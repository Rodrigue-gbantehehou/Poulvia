import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../auth/auth_provider.dart';
import '../dashboard/dashboard_screen.dart';
import '../dashboard/dashboard_provider.dart';
import '../dashboard/quick_action_sheet.dart';
import '../eggs/eggs_screen.dart';
import '../eggs/egg_provider.dart';
import '../eggs/record_egg_modal.dart';
import '../finances/finances_screen.dart';
import '../finances/finance_provider.dart';
import '../finances/record_transaction_modal.dart';
import '../flocks/flocks_screen.dart';
import '../flocks/flock_provider.dart';
import '../flocks/record_movement_modal.dart';
import '../flocks/record_poultry_sale_modal.dart';
import '../health/health_screen.dart';
import '../health/health_provider.dart';
import '../inventory/inventory_screen.dart';
import '../inventory/inventory_provider.dart';
import '../inventory/record_feeding_modal.dart';
import '../reports/reports_screen.dart';
import '../buildings/buildings_screen.dart';
import '../members/members_screen.dart';
import '../sync/sync_screen.dart';
import '../subscriptions/subscription_screen.dart';
import '../contacts/contacts_screen.dart';
import '../settings/farm_settings_screen.dart';
import '../settings/settings_screen.dart';
import '../management/management_screen.dart';
import 'app_drawer.dart';

class BottomNavScaffold extends ConsumerStatefulWidget {
  const BottomNavScaffold({super.key});

  @override
  ConsumerState<BottomNavScaffold> createState() => _BottomNavScaffoldState();
}

