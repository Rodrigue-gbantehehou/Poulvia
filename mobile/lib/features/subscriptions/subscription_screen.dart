import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/models/subscription_plan.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/utils/currency_formatter.dart';
import '../../core/widgets/brand_loader.dart';
import '../auth/auth_provider.dart';
import 'subscription_provider.dart';

class SubscriptionScreen extends ConsumerWidget {
  final VoidCallback? onBack;
  final VoidCallback? onOpenMenu;
  const SubscriptionScreen({super.key, this.onBack, this.onOpenMenu});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final farm = authState.activeFarm;

    if (farm == null || !farm.canManageSubscription) {
      return Scaffold(
        appBar: AppBar(
          leading: onBack != null
              ? IconButton(
                  icon: const Icon(Icons.arrow_back_rounded),
                  tooltip: "Retour",
                  onPressed: onBack,
                )
              : (onOpenMenu != null
                  ? IconButton(
                      icon: const Icon(Icons.menu_rounded),
                      tooltip: "Menu",
                      onPressed: onOpenMenu,
                    )
                  : null),
          title: const Text("Abonnement"),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.lock_outline_rounded, size: 48, color: AppColors.textMutedLight),
                const SizedBox(height: 16),
                const Text(
                  "Accès réservé au propriétaire",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  "Seul le propriétaire de l'exploitation peut consulter ou modifier la formule d'abonnement.",
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13, color: AppColors.textMutedLight),
                ),
                const SizedBox(height: 20),
                if (onBack != null)
                  ElevatedButton(
                    onPressed: onBack,
                    child: const Text("Retour"),
                  ),
              ],
            ),
          ),
        ),
      );
    }

    final state = ref.watch(subscriptionProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    ref.listen<SubscriptionState>(subscriptionProvider, (_, next) {
      if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.error!), backgroundColor: AppColors.danger),
        );
      }
      if (next.successMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.successMessage!), backgroundColor: AppColors.primary),
        );
      }
    });

    final currentPlan = state.currentPlan;
    final paidPlans = state.publicPlans.where((plan) => plan.sku == 'STANDARD').toList();
    final currentPlanName = currentPlan?.sku == 'STANDARD'
        ? 'Poulvia'
        : (currentPlan?.name ?? 'Offre Poulvia');
    final trialEnd = DateTime.tryParse(farm.subscriptionTrialEndsAt ?? '');
    final orgStatus = state.orgStatus.toUpperCase();
    final trialExpired =
        (orgStatus == 'TRIAL' || orgStatus == 'SUSPENDED') &&
        trialEnd != null &&
        !trialEnd.isAfter(DateTime.now());
    final isSuspended = orgStatus == 'SUSPENDED' || trialExpired;
    final statusLabel = isSuspended
        ? 'Lecture seule'
        : (orgStatus == 'TRIAL' ? 'Essai en cours' : 'Actif');
    final statusColor = isSuspended
        ? AppColors.accent
        : AppColors.success;
    final annualAllowed = paidPlans.any(
      (plan) => plan.allowedBillingCycles.contains('ANNUALLY') && plan.priceAnnually > 0,
    );
    final annualDiscount = paidPlans.isEmpty || paidPlans.first.priceMonthly <= 0 || paidPlans.first.priceAnnually <= 0
        ? 0
        : ((1 - paidPlans.first.priceAnnually / (paidPlans.first.priceMonthly * 12)) * 100).round();

    return Scaffold(
      appBar: AppBar(
        leading: onBack != null
            ? IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                tooltip: "Retour",
                onPressed: onBack,
              )
            : (onOpenMenu != null
                ? IconButton(
                    icon: const Icon(Icons.menu_rounded),
                    tooltip: "Menu",
                    onPressed: onOpenMenu,
                  )
                : null),
        title: const Text("Abonnement"),
        actions: [
          IconButton(
            icon: Icon(
              isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
              color: isDark ? AppColors.primaryLight : null,
              size: 20,
            ),
            tooltip: isDark ? "Activer le mode clair" : "Activer le mode sombre",
            onPressed: () => ref.read(themeModeProvider.notifier).toggleTheme(context),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: "Actualiser",
            onPressed: () => ref.read(subscriptionProvider.notifier).loadSubscription(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(subscriptionProvider.notifier).loadSubscription(showLoading: false),
        child: state.isLoading
            ? const Center(child: BrandLoader(message: "Chargement des formules..."))
            : SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 30),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // En-tête aéré direct
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                "FORMULE ACTUELLE",
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.8,
                                  color: AppColors.textMutedLight,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                currentPlanName,
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.primary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                "Statut : $statusLabel • Quotas opérationnels",
                                style: const TextStyle(fontSize: 12, color: AppColors.textMutedLight),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: statusColor.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            statusLabel,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: statusColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    if (isSuspended) ...[
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.accent.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.accent.withValues(alpha: 0.3)),
                        ),
                        child: Text(
                          trialExpired
                              ? "Votre période d’essai est terminée. Les opérations sont en lecture seule et vos données restent consultables. Choisissez l’offre Poulvia pour demander l’activation."
                              : "Votre accès aux opérations est suspendu. Vos données restent consultables. Contactez Poulvia pour réactiver l’abonnement.",
                          style: const TextStyle(fontSize: 12, height: 1.35),
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],

                    if (currentPlan != null && currentPlan.sku != 'STANDARD') ...[
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.surfaceDark : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isDark ? AppColors.borderDark : AppColors.borderLight,
                          ),
                        ),
                        child: Text(
                          "Votre formule actuelle (${currentPlan.name}) est une offre historique et n’est plus proposée aux nouvelles souscriptions.",
                          style: const TextStyle(fontSize: 12, height: 1.35),
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],

                    // Sélecteur de cycle de facturation
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          "Offre Poulvia",
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.surfaceDark : AppColors.inputFillLight,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          padding: const EdgeInsets.all(3),
                          child: Row(
                            children: [
                              _CycleOption(
                                label: "Mensuel",
                                isSelected: state.billingCycle == 'MONTHLY',
                                onTap: () => ref.read(subscriptionProvider.notifier).setBillingCycle('MONTHLY'),
                              ),
                              if (annualAllowed)
                                _CycleOption(
                                  label: annualDiscount > 0 ? "Annuel (-$annualDiscount%)" : "Annuel",
                                  isSelected: state.billingCycle == 'ANNUALLY',
                                  onTap: () => ref.read(subscriptionProvider.notifier).setBillingCycle('ANNUALLY'),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Liste des formules disponibles
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: paidPlans.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (ctx, index) {
                        final plan = paidPlans[index];
                        final isCurrent = currentPlan?.sku == plan.sku;

                        return _PlanCard(
                          plan: plan,
                          isCurrent: isCurrent,
                          billingCycle: state.billingCycle,
                          onSelectUpgrade: () => _openUpgradeModal(context, plan),
                        );
                      },
                    ),
                  ],
                ),
              ),
      ),
    );
  }

  void _openUpgradeModal(BuildContext context, SubscriptionPlanModel plan) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _UpgradeModal(plan: plan),
    );
  }
}

