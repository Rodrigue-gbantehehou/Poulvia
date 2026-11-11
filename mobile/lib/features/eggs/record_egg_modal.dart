import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/models/flock.dart';
import '../../core/design_system/app_modal_surface.dart';
import '../../core/theme/app_theme.dart';
import '../dashboard/dashboard_provider.dart';
import '../flocks/flock_provider.dart';
import 'egg_provider.dart';

class RecordEggModal extends ConsumerStatefulWidget {
  final String? defaultFlockId;
  final VoidCallback? onSaved;

  const RecordEggModal({
    super.key,
    this.defaultFlockId,
    this.onSaved,
  });

  static Future<bool?> show(
    BuildContext context, {
    String? defaultFlockId,
    VoidCallback? onSaved,
  }) {
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => RecordEggModal(
        defaultFlockId: defaultFlockId,
        onSaved: onSaved,
      ),
    );
  }

  @override
  ConsumerState<RecordEggModal> createState() => _RecordEggModalState();
}

class _RecordEggModalState extends ConsumerState<RecordEggModal> {
  String? _selectedFlockId;
  final DateTime _selectedDate = DateTime.now();
  String _session = "MORNING";
  int _goodEggs = 0;
  final _goodEggsController = TextEditingController(text: '0');
  int _crackedEggs = 0;
  int _deformedEggs = 0;
  final _crackedEggsController = TextEditingController(text: '0');
  final _deformedEggsController = TextEditingController(text: '0');
  final _notesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _selectedFlockId = widget.defaultFlockId;
  }

  @override
  void dispose() {
    _notesController.dispose();
    _goodEggsController.dispose();
    _crackedEggsController.dispose();
    _deformedEggsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;
    final eggState = ref.watch(eggProvider);
    final flockState = ref.watch(flockProvider);

    // Récupération des bandes de pondeuses disponibles
    List<Flock> layerFlocks = eggState.layerFlocks;
    if (layerFlocks.isEmpty) {
      layerFlocks = flockState.flocks.where((f) => f.isLayer).toList();
    }

    if (layerFlocks.isNotEmpty) {
      if (_selectedFlockId == null || !layerFlocks.any((f) => f.id == _selectedFlockId)) {
        _selectedFlockId = layerFlocks.first.id;
      }
    }


    return AppModalSurface(
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Poignée de glissement
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

            // En-tête
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.egg_rounded, color: AppColors.accent, size: 22),
                    SizedBox(width: 8),
                    Text(
                      "Collecte d'Œufs",
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Navigator.pop(context, false),
                ),
              ],
            ),
            const SizedBox(height: 12),

            if (layerFlocks.isEmpty) ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.danger.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline, color: AppColors.danger, size: 20),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        "Aucun lot de pondeuses actif trouvé dans votre exploitation.",
                        style: TextStyle(fontSize: 12, color: AppColors.danger, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ] else ...[
              // Sélection du Lot / Bande
              if (layerFlocks.length > 1) ...[
                const Text(
                  "Bande de pondeuses *",
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.surfaceDark : AppColors.inputFillLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: borderColor),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedFlockId,
                      isExpanded: true,
                      items: layerFlocks.map((flock) {
                        return DropdownMenuItem<String>(
                          value: flock.id,
                          child: Text(
                            "${flock.name} (${flock.currentQuantity} sujets)",
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedFlockId = val);
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 14),
              ] else ...[
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.accent.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.pets, size: 16, color: AppColors.accent),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          "Bande : ${layerFlocks.first.name} (${layerFlocks.first.currentQuantity} sujets)",
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.accent),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
              ],

              // Session de ramassage
              const Text(
                "Session de collecte *",
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  _SessionChip(
                    label: "Matin",
                    icon: Icons.wb_sunny_outlined,
                    isSelected: _session == "MORNING",
                    onTap: () => setState(() => _session = "MORNING"),
                  ),
                  const SizedBox(width: 6),
                  _SessionChip(
                    label: "Midi",
                    icon: Icons.wb_sunny,
                    isSelected: _session == "AFTERNOON",
                    onTap: () => setState(() => _session = "AFTERNOON"),
                  ),
                  const SizedBox(width: 6),
                  _SessionChip(
                    label: "Soir",
                    icon: Icons.nightlight_round_outlined,
                    isSelected: _session == "EVENING",
                    onTap: () => setState(() => _session = "EVENING"),
                  ),
                  const SizedBox(width: 6),
                  _SessionChip(
                    label: "Jour",
                    icon: Icons.all_inclusive,
                    isSelected: _session == "ALL_DAY",
                    onTap: () => setState(() => _session = "ALL_DAY"),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          "Bons œufs récoltés *",
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textMainLight,
                          ),
                        ),
                        if (_goodEggs > 0)
                          InkWell(
                            onTap: () => setState(() {
                              _goodEggs = 0;
                              _goodEggsController.text = '0';
                            }),
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                              child: Text(
                                "Remettre à 0",
                                style: TextStyle(fontSize: 11, color: AppColors.danger, fontWeight: FontWeight.w600),
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _goodEggsController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        hintText: "Nombre d’œufs",
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (value) => setState(() => _goodEggs = int.tryParse(value) ?? 0),
                    ),
                ],
              ),
              const SizedBox(height: 16),

              // Déclassement & Anomalies
              const Text(
                "Déclassement & Anomalies",
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _crackedEggsController,
                keyboardType: TextInputType.number,
                onTap: () => _crackedEggsController.selection = TextSelection(
                  baseOffset: 0,
                  extentOffset: _crackedEggsController.text.length,
                ),
                onChanged: (value) => setState(() => _crackedEggs = int.tryParse(value) ?? 0),
                decoration: const InputDecoration(
                  labelText: "Œufs fêlés / cassés",
                  hintText: "0",
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _deformedEggsController,
                keyboardType: TextInputType.number,
                onTap: () => _deformedEggsController.selection = TextSelection(
                  baseOffset: 0,
                  extentOffset: _deformedEggsController.text.length,
                ),
                onChanged: (value) => setState(() => _deformedEggs = int.tryParse(value) ?? 0),
                decoration: const InputDecoration(
                  labelText: "Œufs déformés / anormaux",
                  hintText: "0",
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 14),

              // Observations optionnelles
              TextField(
                controller: _notesController,
                maxLines: 2,
                decoration: InputDecoration(
                  labelText: "Observations (optionnel)",
                  hintText: "Ex: Ramassage retardé, bonne couleur de coquille...",
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.all(12),
                ),
              ),
              const SizedBox(height: 18),

              // Boutons d'action
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context, false),
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
                      onPressed: (_goodEggs > 0 && !eggState.isSubmitting && _selectedFlockId != null)
                          ? () async {
                              final scaffoldMessenger = ScaffoldMessenger.of(context);
                              final navigator = Navigator.of(context);

                              final success = await ref.read(eggProvider.notifier).recordProduction(
                                flockId: _selectedFlockId!,
                                date: _selectedDate,
                                session: _session,
                                goodEggs: _goodEggs,
                                crackedEggs: _crackedEggs,
                                dirtyEggs: 0,
                                deformedEggs: _deformedEggs,
                                notes: _notesController.text,
                              );

                              if (mounted) {
                                if (success) {
                                  // Rechargement immédiat du Dashboard et des données de ponte
                                  ref.read(dashboardProvider.notifier).loadDashboard(showLoading: false);
                                  widget.onSaved?.call();

                                  navigator.pop(true);
                                  scaffoldMessenger.showSnackBar(
                                    SnackBar(
                                      content: Text("Collecte de $_goodEggs œufs enregistrée avec succès"),
                                      backgroundColor: AppColors.success,
                                    ),
                                  );
                                } else {
                                  final err = ref.read(eggProvider).error ?? "Une erreur est survenue.";
                                  scaffoldMessenger.showSnackBar(
                                    SnackBar(content: Text(err), backgroundColor: AppColors.danger),
                                  );
                                }
                              }
                            }
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: eggState.isSubmitting
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text("Enregistrer"),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _SessionChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _SessionChip({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.accent : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? AppColors.accent : AppColors.borderLight,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 16, color: isSelected ? Colors.white : AppColors.textMutedLight),
              const SizedBox(height: 2),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : AppColors.textMutedLight,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

