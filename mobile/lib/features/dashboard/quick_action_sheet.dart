import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../auth/auth_provider.dart';

class QuickActionSheet extends ConsumerWidget {
  final VoidCallback onRecordEgg;
  final VoidCallback onRecordFeeding;
  final VoidCallback onRecordMovement;
  final VoidCallback? onRecordPoultrySale;
  final VoidCallback? onRecordEggSale;
  final VoidCallback onRecordIncome;
  final VoidCallback onRecordExpense;

  const QuickActionSheet({
    super.key,
    required this.onRecordEgg,
    required this.onRecordFeeding,
    required this.onRecordMovement,
    this.onRecordPoultrySale,
    this.onRecordEggSale,
    required this.onRecordIncome,
    required this.onRecordExpense,
  });

  static void show(
    BuildContext context, {
    required VoidCallback onRecordEgg,
    required VoidCallback onRecordFeeding,
    required VoidCallback onRecordMovement,
    VoidCallback? onRecordPoultrySale,
    VoidCallback? onRecordEggSale,
    required VoidCallback onRecordIncome,
    required VoidCallback onRecordExpense,
  }) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => QuickActionSheet(
        onRecordEgg: onRecordEgg,
        onRecordFeeding: onRecordFeeding,
        onRecordMovement: onRecordMovement,
        onRecordPoultrySale: onRecordPoultrySale,
        onRecordEggSale: onRecordEggSale,
        onRecordIncome: onRecordIncome,
        onRecordExpense: onRecordExpense,
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final farm = authState.activeFarm;

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;

    // Filtres d'actions selon l'abonnement de la ferme et le rôle utilisateur
    final canEgg = farm != null && farm.canCreateEggs;
    final canFeed = farm != null && farm.canFeed;
    final canFinance = farm != null && farm.canCreateFinance;
    final canMovement = farm != null && farm.canRecordFlockMovement;

    final hasAnyAction = canEgg || canFeed || canFinance || canMovement;

    return Material(
      color: surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Padding(
        padding: EdgeInsets.fromLTRB(
          20,
          12,
          20,
          MediaQuery.of(context).padding.bottom + 20,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
            // Poignée de glissement
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? AppColors.borderDark : AppColors.borderLight,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // En-tête
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Actions rapides",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      "Choisir une opération",
                      style: TextStyle(fontSize: 11, color: AppColors.textMutedLight),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16),

            if (!hasAnyAction)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(
                  child: Text(
                    "Aucune action de saisie autorisée pour ce profil.",
                    style: TextStyle(fontSize: 13, color: AppColors.textMutedLight),
                  ),
                ),
              )
            else ...[
              _actionSection(context, "Élevage & production", [
                if (canEgg)
                  _ActionButton(
                    icon: Icons.egg_outlined,
                    label: "Collecte d'œufs",
                    onTap: () {
                      Navigator.pop(context);
                      onRecordEgg();
                    },
                  ),
                if (canFeed)
                  _ActionButton(
                    icon: Icons.restaurant_outlined,
                    label: "Nourrir",
                    onTap: () {
                      Navigator.pop(context);
                      onRecordFeeding();
                    },
                  ),
                if (canMovement)
                  _ActionButton(
                    icon: Icons.heart_broken_rounded,
                    label: "Mortalité",
                    onTap: () {
                      Navigator.pop(context);
                      onRecordMovement();
                    },
                  ),
              ]),
              _actionSection(context, "Ventes", [
                if (canFinance && canMovement && onRecordPoultrySale != null)
                  _ActionButton(
                    icon: Icons.shopping_bag_outlined,
                    label: "Vente de volailles",
                    onTap: () {
                      Navigator.pop(context);
                      onRecordPoultrySale!();
                    },
                  ),
                if (canFinance && canEgg && onRecordEggSale != null)
                  _ActionButton(
                    icon: Icons.point_of_sale_rounded,
                    label: "Vente d'œufs",
                    onTap: () {
                      Navigator.pop(context);
                      onRecordEggSale!();
                    },
                  ),
              ]),
              _actionSection(context, "Finances", [
                if (canFinance)
                  _ActionButton(
                    icon: Icons.trending_up,
                    label: "Autre recette",
                    onTap: () {
                      Navigator.pop(context);
                      onRecordIncome();
                    },
                  ),
                if (canFinance)
                  _ActionButton(
                    icon: Icons.trending_down,
                    label: "Dépense",
                    onTap: () {
                      Navigator.pop(context);
                      onRecordExpense();
                    },
                  ),
              ]),
            ],
          ],
        ),
      ),
    ),
  );
}

  Widget _actionSection(BuildContext context, String title, List<Widget> actions) {
    if (actions.isEmpty) return const SizedBox.shrink();

    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.primaryLight : AppColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          ...actions,
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final iconColor = isDark ? AppColors.primaryLight : AppColors.primary;
    final mutedColor = isDark ? AppColors.textMutedDark : AppColors.textMutedLight;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(9),
              ),
              child: Icon(icon, color: iconColor, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                  color: Theme.of(context).textTheme.bodyMedium?.color,
                ),
              ),
            ),
            Icon(Icons.chevron_right_rounded, size: 18, color: mutedColor),
          ],
        ),
      ),
    );
  }
}
