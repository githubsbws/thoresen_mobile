/**
 * ============================================================
 * app/course-category/[id].tsx  —  รายการหลักสูตรในหมวดหมู่
 * (อย่าสับสนกับ app/course/[id].tsx และ app/lesson/[id].tsx ที่ชื่อไฟล์เหมือนกัน)
 * ============================================================
 * สรุปสิ่งที่แก้ (ค้นหา [FIX] / [ADD] / [REMOVE])
 * [FIX]  loading เริ่มเป็น true และปิดเมื่อไม่มี userId (เดิมกระพริบ "ยังไม่มีหลักสูตร" ก่อนโหลด)
 * [FIX]  chip หมวดหมู่ดึงจาก API (data.categories) และเทียบ active ด้วย id
 *        เดิม hard-code ชื่อ/เลขหมวดไว้ และเทียบ `chip === category.title` ซึ่งแทบไม่เคยตรง
 *        (และมี "05 - Technical" กับ "08 - Technical" ซ้ำ)
 * [FIX]  สลับ chip ใช้ router.replace (เดิม push ทำให้ stack สะสมทุกครั้งที่กด)
 * [FIX]  การ์ด: ผู้สอน/ผู้ช่วย/ช่วงเวลา มาจากข้อมูลจริง (เดิม "-" ตายตัว และ "30 Day" hard-code)
 * [FIX]  ใช้ formatDate ร่วมกัน (src/utils/formatDate.ts)
 * [FIX]  ปุ่มค้นหาปิดคีย์บอร์ด (เดิมกดแล้วไม่ทำอะไร) การค้นหาทำงานทันทีตอนพิมพ์อยู่แล้ว
 * [FIX]  dropdown "Course" ใช้งานได้จริงแล้ว เป็นตัวกรองสถานะการเรียน (ทั้งหมด/ยังไม่เริ่ม/
 *        กำลังเรียน/เรียนจบแล้ว) เดิมเป็นปุ่มเปล่า กดแล้วไม่ทำอะไรเลย
 * [REMOVE] โค้ดเมนูที่ไม่มีที่เรียกเปิด, style ที่ไม่ได้ใช้
 */
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import AppHeader from '../../src/components/AppHeader';

import {
  getCoursesByCategory,
  Course,
  CourseCategory,
} from '../../src/services/course';

import { useAuth } from '../../src/context/AuthContext';
import { formatDate } from '../../src/utils/formatDate';

const PRIMARY = '#001B74';
const RED = '#E30613';
const BLUE = '#0B63CE';
const LIGHT_BLUE = '#EAF3FF';
const ORANGE = '#F9C56A';
const GREEN = '#57C46B';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const BG = '#F4F6FA';

type CategoryChip = { id: number; title?: string | null };

// [ADD] ตัวเลือกของ dropdown "Course"
type StatusFilter = 'all' | 'not_started' | 'in_progress' | 'completed';

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'not_started', label: 'ยังไม่เริ่มเรียน' },
  { value: 'in_progress', label: 'กำลังเรียน' },
  { value: 'completed', label: 'เรียนจบแล้ว' },
];