class _CycleOption extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _CycleOption({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? AppColors.surfaceDark : Colors.white)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? AppColors.primary : AppColors.textMutedLight,
          ),
        ),
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  final SubscriptionPlanModel plan;
  final bool isCurrent;
  final String billingCycle;
  final VoidCallback onSelectUpgrade;

  const _PlanCard({
    required this.plan,
    required this.isCurrent,
    required this.billingCycle,
    required this.onSelectUpgrade,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final price = billingCycle == 'ANNUALLY' && plan.priceAnnually > 0
        ? "${CurrencyFormatter.formatFcfa(plan.priceAnnually)} / an"
        : "${CurrencyFormatter.formatFcfa(plan.priceMonthly)} / mois";
    final cyclePriceAvailable = billingCycle != 'ANNUALLY' || plan.priceAnnually > 0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isCurrent
              ? AppColors.primary
              : (plan.isRecommended
                  ? AppColors.accent
                  : (isDark ? AppColors.borderDark : AppColors.borderLight)),
          width: isCurrent || plan.isRecommended ? 2 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Poulvia",
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              if (isCurrent)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    "Actuelle",
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),

          Text(
            price,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              fontFamily: 'monospace',
              color: AppColors.primary,
            ),
          ),
          if (!cyclePriceAvailable)
            const Padding(
              padding: EdgeInsets.only(top: 4),
              child: Text(
                "Le tarif annuel n’est pas encore configuré.",
                style: TextStyle(fontSize: 11, color: AppColors.accent),
              ),
            ),
          if (plan.trialDays > 0) ...[
            const SizedBox(height: 4),
            Text(
              "Essai gratuit de ${plan.trialDays} jours",
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.success,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
          const SizedBox(height: 12),
          const Divider(height: 1),
          const SizedBox(height: 10),

          // Liste des fonctionnalités incluses
          ...const [
            "Suivi des bandes, bâtiments et mortalités",
            "Production selon le type d’exploitation",
            "Suivi sanitaire et traitements",
            "Stocks, dépenses, recettes et ventes",
            "Contacts, équipe et rôles personnalisés",
          ].map(
                (feature) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_rounded, size: 14, color: AppColors.primary),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          feature,
                          style: const TextStyle(fontSize: 11, color: AppColors.textMutedLight),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

          const SizedBox(height: 12),

          SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onSelectUpgrade,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 11),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: Text(
                  isCurrent ? "Choisir cette périodicité" : "S’abonner avec FedaPay",
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _UpgradeModal extends ConsumerStatefulWidget {
  final SubscriptionPlanModel plan;

  const _UpgradeModal({required this.plan});

  @override
  ConsumerState<_UpgradeModal> createState() => _UpgradeModalState();
}

class _UpgradeModalState extends ConsumerState<_UpgradeModal> {
  Future<void> _submit() async {
    final navigator = Navigator.of(context);
    final url = await ref.read(subscriptionProvider.notifier).createCheckout(targetPlan: widget.plan.sku);
    if (url == null || !mounted) return;
    final opened = await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    if (opened && mounted) {
      navigator.pop();
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Impossible d’ouvrir la page de paiement.")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final state = ref.watch(subscriptionProvider);
    final isAnnual = state.billingCycle == 'ANNUALLY';
    final selectedPrice = isAnnual && widget.plan.priceAnnually > 0
        ? widget.plan.priceAnnually
        : widget.plan.priceMonthly;
    final pricePeriod = isAnnual ? '/ an' : '/ mois';

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(
        20,
        16,
        20,
        MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.grey.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.stars_rounded, color: AppColors.primary, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Offre Poulvia",
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      "${CurrencyFormatter.formatFcfa(selectedPrice)} $pricePeriod",
                      style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Text(
            "Vous allez payer de façon sécurisée avec FedaPay. L’abonnement sera activé après confirmation du paiement par Poulvia.",
            style: TextStyle(fontSize: 12, color: AppColors.textMutedLight, height: 1.3),
          ),
          const SizedBox(height: 14),
          if (state.error != null) ...[
            Text(state.error!, style: const TextStyle(color: Colors.red, fontSize: 12)),
            const SizedBox(height: 12),
          ],

          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: state.isSubmitting ? null : _submit,
              icon: state.isSubmitting
                  ? const BrandLoader.button(size: 18)
                  : const Icon(Icons.lock_outline_rounded, size: 18),
              label: Text(
                state.isSubmitting ? "Préparation du paiement..." : "Continuer vers FedaPay",
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