class _BottomNavScaffoldState extends ConsumerState<BottomNavScaffold> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  int _currentIndex = 0;
  String? _activeSecondaryKey;

  void _openDrawer() {
    _scaffoldKey.currentState?.openDrawer();
  }

  void _closeSecondaryModule() {
    if (_activeSecondaryKey != null) {
      setState(() => _activeSecondaryKey = null);
    }
  }

  void _onTabSelected(int index) {
    HapticFeedback.selectionClick();
    setState(() {
      _activeSecondaryKey = null;
      _currentIndex = index;
    });

    if (index == 0) {
      ref.read(dashboardProvider.notifier).loadDashboard(showLoading: false);
    } else if (index == 1) {
      ref.read(flockProvider.notifier).loadFlocks(showLoading: false);
    } else if (index == 2) {
      ref.read(eggProvider.notifier).loadData(showLoading: false);
    } else if (index == 3) {
      // Gestion
    }
  }

  void _refreshModuleData(String destKey) {
    switch (destKey) {
      case 'inventory':
        ref.read(inventoryProvider.notifier).loadMovements(showLoading: false);
        ref.read(inventoryProvider.notifier).loadItems(showLoading: false);
        break;
      case 'finance':
        ref.read(financeProvider.notifier).loadTransactions(showLoading: false);
        break;
      case 'eggs':
        ref.read(eggProvider.notifier).loadData(showLoading: false);
        break;
      case 'health':
        ref.read(healthProvider.notifier).loadTreatments(showLoading: false);
        break;
      case 'flocks':
        ref.read(flockProvider.notifier).loadFlocks(showLoading: false);
        break;
      case 'dashboard':
        ref.read(dashboardProvider.notifier).loadDashboard(showLoading: false);
        break;
    }
  }

  void _openQuickActions() {
    HapticFeedback.lightImpact();
    QuickActionSheet.show(
      context,
      onRecordEgg: () => RecordEggModal.show(context),
      onRecordFeeding: () => RecordFeedingModal.show(
        context,
        onSaved: () {
          ref.read(inventoryProvider.notifier).loadMovements(showLoading: false);
          ref.read(inventoryProvider.notifier).loadItems(showLoading: false);
        },
      ),
      onRecordPoultrySale: () => RecordPoultrySaleModal.show(
        context,
        onSaved: () {
          ref.read(flockProvider.notifier).loadFlocks(showLoading: false);
          ref.read(financeProvider.notifier).loadTransactions(showLoading: false);
        },
      ),
      onRecordEggSale: () => RecordTransactionModal.show(
        context,
        initialType: "INCOME",
        initialCategory: "EGG_SALE",
        onSaved: () {
          ref.read(financeProvider.notifier).loadTransactions(showLoading: false);
          ref.read(eggProvider.notifier).loadData(showLoading: false);
        },
      ),
      onRecordMovement: () => RecordMovementModal.show(
        context,
        onSaved: () {
          ref.read(flockProvider.notifier).loadFlocks(showLoading: false);
        },
      ),
      onRecordIncome: () => RecordTransactionModal.show(
        context,
        initialType: "INCOME",
        onSaved: () {
          ref.read(financeProvider.notifier).loadTransactions(showLoading: false);
        },
      ),
      onRecordExpense: () => RecordTransactionModal.show(
        context,
        initialType: "EXPENSE",
        onSaved: () {
          ref.read(financeProvider.notifier).loadTransactions(showLoading: false);
        },
      ),
    );
  }

  void _navigateToModule(String key) {
    if (key == 'dashboard') {
      setState(() {
        _activeSecondaryKey = null;
        _currentIndex = 0;
      });
      return;
    }
    if (key == 'flocks') {
      setState(() {
        _activeSecondaryKey = null;
        _currentIndex = 1;
      });
      return;
    }
    if (key == 'eggs') {
      setState(() {
        _activeSecondaryKey = null;
        _currentIndex = 2;
      });
      return;
    }
    if (key == 'management') {
      setState(() {
        _activeSecondaryKey = null;
        _currentIndex = 3;
      });
      return;
    }

    _refreshModuleData(key);

    // Module secondaire affiché à l'intérieur du scaffold
    setState(() {
      _activeSecondaryKey = key;
    });
  }

  Widget _buildSecondaryScreen(String key) {
    switch (key) {
      case 'health':
        return HealthScreen(
          onOpenMenu: _openDrawer,
          onBack: _closeSecondaryModule,
        );
      case 'finance':
        return FinancesScreen(
          onOpenMenu: _openDrawer,
          onBack: _closeSecondaryModule,
        );
      case 'inventory':
        return InventoryScreen(
          onOpenMenu: _openDrawer,
          onBack: _closeSecondaryModule,
        );
      case 'reports':
        return ReportsScreen(
          onOpenMenu: _openDrawer,
          onBack: _closeSecondaryModule,
        );
      case 'buildings':
        return BuildingsScreen(
          onOpenMenu: _openDrawer,
          onBack: _closeSecondaryModule,
        );
      case 'members':
        return MembersScreen(
          onOpenMenu: _openDrawer,
          onBack: _closeSecondaryModule,
        );
      case 'contacts':
        return ContactsScreen(
          onOpenMenu: _openDrawer,
          onBack: _closeSecondaryModule,
        );
      case 'sync':
        return SyncScreen(
          onOpenMenu: _openDrawer,
          onBack: _closeSecondaryModule,
        );
      case 'subscription':
        return SubscriptionScreen(
          onOpenMenu: _openDrawer,
          onBack: _closeSecondaryModule,
        );
      case 'farm_settings':
        return FarmSettingsScreen(
          onOpenMenu: _openDrawer,
          onBack: _closeSecondaryModule,
        );
      case 'settings':
        return SettingsScreen(
          onOpenMenu: _openDrawer,
          onBack: _closeSecondaryModule,
        );
      default:
        return const SizedBox.shrink();
    }
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AuthState>(authProvider, (previous, next) {
      final prevFarmId = previous?.activeFarm?.id;
      final nextFarmId = next.activeFarm?.id;
      if (prevFarmId != nextFarmId) {
        if (_activeSecondaryKey != null) {
          setState(() => _activeSecondaryKey = null);
        }
        ref.read(dashboardProvider.notifier).loadDashboard(showLoading: false);
        ref.read(flockProvider.notifier).loadFlocks(showLoading: false);
        ref.read(inventoryProvider.notifier).loadItems(showLoading: false);
        ref.read(inventoryProvider.notifier).loadMovements(showLoading: false);
        ref.read(financeProvider.notifier).loadTransactions(showLoading: false);
        ref.read(eggProvider.notifier).loadData(showLoading: false);
        ref.read(healthProvider.notifier).loadTreatments(showLoading: false);
      }
    });

    final authState = ref.watch(authProvider);
    final farm = authState.activeFarm;

    // ─── 4 ÉCRANS STABLES EN BAS ───
    final screens = <Widget>[
      DashboardScreen(
        onOpenQuickActions: _openQuickActions,
        onNavigateToEggs: () => _navigateToModule('eggs'),
        onNavigateToFlocks: () => _navigateToModule('flocks'),
        onNavigateToFinances: () => _navigateToModule('finance'),
        onNavigateToSync: () => _navigateToModule('sync'),
        onOpenMenu: _openDrawer,
      ),
      FlocksScreen(onOpenMenu: _openDrawer),
      EggsScreen(onOpenMenu: _openDrawer),
      ManagementScreen(onOpenMenu: _openDrawer),
    ];

    final safeIndex = _currentIndex < screens.length ? _currentIndex : 0;
    final showEggs = farm == null || farm.canViewEggs;

    return PopScope(
      canPop: _activeSecondaryKey == null,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (_activeSecondaryKey != null) {
          setState(() => _activeSecondaryKey = null);
        }
      },
      child: Scaffold(
        key: _scaffoldKey,
        drawer: AppDrawer(
          onSelectModule: (modKey) => _navigateToModule(modKey),
        ),
        extendBody: false,
        body: _activeSecondaryKey != null
            ? _buildSecondaryScreen(_activeSecondaryKey!)
            : IndexedStack(
                index: safeIndex,
                children: screens,
              ),
        bottomNavigationBar: Container(
          color: const Color(0xFFFAFAF8),
          child: SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 58,
                    padding: const EdgeInsets.all(5),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0F0EE),
                      borderRadius: BorderRadius.circular(32),
                      border: Border.all(color: const Color(0xFFE7E7E3)),
                    ),
                    child: Row(
                      children: [
                        _buildNavItem(
                          index: 0,
                          icon: Icons.home_outlined,
                          activeIcon: Icons.home_rounded,
                          label: "Accueil",
                        ),
                        _buildNavItem(
                          index: 1,
                          icon: Icons.pets_outlined,
                          activeIcon: Icons.pets_rounded,
                          label: "Élevage",
                        ),
                        if (showEggs)
                          _buildNavItem(
                            index: 2,
                            icon: Icons.egg_outlined,
                            activeIcon: Icons.egg_rounded,
                            label: "Production",
                          ),
                        _buildNavItem(
                          index: 3,
                          icon: Icons.business_center_outlined,
                          activeIcon: Icons.business_center_rounded,
                          label: "Gestion",
                        ),
                      ],
                    ),
                  ),
                ),
                if (farm == null || farm.hasAnyQuickAction) ...[
                  const SizedBox(width: 10),
                  SizedBox(
                    width: 54,
                    height: 54,
                    child: Material(
                      color: const Color(0xFFF05257),
                      shape: const CircleBorder(),
                      child: InkWell(
                        onTap: _openQuickActions,
                        customBorder: const CircleBorder(),
                        child: const Tooltip(
                          message: "Actions rapides",
                          child: Icon(Icons.add_rounded, size: 27, color: Colors.white),
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required IconData activeIcon,
    required String label,
  }) {
    final isSelected = _activeSecondaryKey == null && _currentIndex == index;
    final flex = isSelected ? 4 : 2;

    return Expanded(
      flex: flex,
      child: Semantics(
        button: true,
        selected: isSelected,
        label: label,
        child: Material(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(26),
          child: InkWell(
            onTap: () => _onTabSelected(index),
            borderRadius: BorderRadius.circular(26),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 6),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    isSelected ? activeIcon : icon,
                    color: isSelected ? const Color(0xFF262724) : const Color(0xFF777873),
                    size: 20,
                  ),
                  if (isSelected) ...[
                    const SizedBox(width: 5),
                    Flexible(
                      child: Text(
                        label,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF262724),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
