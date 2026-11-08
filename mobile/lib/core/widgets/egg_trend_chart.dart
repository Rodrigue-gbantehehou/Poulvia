import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme/app_theme.dart';

class EggTrendPoint {
  final String date;
  final int? goodEggs;
  const EggTrendPoint({required this.date, required this.goodEggs});
}

class EggTrendChart extends StatelessWidget {
  final List<EggTrendPoint> points;
  final DateTime? cachedAt;
  final bool isLoading;
  final String? error;
  final String? startDate;
  final String? endDate;
  const EggTrendChart({super.key, required this.points, this.cachedAt, this.isLoading = false, this.error, this.startDate, this.endDate});

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
    final observations = {for (final point in points) point.date: point.goodEggs};
    final plotPoints = <EggTrendPoint>[];
    if (points.isNotEmpty) {
      var cursor = DateTime.tryParse(startDate ?? points.first.date);
      final last = DateTime.tryParse(endDate ?? points.last.date);
      while (cursor != null && last != null && !cursor.isAfter(last)) {
        final date = DateFormat('yyyy-MM-dd').format(cursor);
        plotPoints.add(EggTrendPoint(date: date, goodEggs: observations[date]));
        cursor = cursor.add(const Duration(days: 1));
      }
    }
    final maxValue = points.fold<int>(0, (max, point) => (point.goodEggs ?? 0) > max ? (point.goodEggs ?? 0) : max);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: border)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text("Évolution de la ponte", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
        const SizedBox(height: 3),
        Text("Œufs bons par jour · 7 derniers jours", style: TextStyle(fontSize: 11, color: muted)),
        if (cachedAt != null) ...[
          const SizedBox(height: 5),
          Text("Données synchronisées le ${DateFormat('dd/MM à HH:mm').format(cachedAt!)}", style: TextStyle(fontSize: 10, color: muted)),
          Text("Les saisies hors ligne apparaîtront après synchronisation.", style: TextStyle(fontSize: 10, color: muted)),
        ],
        const SizedBox(height: 14),
        if (isLoading)
          const SizedBox(height: 150, child: Center(child: CircularProgressIndicator()))
        else if (error != null && points.isEmpty)
          SizedBox(height: 150, child: Center(child: Text(error!, textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, color: AppColors.danger))))
        else if (points.isEmpty)
          SizedBox(height: 150, child: Center(child: Text("Aucune donnée sur cette période.", style: TextStyle(fontSize: 12, color: muted))))
        else ...[
          SizedBox(
            height: 132,
            width: double.infinity,
            child: Semantics(
              label: "Production quotidienne d'œufs",
              child: CustomPaint(painter: _EggTrendPainter(points: plotPoints, maxValue: maxValue, color: AppColors.primary, gridColor: border, backgroundColor: surface)),
            ),
          ),
          const SizedBox(height: 5),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text(_dateLabel(plotPoints.first.date), style: TextStyle(fontSize: 10, color: muted)),
            if (plotPoints.length > 2) Text(_dateLabel(plotPoints[plotPoints.length ~/ 2].date), style: TextStyle(fontSize: 10, color: muted)),
            Text(_dateLabel(plotPoints.last.date), style: TextStyle(fontSize: 10, color: muted)),
          ]),
        ],
      ]),
    );
  }
}

class _EggTrendPainter extends CustomPainter {
  final List<EggTrendPoint> points;
  final int maxValue;
  final Color color;
  final Color gridColor;
  final Color backgroundColor;
  _EggTrendPainter({required this.points, required this.maxValue, required this.color, required this.gridColor, required this.backgroundColor});

  @override
  void paint(Canvas canvas, Size size) {
    final chart = Rect.fromLTWH(8, 8, size.width - 16, size.height - 16);
    final grid = Paint()..color = gridColor..strokeWidth = 1;
    for (var i = 0; i < 3; i++) {
      final y = chart.top + chart.height * i / 2;
      canvas.drawLine(Offset(chart.left, y), Offset(chart.right, y), grid);
    }
    final values = points.asMap().entries.map((entry) {
      final x = points.length == 1 ? chart.center.dx : chart.left + chart.width * entry.key / (points.length - 1);
      final eggs = entry.value.goodEggs;
      final y = eggs == null ? null : chart.bottom - (maxValue == 0 ? 0 : chart.height * eggs / maxValue);
      return (x: x, y: y);
    }).toList();
    final line = Paint()..color = color..strokeWidth = 2.5..strokeCap = StrokeCap.round..style = PaintingStyle.stroke;
    Path? path;
    var segmentLength = 0;
    for (final point in values) {
      if (point.y == null) {
        if (path != null && segmentLength > 1) canvas.drawPath(path, line);
        path = null;
        segmentLength = 0;
      } else {
        if (path == null) { path = Path()..moveTo(point.x, point.y!); segmentLength = 1; }
        else { path.lineTo(point.x, point.y!); segmentLength++; }
      }
    }
    if (path != null && segmentLength > 1) canvas.drawPath(path, line);
    final dot = Paint()..color = color;
    final hole = Paint()..color = backgroundColor;
    for (final point in values) { if (point.y != null) { final offset = Offset(point.x, point.y!); canvas.drawCircle(offset, 4, dot); canvas.drawCircle(offset, 1.8, hole); } }
  }

  @override
  bool shouldRepaint(covariant _EggTrendPainter oldDelegate) => oldDelegate.points != points || oldDelegate.maxValue != maxValue || oldDelegate.color != color || oldDelegate.gridColor != gridColor || oldDelegate.backgroundColor != backgroundColor;
}
