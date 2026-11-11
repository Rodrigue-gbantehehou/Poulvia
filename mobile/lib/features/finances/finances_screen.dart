import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/design_system/app_segmented_filter.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/utils/currency_formatter.dart';
import '../../core/design_system/app_shimmer.dart';
import '../../core/design_system/app_empty_state.dart';
import 'finance_provider.dart';
import 'record_transaction_modal.dart';
import 'sales_receipt_modal.dart';

class FinancesScreen extends ConsumerStatefulWidget {
  final VoidCallback? onBack;
  final VoidCallback? onOpenMenu;
  const FinancesScreen({super.key, this.onBack, this.onOpenMenu});

  @override
  ConsumerState<FinancesScreen> createState() => _FinancesScreenState();
}

class _FinancesScreenState extends ConsumerState<FinancesScreen> {
  // Les créances avancées restent compatibles avec les données existantes, mais sont masquées du parcours standard.
  final bool _showAdvancedReceivables = false;
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(financeProvider.notifier).loadTransactions(showLoading: false);
    });
  }

  void _openRecordTransactionDialog([String initialType = "INCOME"]) {
    RecordTransactionModal.show(context, initialType: initialType);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final mutedColor =
        isDark ? AppColors.textMutedDark : AppColors.textMutedLight;
    final financeState = ref.watch(financeProvider);
    final summary = financeState.summary;

    final filteredTx = financeState.transactions.where((t) {
      if (financeState.filterType == null) return true;
      return t.type == financeState.filterType;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        leading: widget.onBack != null
            ? IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                tooltip: "Retour",
                onPressed: widget.onBack,
              )
            : IconButton(
                icon: const Icon(Icons.menu_rounded),
                tooltip: "Menu",
                onPressed: widget.onOpenMenu ??
                    () => Scaffold.maybeOf(context)?.openDrawer(),
              ),
        title: const Text("Caisse & Finances"),
        actions: [
          IconButton(
            icon: Icon(
              isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
              color: isDark ? AppColors.primaryLight : Colors.white,
              size: 20,
            ),
            tooltip:
                isDark ? "Activer le mode clair" : "Activer le mode sombre",
            onPressed: () =>
                ref.read(themeModeProvider.notifier).toggleTheme(context),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            tooltip: "Actualiser",
            onPressed: () =>
                ref.read(financeProvider.notifier).loadTransactions(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref
            .read(financeProvider.notifier)
            .loadTransactions(showLoading: false),
        child: financeState.isLoading
            ? SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
                child: Column(
                  children:
                      List.generate(5, (_) => AppShimmer.transactionRow()),
                ),
              )
            : SingleChildScrollView(
                physics: const BouncingScrollPhysics(
                    parent: AlwaysScrollableScrollPhysics()),
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // En-tête Caisse & Finances (Léger & Aéré)
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "SOLDE DISPONIBLE",
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.8,
                                  color: mutedColor,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                "${summary.netBalance >= 0 ? '+' : ''}${CurrencyFormatter.formatFcfa(summary.netBalance)}",
                                style: const TextStyle(
                                  fontSize: 26,
                                  fontWeight: FontWeight.w900,
                                  fontFamily: 'monospace',
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Text(
                                    "+${CurrencyFormatter.formatFcfa(summary.totalIncome)}",
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text("•",
                                      style: TextStyle(color: mutedColor)),
                                  const SizedBox(width: 8),
                                  Text(
                                    "-${CurrencyFormatter.formatFcfa(summary.totalExpense)}",
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        OutlinedButton.icon(
                          onPressed: () =>
                              _openRecordTransactionDialog("EXPENSE"),
                          icon: const Icon(Icons.remove_rounded, size: 16),
                          label: const Text("Dépense",
                              style: TextStyle(
                                  fontSize: 12, fontWeight: FontWeight.bold)),
                          style: OutlinedButton.styleFrom(
                            foregroundColor:
                                Theme.of(context).colorScheme.onSurface,
                            side: BorderSide(
                                color: isDark
                                    ? AppColors.borderDark
                                    : AppColors.borderLight),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 8),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    AppSegmentedFilter<String?>(
                      selectedValue: financeState.filterType,
                      isDark: isDark,
                      options: const [
                        AppSegmentedFilterOption(value: null, label: "Tout"),
                        AppSegmentedFilterOption(
                            value: "INCOME", label: "Recettes"),
                        AppSegmentedFilterOption(
                            value: "EXPENSE",
                            label: "Dépenses",
                            selectedColor: AppColors.danger),
                      ],
                      onChanged: (value) => ref
                          .read(financeProvider.notifier)
                          .setFilterType(value),
                    ),
                    const SizedBox(height: 14),

                    // Titre Liste
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          "Journal de caisse",
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          "${filteredTx.length} opération(s)",
                          style: TextStyle(fontSize: 12, color: mutedColor),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // Liste ou état vide
                    if (filteredTx.isEmpty)
                      AppEmptyState(
                        icon: Icons.account_balance_wallet_outlined,
                        title: "Aucune transaction enregistrée",
                        description:
                            "Enregistrez vos premières ventes ou dépenses pour suivre votre rentabilité en direct.",
                        actionLabel: "Encaisser une vente",
                        onAction: () => _openRecordTransactionDialog("INCOME"),
                      )
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: filteredTx.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final tx = filteredTx[index];

                          return Card(
                            child: ListTile(
                              onTap: tx.isIncome
                                  ? () => SalesReceiptModal.show(context,
                                      transaction: tx)
                                  : null,
                              leading: CircleAvatar(
                                backgroundColor: tx.isIncome
                                    ? AppColors.success.withValues(alpha: 0.12)
                                    : AppColors.danger.withValues(alpha: 0.12),
                                child: Icon(
                                  tx.isIncome
                                      ? Icons.add_rounded
                                      : Icons.remove_rounded,
                                ),
                              ),
                              title: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      tx.note ?? tx.categoryLabel,
                                      style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  Text(
                                    "${tx.isIncome ? '+' : '-'}${CurrencyFormatter.formatFcfa(tx.amount)}",
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w900,
                                      fontSize: 14,
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                ],
                              ),
                              subtitle: Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            "${tx.categoryLabel} • ${tx.paymentMethodLabel}",
                                            style: TextStyle(
                                                fontSize: 11,
                                                color: mutedColor),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        Text(
                                          tx.date,
                                          style: TextStyle(
                                              fontSize: 10, color: mutedColor),
                                        ),
                                      ],
                                    ),
                                    if (_showAdvancedReceivables &&
                                        !tx.isPaid) ...[
                                      const SizedBox(height: 4),
                                      Text(
                                        "${tx.paymentStatusLabel} • Reste: ${CurrencyFormatter.formatFcfa(tx.remainingAmount)}",
                                        style: const TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.w600),
                                      ),
                                    ],
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
