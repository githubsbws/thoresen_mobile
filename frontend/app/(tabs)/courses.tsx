import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  router,
  useFocusEffect,
} from 'expo-router';

import {
  getCourses,
  Course,
  CourseCategory,
} from '../../src/services/course';

import AppHeader from '../../src/components/AppHeader';
import { useAuth } from '../../src/context/AuthContext';


// =====================================================
// Constants
// =====================================================

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


// =====================================================
// Component
// =====================================================

export default function CourseScreen() {

  // ---------------------------------------------------
  // State
  // ---------------------------------------------------

  const [menuVisible, setMenuVisible] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState('Course');

  const [searchText, setSearchText] =
    useState('');

  const [categories, setCategories] = useState<CourseCategory[]>([]);

  const [myCourses, setMyCourses] =
    useState<Course[]>([]);

  const [completedCourses, setCompletedCourses] =
    useState<Course[]>([]);

  const [loading, setLoading] =
    useState(false);


  // ---------------------------------------------------
  // User
  // ---------------------------------------------------

  const { user } = useAuth();

  const userId = user?.id
  ? Number(user.id)
  : null; 


  // ---------------------------------------------------
  // Load Courses
  // ---------------------------------------------------

  const loadCourses = useCallback(async () => {
  if (!userId) {
    return;
  }

  try {
    setLoading(true);

    console.log('LOAD COURSE CATEGORIES');
    console.log('userId:', userId);

    const response = await getCourses(userId);

    console.log('COURSE RESPONSE:', response);

    if (!response?.success) {
      throw new Error(
        response?.message ||
          'ไม่สามารถโหลดข้อมูลหมวดหมู่ได้',
      );
    }

    setCategories(
      response?.data?.categories || [],
    );
  } catch (error: any) {
    console.error(
      'Load course categories error:',
      error?.response?.data ||
        error?.message ||
        error,
    );

    Alert.alert(
      'เกิดข้อผิดพลาด',
      'ไม่สามารถโหลดหมวดหมู่หลักสูตรได้',
    );
  } finally {
    setLoading(false);
  }
}, [userId]);


  // ---------------------------------------------------
  // Reload when screen focus
  // ---------------------------------------------------

  useFocusEffect(
    useCallback(() => {

      loadCourses();

    }, [loadCourses]),
  );


  // ===================================================
  // Search - All Courses
  // ===================================================

  const filteredCategories = useMemo(() => {
  const keyword = searchText
    .trim()
    .toLowerCase();

  if (!keyword) {
    return categories;
  }

  return categories.filter((item) => {
    const title =
      item.title?.toLowerCase() ?? '';

    const shortDetail =
      item.shortDetail?.toLowerCase() ?? '';

    const detail =
      item.detail?.toLowerCase() ?? '';

    return (
      title.includes(keyword) ||
      shortDetail.includes(keyword) ||
      detail.includes(keyword)
    );
  });
}, [
  categories,
  searchText,
]);


  // ===================================================
  // Search - My / Completed
  // ===================================================

  const filteredMyCourses = useMemo(() => {

    const source =
      activeTab === 'Completed'
        ? completedCourses
        : myCourses;


    const keyword =
      searchText
        .trim()
        .toLowerCase();


    if (!keyword) {
      return source;
    }


    return source.filter(
      (item) => {

        const title =
          item.title
            ?.toLowerCase() ?? '';

        const shortTitle =
          item.shortTitle
            ?.toLowerCase() ?? '';

        const courseNumber =
          item.courseNumber
            ?.toLowerCase() ?? '';


        return (
          title.includes(keyword) ||
          shortTitle.includes(keyword) ||
          courseNumber.includes(keyword)
        );
      },
    );

  }, [
    activeTab,
    searchText,
    myCourses,
    completedCourses,
  ]);


  // ===================================================
  // Date Formatter
  // ===================================================

  const formatDate = (
    date?: string | null,
  ) => {

    if (!date) {
      return '-';
    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime(),
      )
    ) {
      return '-';
    }


    return parsedDate.toLocaleDateString(
      'th-TH',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    );
  };


  // ===================================================
  // Navigate Course
  // ===================================================

  const handleCategoryPress = (
    category: CourseCategory,
  ) => {
    router.push(
      `/course-category/${category.id}` as any,
    );
  };


  const handleMyCoursePress = (
    course: Course,
  ) => {

    router.push(
      `/course/${course.id}`,
    );
  };


  // ===================================================
  // Render Empty
  // ===================================================

  const renderEmpty = (
    message: string,
  ) => {

    return (
      <View style={styles.emptyContainer}>

        <Ionicons
          name="book-outline"
          size={48}
          color={BORDER}
        />

        <Text
          style={styles.emptyTitle}
        >
          {message}
        </Text>

      </View>
    );
  };


  // ===================================================
  // Main Render
  // ===================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >

      <View
        style={styles.container}
      >

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >

          {/* =================================================
              Header
          ================================================= */}

          <AppHeader />


          {/* =================================================
              Page Header
          ================================================= */}

          <View
            style={styles.pageHeader}
          >

            <View>

              <Text
                style={styles.pageTitle}
              >
                หลักสูตร
              </Text>

              <Text
                style={styles.pageSubtitle}
              >
                หลักสูตรการเรียนรู้
              </Text>

            </View>


            <TouchableOpacity
              style={styles.menuButton}
              onPress={() =>
                setMenuVisible(true)
              }
            >

              <Ionicons
                name="menu"
                size={25}
                color={PRIMARY}
              />

            </TouchableOpacity>

          </View>


          {/* =================================================
              Search
          ================================================= */}

          <View
            style={styles.searchContainer}
          >

            <Ionicons
              name="search-outline"
              size={20}
              color={MUTED}
            />

            <TextInput
              value={searchText}
              onChangeText={
                setSearchText
              }
              placeholder="ค้นหาหลักสูตร..."
              placeholderTextColor={MUTED}
              style={styles.searchInput}
              returnKeyType="search"
            />


            {searchText.length > 0 && (

              <TouchableOpacity
                onPress={() =>
                  setSearchText('')
                }
              >

                <Ionicons
                  name="close-circle"
                  size={20}
                  color={MUTED}
                />

              </TouchableOpacity>

            )}

          </View>


          {/* =================================================
              Tabs
          ================================================= */}

          <View
            style={styles.tabsContainer}
          >

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'Course' &&
                  styles.tabActive,
              ]}
              onPress={() =>
                setActiveTab('Course')
              }
            >

              <Text
                style={[
                  styles.tabText,
                  activeTab === 'Course' &&
                    styles.tabTextActive,
                ]}
              >
                Course
              </Text>

            </TouchableOpacity>


            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'My Course' &&
                  styles.tabActive,
              ]}
              onPress={() =>
                setActiveTab('My Course')
              }
            >

              <Text
                style={[
                  styles.tabText,
                  activeTab === 'My Course' &&
                    styles.tabTextActive,
                ]}
              >
                My Course
              </Text>

            </TouchableOpacity>


            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'Completed' &&
                  styles.tabActive,
              ]}
              onPress={() =>
                setActiveTab('Completed')
              }
            >

              <Text
                style={[
                  styles.tabText,
                  activeTab === 'Completed' &&
                    styles.tabTextActive,
                ]}
              >
                Completed
              </Text>

            </TouchableOpacity>

          </View>


          {/* =================================================
              Loading
          ================================================= */}

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
                กำลังโหลดข้อมูล...
              </Text>

            </View>

          ) : (

            <>
              {/* =================================================
                  COURSE TAB
              ================================================= */}

              {activeTab === 'Course' && (
                  <View>

                    <View style={styles.sectionHeader}>

                      <Text style={styles.sectionTitle}>
                        หมวดหมู่หลักสูตร
                      </Text>

                      <Text style={styles.sectionCount}>
                        {filteredCategories.length} หมวดหมู่
                      </Text>

                    </View>

                    {filteredCategories.length === 0 ? (

                      renderEmpty(
                        searchText
                          ? 'ไม่พบหมวดหมู่ที่ค้นหา'
                          : 'ยังไม่มีหมวดหมู่หลักสูตร',
                      )

                    ) : (

                      <View style={styles.courseGrid}>

                        {filteredCategories.map(
                          (category) => (

                            <CategoryCard
                              key={category.id}
                              category={category}
                              onPress={() =>
                                handleCategoryPress(
                                  category,
                                )
                              }
                            />

                          ),
                        )}

                      </View>

                    )}

                  </View>
                )}


              {/* =================================================
                  MY COURSE / COMPLETED
              ================================================= */}

              {activeTab !== 'Course' && (

                <View>

                  <View
                    style={styles.sectionHeader}
                  >

                    <Text
                      style={
                        styles.sectionTitle
                      }
                    >
                      {activeTab ===
                      'Completed'
                        ? 'หลักสูตรที่เรียนจบแล้ว'
                        : 'หลักสูตรของฉัน'}
                    </Text>

                    <Text
                      style={
                        styles.sectionCount
                      }
                    >
                      {filteredMyCourses.length}{' '}
                      หลักสูตร
                    </Text>

                  </View>


                  {filteredMyCourses.length === 0 ? (

                    renderEmpty(
                      searchText
                        ? 'ไม่พบหลักสูตรที่ค้นหา'
                        : activeTab ===
                          'Completed'
                        ? 'ยังไม่มีหลักสูตรที่เรียนจบ'
                        : 'ยังไม่มีหลักสูตรของคุณ',
                    )

                  ) : (

                    <View
                      style={styles.myCourseList}
                    >

                      {filteredMyCourses.map(
                        (course) => (

                          <MyCourseCard
                            key={course.id}
                            course={course}
                            onPress={() =>
                              handleMyCoursePress(
                                course,
                              )
                            }
                            formatDate={
                              formatDate
                            }
                          />

                        ),
                      )}

                    </View>

                  )}

                </View>

              )}

            </>

          )}

        </ScrollView>


        {/* =================================================
            Menu Modal
        ================================================= */}

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

            <View
              style={styles.menuModal}
            >

              <View
                style={styles.menuHeader}
              >

                <Text
                  style={
                    styles.menuTitle
                  }
                >
                  เมนู
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setMenuVisible(false)
                  }
                >

                  <Ionicons
                    name="close"
                    size={24}
                    color={TEXT}
                  />

                </TouchableOpacity>

              </View>


              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {

                  setMenuVisible(false);

                  setActiveTab('Course');

                }}
              >

                <Ionicons
                  name="book-outline"
                  size={22}
                  color={PRIMARY}
                />

                <Text
                  style={styles.menuItemText}
                >
                  Course
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {

                  setMenuVisible(false);

                  setActiveTab(
                    'My Course',
                  );

                }}
              >

                <Ionicons
                  name="school-outline"
                  size={22}
                  color={PRIMARY}
                />

                <Text
                  style={styles.menuItemText}
                >
                  My Course
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {

                  setMenuVisible(false);

                  setActiveTab(
                    'Completed',
                  );

                }}
              >

                <Ionicons
                  name="checkmark-circle-outline"
                  size={22}
                  color={GREEN}
                />

                <Text
                  style={styles.menuItemText}
                >
                  Completed
                </Text>

              </TouchableOpacity>

            </View>

          </TouchableOpacity>

        </Modal>

      </View>

    </SafeAreaView>
  );
}


