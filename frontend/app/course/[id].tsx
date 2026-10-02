/**
 * ============================================================
 * app/course/[id].tsx  —  หน้ารายละเอียดหลักสูตร + รายการบทเรียน
 * (อย่าสับสนกับ app/course-category/[id].tsx และ app/lesson/[id].tsx ที่ชื่อไฟล์เหมือนกัน)
 * ============================================================
 * สรุปสิ่งที่แก้ (ค้นหา [FIX] / [ADD] / [REMOVE])
 * [FIX]  ปุ่มแบบทดสอบหลังเรียนใช้ lesson.postTest.canTake ที่ backend ส่งมาแล้ว
 * [FIX]  ไม่หมุนค้างเมื่อยังไม่มี user: แสดง error แทน
 * [FIX]  โหลดซ้ำตอนกลับมาที่หน้าเป็นแบบ "เงียบ" ไม่เด้ง spinner เต็มจอ/ไม่รีเซ็ต scroll
 * [FIX]  setActiveTab('lessons') ทำเฉพาะตอน params.tab เปลี่ยน (เดิมบังคับทุกครั้งที่ focus)
 * [FIX]  กดวิดีโอตัวไหนก็เปิดตัวนั้น (ส่ง fileId) เดิมทุกปุ่มเปิดบทเฉยๆ
 * [FIX]  ใช้ progress.completed / passedAllExams จาก backend ให้ตรงกับหน้า list
 * [FIX]  ใบประกาศ/แบบประเมินอ่านจาก courseData.evaluation (เดิมเป็น local state ที่ไม่เคยเป็น true)
 * [FIX]  video.name เป็น null -> ใช้ filename แทน
 * [ADD]  ปุ่ม "เอกสารประกอบ" ใช้งานได้จริงแล้ว ดึงจาก getLessonDocuments แล้วเปิดผ่าน Linking
 *        (เดิมเป็นปุ่มเปล่า กดแล้วไม่ทำอะไรเลย)
 * [REMOVE] โค้ดเมนู (menuVisible/menuList/handleMenuPress/Modal) ที่ไม่มีที่เรียกเปิด,
 *          โค้ดที่ comment ทิ้ง, style และค่าคงที่ที่ไม่ได้ใช้
 */
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  router,
  useLocalSearchParams,
  useFocusEffect,
} from 'expo-router';

import AppHeader from '../../src/components/AppHeader';

import {
  getCourseDetail,
  getLessonDocuments,
  CourseDetail,
  CourseLesson,
  LessonTest,
  LessonVideo,
} from '../../src/services/course';

import { useAuth } from '../../src/context/AuthContext';

const PRIMARY = '#001B74';
const BLUE = '#0B63CE';
const ORANGE = '#F9C56A';
const GREEN = '#57C46B';
const BG = '#FFFFFF';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// "คะแนน/เต็ม" ถ้าสอบแล้ว ไม่งั้น null
const scoreText = (test: LessonTest) =>
  test.completed
    ? `${test.score ?? 0}/${test.total ?? 0}`
    : null;