export default function CourseCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const userId = user?.id ? Number(user.id) : null;
  const categoryId = Number(id);

  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState<CourseCategory | null>(null);
  const [categories, setCategories] = useState<CategoryChip[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // [FIX] เริ่มเป็น true ไม่ให้กระพริบหน้าว่างก่อนโหลด
  const [loading, setLoading] = useState(true);

  const loadCourses = useCallback(async () => {
    if (!userId || !categoryId || Number.isNaN(categoryId)) {
      // [FIX] เดิม return เฉยๆ
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // [FIX] เลิกส่ง userId แล้ว (backend อ่านจาก token)
      const response = await getCoursesByCategory(categoryId, 1);

      if (!response?.success) {
        throw new Error(response?.message || 'ไม่สามารถโหลดหลักสูตรได้');
      }

      setCategory(response.data?.category ?? null);
      setCategories(response.data?.categories ?? []);
      setCourses(response.data?.courses ?? []);
    } catch (error: any) {
      if (__DEV__) {
        console.error(
          'Load category courses error:',
          error?.response?.data || error?.message || error,
        );
      }

      // backend คืน 404 เมื่อไม่พบหมวดหมู่
      Alert.alert(
        'เกิดข้อผิดพลาด',
        error?.response?.status === 404
          ? 'ไม่พบหมวดหมู่นี้'
          : 'ไม่สามารถโหลดหลักสูตรได้',
      );

      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, userId]);

  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [loadCourses]),
  );

  // [ADD] dropdown "Course" = ตัวกรองสถานะการเรียน (เดิมปุ่มนี้กดแล้วไม่ทำอะไรเลย)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);

  const filteredCourses = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    const byKeyword = !keyword
      ? courses
      : courses.filter((item) => {
          const title = item.title?.toLowerCase() ?? '';
          const shortTitle = item.shortTitle?.toLowerCase() ?? '';
          const courseNumber = item.courseNumber?.toLowerCase() ?? '';

          return (
            title.includes(keyword) ||
            shortTitle.includes(keyword) ||
            courseNumber.includes(keyword)
          );
        });

    if (statusFilter === 'all') {
      return byKeyword;
    }

    // [ADD] ใช้ตรรกะเดียวกับที่ CourseCard ใช้ตัดสิน isCompleted/progress ด้านล่าง
    // เพื่อให้ตัวกรองตรงกับป้ายสถานะที่เห็นในการ์ดจริง
    return byKeyword.filter((item) => {
      const isCompleted = item.status === 'completed' || item.passed === true;
      const progress = Math.min(100, Math.max(0, Number(item.progress ?? 0)));

      if (statusFilter === 'completed') {
        return isCompleted;
      }

      if (statusFilter === 'in_progress') {
        return !isCompleted && progress > 0;
      }

      return !isCompleted && progress === 0; // not_started
    });
  }, [courses, searchText, statusFilter]);

  const handleChipPress = (chipId: number) => {
    if (chipId === categoryId) {
      return;
    }

    // [FIX] replace แทน push เพื่อไม่ให้ stack หน้าเดิมซ้อนกันหลายชั้น
    router.replace(`/course-category/${chipId}` as any);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AppHeader />

          <View style={styles.pageBox}>
            <View style={styles.titleRow}>
              <Text style={styles.pageTitle}>
                {category?.title || 'Course'}
              </Text>
            </View>

            <View style={styles.searchLabelRow}>
              <Text style={styles.searchLabel}>Search</Text>

              <View style={styles.searchInputWrap}>
                <TextInput
                  placeholder="search"
                  placeholderTextColor="#9CA3AF"
                  value={searchText}
                  onChangeText={setSearchText}
                  style={styles.searchInput}
                  returnKeyType="search"
                  onSubmitEditing={Keyboard.dismiss}
                />

                {/* [FIX] ค้นหาทำงานตอนพิมพ์อยู่แล้ว ปุ่มนี้ปิดคีย์บอร์ด */}
                <TouchableOpacity
                  style={styles.searchBtn}
                  onPress={Keyboard.dismiss}
                >
                  <Ionicons name="search" size={14} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* [FIX] dropdown กรองสถานะการเรียน ใช้งานได้จริงแล้ว */}
              <TouchableOpacity
                style={styles.selectBox}
                activeOpacity={0.8}
                onPress={() => setFilterMenuVisible(true)}
              >
                <Text style={styles.selectText} numberOfLines={1}>
                  {
                    STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)
                      ?.label
                  }
                </Text>
                <Ionicons name="chevron-down" size={14} color={PRIMARY} />
              </TouchableOpacity>
            </View>

            {/* [FIX] chip มาจาก API */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroll}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/courses' as any)}
                style={styles.chip}
              >
                <Text style={styles.chipText}>All Courses</Text>
              </TouchableOpacity>

              {categories.map((chip) => {
                const active = chip.id === categoryId;

                return (
                  <TouchableOpacity
                    key={chip.id}
                    activeOpacity={0.8}
                    onPress={() => handleChipPress(chip.id)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {chip.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Course</Text>
              <View style={styles.redDot} />
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={styles.loadingText}>กำลังโหลดหลักสูตร...</Text>
              </View>
            ) : filteredCourses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="book-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>
                  {searchText
                    ? 'ไม่พบหลักสูตรที่ค้นหา'
                    : 'ยังไม่มีหลักสูตรในหมวดหมู่นี้'}
                </Text>
              </View>
            ) : (
              <View style={styles.courseList}>
                {filteredCourses.map((item) => (
                  <CourseCard key={item.id} item={item} />
                ))}
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>©2026 Thoresen e-learning</Text>
          </View>
        </ScrollView>

        {/* [ADD] Modal เลือกตัวกรองสถานะ ใช้คู่กับปุ่ม dropdown "Course" ด้านบน */}
        <Modal
          visible={filterMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setFilterMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.filterModalOverlay}
            activeOpacity={1}
            onPress={() => setFilterMenuVisible(false)}
          >
            <View style={styles.filterModalBox}>
              <Text style={styles.filterModalTitle}>กรองตามสถานะ</Text>

              {STATUS_FILTER_OPTIONS.map((option) => {
                const active = option.value === statusFilter;

                return (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.filterOptionRow}
                    onPress={() => {
                      setStatusFilter(option.value);
                      setFilterMenuVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        active && styles.filterOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>

                    {active && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={PRIMARY}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function CourseCard({ item }: { item: Course }) {
  const isCompleted = item.status === 'completed' || item.passed === true;

  // [FIX] กัน progress เกิน 0-100
  const progress = Math.min(100, Math.max(0, Number(item.progress ?? 0)));

  const statusColor = isCompleted
    ? GREEN
    : progress > 0
      ? ORANGE
      : '#9CA3AF';

  const statusText = isCompleted
    ? 'Completed'
    : progress > 0
      ? 'In Progress'
      : 'Not Started';

  // [FIX] ไม่ใส่ "30 Day" เองเมื่อไม่มีข้อมูล (เดิม fallback เป็น 30 ตายตัว)
  const periodText =
    item.courseDateStart && item.courseDateEnd
      ? `Period ${item.courseDayLearn ? `${item.courseDayLearn} Day ` : ''}( ${formatDate(
          item.courseDateStart,
        )} - ${formatDate(item.courseDateEnd)} )`
      : 'Course Period';

  const openCourse = () => router.push(`/course/${item.id}` as any);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={openCourse}
    >
      <View style={styles.periodBox}>
        <Text style={styles.periodText}>{periodText}</Text>
      </View>

      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.cardImage, styles.imagePlaceholder]}>
          <Ionicons name="book-outline" size={50} color="#9CA3AF" />
        </View>
      )}

      <View style={styles.cardBody}>
        <View style={styles.courseTitleRow}>
          <Text numberOfLines={2} style={styles.cardTitle}>
            {item.title || 'ไม่มีชื่อหลักสูตร'}
          </Text>

          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: statusColor },
            ]}
          />
        </View>

        <Text style={styles.progressText}>
          {progress} %{' '}
          {isCompleted
            ? 'เรียนสมบูรณ์'
            : progress > 0
              ? 'กำลังเรียน'
              : 'ยังไม่ได้เริ่มเรียน'}
        </Text>

        <View style={styles.teacherBox}>
          <View style={styles.teacherRow}>
            <Text style={styles.teacherLabel}>คำสอนหลักสูตร :</Text>
            <Text style={styles.teacherValue}>{item.teacher ?? '-'}</Text>
          </View>

          <View style={styles.teacherRow}>
            <Text style={styles.teacherLabel}>ผู้ปฏิบัติหลักสูตร :</Text>
            <Text style={styles.teacherValue}>{item.assistant ?? '-'}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>ระยะเวลา</Text>
            <Ionicons name="time-outline" size={22} color={BLUE} />
            <Text style={styles.infoValue}>
              {item.courseDayLearn ? `${item.courseDayLearn} วัน` : '-'}
            </Text>
          </View>

          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>จำนวนบทเรียน</Text>
            <Ionicons name="book" size={22} color={BLUE} />
            <Text style={styles.infoValue}>{item.lessonCount ?? 0} บทเรียน</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>สถานะ Certificate</Text>
            <Ionicons
              name={isCompleted ? 'ribbon' : 'document-text-outline'}
              size={24}
              color={isCompleted ? GREEN : '#D1D5DB'}
            />
            <Text
              style={isCompleted ? styles.infoValue : styles.infoValueMuted}
            >
              {isCompleted ? 'รับใบประกาศได้' : 'ยังไม่ผ่านเงื่อนไข'}
            </Text>
          </View>

          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>แบบประเมินหลักสูตร</Text>
            <Ionicons name="newspaper-outline" size={24} color={BLUE} />

            {/* TODO: ต่อกับสถานะแบบประเมินจริง (ตอนนี้เป็นปุ่มจำลอง disabled เหมือนเดิม) */}
            <View style={[styles.evaluateBtn, styles.evaluateBtnDisabled]}>
              <Text style={styles.evaluateText}>ทำแบบประเมิน</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.summaryBtn}
          activeOpacity={0.85}
          onPress={openCourse}
        >
          <Text style={styles.summaryText}>Academic summary</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  root: {
    flex: 1,
    backgroundColor: '#fff',
  },

  scrollContent: {
    paddingBottom: 0,
    flexGrow: 1,
  },

  pageBox: {
    paddingHorizontal: 18,
    flex: 1,
  },

  titleRow: {
    marginTop: 8,
    marginBottom: 14,
  },

  pageTitle: {
    fontSize: 22,
    color: TEXT,
    fontWeight: '900',
  },

  searchLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  searchLabel: {
    fontSize: 12,
    color: TEXT,
    marginRight: 8,
  },

  searchInputWrap: {
    flex: 1,
    height: 30,
    borderWidth: 1,
    borderColor: '#B8D8F5',
    backgroundColor: '#F8FBFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    height: 30,
    paddingHorizontal: 10,
    fontSize: 11,
    color: TEXT,
  },

  searchBtn: {
    width: 30,
    height: 30,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectBox: {
    width: 118,
    height: 30,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#B8D8F5',
    backgroundColor: LIGHT_BLUE,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectText: {
    fontSize: 11,
    color: PRIMARY,
    fontWeight: '600',
  },

  chipScroll: {
    marginBottom: 18,
    flexGrow: 0,
  },

  chip: {
    paddingHorizontal: 17,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    marginRight: 8,
  },

  chipActive: {
    backgroundColor: RED,
    borderColor: RED,
  },

  chipText: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '700',
  },

  chipTextActive: {
    color: '#fff',
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    color: PRIMARY,
    fontWeight: '900',
  },

  redDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: RED,
    marginLeft: 8,
  },

  loadingContainer: {
    minHeight: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: MUTED,
  },

  emptyContainer: {
    flex: 1,
    minHeight: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    marginTop: 12,
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
  },

  courseList: {
    alignItems: 'center',
  },

  card: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.11,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 5,
  }
  },

  periodBox: {
    backgroundColor: LIGHT_BLUE,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },

  periodText: {
    fontSize: 10,
    color: PRIMARY,
    fontWeight: '700',
  },

  cardImage: {
    width: '100%',
    height: 210,
  },

  imagePlaceholder: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardBody: {
    padding: 13,
  },

  courseTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  cardTitle: {
    flex: 1,
    fontSize: 15,
    color: TEXT,
    fontWeight: '900',
    lineHeight: 20,
    paddingRight: 8,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 3,
  },

  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '800',
  },

  progressTrack: {
    height: 7,
    backgroundColor: '#E5E7EB',
    marginTop: 12,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
  },

  progressText: {
    fontSize: 13,
    color: TEXT,
    fontWeight: '800',
    marginTop: 9,
  },

  teacherBox: {
    marginTop: 8,
  },

  teacherRow: {
    flexDirection: 'row',
    marginTop: 3,
  },

  teacherLabel: {
    width: 110,
    fontSize: 11,
    color: MUTED,
  },

  teacherValue: {
    flex: 1,
    fontSize: 11,
    color: TEXT,
    fontWeight: '800',
  },

  infoGrid: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: '#fff',
  },

  infoCell: {
    flex: 1,
    minHeight: 82,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },

  infoLabel: {
    fontSize: 10,
    color: TEXT,
    fontWeight: '700',
    marginBottom: 8,
  },

  infoValue: {
    fontSize: 11,
    color: TEXT,
    marginTop: 6,
    fontWeight: '700',
  },

  infoValueMuted: {
    fontSize: 10,
    color: MUTED,
    marginTop: 6,
  },

  evaluateBtn: {
    backgroundColor: BLUE,
    borderRadius: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginTop: 6,
  },

  evaluateBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },

  evaluateText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '800',
  },

  summaryBtn: {
    height: 44,
    backgroundColor: PRIMARY,
    marginTop: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },

  footer: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 40,
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 18,
    width: '100%',
  },

  footerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  // [ADD] style ของ Modal ตัวกรองสถานะ
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  filterModalBox: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 6,
    elevation: 8,
  },

  filterModalTitle: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '900',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  filterOptionRow: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  filterOptionText: {
    fontSize: 14,
    color: TEXT,
    fontWeight: '600',
  },

  filterOptionTextActive: {
    color: PRIMARY,
    fontWeight: '900',
  },

});