// =====================================================
// Course Card
// =====================================================

interface CourseCardProps {
  course: Course;
  onPress: () => void;
}
interface CategoryCardProps {
  category: CourseCategory;
  onPress: () => void;
}

function CategoryCard({
  category,
  onPress,
}: CategoryCardProps) {

  return (
    <TouchableOpacity
      style={styles.courseCard}
      activeOpacity={0.85}
      onPress={onPress}
    >

      {category.image ? (

        <Image
          source={{
            uri: category.image,
          }}
          style={styles.courseImage}
          resizeMode="cover"
        />

      ) : (

        <View
          style={[
            styles.courseImage,
            styles.imagePlaceholder,
          ]}
        >

          <Ionicons
            name="folder-open-outline"
            size={40}
            color={PRIMARY}
          />

        </View>

      )}

      <View style={styles.courseContent}>

        <Text
          style={styles.courseTitle}
          numberOfLines={2}
        >
          {category.title ||
            'ไม่มีชื่อหมวดหมู่'}
        </Text>

        {category.shortDetail && (
          <Text
            style={styles.categoryDescription}
            numberOfLines={2}
          >
            {category.shortDetail}
          </Text>
        )}

        <View style={styles.categoryButton}>

          <Text style={styles.categoryButtonText}>
            ดูหลักสูตร
          </Text>

          <Ionicons
            name="chevron-forward"
            size={16}
            color="#fff"
          />

        </View>

      </View>

    </TouchableOpacity>
  );
}
function CourseCard({
  course,
  onPress,
}: CourseCardProps) {

  return (

    <TouchableOpacity
      style={styles.courseCard}
      activeOpacity={0.85}
      onPress={onPress}
    >

      {/* Image */}

      {course.image ? (

        <Image
          source={{
            uri: course.image,
          }}
          style={styles.courseImage}
          resizeMode="cover"
        />

      ) : (

        <View
          style={[
            styles.courseImage,
            styles.imagePlaceholder,
          ]}
        >

          <Ionicons
            name="book-outline"
            size={40}
            color={PRIMARY}
          />

        </View>

      )}


      {/* Content */}

      <View
        style={styles.courseContent}
      >

        <Text
          style={styles.courseTitle}
          numberOfLines={2}
        >
          {course.title ||
            course.shortTitle ||
            'ไม่มีชื่อหลักสูตร'}
        </Text>


        {course.courseNumber && (

          <Text
            style={
              styles.courseNumber
            }
          >
            {course.courseNumber}
          </Text>

        )}


        <View
          style={styles.courseMeta}
        >

          <Ionicons
            name="book-outline"
            size={15}
            color={MUTED}
          />

          <Text
            style={styles.courseMetaText}
          >
            {course.lessonCount ?? 0}{' '}
            บทเรียน
          </Text>

        </View>


        {/* Status */}

        <View
          style={styles.statusRow}
        >

          <StatusBadge
            status={course.status}
          />

        </View>

      </View>

    </TouchableOpacity>

  );
}


