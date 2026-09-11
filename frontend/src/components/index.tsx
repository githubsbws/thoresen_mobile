import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { Course } from '../data';

// ── Course Card ──────────────────────────────────────────────────────────────
const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  safety: 'shield-checkmark',
  security: 'lock-closed',
  fire: 'flame',
  survival: 'boat',
};

const colorMap: Record<string, string> = {
  safety: colors.primary,
  security: '#0E5E8A',
  fire: colors.danger,
  survival: '#0E7490',
};

export function CourseCard({ course, onPress }: { course: Course; onPress: () => void }) {
  const icon = iconMap[course.category];
  const color = colorMap[course.category];

  return (
    <TouchableOpacity style={styles.courseCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.courseIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.courseBody}>
        <Text style={styles.courseTitle} numberOfLines={1}>{course.title}</Text>
        <Text style={styles.courseDesc} numberOfLines={1}>{course.description}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${course.progress * 100}%` as any }]} />
        </View>
        {course.progress > 0 ? (
          <Text style={styles.progressPct}>{Math.round(course.progress * 100)}%</Text>
        ) : (
          <View style={styles.newBadge}><Text style={styles.newBadgeText}>ใหม่</Text></View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textHint} />
    </TouchableOpacity>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>ดูทั้งหมด</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Primary Button ────────────────────────────────────────────────────────────
export function PrimaryButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <TouchableOpacity style={styles.primaryBtn} onPress={onPress} activeOpacity={0.85}>
      {icon && <Ionicons name={icon} size={18} color="#fff" style={{ marginRight: 6 }} />}
      <Text style={styles.primaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Quick Icon Button ──────────────────────────────────────────────────────────
export function QuickIcon({ icon, label, bgColor, iconColor, onPress }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; bgColor: string; iconColor: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickIcon} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.quickIconBg, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.quickIconLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  courseCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  courseIcon: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  courseBody: { flex: 1 },
  courseTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, lineHeight: 18 },
  courseDesc: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  progressTrack: { height: 5, backgroundColor: colors.border, borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  progressPct: { fontSize: 11, color: colors.primary, fontWeight: '600', marginTop: 4 },
  newBadge: { marginTop: 6, backgroundColor: '#FFF7ED', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  newBadgeText: { fontSize: 10, color: '#C05621', fontWeight: '500' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  seeAll: { fontSize: 12, color: colors.primary, fontWeight: '500' },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: spacing.lg },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  quickIcon: { flex: 1, alignItems: 'center', gap: 6 },
  quickIconBg: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickIconLabel: { fontSize: 11, color: colors.textPrimary, textAlign: 'center' },
});
