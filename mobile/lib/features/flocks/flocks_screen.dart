import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/design_system/app_segmented_filter.dart';
import '../../core/theme/theme_provider.dart';
import '../buildings/buildings_provider.dart';
import '../../core/design_system/app_shimmer.dart';
import '../../core/design_system/app_badge.dart';
import '../../core/design_system/app_empty_state.dart';
import '../../core/widgets/brand_loader.dart';
import 'flock_provider.dart';
import 'flock_detail_screen.dart';
import '../subscriptions/subscription_screen.dart';

class FlocksScreen extends ConsumerStatefulWidget {
  final VoidCallback? onOpenMenu;
  const FlocksScreen({super.key, this.onOpenMenu});

  @override
  ConsumerState<FlocksScreen> createState() => _FlocksScreenState();
}

class _FlocksScreenState extends ConsumerState<FlocksScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        ref.read(flockProvider.notifier).loadFlocks(showLoading: false);
      }
    });
  }

  void _openCreateFlockDialog() {
    final codeController = TextEditingController();
    final nameController = TextEditingController();
    final strainController = TextEditingController();
    final qtyController = TextEditingController();
    String poultryType = "LAYER";
    DateTime startDate = DateTime.now();
    String? selectedBuildingId;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) {
          final isDark = Theme.of(ctx).brightness == Brightness.dark;
          final surfaceColor = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
          final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;
          final flockState = ref.watch(flockProvider);

          return Container(
            decoration: BoxDecoration(
              color: surfaceColor,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              border: Border.all(color: borderColor),
            ),
            padding: EdgeInsets.fromLTRB(
              20,
              12,
              20,
              MediaQuery.of(ctx).viewInsets.bottom + MediaQuery.of(ctx).padding.bottom + 20,
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.borderDark : AppColors.borderLight,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "Nouvelle Bande de Volailles",
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Type de production
                  const Text("Type d'élevage *", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Expanded(
                        child: InkWell(
                          onTap: () => setModalState(() => poultryType = "LAYER"),
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: poultryType == "LAYER" ? AppColors.accent : Colors.transparent,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: poultryType == "LAYER" ? AppColors.accent : borderColor),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              "Pondeuses",
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: poultryType == "LAYER" ? Colors.white : AppColors.textMutedLight,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: InkWell(
                          onTap: () => setModalState(() => poultryType = "BROILER"),
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: poultryType == "BROILER" ? AppColors.primary : Colors.transparent,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: poultryType == "BROILER" ? AppColors.primary : borderColor),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              "Poulets de chair",
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: poultryType == "BROILER" ? Colors.white : AppColors.textMutedLight,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Nom et Code
                  Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: TextField(
                          controller: nameController,
                          decoration: InputDecoration(
                            labelText: "Nom de la bande *",
                            hintText: "Ex: Lot Pondeuses Bâtiment A",
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            contentPadding: const EdgeInsets.all(12),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: codeController,
                          decoration: InputDecoration(
                            labelText: "Code *",
                            hintText: "LOT-01",
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            contentPadding: const EdgeInsets.all(12),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Effectif & Souche
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: qtyController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            labelText: "Effectif initial *",
                            hintText: "Ex: 500",
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            contentPadding: const EdgeInsets.all(12),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: strainController,
                          decoration: InputDecoration(
                            labelText: "Souche / Race",
                            hintText: "Ex: Lohmann, Cobb 500",
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            contentPadding: const EdgeInsets.all(12),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Bâtiment d'accueil
                  Consumer(
                    builder: (ctx, ref, _) {
                      final buildings = ref.watch(buildingsProvider).buildings.where((b) => b.isActive).toList();
                      if (buildings.isEmpty) return const SizedBox.shrink();

                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          DropdownButtonFormField<String>(
                            initialValue: selectedBuildingId,
                            isExpanded: true,
                            decoration: InputDecoration(
                              labelText: "Bâtiment d'accueil",
                              prefixIcon: const Icon(Icons.home_work_outlined, size: 20),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            ),
                            hint: const Text("Sélectionner un bâtiment (optionnel)"),
                            items: [
                              const DropdownMenuItem<String>(
                                value: null,
                                child: Text("Aucun bâtiment spécifique"),
                              ),
                              ...buildings.map((b) => DropdownMenuItem<String>(
                                    value: b.id,
                                    child: Text("${b.name} (${b.capacity} pl. - ${b.type.label})"),
                                  )),
                            ],
                            onChanged: (val) => setModalState(() => selectedBuildingId = val),
                          ),
                          const SizedBox(height: 12),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 6),

                  // Boutons d'action
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(ctx),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text("Annuler"),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: !flockState.isSubmitting
                              ? () async {
                                  final name = nameController.text.trim();
                                  final code = codeController.text.trim();
                                  final qty = int.tryParse(qtyController.text.trim()) ?? 0;

                                  if (name.isEmpty || code.isEmpty || qty <= 0) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text("Veuillez renseigner un nom, un code et un effectif valide."),
                                        backgroundColor: AppColors.danger,
                                      ),
                                    );
                                    return;
                                  }

                                  final messenger = ScaffoldMessenger.of(context);
                                  final navigator = Navigator.of(ctx);

                                  final success = await ref.read(flockProvider.notifier).createFlock(
                                    code: code,
                                    name: name,
                                    initialQuantity: qty,
                                    startDate: startDate,
                                    poultryType: poultryType,
                                    strain: strainController.text.trim(),
                                    buildingId: selectedBuildingId,
                                  );

                                  if (ctx.mounted) {
                                    if (success) {
                                      navigator.pop();
                                      messenger.showSnackBar(
                                        SnackBar(
                                          content: Text("Bande $name créée avec succès !"),
                                          backgroundColor: AppColors.success,
                                        ),
                                      );
                                    } else {
                                      final err = ref.read(flockProvider).error ?? "Une erreur est survenue.";
                                      final isQuotaOrUpgrade = err.contains("Limite atteinte") ||
                                          err.contains("quota") ||
                                          err.contains("formule") ||
                                          err.contains("Passez à");
                                      messenger.showSnackBar(
                                        SnackBar(
                                          content: Text(err),
                                          backgroundColor: AppColors.danger,
                                          duration: isQuotaOrUpgrade ? const Duration(seconds: 7) : const Duration(seconds: 4),
                                          action: isQuotaOrUpgrade
                                              ? SnackBarAction(
                                                  label: "Voir offres",
                                                  textColor: Colors.white,
                                                  onPressed: () {
                                                    Navigator.of(context).push(
                                                      MaterialPageRoute(
                                                        builder: (_) => const SubscriptionScreen(),
                                                      ),
                                                    );
                                                  },
                                                )
                                              : null,
                                        ),
                                      );
                                    }
                                  }
                                }
                              : null,
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: flockState.isSubmitting
                              ? const BrandLoader.button()
                              : const Text("Créer la bande"),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final flockState = ref.watch(flockProvider);
    final summary = flockState.summary;

    final filteredFlocks = flockState.flocks.where((f) {
      if (flockState.filterType != null && f.type != flockState.filterType) return false;
      return true;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.menu_rounded),
          tooltip: "Menu",
          onPressed: widget.onOpenMenu ?? () => Scaffold.maybeOf(context)?.openDrawer(),
        ),
        title: const Text("Bandes d’élevage"),
        actions: [
          IconButton(
            icon: Icon(
              isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
              color: isDark ? AppColors.primaryLight : Colors.white,
              size: 20,
            ),
            tooltip: isDark ? "Activer le mode clair" : "Activer le mode sombre",
            onPressed: () => ref.read(themeModeProvider.notifier).toggleTheme(context),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            tooltip: "Actualiser",
            onPressed: () => ref.read(flockProvider.notifier).loadFlocks(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(flockProvider.notifier).loadFlocks(showLoading: false),
        child: flockState.isLoading
            ? SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
                child: Column(
                  children: List.generate(3, (_) => AppShimmer.flockCard()),
                ),
              )
            : SingleChildScrollView(
                physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // En-tête simple et aéré (sans carte encombrante)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12, top: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    "${summary.totalBirds}",
                                    style: const TextStyle(
                                      fontSize: 22,
                                      fontWeight: FontWeight.w900,
                                      fontFamily: 'monospace',
                                      color: AppColors.primary,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  const Text(
                                    "volailles vivantes",
                                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              Text(
                                "${summary.activeFlocksCount} bande(s) active(s)",
                                style: const TextStyle(fontSize: 11, color: AppColors.textMutedLight),
                              ),
                            ],
                          ),
                          ElevatedButton.icon(
                            onPressed: _openCreateFlockDialog,
                            icon: const Icon(Icons.add_rounded, size: 16),
                            label: const Text("Nouvelle bande", style: TextStyle(fontSize: 12)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ],
                      ),
                    ),

                    AppSegmentedFilter<String?>(
                      selectedValue: flockState.filterType,
                      isDark: isDark,
                      options: const [
                        AppSegmentedFilterOption(value: null, label: "Toutes"),
                        AppSegmentedFilterOption(
                          value: "LAYER",
                          label: "Pondeuses",
                          selectedColor: AppColors.accent,
                        ),
                        AppSegmentedFilterOption(value: "BROILER", label: "Poulets chair"),
                      ],
                      onChanged: (value) => ref.read(flockProvider.notifier).setFilterType(value),
                    ),
                    const SizedBox(height: 14),

                    // Titre Liste
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          "Bandes",
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          "${filteredFlocks.length} bande(s)",
                          style: const TextStyle(fontSize: 12, color: AppColors.textMutedLight),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // Liste ou état vide
                    if (filteredFlocks.isEmpty)
                      AppEmptyState(
                        icon: Icons.pets_outlined,
                        title: "Aucune bande d'élevage enregistrée",
                        description: "Démarrez une nouvelle bande pour suivre la croissance, la ponte et la mortalité.",
                        actionLabel: "Créer une bande",
                        onAction: _openCreateFlockDialog,
                      )
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: filteredFlocks.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final flock = filteredFlocks[index];
                          return Card(
                            clipBehavior: Clip.antiAlias,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            child: InkWell(
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => FlockDetailScreen(flock: flock),
                                  ),
                                ).then((_) => ref.read(flockProvider.notifier).loadFlocks(showLoading: false));
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                flock.name,
                                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                              ),
                                            ],
                                          ),
                                        ),
                                        Row(
                                          children: [
                                            if (!flock.isActive) ...[
                                              const AppBadge(
                                                label: "Clôturé",
                                                variant: AppBadgeVariant.neutral,
                                                showDot: true,
                                              ),
                                              const SizedBox(width: 6),
                                            ],
                                            AppBadge(
                                              label: flock.typeLabel,
                                              variant: flock.isLayer ? AppBadgeVariant.warning : AppBadgeVariant.brand,
                                              showDot: true,
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      "${flock.breed} • ${flock.buildingName ?? 'Sans bâtiment'}${flock.ageInDays != null ? ' • ${flock.ageInDays} j' : ''}",
                                      style: const TextStyle(fontSize: 12, color: AppColors.textMutedLight),
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      children: [
                                        Text(
                                          "${flock.currentQuantity}",
                                          style: const TextStyle(
                                            fontSize: 20,
                                            fontWeight: FontWeight.bold,
                                            fontFamily: 'monospace',
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        const Text(
                                          "volailles vivantes",
                                          style: TextStyle(fontSize: 12, color: AppColors.textMutedLight),
                                        ),
                                        const Spacer(),
                                        const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textMutedLight),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
      ),
    );
  }

}
