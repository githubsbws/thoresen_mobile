import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, radius, spacing } from '../../src/theme';
import '../../src/locales/i18n';
import { courses } from '../../src/data';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../src/components/AppHeader';
const FILTERS = ['ทั้งหมด', 'รอทำ', 'ทำแล้ว'];

export default function ExamsScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ทั้งหมด');

  const filteredCourses = useMemo(() => {
    return courses.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader />
          <View>
            <Text style={styles.heroSmall}>Examination</Text>
            <Text style={styles.heroTitle}>ทำแบบทดสอบ</Text>
            <Text style={styles.heroDesc}>
              เลือกแบบทดสอบเพื่อเริ่มประเมินความรู้ของคุณ
            </Text>
          </View>

        

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>{courses.length}</Text>
            <Text style={styles.summaryLabel}>ทั้งหมด</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>20</Text>
            <Text style={styles.summaryLabel}>ข้อ/ชุด</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>30</Text>
            <Text style={styles.summaryLabel}>นาที</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#8A94A6" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ค้นหาแบบทดสอบ"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map(item => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterChip,
                activeFilter === item && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === item && styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>รายการแบบทดสอบ</Text>
          <Text style={styles.countText}>{filteredCourses.length} รายการ</Text>
        </View>

        <View style={styles.list}>
          {filteredCourses.map((c, index) => {
            const isFire = c.category === 'fire';

            return (
              <TouchableOpacity
                key={c.id}
                style={styles.examCard}
                activeOpacity={0.85}
                onPress={() => router.push(`/exam/${c.id}`)}
              >
                <View
                  style={[
                    styles.examIcon,
                    { backgroundColor: isFire ? '#FFF4D6' : '#EFF4FF' },
                  ]}
                >
                  <Ionicons
                    name={isFire ? 'flame' : 'shield-checkmark'}
                    size={24}
                    color={isFire ? '#D97706' : colors.primary}
                  />
                </View>

                <View style={styles.examContent}>
                  <View style={styles.titleRow}>
                    <Text style={styles.examTitle} numberOfLines={2}>
                      {c.title}
                    </Text>

                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>รอทำ</Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="help-circle-outline"
                        size={14}
                        color="#6B7280"
                      />
                      <Text style={styles.metaText}>20 ข้อ</Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color="#6B7280"
                      />
                      <Text style={styles.metaText}>30 นาที</Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Ionicons
                        name="trophy-outline"
                        size={14}
                        color="#6B7280"
                      />
                      <Text style={styles.metaText}>ผ่าน 80%</Text>
                    </View>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: index % 2 === 0 ? '0%' : '35%' },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.startBtn}>
                  <Ionicons name="play" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 26 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: 18,
    paddingBottom: 26,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroSmall: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 17,
    maxWidth: 230,
  },
  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: 10,
    marginTop: -18,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5EAF3',
  },
  summaryNum: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchBox: {
    marginHorizontal: spacing.lg,
    marginTop: 16,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5EAF3',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    gap: 8,
    marginTop: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    height: 34,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5EAF3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  listHeader: {
    marginTop: 18,
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  countText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.lg,
    gap: 12,
  },
  examCard: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5EAF3',
  },
  examIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  examTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  statusBadge: {
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#EEF2F7',
    borderRadius: 99,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 99,
  },
  startBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});