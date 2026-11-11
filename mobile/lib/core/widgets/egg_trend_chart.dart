import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme/app_theme.dart';

class EggTrendPoint {
  final String date;
  final int? goodEggs;
  final int? crackedEggs;
  final int? abnormalEggs;

  const EggTrendPoint({
    required this.date,
    this.goodEggs,
    this.crackedEggs,
    this.abnormalEggs,
  });
}

class EggTrendChart extends StatelessWidget {
  final List<EggTrendPoint> points;
  final DateTime? cachedAt;
  final bool isLoading;
  final String? error;
  final String? startDate;
  final String? endDate;

  const EggTrendChart({
    super.key,
    required this.points,
    this.cachedAt,
    this.isLoading = false,
    this.error,
    this.startDate,
    this.endDate,
  });

  String _dateLabel(String value) {
    final date = DateTime.tryParse(value);
    return date == null ? value : DateFormat('dd/MM').format(date);
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final surface = dark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final border = dark ? AppColors.borderDark : AppColors.borderLight;
    final muted = dark ? Colors.white60 : AppColors.textMutedLight;
    final observations = {for (final point in points) point.date: point};
    final plotPoints = <EggTrendPoint>[];

    if (points.isNotEmpty) {
      var cursor = DateTime.tryParse(startDate ?? points.first.date);
      final last = DateTime.tryParse(endDate ?? points.last.date);
      while (cursor != null && last != null && !cursor.isAfter(last)) {
        final date = DateFormat('yyyy-MM-dd').format(cursor);
        plotPoints.add(observations[date] ?? EggTrendPoint(date: date));
        cursor = cursor.add(const Duration(days: 1));
      }
    }

    final series = <_EggSeries>[
      _EggSeries('Normaux', AppColors.primary, (point) => point.goodEggs),
      _EggSeries('Fêlés', AppColors.danger, (point) => point.crackedEggs),
      _EggSeries('Autres', AppColors.accent, (point) => point.abnormalEggs),
    ];
    final maxValue = points.fold<int>(0, (max, point) {
      final values = [point.goodEggs, point.crackedEggs, point.abnormalEggs];
      return values.fold<int>(max, (current, value) => (value ?? 0) > current ? value! : current);
    });
    final chartMaxY = maxValue == 0 ? 1.0 : maxValue * 1.12;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: border),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Tendance de ponte', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Wrap(
          spacing: 12,
          runSpacing: 6,
          children: series.map((item) => Row(mainAxisSize: MainAxisSize.min, children: [
            Container(width: 8, height: 8, decoration: BoxDecoration(color: item.color, shape: BoxShape.circle)),
            const SizedBox(width: 5),
            Text(item.label, style: TextStyle(fontSize: 10, color: muted)),
          ])).toList(),
        ),
        const SizedBox(height: 8),
        if (isLoading)
          const SizedBox(height: 150, child: Center(child: CircularProgressIndicator()))
        else if (error != null && points.isEmpty)
          SizedBox(height: 150, child: Center(child: Text(error!, textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, color: AppColors.danger))))
        else if (points.isEmpty)
          SizedBox(height: 150, child: Center(child: Text('Aucune donnée sur cette période.', style: TextStyle(fontSize: 12, color: muted))))
        else ...[
          SizedBox(
            height: 150,
            width: double.infinity,
            child: Semantics(
              label: 'Courbes de production quotidienne : œufs normaux, fêlés et autres œufs anormaux.',
              child: LineChart(
                LineChartData(
                  minX: 0,
                  maxX: (plotPoints.length - 1).clamp(1, double.infinity).toDouble(),
                  minY: 0,
                  maxY: chartMaxY,
                  gridData: FlGridData(
                    drawVerticalLine: false,
                    horizontalInterval: chartMaxY / 2,
                    getDrawingHorizontalLine: (_) => FlLine(color: border, strokeWidth: 1, dashArray: [3, 4]),
                  ),
                  borderData: FlBorderData(show: false),
                  titlesData: FlTitlesData(
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 30,
                        interval: chartMaxY / 2,
                        getTitlesWidget: (value, _) => Text(
                          NumberFormat.compact(locale: 'fr').format(value),
                          style: TextStyle(fontSize: 9, color: muted),
                        ),
                      ),
                    ),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 22,
                        interval: (plotPoints.length - 1).clamp(1, double.infinity).toDouble() / 2,
                        getTitlesWidget: (value, _) {
                          final index = value.round();
                          if (index < 0 || index >= plotPoints.length) return const SizedBox.shrink();
                          return Padding(
                            padding: const EdgeInsets.only(top: 5),
                            child: Text(_dateLabel(plotPoints[index].date), style: TextStyle(fontSize: 9, color: muted)),
                          );
                        },
                      ),
                    ),
                  ),
                  lineTouchData: LineTouchData(
                    handleBuiltInTouches: true,
                    touchTooltipData: LineTouchTooltipData(
                      getTooltipColor: (_) => surface,
                      getTooltipItems: (spots) => spots.map((spot) {
                        final index = spot.barIndex.clamp(0, series.length - 1);
                        final dateIndex = spot.x.round().clamp(0, plotPoints.length - 1);
                        return LineTooltipItem(
                          '${series[index].label}\n${_dateLabel(plotPoints[dateIndex].date)} · ${spot.y.round()} œufs',
                          TextStyle(color: series[index].color, fontSize: 10, fontWeight: FontWeight.w600),
                        );
                      }).toList(),
                    ),
                  ),
                  lineBarsData: series.map((item) {
                    final spots = plotPoints.asMap().entries
                        .where((entry) => item.value(entry.value) != null)
                        .map((entry) => FlSpot(
                              entry.key.toDouble(),
                              item.value(entry.value)!.toDouble(),
                            ))
                        .toList();
                    return LineChartBarData(
                      spots: spots,
                      color: item.color,
                      barWidth: 2.5,
                      isCurved: true,
                      curveSmoothness: 0.2,
                      preventCurveOverShooting: true,
                      isStrokeCapRound: true,
                      isStrokeJoinRound: true,
                      dotData: FlDotData(show: spots.length == 1),
                      belowBarData: BarAreaData(show: false),
                    );
                  }).toList(),
                ),
                duration: const Duration(milliseconds: 250),
              ),
            ),
          ),
          if (points.length == 1) ...[
            const SizedBox(height: 4),
            Text(
              'Ajoutez un relevé sur une autre journée pour afficher l’évolution.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 10, color: muted),
            ),
          ],
        ],
      ]),
    );
  }
}

class _EggSeries {
  final String label;
  final Color color;
  final int? Function(EggTrendPoint) value;

  const _EggSeries(this.label, this.color, this.value);
}