// =====================================================
// My Course Card
// =====================================================

interface MyCourseCardProps {
  course: Course;
  onPress: () => void;
  formatDate: (
    date?: string | null,
  ) => string;
}

function MyCourseCard({
  course,
  onPress,
  formatDate,
}: MyCourseCardProps) {

  const progress = Math.min(
    100,
    Math.max(
      0,
      Number(course.progress ?? 0),
    ),
  );


  const isCompleted =
    course.status ===
      'completed' ||
    course.passed === true ||
    progress >= 100;


  return (

    <TouchableOpacity
      style={styles.myCourseCard}
      activeOpacity={0.85}
      onPress={onPress}
    >

      {/* Image */}

      {course.image ? (

        <Image
          source={{
            uri: course.image,
          }}
          style={styles.myCourseImage}
          resizeMode="cover"
        />

      ) : (

        <View
          style={[
            styles.myCourseImage,
            styles.imagePlaceholder,
          ]}
        >

          <Ionicons
            name="book-outline"
            size={35}
            color={PRIMARY}
          />

        </View>

      )}


      {/* Content */}

      <View
        style={styles.myCourseContent}
      >

        <Text
          style={styles.myCourseTitle}
          numberOfLines={2}
        >
          {course.title ||
            course.shortTitle ||
            'ไม่มีชื่อหลักสูตร'}
        </Text>


        {course.courseNumber && (

          <Text
            style={
              styles.courseNumber
            }
          >
            {course.courseNumber}
          </Text>

        )}


        {/* Progress */}

        <View
          style={styles.progressHeader}
        >

          <Text
            style={
              styles.progressLabel
            }
          >
            ความคืบหน้า
          </Text>

          <Text
            style={
              styles.progressPercent
            }
          >
            {Math.round(progress)}%
          </Text>

        </View>


        <View
          style={styles.progressBackground}
        >

          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
              },
            ]}
          />

        </View>


        {/* Info */}

        <View
          style={styles.infoRow}
        >

          <View
            style={styles.infoItem}
          >

            <Ionicons
              name="book-outline"
              size={15}
              color={MUTED}
            />

            <Text
              style={styles.infoText}
            >
              {course.passedLessons ??
                0}{' '}
              / {course.lessonCount ?? 0}{' '}
              บท
            </Text>

          </View>


          {course.startDate && (

            <View
              style={styles.infoItem}
            >

              <Ionicons
                name="calendar-outline"
                size={15}
                color={MUTED}
              />

              <Text
                style={styles.infoText}
              >
                {formatDate(
                  course.startDate,
                )}
              </Text>

            </View>

          )}

        </View>


        {/* Status */}

        <View
          style={styles.statusRow}
        >

          <StatusBadge
            status={
              isCompleted
                ? 'completed'
                : course.status
            }
          />

        </View>

      </View>


      {/* Arrow */}

      <View
        style={styles.arrowContainer}
      >

        <Ionicons
          name="chevron-forward"
          size={22}
          color={MUTED}
        />

      </View>

    </TouchableOpacity>

  );
}