export default function CourseDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
    tab?: string;
  }>();

  const { id } = params;
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'detail' | 'lessons'>(
    params.tab === 'lessons' ? 'lessons' : 'detail',
  );

  const [courseData, setCourseData] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ใช้สั่งโหลดใหม่ (ปุ่ม "ลองใหม่")
  const [reloadKey, setReloadKey] = useState(0);

  // [ADD] lessonId ที่กำลังโหลดเอกสารประกอบอยู่ (กันกดซ้ำ/โชว์ loading เฉพาะปุ่มนั้น)
  const [loadingDocsLessonId, setLoadingDocsLessonId] = useState<
    number | null
  >(null);

  // [ADD] มีข้อมูลแล้วหรือยัง -> ถ้ามีแล้วให้ refresh เงียบๆ
  const hasData = useRef(false);

  // [FIX] เดิมเรียก setActiveTab('lessons') ใน loadCourse ทุกครั้งที่ focus
  useEffect(() => {
    if (params.tab === 'lessons') {
      setActiveTab('lessons');
    }
  }, [params.tab]);

  // ============================================================
  // LOAD COURSE
  // ============================================================

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const loadCourse = async () => {
        if (!id) {
          return;
        }

        // [FIX] เดิม return โดยไม่ setLoading(false) -> หมุนค้างถ้า user ยังไม่พร้อม
        if (!user?.id) {
          setLoading(false);
          setError('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
          return;
        }

        try {
          // [FIX] แสดง spinner เต็มจอเฉพาะครั้งแรก
          if (!hasData.current) {
            setLoading(true);
          }

          setError(null);

          const response = await getCourseDetail(
            Number(id),
            Number(user.id),
            1,
          );

          if (!mounted) {
            return;
          }

          if (!response.success || !response.data) {
            hasData.current = false;
            setCourseData(null);
            setError(response.message ?? 'ไม่พบข้อมูลหลักสูตร');
            return;
          }

          hasData.current = true;
          setCourseData(response.data);
        } catch (err) {
          if (__DEV__) {
            console.log('COURSE DETAIL ERROR:', err);
          }

          // ถ้ามีข้อมูลเดิมอยู่แล้ว ให้แสดงต่อ ไม่ต้องล้างหน้า
          if (mounted && !hasData.current) {
            setError('ไม่สามารถโหลดข้อมูลหลักสูตรได้');
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

      loadCourse();

      return () => {
        mounted = false;
      };
    }, [id, user?.id, reloadKey]),
  );

  // ============================================================
  // LOADING / ERROR
  // ============================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูลหลักสูตร...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !courseData) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {error ?? 'ไม่พบข้อมูลหลักสูตร'}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              setReloadKey((value) => value + 1);
            }}
          >
            <Text style={styles.retryText}>ลองใหม่</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // DATA
  // ============================================================

  const { course, lessons, progress } = courseData;

  const percent = Math.min(100, Math.max(0, progress.percent ?? 0));

  // เรียนครบทุกบท (ดูวิดีโอครบ)
  const lessonCompleted =
    progress.totalLessons > 0 &&
    progress.passedLessons >= progress.totalLessons;

  // [FIX] ใช้ค่าจาก backend (เดิมคำนวณเองในแอป ทำให้ไม่ตรงกับหน้า list)
  const passedAllExams = progress.passedAllExams;
  const isCompleted = progress.completed;

  // [FIX] แบบประเมินอ่านจาก API (เดิม local state ที่ไม่เคยถูกตั้งเป็น true
  // -> ปุ่มใบประกาศถูกล็อกตลอด) required = false = ไม่ต้องทำแบบประเมิน
  const evaluationRequired = courseData.evaluation?.required ?? true;
  const evaluationDone = courseData.evaluation?.completed ?? false;
  const canGetCertificate =
    isCompleted && (!evaluationRequired || evaluationDone);

  const courseName = course.courseName ?? course.title ?? '';

  // ============================================================
  // NAVIGATION
  // ============================================================

  // [FIX] ส่ง fileId ไปด้วย เพื่อเปิดวิดีโอตัวที่กด
  const openLesson = (lesson: CourseLesson, video?: LessonVideo) => {
    if (!lesson.canLearn) {
      return;
    }

    router.push({
      pathname: `/lesson/${course.id}`,
      params: {
        lessonId: String(lesson.id),
        chapter: String(lesson.lessonNo ?? 1),
        ...(video ? { fileId: String(video.id) } : {}),
      },
    } as any);
  };

  const openPreTest = (lesson: CourseLesson) => {
    if (!lesson.canLearn || !lesson.preTest.hasTest) {
      return;
    }

    router.push({
      pathname: `/exam/${course.id}`,
      params: { lessonId: String(lesson.id), examType: 'pretest' },
    } as any);
  };

  const openPostTest = (lesson: CourseLesson) => {
    if (
      !lesson.canLearn ||
      !lesson.postTest.hasTest ||
      !lesson.postTest.canTake
    ) {
      return;
    }

    router.push({
      pathname: `/exam/${course.id}`,
      params: { lessonId: String(lesson.id), examType: 'posttest' },
    } as any);
  };

  // [ADD] เปิดเอกสารประกอบของบทเรียน (เดิมปุ่มนี้กดแล้วไม่ทำอะไรเลย)
  const openDocuments = async (lesson: CourseLesson) => {
    if (loadingDocsLessonId) {
      return;
    }

    try {
      setLoadingDocsLessonId(lesson.id);

      const response = await getLessonDocuments(course.id, lesson.id);
      const documents = response.success ? response.data.documents : [];

      if (documents.length === 0) {
        Alert.alert('ไม่มีเอกสารประกอบ', 'บทเรียนนี้ยังไม่มีเอกสารประกอบให้ดาวน์โหลด');
        return;
      }

      if (documents.length === 1) {
        const [only] = documents;

        if (only.url) {
          Linking.openURL(only.url);
        } else {
          Alert.alert('เปิดไม่ได้', 'ไม่พบไฟล์เอกสารนี้');
        }

        return;
      }

      // มีหลายไฟล์ -> ให้เลือกก่อนเปิด (Alert รองรับปุ่มได้จำกัด จึงแสดงสูงสุด 3 รายการแรก)
      Alert.alert(
        'เอกสารประกอบ',
        undefined,
        [
          ...documents.slice(0, 3).map((doc) => ({
            text: doc.name ?? 'เอกสาร',
            onPress: () => {
              if (doc.url) {
                Linking.openURL(doc.url);
              }
            },
          })),
          { text: 'ยกเลิก', style: 'cancel' as const },
        ],
      );
    } catch (err) {
      if (__DEV__) {
        console.log('LOAD DOCUMENTS ERROR:', err);
      }

      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดเอกสารประกอบได้ กรุณาลองใหม่');
    } finally {
      setLoadingDocsLessonId(null);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.root}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppHeader />

          <View style={styles.pageBox}>
            {/* TITLE */}
            <View style={styles.titleRow}>
              <Text style={styles.pageTitle}>{course.title}</Text>
            </View>

            {/* COURSE CARD */}
            <View style={styles.courseCard}>
              {course.image && (
                <Image
                  source={{ uri: course.image }}
                  style={styles.courseImage}
                />
              )}

              <View style={styles.courseBody}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${percent}%`,
                        backgroundColor: isCompleted ? GREEN : ORANGE,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.progressText}>
                  {percent}% {isCompleted ? 'เรียนสมบูรณ์' : 'กำลังเรียน'}
                </Text>

                <View style={styles.teacherBox}>
                  <View style={styles.teacherRow}>
                    <Text style={styles.teacherLabel}>คำสอนหลักสูตร :</Text>
                    <Text style={styles.teacherValue}>
                      {course.teacher ?? '-'}
                    </Text>
                  </View>

                  <View style={styles.teacherRow}>
                    <Text style={styles.teacherLabel}>ผู้ปฏิบัติหลักสูตร :</Text>
                    <Text style={styles.teacherValue}>
                      {course.assistant ?? '-'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* COURSE INFO */}
            <View style={styles.infoGrid}>
              <View style={styles.infoCell}>
                <Text style={styles.infoLabel}>ระยะเวลา</Text>
                <Ionicons name="time-outline" size={24} color={BLUE} />
                <Text style={styles.infoValue}>{course.duration ?? '-'}</Text>
              </View>

              <View style={styles.infoCell}>
                <Text style={styles.infoLabel}>จำนวนบทเรียน</Text>
                <Ionicons name="book" size={24} color={BLUE} />
                <Text style={styles.infoValue}>
                  {progress.totalLessons} บทเรียน
                </Text>
              </View>
            </View>

            {/* STATUS */}
            <View style={styles.statusBox}>
              <View style={styles.statusHeader}>
                <Ionicons
                  name={isCompleted ? 'checkmark-circle' : 'school-outline'}
                  size={24}
                  color={isCompleted ? GREEN : PRIMARY}
                />

                <View style={{ flex: 1 }}>
                  <Text style={styles.statusTitle}>
                    {isCompleted ? 'เรียนครบแล้ว' : 'สถานะการเรียน'}
                  </Text>

                  <Text style={styles.statusDesc}>
                    {isCompleted
                      ? 'คุณเรียนครบทุกบทและทำแบบทดสอบผ่านครบทั้งคอร์สแล้ว'
                      : 'ต้องเรียนจบทุกบทของคอร์สนี้ก่อน จึงจะสามารถพิมพ์ใบประกาศได้'}
                  </Text>
                </View>
              </View>

              <View style={styles.requirementList}>
                <Requirement done={lessonCompleted} label="เรียนครบทุกบท" />
                <Requirement
                  done={passedAllExams}
                  label="ทำแบบทดสอบผ่านทุกบท"
                />
              </View>
            </View>

            {/* SCORE SUMMARY */}
            <View style={styles.academicSummaryBox}>
              <View style={styles.academicSummaryHeader}>
                <Ionicons name="stats-chart" size={20} color="#fff" />
                <Text style={styles.academicSummaryTitle}>
                  คะแนนสอบแต่ละบท
                </Text>
              </View>

              {lessons.map((lesson, index) => (
                <View key={lesson.id} style={styles.chapterScoreGroup}>
                  <View style={styles.chapterScoreGroupHeader}>
                    <Text style={styles.chapterScoreChapter}>
                      บทที่ {index + 1}
                    </Text>
                    <Text style={styles.chapterScoreName} numberOfLines={1}>
                      {lesson.title}
                    </Text>
                  </View>

                  <View style={styles.chapterScoreRow}>
                    <Text style={styles.chapterScoreLabel}>คะแนนก่อนเรียน</Text>
                    <Text style={styles.chapterScoreValue}>
                      {scoreText(lesson.preTest) ?? '-'}
                    </Text>
                  </View>

                  <View style={styles.chapterScoreRow}>
                    <Text style={styles.chapterScoreLabel}>คะแนนหลังเรียน</Text>
                    <Text style={styles.chapterScoreValue}>
                      {scoreText(lesson.postTest) ?? '-'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* EVALUATION */}
            {evaluationRequired &&
              (isCompleted ? (
                <TouchableOpacity
                  style={[
                    styles.evaluateBtn,
                    evaluationDone && styles.evaluateBtnDone,
                  ]}
                  activeOpacity={0.85}
                  disabled={evaluationDone}
                  onPress={() =>
                    router.push({
                      pathname: '/evaluation/[id]',
                      params: { id: String(course.id), courseName },
                    } as any)
                  }
                >
                  <Ionicons
                    name={
                      evaluationDone ? 'checkmark-circle' : 'clipboard-outline'
                    }
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.evaluateText}>
                    {evaluationDone
                      ? 'ทำแบบประเมินเรียบร้อยแล้ว'
                      : 'ทำแบบประเมิน'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.evaluationLockedBox}>
                  <Ionicons name="lock-closed" size={18} color="#9CA3AF" />
                  <Text style={styles.evaluationLockedText}>
                    ต้องเรียนและทำแบบทดสอบหลังเรียนครบทุกบทก่อน
                  </Text>
                </View>
              ))}

            {/* CERTIFICATE */}
            {canGetCertificate ? (
              <TouchableOpacity
                style={styles.certificateBigBtn}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: '/certificate/[id]',
                    params: { id: String(course.id), courseName },
                  } as any)
                }
              >
                <Ionicons name="ribbon" size={22} color="#fff" />
                <Text style={styles.certificateBigText}>พิมพ์ใบประกาศ</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.certificateLockedBox}>
                <Ionicons name="lock-closed" size={18} color="#9CA3AF" />
                <Text style={styles.certificateLockedText}>
                  {!isCompleted
                    ? 'ต้องเรียนจบทั้งคอร์สก่อน จึงจะพิมพ์ใบประกาศได้'
                    : 'ต้องทำแบบประเมินก่อน จึงจะพิมพ์ใบประกาศได้'}
                </Text>
              </View>
            )}

            {/* TABS */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab === 'detail' && styles.tabBtnActive,
                ]}
                onPress={() => setActiveTab('detail')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'detail' && styles.tabTextActive,
                  ]}
                >
                  รายละเอียดหลักสูตร
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab === 'lessons' && styles.tabBtnActive,
                ]}
                onPress={() => setActiveTab('lessons')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'lessons' && styles.tabTextActive,
                  ]}
                >
                  รายการหลักสูตร
                </Text>
              </TouchableOpacity>
            </View>

            {/* DETAIL TAB */}
            {activeTab === 'detail' && (
              <View style={styles.detailBox}>
                <Text style={styles.detailText}>{course.detail ?? ''}</Text>

                <View style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{course.title}</Text>
                </View>

                <View style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>
                    {progress.totalLessons} บทเรียน
                  </Text>
                </View>
              </View>
            )}

            {/* LESSON TAB */}
            {activeTab === 'lessons' && (
              <View style={styles.lessonPanel}>
                {lessons.map((lesson, index) => {
                  const unlocked = lesson.canLearn === true;
                  const preScore = scoreText(lesson.preTest);
                  const postScore = scoreText(lesson.postTest);

                  // [FIX] canTake มาจาก backend แล้ว
                  const postLocked = !unlocked || !lesson.postTest.canTake;

                  return (
                    <View key={lesson.id} style={styles.chapterSection}>
                      {/* CHAPTER HEADER */}
                      <View style={styles.blueChapterHeader}>
                        <View style={styles.blueChapterLeft}>
                          <Text style={styles.blueChapterNo}>
                            บทที่ {index + 1}
                          </Text>
                          <Text style={styles.blueChapterTitle}>
                            {lesson.title}
                          </Text>
                        </View>

                        {/* [FIX] เชื่อมกับ getLessonDocuments จริงแล้ว */}
                        <TouchableOpacity
                          style={styles.docBtnWhite}
                          activeOpacity={0.8}
                          disabled={loadingDocsLessonId === lesson.id}
                          onPress={() => openDocuments(lesson)}
                        >
                          {loadingDocsLessonId === lesson.id ? (
                            <ActivityIndicator size="small" color={TEXT} />
                          ) : (
                            <>
                              <Ionicons name="download" size={12} color={TEXT} />
                              <Text style={styles.docBtnWhiteText}>
                                เอกสารประกอบ
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>

                      <View style={styles.examSections}>
                        {/* PRE TEST */}
                        <View style={styles.examSection}>
                          <SectionHeader
                            iconStyle={styles.pretestIcon}
                            icon="create-outline"
                            iconSize={20}
                            iconColor={BLUE}
                            title="แบบทดสอบก่อนเรียน"
                            desc="ทำแบบทดสอบก่อนเริ่มเรียนบทนี้"
                          />

                          {preScore && (
                            <ScoreResult
                              label="คะแนนสอบก่อนเรียน"
                              value={preScore}
                            />
                          )}

                          {lesson.preTest.hasTest ? (
                            <TouchableOpacity
                              style={[
                                styles.examButton,
                                styles.pretestButton,
                                !unlocked && styles.examButtonLocked,
                              ]}
                              activeOpacity={0.85}
                              disabled={!unlocked}
                              onPress={() => openPreTest(lesson)}
                            >
                              <Text style={styles.examButtonText}>
                                {!unlocked
                                  ? 'บทเรียนนี้ยังไม่ปลดล็อก'
                                  : lesson.preTest.completed
                                    ? 'ทำแบบทดสอบอีกครั้ง'
                                    : 'เริ่มทำแบบทดสอบก่อนเรียน'}
                              </Text>

                              <Ionicons
                                name={
                                  !unlocked
                                    ? 'lock-closed'
                                    : lesson.preTest.completed
                                      ? 'checkmark-circle'
                                      : 'arrow-forward'
                                }
                                size={20}
                                color="#FFFFFF"
                              />
                            </TouchableOpacity>
                          ) : (
                            <EmptyNote text="ไม่มีแบบทดสอบก่อนเรียน" />
                          )}
                        </View>

                        {/* VIDEO */}
                        <View style={styles.examSection}>
                          <SectionHeader
                            iconStyle={styles.videoIcon}
                            icon="play-circle-outline"
                            iconSize={22}
                            iconColor={BLUE}
                            title="วิดีโอบทเรียน"
                            desc="ต้องดูวิดีโอให้จบก่อนทำแบบทดสอบประจำบท"
                          />

                          {lesson.videos && lesson.videos.length > 0 ? (
                            lesson.videos.map((video) => (
                              <TouchableOpacity
                                key={video.id}
                                style={[
                                  styles.examButton,
                                  styles.videoButton,
                                  !unlocked && styles.examButtonLocked,
                                ]}
                                disabled={!unlocked}
                                activeOpacity={0.85}
                                // [FIX] ส่ง video ไปด้วย
                                onPress={() => openLesson(lesson, video)}
                              >
                                <View style={styles.videoButtonLeft}>
                                  <Ionicons
                                    name={
                                      video.status === 'pass'
                                        ? 'checkmark-circle'
                                        : 'play-circle'
                                    }
                                    size={22}
                                    color="#FFFFFF"
                                  />

                                  <View style={{ marginLeft: 10, flex: 1 }}>
                                    <Text
                                      style={styles.examButtonText}
                                      numberOfLines={2}
                                    >
                                      {/* [FIX] name อาจเป็น null */}
                                      {video.name ?? video.filename}
                                    </Text>

                                    {video.time && (
                                      <Text style={styles.videoTimeText}>
                                        {video.time}
                                      </Text>
                                    )}
                                  </View>
                                </View>

                                <Text style={styles.videoActionText}>
                                  {video.status === 'pass'
                                    ? 'ดูอีกครั้ง'
                                    : 'ดูวิดีโอ'}
                                </Text>
                              </TouchableOpacity>
                            ))
                          ) : (
                            <EmptyNote text="ไม่มีวิดีโอในบทเรียนนี้" />
                          )}
                        </View>

                        {/* POST TEST */}
                        <View style={styles.examSection}>
                          <SectionHeader
                            iconStyle={styles.posttestIcon}
                            icon="ribbon-outline"
                            iconSize={20}
                            iconColor="#B45309"
                            title="แบบทดสอบหลังเรียน"
                            desc="ทำแบบทดสอบหลังจากดูบทเรียนจบ"
                          />

                          {postScore && (
                            <ScoreResult
                              label="คะแนนสอบบทนี้"
                              value={postScore}
                            />
                          )}

                          {lesson.postTest.hasTest ? (
                            <TouchableOpacity
                              style={[
                                styles.examButton,
                                styles.posttestButton,
                                postLocked && styles.examButtonLocked,
                              ]}
                              activeOpacity={0.85}
                              disabled={postLocked}
                              onPress={() => openPostTest(lesson)}
                            >
                              <Text style={styles.examButtonText}>
                                {!unlocked
                                  ? 'บทเรียนนี้ยังไม่ปลดล็อก'
                                  : !lesson.postTest.canTake
                                    ? 'กรุณาดูบทเรียนให้จบก่อน'
                                    : lesson.postTest.completed
                                      ? 'ทำแบบทดสอบอีกครั้ง'
                                      : 'เริ่มทำแบบทดสอบประจำบท'}
                              </Text>

                              <Ionicons
                                name={
                                  postLocked
                                    ? 'lock-closed'
                                    : lesson.postTest.completed
                                      ? 'checkmark-circle'
                                      : 'arrow-forward'
                                }
                                size={20}
                                color="#FFFFFF"
                              />
                            </TouchableOpacity>
                          ) : (
                            <EmptyNote text="ไม่มีแบบทดสอบหลังเรียน" />
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>©2026 Thoresen e-learning</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ============================================================
// [ADD] component ย่อย: แยกโค้ดที่เคยซ้ำกัน pre/post/video ออกมา
// ============================================================

function Requirement({ done, label }: { done: boolean; label: string }) {
  return (
    <View style={styles.requirementItem}>
      <Ionicons
        name={done ? 'checkmark-circle' : 'ellipse-outline'}
        size={18}
        color={done ? GREEN : '#9CA3AF'}
      />
      <Text style={styles.requirementText}>{label}</Text>
    </View>
  );
}

function SectionHeader({
  icon,
  iconSize,
  iconColor,
  iconStyle,
  title,
  desc,
}: {
  icon: IconName;
  iconSize: number;
  iconColor: string;
  iconStyle: object;
  title: string;
  desc: string;
}) {
  return (
    <View style={styles.examSectionHeader}>
      <View style={[styles.examTypeIcon, iconStyle]}>
        <Ionicons name={icon} size={iconSize} color={iconColor} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.examSectionTitle}>{title}</Text>
        <Text style={styles.examSectionDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function ScoreResult({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.lessonScoreResult}>
      <Text style={styles.lessonScoreLabel}>{label}</Text>
      <Text style={styles.lessonScoreValue}>{value}</Text>
    </View>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <View style={[styles.evaluationLockedBox, { marginBottom: 0 }]}>
      <Text style={styles.evaluationLockedText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  root: {
    flex: 1,
    backgroundColor: "#fff",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 12,
    color: MUTED,
    fontSize: 13,
    fontWeight: "700",
  },

  errorText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 14,
  },

  retryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },

  retryText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },

  pageBox: {
    paddingHorizontal: 18,
  },

  titleRow: {
    marginTop: 8,
    marginBottom: 12,
  },

  pageTitle: {
    fontSize: 18,
    color: TEXT,
    fontWeight: "900",
  },

  courseCard: {
    backgroundColor: "#F3F3F3",
    overflow: "hidden",
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },

  courseImage: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
  },

  courseBody: {
    padding: 12,
    backgroundColor: "#F3F3F3",
  },

  progressTrack: {
    height: 7,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
  },

  progressText: {
    fontSize: 13,
    color: TEXT,
    fontWeight: "800",
    marginTop: 9,
  },

  teacherBox: {
    marginTop: 8,
  },

  teacherRow: {
    flexDirection: "row",
    marginTop: 4,
  },

  teacherLabel: {
    width: 112,
    color: MUTED,
    fontSize: 11,
  },

  teacherValue: {
    flex: 1,
    color: TEXT,
    fontSize: 11,
    fontWeight: "800",
  },

  infoGrid: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    overflow: "hidden",
    flexDirection: "row",
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  infoCell: {
    flex: 1,
    minHeight: 82,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: BORDER,
    paddingVertical: 10,
  },

  infoLabel: {
    fontSize: 10,
    color: TEXT,
    fontWeight: "700",
    marginBottom: 8,
  },

  infoValue: {
    marginTop: 6,
    fontSize: 11,
    color: TEXT,
    fontWeight: "700",
  },

  evaluateBtn: {
    height: 46,
    backgroundColor: "#16A34A",
    borderRadius: 10,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  evaluateText: {
    color: "#fff",
    fontWeight: "900",
    marginLeft: 8,
    fontSize: 14,
  },

  academicSummaryBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },

  academicSummaryHeader: {
    minHeight: 46,
    backgroundColor: PRIMARY,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  academicSummaryTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 9,
  },

  chapterScoreGroup: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  chapterScoreGroupHeader: {
    marginBottom: 8,
  },

  chapterScoreChapter: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 3,
  },

  chapterScoreName: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "700",
  },

  chapterScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },

  chapterScoreLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "600",
  },

  chapterScoreValue: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: "900",
  },

  lessonScoreResult: {
    minHeight: 46,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 9,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  lessonScoreLabel: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "700",
  },

  lessonScoreValue: {
    color: "#166534",
    fontSize: 16,
    fontWeight: "900",
  },

  tabRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
    overflow: "hidden",
  },

  tabBtn: {
    flex: 1,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 4,
    borderBottomColor: "transparent",
  },

  tabBtnActive: {
    borderBottomColor: PRIMARY,
  },

  tabText: {
    fontSize: 13,
    color: MUTED,
    fontWeight: "800",
    textAlign: "center",
  },

  tabTextActive: {
    color: PRIMARY,
    fontWeight: "900",
  },

  detailBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 14,
    marginBottom: 22,
  },

  detailText: {
    color: TEXT,
    fontSize: 10.5,
    lineHeight: 16,
    marginBottom: 8,
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 3,
  },

  bullet: {
    fontSize: 11,
    color: TEXT,
    marginRight: 5,
  },

  bulletText: {
    fontSize: 10.5,
    color: TEXT,
    lineHeight: 15,
  },

  lessonPanel: {
    backgroundColor: "#D9ECFA",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 22,
  },

  chapterSection: {
    marginBottom: 12,
  },

  blueChapterHeader: {
    minHeight: 35,
    backgroundColor: "#2384D1",
    borderRadius: 5,
    paddingLeft: 13,
    paddingRight: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 6,
  },

  blueChapterLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },

  blueChapterNo: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginRight: 14,
  },

  blueChapterTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
  },

  docBtnWhite: {
    minWidth: 135,
    height: 27,
    backgroundColor: "#fff",
    borderRadius: 4,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  docBtnWhiteText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 1,
  },

  footer: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    marginTop: 18,
    paddingHorizontal: 18,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },

  footerText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },

  statusBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },

  statusHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  statusTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: TEXT,
    marginBottom: 4,
  },

  statusDesc: {
    fontSize: 11,
    lineHeight: 16,
    color: MUTED,
    fontWeight: "600",
  },

  requirementList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 10,
  },

  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  requirementText: {
    marginLeft: 8,
    fontSize: 12,
    color: TEXT,
    fontWeight: "700",
  },

  certificateBigBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  certificateBigText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },

  certificateLockedBox: {
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    paddingHorizontal: 14,
  },

  certificateLockedText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 8,
    textAlign: "center",
  },

  examSections: {
    padding: 12,
    backgroundColor: "#F8FAFC",
  },

  examSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 12,
  },

  examSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  examTypeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  pretestIcon: {
    backgroundColor: "#E8F1FF",
  },

  posttestIcon: {
    backgroundColor: "#FFF3D6",
  },

  examSectionTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
  },

  examSectionDesc: {
    color: "#6B7280",
    fontSize: 11,
    marginTop: 3,
  },

  examButton: {
    height: 48,
    borderRadius: 11,
    backgroundColor: PRIMARY,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pretestButton: {
    backgroundColor: BLUE,
  },

  posttestButton: {
    backgroundColor: "#E30613",
  },

  examButtonLocked: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },

  examButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    flex: 1,
  },

  videoIcon: {
    backgroundColor: "#E8F4FF",
  },

  videoButton: {
    backgroundColor: BLUE,
    minHeight: 58,
    height: "auto",
    paddingVertical: 10,
  },

  videoButtonLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  videoTimeText: {
    color: "#DCEBFF",
    fontSize: 10,
    marginTop: 3,
  },

  videoActionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 8,
  },

  evaluateBtnDone: {
    backgroundColor: GREEN,
    opacity: 0.8,
  },

  evaluationLockedBox: {
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  evaluationLockedText: {
    flex: 1,
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

});
