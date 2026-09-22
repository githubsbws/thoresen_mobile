import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
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

const commonChips = [
  'All Courses',
  '01 - Management',
  '02 - Cargo Care',
  '03 - Maritime Labour',
  '04 - Navigation',
  '05 - Technical',
  '06 - Quality and Safety',
  '07 - Other Course',
  '08 - Technical',
];

const chipRoute: Record<string, string> = {
  '01 - Management': '1',
  '02 - Cargo Care': '2',
  '03 - Maritime Labour': '3',
  '04 - Navigation': '4',
  '05 - Technical': '5',
  '06 - Quality and Safety': '6',
  '07 - Other Course': '7',
  '08 - Technical': '8',
};

const menuList = [
  'Home',
  'About Us',
  'Course',
  'How to Use',
  'FAQ',
  'Contact Us',
  'Mess-room',
  'Library',
  'Terms & Conditions',
  'Report',
];

export default function CourseCategoryScreen() {
  const { id } =
    useLocalSearchParams<{ id: string }>();

  const { user } = useAuth();

  const userId = user?.id
    ? Number(user.id)
    : null;

  const categoryId = Number(id);

  const [menuVisible, setMenuVisible] =
    useState(false);

  const [searchText, setSearchText] =
    useState('');

  const [category, setCategory] =
    useState<CourseCategory | null>(null);

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [loading, setLoading] =
    useState(false);

  const handleMenuPress = (item: string) => {
    setMenuVisible(false);

    if (item === 'Home') {
      router.push('/(tabs)/Home' as any);
    }

    if (item === 'About Us') {
      router.push('/(tabs)/about' as any);
    }

    if (item === 'Course') {
      router.push('/(tabs)/courses' as any);
    }

    if (item === 'Library') {
      router.push('/(tabs)/library' as any);
    }

    if (item === 'Report') {
      router.push('/(tabs)/report' as any);
    }

    if (item === 'How to Use') {
      router.push('/(tabs)/how-to-use' as any);
    }

    if (item === 'FAQ') {
      router.push('/(tabs)/faq' as any);
    }

    if (item === 'Terms & Conditions') {
      router.push('/(tabs)/terms' as any);
    }
  };

  const loadCourses = useCallback(async () => {
    if (
      !userId ||
      !categoryId ||
      Number.isNaN(categoryId)
    ) {
      return;
    }

    try {
      setLoading(true);

      console.log(
        'LOAD CATEGORY COURSES',
      );
      console.log(
        'categoryId:',
        categoryId,
      );
      console.log(
        'userId:',
        userId,
      );

      const response =
        await getCoursesByCategory(
          categoryId,
          userId,
          1,
        );

      console.log(
        'CATEGORY COURSE RESPONSE:',
        response,
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            'ไม่สามารถโหลดหลักสูตรได้',
        );
      }

      setCategory(
        response?.data?.category ?? null,
      );

      setCourses(
        response?.data?.courses ?? [],
      );
    } catch (error: any) {
      console.error(
        'Load category courses error:',
        error?.response?.data ||
          error?.message ||
          error,
      );

      Alert.alert(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถโหลดหลักสูตรได้',
      );
    } finally {
      setLoading(false);
    }
  }, [categoryId, userId]);

  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [loadCourses]),
  );

  const filteredCourses = useMemo(() => {
    const keyword =
      searchText.trim().toLowerCase();

    if (!keyword) {
      return courses;
    }

    return courses.filter((item) => {
      const title =
        item.title?.toLowerCase() ?? '';

      const shortTitle =
        item.shortTitle?.toLowerCase() ?? '';

      const courseNumber =
        item.courseNumber?.toLowerCase() ?? '';

      return (
        title.includes(keyword) ||
        shortTitle.includes(keyword) ||
        courseNumber.includes(keyword)
      );
    });
  }, [courses, searchText]);

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <AppHeader />

          <View style={styles.pageBox}>
            <View style={styles.titleRow}>
              <Text style={styles.pageTitle}>
                {category?.title ||
                  'Course'}
              </Text>
            </View>

            <View style={styles.searchLabelRow}>
              <Text style={styles.searchLabel}>
                Search
              </Text>

              <View
                style={styles.searchInputWrap}
              >
                <TextInput
                  placeholder="search"
                  placeholderTextColor="#9CA3AF"
                  value={searchText}
                  onChangeText={setSearchText}
                  style={styles.searchInput}
                />

                <TouchableOpacity
                  style={styles.searchBtn}
                >
                  <Ionicons
                    name="search"
                    size={14}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.selectBox}
                activeOpacity={0.8}
              >
                <Text style={styles.selectText}>
                  Course
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={PRIMARY}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroll}
            >
              {commonChips.map((chip) => {
                const active =
                  chip === category?.title;

                return (
                  <TouchableOpacity
                    key={chip}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (
                        chip ===
                        'All Courses'
                      ) {
                        router.push(
                          '/(tabs)/courses' as any,
                        );
                        return;
                      }

                      const route =
                        chipRoute[chip];

                      if (route) {
                        router.push(
                          `/course-category/${route}` as any,
                        );
                      }
                    }}
                    style={[
                      styles.chip,
                      active &&
                        styles.chipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active &&
                          styles.chipTextActive,
                      ]}
                    >
                      {chip}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>
                Course
              </Text>

              <View style={styles.redDot} />
            </View>

            {loading ? (
              <View
                style={styles.loadingContainer}
              >
                <ActivityIndicator
                  size="large"
                  color={PRIMARY}
                />

                <Text
                  style={styles.loadingText}
                >
                  กำลังโหลดหลักสูตร...
                </Text>
              </View>
            ) : filteredCourses.length ===
              0 ? (
              <View
                style={styles.emptyContainer}
              >
                <Ionicons
                  name="book-outline"
                  size={48}
                  color="#9CA3AF"
                />

                <Text
                  style={styles.emptyText}
                >
                  {searchText
                    ? 'ไม่พบหลักสูตรที่ค้นหา'
                    : 'ยังไม่มีหลักสูตรในหมวดหมู่นี้'}
                </Text>
              </View>
            ) : (
              <View
                style={styles.courseList}
              >
                {filteredCourses.map(
                  (item) => (
                    <CourseCard
                      key={item.id}
                      item={item}
                    />
                  ),
                )}
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ©2026 Thoresen e-learning
            </Text>
          </View>
        </ScrollView>

        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setMenuVisible(false)
          }
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() =>
              setMenuVisible(false)
            }
          >
            <View style={styles.menuBox}>
              {menuList.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.menuItem}
                  onPress={() =>
                    handleMenuPress(item)
                  }
                >
                  <Text
                    style={styles.menuText}
                  >
                    {item}
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={PRIMARY}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function CourseCard({
  item,
}: {
  item: Course;
}) {
  const isCompleted =
    item.status === 'completed' ||
    item.passed === true;

  const progress =
    Number(item.progress ?? 0);

  const statusColor =
    isCompleted
      ? GREEN
      : progress > 0
        ? ORANGE
        : '#9CA3AF';

  const statusText =
    isCompleted
      ? 'Completed'
      : progress > 0
        ? 'In Progress'
        : 'Not Started';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        router.push(
          `/course/${item.id}` as any,
        )
      }
    >
      <View style={styles.periodBox}>
        <Text style={styles.periodText}>
          {item.courseDateStart &&
          item.courseDateEnd
            ? `Period ${item.courseDayLearn ?? 30} Day ( ${formatDate(
                item.courseDateStart,
              )} - ${formatDate(
                item.courseDateEnd,
              )} )`
            : 'Course Period'}
        </Text>
      </View>

      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.cardImage,
            styles.imagePlaceholder,
          ]}
        >
          <Ionicons
            name="book-outline"
            size={50}
            color="#9CA3AF"
          />
        </View>
      )}

      <View style={styles.cardBody}>
        <View
          style={styles.courseTitleRow}
        >
          <Text
            numberOfLines={2}
            style={styles.cardTitle}
          >
            {item.title ||
              'ไม่มีชื่อหลักสูตร'}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  statusColor,
              },
            ]}
          >
            <Text
              style={styles.statusText}
            >
              {statusText}
            </Text>
          </View>
        </View>

        <View
          style={styles.progressTrack}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor:
                  statusColor,
              },
            ]}
          />
        </View>

        <Text
          style={styles.progressText}
        >
          {progress} %{' '}
          {isCompleted
            ? 'เรียนสมบูรณ์'
            : progress > 0
              ? 'กำลังเรียน'
              : 'ยังไม่ได้เริ่มเรียน'}
        </Text>

        <View style={styles.teacherBox}>
          <View style={styles.teacherRow}>
            <Text
              style={styles.teacherLabel}
            >
              คำสอนหลักสูตร :
            </Text>

            <Text
              style={styles.teacherValue}
            >
              -
            </Text>
          </View>

          <View style={styles.teacherRow}>
            <Text
              style={styles.teacherLabel}
            >
              ผู้ปฏิบัติหลักสูตร :
            </Text>

            <Text
              style={styles.teacherValue}
            >
              -
            </Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text
              style={styles.infoLabel}
            >
              ระยะเวลา
            </Text>

            <Ionicons
              name="time-outline"
              size={22}
              color={BLUE}
            />

            <Text
              style={styles.infoValue}
            >
              {item.courseDayLearn
                ? `${item.courseDayLearn} วัน`
                : '-'}
            </Text>
          </View>

          <View style={styles.infoCell}>
            <Text
              style={styles.infoLabel}
            >
              จำนวนบทเรียน
            </Text>

            <Ionicons
              name="book"
              size={22}
              color={BLUE}
            />

            <Text
              style={styles.infoValue}
            >
              {item.lessonCount ?? 0}{' '}
              บทเรียน
            </Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text
              style={styles.infoLabel}
            >
              สถานะ Certificate
            </Text>

            <Ionicons
              name={
                isCompleted
                  ? 'ribbon'
                  : 'document-text-outline'
              }
              size={24}
              color={
                isCompleted
                  ? GREEN
                  : '#D1D5DB'
              }
            />

            <Text
              style={
                isCompleted
                  ? styles.infoValue
                  : styles.infoValueMuted
              }
            >
              {isCompleted
                ? 'รับใบประกาศได้'
                : 'ยังไม่ผ่านเงื่อนไข'}
            </Text>
          </View>

          <View style={styles.infoCell}>
            <Text
              style={styles.infoLabel}
            >
              แบบประเมินหลักสูตร
            </Text>

            <Ionicons
              name="newspaper-outline"
              size={24}
              color={BLUE}
            />

            <View
              style={[
                styles.evaluateBtn,
                styles.evaluateBtnDisabled,
              ]}
            >
              <Text
                style={styles.evaluateText}
              >
                ทำแบบประเมิน
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.summaryBtn}
          activeOpacity={0.85}
          onPress={() =>
            router.push(
              `/course/${item.id}` as any,
            )
          }
        >
          <Text
            style={styles.summaryText}
          >
            Academic summary
          </Text>

          <Ionicons
            name="chevron-forward"
            size={18}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function formatDate(
  value: string | Date,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
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
  },

  pageBox: {
    paddingHorizontal: 18,
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
    },
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
  },

  footerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 18,
  },

  menuBox: {
    width: 230,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 8,
    elevation: 8,
  },

  menuItem: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  menuText: {
    fontSize: 15,
    color: PRIMARY,
    fontWeight: '700',
  },
});