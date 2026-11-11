import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../auth/auth_provider.dart';
import '../auth/user_profile_sheet.dart';
import '../subscriptions/subscription_screen.dart';
import 'farm_settings_screen.dart';

class SettingsScreen extends ConsumerWidget {
  final VoidCallback? onBack;
  final VoidCallback? onOpenMenu;

  const SettingsScreen({super.key, this.onBack, this.onOpenMenu});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final farm = ref.watch(authProvider).activeFarm;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: onBack != null
            ? IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                tooltip: 'Retour',
                onPressed: onBack,
              )
            : (onOpenMenu != null
                ? IconButton(
                    icon: const Icon(Icons.menu_rounded),
                    tooltip: 'Menu',
                    onPressed: onOpenMenu,
                  )
                : null),
        title: const Text('Paramètres'),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: [
          _SettingsDestination(
            icon: Icons.person_outline_rounded,
            title: 'Mon compte',
            subtitle: 'Accès au compte et à la sécurité',
            isDark: isDark,
            onTap: () => UserProfileSheet.show(context),
          ),
          const SizedBox(height: 12),
          _SettingsDestination(
            icon: Icons.agriculture_rounded,
            title: 'Ma ferme',
            subtitle: farm?.isOwner == true
                ? (farm?.name ?? 'Informations de l’exploitation')
                : 'Modification réservée au propriétaire',
            isDark: isDark,
            onTap: farm?.isOwner == true
                ? () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const FarmSettingsScreen(),
                      ),
                    )
                : null,
          ),
          const SizedBox(height: 12),
          _SettingsDestination(
            icon: Icons.workspace_premium_outlined,
            title: 'Abonnement',
            subtitle: farm?.canManageSubscription == true
                ? 'Offre et périodicité de paiement'
                : 'Gestion réservée au propriétaire',
            isDark: isDark,
            onTap: farm?.canManageSubscription == true
                ? () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const SubscriptionScreen(),
                      ),
                    )
                : null,
          ),
        ],
      ),
    );
  }
}

class _SettingsDestination extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool isDark;
  final VoidCallback? onTap;

  const _SettingsDestination({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? AppColors.borderDark : AppColors.borderLight,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: AppColors.primary),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textMutedLight,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                onTap == null ? Icons.lock_outline_rounded : Icons.chevron_right_rounded,
                size: 20,
                color: onTap == null ? AppColors.textMutedLight : null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
