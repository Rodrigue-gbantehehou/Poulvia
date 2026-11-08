import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../auth/auth_provider.dart';
import '../contacts/contacts_screen.dart';
import '../finances/finances_screen.dart';
import '../inventory/inventory_screen.dart';
import '../members/members_screen.dart';
import '../reports/reports_screen.dart';

class ManagementScreen extends ConsumerWidget {
  final VoidCallback? onOpenMenu;

  const ManagementScreen({super.key, this.onOpenMenu});

  void _navigate(BuildContext context, Widget screen) {
    HapticFeedback.selectionClick();
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => screen),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final farm = authState.activeFarm;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final canFinance = farm == null || farm.canViewFinance;
    final canInventory = farm == null || farm.canViewInventory;
    const canContacts = true; // Toujours accessible
    final canMembers = farm == null || farm.canManageMembers;
    final canReports = farm == null || farm.canViewReports;

    return Scaffold(
      backgroundColor: isDark ? AppColors.backgroundDark : AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text(
          "Gestion",
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
        ),
        centerTitle: false,
        leading: onOpenMenu != null
            ? IconButton(
                icon: const Icon(Icons.menu_rounded),
                onPressed: onOpenMenu,
                tooltip: "Menu",
              )
            : null,
      ),
      body: ListView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        children: [
          // Carte d'introduction
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isDark
                    ? [const Color(0xFF1B4331), const Color(0xFF143627)]
                    : [AppColors.primary, const Color(0xFF1B4331)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(
                    Icons.business_center_rounded,
                    color: AppColors.accentGold,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Espace Gestion",
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        "Caisse, stocks, contacts, équipe et synthèses.",
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // 1. Trésorerie & Ventes (Caisse)
          if (canFinance)
            _ManagementCard(
              icon: Icons.account_balance_wallet_rounded,
              iconColor: AppColors.success,
              title: "Trésorerie & Ventes",
              subtitle: "Caisse en FCFA, entrées/sorties et reçus",
              onTap: () => _navigate(context, const FinancesScreen()),
            ),

          // 2. Stocks & Intrants
          if (canInventory)
            _ManagementCard(
              icon: Icons.inventory_2_rounded,
              iconColor: AppColors.primary,
              title: "Stocks & Intrants",
              subtitle: "Provende (sacs 50 kg), intrants et réassorts",
              onTap: () => _navigate(context, const InventoryScreen()),
            ),

          // 3. Contacts & Répertoire
          if (canContacts)
            _ManagementCard(
              icon: Icons.contacts_rounded,
              iconColor: const Color(0xFF8B5CF6),
              title: "Répertoire & Contacts",
              subtitle: "Clients, provendiers, vétérinaires et partenaires",
              onTap: () => _navigate(context, const ContactsScreen()),
            ),

          // 4. Équipe & Rôles
          if (canMembers)
            _ManagementCard(
              icon: Icons.people_alt_rounded,
              iconColor: AppColors.accentWarm,
              title: "Équipe & Rôles",
              subtitle: "Employés de ferme et habilitations d'accès",
              onTap: () => _navigate(context, const MembersScreen()),
            ),

          // 5. Rapports & Synthèses (WhatsApp/PDF)
          if (canReports)
            _ManagementCard(
              icon: Icons.bar_chart_rounded,
              iconColor: const Color(0xFF0284C7),
              title: "Rapports & Synthèses",
              subtitle: "Fiches de lots, bilans et partages WhatsApp",
              onTap: () => _navigate(context, const ReportsScreen()),
            ),

          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _ManagementCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ManagementCard({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(16),
        elevation: 0.5,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: iconColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: iconColor, size: 22),
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
                          fontSize: 14.5,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        style: TextStyle(
                          color: isDark ? Colors.white60 : AppColors.textMutedLight,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 14,
                  color: isDark ? Colors.white38 : AppColors.textMutedLight,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