// =====================================================
// Status Badge
// =====================================================

interface StatusBadgeProps {
  status?: string;
}

function StatusBadge({
  status,
}: StatusBadgeProps) {

  let label = 'Not Started';

  let icon:
    | keyof typeof Ionicons.glyphMap =
    'ellipse-outline';

  let color = MUTED;

  let background = '#F3F4F6';


  switch (status) {

    case 'learning':

      label = 'In Progress';

      icon = 'play-circle-outline';

      color = BLUE;

      background = LIGHT_BLUE;

      break;


    case 'completed':

      label = 'Completed';

      icon = 'checkmark-circle';

      color = GREEN;

      background = '#EAF8ED';

      break;


    case 'expired':

      label = 'Expired';

      icon = 'time-outline';

      color = RED;

      background = '#FDECEC';

      break;


    case 'register':

    default:

      label = 'Not Started';

      icon = 'ellipse-outline';

      color = MUTED;

      background = '#F3F4F6';

      break;

  }


  return (

    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor:
            background,
        },
      ]}
    >

      <Ionicons
        name={icon}
        size={14}
        color={color}
      />

      <Text
        style={[
          styles.statusText,
          {
            color,
          },
        ]}
      >
        {label}
      </Text>

    </View>

  );
}


// =====================================================
// Styles
// =====================================================

