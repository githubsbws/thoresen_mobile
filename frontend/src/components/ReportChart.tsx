import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PRIMARY = '#001B74';
const BLUE = '#1685E5';
const RED = '#E30613';
const GREEN = '#10B981';
const AMBER = '#F59E0B';
const PURPLE = '#8B5CF6';

export interface ChartDataItem {
  label: string;
  value: number;
  color?: string;
}

interface ReportChartProps {
  type: 'column' | 'pie';
  title?: string;
  data?: ChartDataItem[];
}

const DEFAULT_DATA: ChartDataItem[] = [
  { label: 'Marine', value: 45, color: PRIMARY },
  { label: 'HR', value: 30, color: BLUE },
  { label: 'MPD', value: 20, color: GREEN },
  { label: 'Technical', value: 15, color: AMBER },
  { label: 'QAS', value: 10, color: PURPLE },
];

export const ReportChart: React.FC<ReportChartProps> = ({
  type,
  title = 'Report Statistics Chart',
  data = DEFAULT_DATA,
}) => {
  const chartData = data && data.length > 0 ? data : DEFAULT_DATA;
  const maxValue = Math.max(...chartData.map((d) => d.value), 1);
  const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const colors = [PRIMARY, BLUE, GREEN, AMBER, PURPLE, RED];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {type === 'column' ? 'BAR CHART' : 'PIE CHART'}
          </Text>
        </View>
      </View>

      {type === 'column' ? (
        <View style={styles.columnContainer}>
          <View style={styles.barsRow}>
            {chartData.map((item, idx) => {
              const barHeightPct = Math.round((item.value / maxValue) * 100);
              const barColor = item.color || colors[idx % colors.length];
              return (
                <View key={idx} style={styles.colItem}>
                  <Text style={styles.valText}>{item.value}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${Math.max(barHeightPct, 8)}%`,
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.labelText} numberOfLines={1}>
                    {item.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.pieContainer}>
          <View style={styles.pieRow}>
            <View style={styles.pieVisual}>
              <View style={styles.pieOuterRing}>
                <View style={styles.pieCenterCircle}>
                  <Text style={styles.pieTotalVal}>{totalValue}</Text>
                  <Text style={styles.pieTotalSub}>TOTAL</Text>
                </View>
              </View>
            </View>

            <View style={styles.legendCol}>
              {chartData.map((item, idx) => {
                const pct = totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0;
                const legendColor = item.color || colors[idx % colors.length];
                return (
                  <View key={idx} style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: legendColor }]} />
                    <Text style={styles.legendLabel} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <Text style={styles.legendVal}>{pct}% ({item.value})</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY,
  },
  badge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: PRIMARY,
  },
  columnContainer: {
    paddingTop: 8,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 140,
    paddingBottom: 4,
  },
  colItem: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  valText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  barTrack: {
    width: 22,
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  labelText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  pieContainer: {
    paddingVertical: 6,
  },
  pieRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pieVisual: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieOuterRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 10,
    borderColor: PRIMARY,
    borderTopColor: BLUE,
    borderRightColor: GREEN,
    borderBottomColor: AMBER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieCenterCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieTotalVal: {
    fontSize: 14,
    fontWeight: '800',
    color: PRIMARY,
  },
  pieTotalSub: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '700',
  },
  legendCol: {
    flex: 1,
    marginLeft: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  legendVal: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
});
