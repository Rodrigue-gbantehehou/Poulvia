import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/models/contact.dart';
import '../../core/design_system/app_card.dart';
import '../../core/design_system/app_modal_surface.dart';
import '../../core/design_system/app_segmented_filter.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/widgets/brand_loader.dart';
import 'contacts_provider.dart';
import '../auth/auth_provider.dart';

class ContactsScreen extends ConsumerStatefulWidget {
  final VoidCallback? onBack;
  final VoidCallback? onOpenMenu;

  const ContactsScreen({super.key, this.onBack, this.onOpenMenu});

  @override
  ConsumerState<ContactsScreen> createState() => _ContactsScreenState();
}

class _ContactsScreenState extends ConsumerState<ContactsScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final farm = ref.watch(authProvider).activeFarm;
    final canView = farm == null || farm.canViewContacts;
    final canCreate = farm == null || farm.canCreateContacts;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (!canView) {
      return Scaffold(
        appBar: AppBar(
          leading: widget.onBack != null
              ? IconButton(
                  icon: const Icon(Icons.arrow_back_rounded),
                  tooltip: "Retour",
                  onPressed: widget.onBack,
                )
              : (widget.onOpenMenu != null
                  ? IconButton(
                      icon: const Icon(Icons.menu_rounded),
                      tooltip: "Menu",
                      onPressed: widget.onOpenMenu,
                    )
                  : null),
          title: const Text("Répertoire & Contacts"),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.danger.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.lock_outline_rounded, color: AppColors.danger, size: 32),
                ),
                const SizedBox(height: 16),
                const Text(
                  "Accès restreint",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  "Vous ne disposez pas des autorisations nécessaires pour consulter le carnet de contacts de cette exploitation.",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color: isDark ? Colors.white60 : AppColors.textMutedLight,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final state = ref.watch(contactsProvider);

    ref.listen<ContactsState>(contactsProvider, (_, next) {
      if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.error!),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    });

    return Scaffold(
      appBar: AppBar(
        leading: widget.onBack != null
            ? IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                tooltip: "Retour",
                onPressed: widget.onBack,
              )
            : (widget.onOpenMenu != null
                ? IconButton(
                    icon: const Icon(Icons.menu_rounded),
                    tooltip: "Menu",
                    onPressed: widget.onOpenMenu,
                  )
                : null),
        title: const Text("Répertoire & Contacts"),
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
            onPressed: () => ref.read(contactsProvider.notifier).loadContacts(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'fab_contacts',
        onPressed: () => _openContactModal(context),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.person_add_alt_1_rounded, color: Colors.white),
        label: const Text(
          "Ajouter un contact",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(contactsProvider.notifier).loadContacts(showLoading: false),
        child: state.isLoading
            ? const Center(child: BrandLoader(message: "Chargement du carnet d'adresses..."))
            : SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "${state.contacts.length} contacts · ${state.clientsCount} clients · ${state.suppliersCount} fournisseurs",
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Barre de recherche
                    TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: "Rechercher par nom, téléphone ou ville...",
                        prefixIcon: const Icon(Icons.search_rounded),
                        suffixIcon: _searchController.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear_rounded),
                                onPressed: () {
                                  _searchController.clear();
                                  ref.read(contactsProvider.notifier).setSearchQuery("");
                                  setState(() {});
                                },
                              )
                            : null,
                        filled: true,
                        fillColor: isDark ? AppColors.surfaceDark : AppColors.inputFillLight,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: isDark ? AppColors.borderDark : AppColors.borderLight,
                          ),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: isDark ? AppColors.borderDark : AppColors.borderLight,
                          ),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                      onChanged: (val) {
                        ref.read(contactsProvider.notifier).setSearchQuery(val);
                        setState(() {});
                      },
                    ),
                    const SizedBox(height: 14),

                    AppSegmentedFilter<String?>(
                      selectedValue: state.typeFilter,
                      isDark: isDark,
                      options: [
                        AppSegmentedFilterOption(value: null, label: "Tous", badge: "${state.contacts.length}"),
                        AppSegmentedFilterOption(value: 'CLIENT', label: "Clients", badge: "${state.clientsCount}"),
                        AppSegmentedFilterOption(value: 'SUPPLIER', label: "Fournisseurs", badge: "${state.suppliersCount}"),
                      ],
                      onChanged: (value) => ref.read(contactsProvider.notifier).setFilter(value),
                    ),
                    const SizedBox(height: 16),

                    // Liste des contacts
                    if (state.filteredContacts.isEmpty)
                      _buildEmptyState(context, isDark, state.typeFilter)
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: state.filteredContacts.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (ctx, index) {
                          final contact = state.filteredContacts[index];
                          return _buildContactCard(context, contact, isDark, canCreate);
                        },
                      ),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildContactCard(BuildContext context, Contact contact, bool isDark, bool canCreate) {
    const badgeColor = AppColors.primary;
    String badgeLabel;
    switch (contact.type) {
      case ContactType.client:
        badgeLabel = "Client";
        break;
      case ContactType.supplier:
        badgeLabel = "Fournisseur";
        break;
      case ContactType.both:
        badgeLabel = "Client & Fournisseur";
        break;
    }

    return AppCard(
      padding: const EdgeInsets.all(14),
      child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: badgeColor.withValues(alpha: 0.15),
                  child: Text(
                    contact.name.isNotEmpty ? contact.name[0].toUpperCase() : "?",
                    style: const TextStyle(
                      color: badgeColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        contact.name,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: badgeColor.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              badgeLabel,
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: badgeColor,
                              ),
                            ),
                          ),
                          if (contact.city != null && contact.city!.isNotEmpty) ...[
                            const SizedBox(width: 6),
                            Icon(
                              Icons.location_on_rounded,
                              size: 13,
                              color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                            ),
                            const SizedBox(width: 2),
                            Text(
                              contact.city!,
                              style: TextStyle(
                                fontSize: 11,
                                color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
                if (canCreate)
                  PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert_rounded, size: 20),
                  onSelected: (val) {
                    if (val == 'edit') {
                      _openContactModal(context, contact: contact);
                    } else if (val == 'delete') {
                      _confirmDelete(context, contact);
                    }
                  },
                  itemBuilder: (ctx) => [
                    const PopupMenuItem(
                      value: 'edit',
                      child: Row(
                        children: [
                          Icon(Icons.edit_outlined, size: 18),
                          SizedBox(width: 8),
                          Text("Modifier"),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete_outline, size: 18, color: AppColors.danger),
                          SizedBox(width: 8),
                          Text("Supprimer", style: TextStyle(color: AppColors.danger)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 10),
            const Divider(height: 1),
            const SizedBox(height: 10),
            Row(
              children: [
                if (contact.phone != null && contact.phone!.isNotEmpty) ...[
                  Expanded(
                    child: Row(
                      children: [
                        const Icon(Icons.phone_rounded, size: 15, color: AppColors.primary),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            contact.phone!,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ] else ...[
                  Expanded(
                    child: Text(
                      "Aucun téléphone",
                      style: TextStyle(
                        fontSize: 12,
                        fontStyle: FontStyle.italic,
                        color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                      ),
                    ),
                  ),
                ],
                if (contact.email != null && contact.email!.isNotEmpty) ...[
                  const SizedBox(width: 8),
                  Icon(
                    Icons.email_outlined,
                    size: 15,
                    color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                  ),
                  const SizedBox(width: 4),
                  Flexible(
                    child: Text(
                      contact.email!,
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ],
            ),
            if (contact.notes != null && contact.notes!.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                contact.notes!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 11,
                  fontStyle: FontStyle.italic,
                  color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                ),
              ),
            ],
          ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, bool isDark, String? filter) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
      child: Column(
        children: [
          Icon(
            Icons.contact_phone_outlined,
            size: 60,
            color: AppColors.primary.withValues(alpha: isDark ? 0.30 : 0.20),
          ),
          const SizedBox(height: 14),
          Text(
            filter == null
                ? "Aucun contact enregistré"
                : "Aucun ${filter == 'CLIENT' ? 'client' : 'fournisseur'} trouvé",
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            "Ajoutez vos clients, revendeurs ou fournisseurs d'aliments et intrants.",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
            ),
          ),
          const SizedBox(height: 18),
          ElevatedButton.icon(
            onPressed: () => _openContactModal(context),
            icon: const Icon(Icons.add_rounded),
            label: const Text("Créer un contact"),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  void _openContactModal(BuildContext context, {Contact? contact}) {
    final farm = ref.read(authProvider).activeFarm;
    if (farm != null && !farm.canCreateContacts) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Vous n'avez pas la permission de créer ou modifier des contacts."),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }
    final isEditing = contact != null;
    final nameController = TextEditingController(text: contact?.name ?? "");
    final phoneController = TextEditingController(text: contact?.phone ?? "");
    final emailController = TextEditingController(text: contact?.email ?? "");
    final addressController = TextEditingController(text: contact?.address ?? "");
    final cityController = TextEditingController(text: contact?.city ?? "");
    final notesController = TextEditingController(text: contact?.notes ?? "");
    String selectedType = contact?.type.code ?? "CLIENT";

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (modalCtx, setModalState) {
          final isDarkModal = Theme.of(modalCtx).brightness == Brightness.dark;
          final contactState = ref.watch(contactsProvider);

          return Padding(
            padding: EdgeInsets.only(top: MediaQuery.of(modalCtx).padding.top + 20),
            child: AppModalSurface(
              child: SingleChildScrollView(
                child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: isDarkModal ? AppColors.borderDark : AppColors.borderLight,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    isEditing ? "Modifier le contact" : "Nouveau contact",
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 18),

                  // Sélecteur de type
                  const Text(
                    "Type de contact *",
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: ChoiceChip(
                          label: const Center(child: Text("Client")),
                          selected: selectedType == 'CLIENT',
                          onSelected: (val) {
                            if (val) setModalState(() => selectedType = 'CLIENT');
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ChoiceChip(
                          label: const Center(child: Text("Fournisseur")),
                          selected: selectedType == 'SUPPLIER',
                          onSelected: (val) {
                            if (val) setModalState(() => selectedType = 'SUPPLIER');
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ChoiceChip(
                          label: const Center(child: Text("Mixte")),
                          selected: selectedType == 'BOTH',
                          onSelected: (val) {
                            if (val) setModalState(() => selectedType = 'BOTH');
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Nom
                  TextField(
                    controller: nameController,
                    decoration: const InputDecoration(
                      labelText: "Nom complet ou Raison sociale *",
                      hintText: "Ex: Établissement Koffi & Fils",
                      prefixIcon: Icon(Icons.badge_outlined),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Téléphone & Ville
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: phoneController,
                          keyboardType: TextInputType.phone,
                          decoration: const InputDecoration(
                            labelText: "Téléphone",
                            hintText: "Ex: +229 97 00 00 00",
                            prefixIcon: Icon(Icons.phone_outlined),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: cityController,
                          decoration: const InputDecoration(
                            labelText: "Ville",
                            hintText: "Ex: Calavi",
                            prefixIcon: Icon(Icons.location_city_outlined),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Email
                  TextField(
                    controller: emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      labelText: "Adresse email (facultatif)",
                      hintText: "contact@entreprise.com",
                      prefixIcon: Icon(Icons.email_outlined),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Adresse
                  TextField(
                    controller: addressController,
                    decoration: const InputDecoration(
                      labelText: "Adresse physique / Repère",
                      hintText: "Ex: Rue du marché, Tokpa",
                      prefixIcon: Icon(Icons.place_outlined),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Notes
                  TextField(
                    controller: notesController,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      labelText: "Notes ou observations",
                      hintText: "Ex: Grossiste régulier pour les plateaux d'œufs...",
                      prefixIcon: Icon(Icons.notes_rounded),
                    ),
                  ),
                  const SizedBox(height: 22),

                  // Boutons d'action
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(modalCtx),
                          child: const Text("Annuler"),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: contactState.isSubmitting
                              ? null
                              : () async {
                                  final name = nameController.text.trim();
                                  if (name.isEmpty) {
                                    ScaffoldMessenger.of(modalCtx).showSnackBar(
                                      const SnackBar(
                                        content: Text("Le nom du contact est obligatoire."),
                                        backgroundColor: AppColors.danger,
                                      ),
                                    );
                                    return;
                                  }

                                  bool success;
                                  if (isEditing) {
                                    success = await ref.read(contactsProvider.notifier).updateContact(
                                          contactId: contact.id,
                                          name: name,
                                          type: selectedType,
                                          phone: phoneController.text.trim(),
                                          email: emailController.text.trim(),
                                          address: addressController.text.trim(),
                                          city: cityController.text.trim(),
                                          notes: notesController.text.trim(),
                                        );
                                  } else {
                                    success = await ref.read(contactsProvider.notifier).createContact(
                                          name: name,
                                          type: selectedType,
                                          phone: phoneController.text.trim(),
                                          email: emailController.text.trim(),
                                          address: addressController.text.trim(),
                                          city: cityController.text.trim(),
                                          notes: notesController.text.trim(),
                                        );
                                  }

                                  if (!modalCtx.mounted) return;
                                  if (success) {
                                    Navigator.pop(modalCtx);
                                    if (!mounted) return;
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(
                                          isEditing
                                              ? "Contact mis à jour avec succès !"
                                              : "Contact ajouté au carnet d'adresses !",
                                        ),
                                        backgroundColor: AppColors.success,
                                      ),
                                    );
                                  }
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                          ),
                          child: contactState.isSubmitting
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : Text(isEditing ? "Enregistrer" : "Créer le contact"),
                        ),
                      ),
                    ],
                  ),
                ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  void _confirmDelete(BuildContext context, Contact contact) {
    final farm = ref.read(authProvider).activeFarm;
    if (farm != null && !farm.canCreateContacts) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Vous n'avez pas la permission de supprimer des contacts."),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Supprimer ce contact ?"),
        content: Text(
          "Êtes-vous sûr de vouloir retirer \"${contact.name}\" de votre répertoire ? Cette action est irréversible.",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Annuler"),
          ),
          ElevatedButton(
            onPressed: () async {
              final messenger = ScaffoldMessenger.of(context);
              Navigator.pop(ctx);
              final success =
                  await ref.read(contactsProvider.notifier).deleteContact(contact.id);
              if (success && mounted) {
                messenger.showSnackBar(
                  const SnackBar(
                    content: Text("Contact supprimé avec succès."),
                    backgroundColor: AppColors.success,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: Colors.white,
            ),
            child: const Text("Supprimer"),
          ),
        ],
      ),
    );
  }
}