const styles = StyleSheet.create({

  // ---------------------------------------------------
  // Layout
  // ---------------------------------------------------

  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  container: {
    flex: 1,
    backgroundColor: BG,
  },

  scrollContent: {
    paddingBottom: 40,
  },


  // ---------------------------------------------------
  // Header
  // ---------------------------------------------------

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: PRIMARY,
  },

  pageSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: MUTED,
  },

  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },


  // ---------------------------------------------------
  // Search
  // ---------------------------------------------------

  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: TEXT,
  },


  // ---------------------------------------------------
  // Tabs
  // ---------------------------------------------------

  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: BORDER,
  },

  tab: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },

  tabActive: {
    backgroundColor: PRIMARY,
  },

  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: MUTED,
  },

  tabTextActive: {
    color: '#FFFFFF',
  },


  // ---------------------------------------------------
  // Section
  // ---------------------------------------------------

  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT,
  },

  sectionCount: {
    fontSize: 13,
    color: MUTED,
  },


  // ---------------------------------------------------
  // Course Grid
  // ---------------------------------------------------

  courseGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  courseCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
  },

  courseImage: {
    width: '100%',
    height: 125,
    backgroundColor: '#EEF2F7',
  },

  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  courseContent: {
    padding: 12,
  },

  courseTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    color: TEXT,
  },

  courseNumber: {
    marginTop: 4,
    fontSize: 11,
    color: MUTED,
  },

  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },

  courseMetaText: {
    marginLeft: 5,
    fontSize: 12,
    color: MUTED,
  },


  // ---------------------------------------------------
  // My Course
  // ---------------------------------------------------

  myCourseList: {
    paddingHorizontal: 20,
  },

  myCourseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'relative',
  },

  myCourseImage: {
    width: 110,
    minHeight: 170,
    backgroundColor: '#EEF2F7',
  },

  myCourseContent: {
    flex: 1,
    padding: 13,
    paddingRight: 38,
  },

  myCourseTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    color: TEXT,
  },

  progressHeader: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  progressLabel: {
    fontSize: 12,
    color: MUTED,
  },

  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },

  progressBackground: {
    height: 7,
    marginTop: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: BLUE,
    borderRadius: 5,
  },

  infoRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoText: {
    marginLeft: 4,
    fontSize: 11,
    color: MUTED,
  },

  arrowContainer: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -11,
  },


  // ---------------------------------------------------
  // Status
  // ---------------------------------------------------

  statusRow: {
    marginTop: 10,
    flexDirection: 'row',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '700',
  },


  // ---------------------------------------------------
  // Loading
  // ---------------------------------------------------

  loadingContainer: {
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: MUTED,
  },


  // ---------------------------------------------------
  // Empty
  // ---------------------------------------------------

  emptyContainer: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
  },


  // ---------------------------------------------------
  // Modal
  // ---------------------------------------------------

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.35)',
    alignItems: 'flex-end',
  },

  menuModal: {
    width: 280,
    marginTop: 80,
    marginRight: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  menuTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  menuItemText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
  },
categoryDescription: {
  marginTop: 6,
  fontSize: 11,
  lineHeight: 16,
  color: MUTED,
},

categoryButton: {
  marginTop: 12,
  backgroundColor: PRIMARY,
  borderRadius: 8,
  paddingVertical: 8,
  paddingHorizontal: 10,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},

categoryButtonText: {
  color: '#FFFFFF',
  fontSize: 11,
  fontWeight: '700',
  marginRight: 4,
},
});