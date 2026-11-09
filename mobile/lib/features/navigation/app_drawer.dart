import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../auth/auth_provider.dart';
import '../auth/login_screen.dart';
import '../buildings/buildings_screen.dart';
import '../sync/sync_provider.dart';
import '../sync/sync_screen.dart';
import '../subscriptions/subscription_screen.dart';
import '../settings/farm_settings_screen.dart';

class AppDrawer extends ConsumerWidget {
  final Function(String moduleKey)? onSelectModule;

  const AppDrawer({super.key, this.onSelectModule});

  void _navigateTo(BuildContext context, String key, Widget screen) {
    HapticFeedback.lightImpact();
    Navigator.of(context).pop();
    if (onSelectModule != null) {
      onSelectModule!(key);
    } else {
      Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final farm = authState.activeFarm;
    final pendingCount = ref.watch(syncProvider).pendingCount;

    return Drawer(
      backgroundColor: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
      child: SafeArea(
        child: Column(
          children: [
            // En-tête avec rappel de la ferme active
            Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 8, 12),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: isDark ? AppColors.borderDark : AppColors.borderLight,
                  ),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isDark ? AppColors.borderDark : AppColors.borderLight,
                      ),
                    ),
                    child: Image.asset(
                      'assets/images/logo.png',
                      fit: BoxFit.contain,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          farm?.name ?? "Poulvia",
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (farm?.productionType != null)
                          Text(
                            farm!.isBroilerOnly
                                ? "Poulets de chair"
                                : (farm.productionType == 'LAYER'
                                    ? "Poules pondeuses"
                                    : "Élevage avicole"),
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? Colors.white60 : AppColors.textMutedLight,
                            ),
                          ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, size: 20),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  const SizedBox(width: 6),
                ],
              ),
            ),

            // Les espaces principaux restent dans la barre du bas.
            // Le tiroir ne contient que les destinations complémentaires.
            Expanded(
              child: ListView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                children: [
                  _SectionHeader(label: "ÉLEVAGE", isDark: isDark),

                  // Les bandes sont accessibles depuis l'onglet Élevage.
                  if (farm?.canManageBuildings == true)
                    _DrawerItem(
                      icon: Icons.home_work_rounded,
                      label: "Bâtiments",
                      onTap: () => _navigateTo(context, 'buildings', const BuildingsScreen()),
                    ),

                  const SizedBox(height: 8),
                  _SectionHeader(label: "OUTILS ET PARAMÈTRES", isDark: isDark),

                  // Synchronisation hors-ligne
                  _DrawerItem(
                    icon: Icons.sync_rounded,
                    label: "Synchronisation",
                    badge: pendingCount > 0
                        ? "$pendingCount en attente"
                        : null,
                    badgeIsAlert: pendingCount > 0,
                    onTap: () => _navigateTo(context, 'sync', const SyncScreen()),
                  ),

                  // Abonnement & Formules
                  if (farm?.canManageSubscription == true)
                    _DrawerItem(
                      icon: Icons.workspace_premium_rounded,
                      label: "Abonnement & Formules",
                      onTap: () => _navigateTo(context, 'subscription', const SubscriptionScreen()),
                    ),

                  // Paramètres de la ferme
                  if (farm?.isOwner == true)
                    _DrawerItem(
                      icon: Icons.settings_rounded,
                      label: "Paramètres de la ferme",
                      onTap: () => _navigateTo(context, 'farm_settings', const FarmSettingsScreen()),
                    ),
                ],
              ),
            ),

            // Pied de page : Mode sombre compact & Déconnexion
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(
                    color: isDark ? AppColors.borderDark : AppColors.borderLight,
                  ),
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Mode clair / sombre compact
                  Row(
                    children: [
                      Icon(
                        isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                        color: isDark ? AppColors.brandEmeraldLight : AppColors.primary,
                        size: 18,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          isDark ? "Mode sombre" : "Mode clair",
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12.5),
                        ),
                      ),
                      Transform.scale(
                        scale: 0.75,
                        child: Switch(
                          value: isDark,
                          activeThumbColor: AppColors.primary,
                          onChanged: (_) {
                            ref.read(themeModeProvider.notifier).toggleTheme(context);
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  // Déconnexion sobre
                  InkWell(
                    onTap: () async {
                      HapticFeedback.lightImpact();
                      final summary = await ref.read(authProvider.notifier).getUnsyncedActionsSummary();
                      if (!context.mounted) return;
                      if (summary.total > 0) {
                        String detailMsg;
                        if (summary.pending > 0 && summary.failed > 0) {
                          detailMsg = "Vous avez ${summary.pending} action(s) en attente d'envoi et ${summary.failed} action(s) rejetée(s).";
                        } else if (summary.pending > 0) {
                          detailMsg = "Vous avez ${summary.pending} action(s) hors-ligne en attente d'envoi.";
                        } else {
                          detailMsg = "Vous avez ${summary.failed} action(s) rejetée(s) nécessitant une décision.";
                        }

                        final confirm = await showDialog<bool>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            title: const Text("Actions non synchronisées"),
                            content: Text(
                              "$detailMsg\n\nSi vous vous déconnectez, elles seront définitivement supprimées de cet appareil. "
                              "Voulez-vous continuer ?",
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, false),
                                child: const Text("Annuler"),
                              ),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.danger,
                                  foregroundColor: Colors.white,
                                ),
                                onPressed: () => Navigator.pop(ctx, true),
                                child: const Text("Se déconnecter quand même"),
                              ),
                            ],
                          ),
                        );
                        if (confirm != true) return;
                      }

                      if (!context.mounted) return;
                      Navigator.of(context).pop();
                      final success = await ref.read(authProvider.notifier).logout();
                      if (!context.mounted) return;
                      if (!success) {
                        _showLogoutFailureDialog(context, ref);
                        return;
                      }
                      Navigator.of(context).pushAndRemoveUntil(
                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                        (route) => false,
                      );
                    },
                    borderRadius: BorderRadius.circular(8),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 6, horizontal: 4),
                      child: Row(
                        children: [
                          Icon(Icons.logout_rounded, color: AppColors.danger, size: 18),
                          SizedBox(width: 10),
                          Text(
                            "Déconnexion",
                            style: TextStyle(
                              color: AppColors.danger,
                              fontWeight: FontWeight.bold,
                              fontSize: 12.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showLogoutFailureDialog(BuildContext context, WidgetRef ref) {
    showDialog<void>(
      context: context,
      builder: (alertCtx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: AppColors.danger),
            SizedBox(width: 8),
            Text("Sécurité du terminal"),
          ],
        ),
        content: const Text(
          "Le système sécurisé de l'appareil n'a pas pu effacer vos clés de session. "
          "Vos identifiants pourraient subsister sur cet appareil.\n\n"
          "Souhaitez-vous forcer la déconnexion locale quand même ?",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(alertCtx),
            child: const Text("Réessayer"),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              Navigator.pop(alertCtx);
              await ref.read(authProvider.notifier).logout(force: true);
              if (context.mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            child: const Text("Forcer la déconnexion"),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String label;
  final bool isDark;

  const _SectionHeader({required this.label, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 8, top: 4, bottom: 4),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.8,
          color: isDark ? Colors.white38 : AppColors.textMutedLight.withValues(alpha: 0.7),
        ),
      ),
    );
  }
}

class _DrawerItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? badge;
  final bool badgeIsAlert;
  final VoidCallback onTap;

  const _DrawerItem({
    required this.icon,
    required this.label,
    this.badge,
    this.badgeIsAlert = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = isDark ? AppColors.brandEmeraldLight : AppColors.primary;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 1.5),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5.5),
          child: Row(
            children: [
              Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  color: isDark
                      ? AppColors.brandEmeraldLight.withValues(alpha: 0.15)
                      : AppColors.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  color: primaryColor,
                  size: 17,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ),
              if (badge != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  margin: const EdgeInsets.only(right: 4),
                  decoration: BoxDecoration(
                    color: badgeIsAlert
                        ? AppColors.accent.withValues(alpha: 0.15)
                        : primaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    badge!,
                    style: TextStyle(
                      fontSize: 9.5,
                      fontWeight: FontWeight.bold,
                      color: badgeIsAlert ? AppColors.accent : primaryColor,
                    ),
                  ),
                ),
              Icon(
                Icons.chevron_right_rounded,
                size: 15,
                color: AppColors.textMutedLight.withValues(alpha: 0.35),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
