import 'package:material_ui/material_ui.dart';

import '../theme/app_theme.dart';

class AppSegmentedFilterOption<T> {
  final T value;
  final String label;
  final Color? selectedColor;
  final String? badge;

  const AppSegmentedFilterOption({
    required this.value,
    required this.label,
    this.selectedColor,
    this.badge,
  });
}

/// Filter selector styled like the segmented filters on the health screen.
class AppSegmentedFilter<T> extends StatelessWidget {
  final T selectedValue;
  final List<AppSegmentedFilterOption<T>> options;
  final ValueChanged<T> onChanged;
  final bool isDark;
  final bool scrollable;

  const AppSegmentedFilter({
    super.key,
    required this.selectedValue,
    required this.options,
    required this.onChanged,
    required this.isDark,
    this.scrollable = false,
  });

  @override
  Widget build(BuildContext context) {
    final children = options.map(_buildOption).toList();

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.backgroundDark : AppColors.inputFillLight,
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.all(4),
      child: scrollable
          ? SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(children: children),
            )
          : Row(
              children: children
                  .map((child) => Expanded(child: child))
                  .toList(growable: false),
            ),
    );
  }

  Widget _buildOption(AppSegmentedFilterOption<T> option) {
    final isSelected = selectedValue == option.value;
    final selectedColor = option.selectedColor ?? AppColors.primary;
    final label = Text(
      option.label,
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
      style: TextStyle(
        fontSize: 11,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
        color: isSelected
            ? selectedColor
            : (isDark ? AppColors.textMutedDark : AppColors.textMutedLight),
      ),
    );
    final badge = option.badge == null || option.badge!.isEmpty
        ? null
        : Container(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
            decoration: BoxDecoration(
              color: selectedColor,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              option.badge!,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 9,
                fontWeight: FontWeight.bold,
              ),
            ),
          );

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => onChanged(option.value),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          constraints: scrollable ? const BoxConstraints(minWidth: 72) : null,
          padding: EdgeInsets.symmetric(
            horizontal: scrollable ? 12 : 4,
            vertical: 8,
          ),
          decoration: BoxDecoration(
            color: isSelected
                ? (isDark ? AppColors.surfaceDark : AppColors.surfaceLight)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 4,
                    ),
                  ]
                : null,
          ),
          alignment: Alignment.center,
          child: scrollable
              ? Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    label,
                    if (badge != null) ...[const SizedBox(width: 4), badge],
                  ],
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Flexible(child: label),
                    if (badge != null) ...[const SizedBox(width: 4), badge],
                  ],
                ),
        ),
      ),
    );
  }
}
