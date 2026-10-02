/**
 * ============================================================
 * app/lesson/[id].tsx  —  หน้าดูวิดีโอบทเรียน
 * (อย่าสับสนกับ app/course/[id].tsx และ app/course-category/[id].tsx ที่ชื่อไฟล์เหมือนกัน)
 * ============================================================
 * ไฟล์นี้เปลี่ยนมากที่สุด เพราะของเดิมเป็นข้อมูลจำลอง (ไม่ต่อ backend)
 *
 * [FIX]  เลิกใช้ lessonBank (hard-code) + video = null -> โหลดบทเรียน/วิดีโอจริงจาก
 *        getCourseDetail ตาม lessonId + fileId ที่หน้า course/[id] ส่งมา
 *        (เดิม lessonId ที่ไม่มีใน bank จะแสดง "Management Introduction" แทน)
 * [FIX]  บันทึกความคืบหน้าที่ server (markFileCompleted) เมื่อวิดีโอเล่นจบ (event 'playToEnd')
 *        เดิมเก็บใน AsyncStorage เครื่องเดียว -> สถานะบทไม่เคยเปลี่ยน บทถัดไปไม่ปลดล็อก
 * [REMOVE] ปุ่ม "กดเมื่อเรียนจบบทนี้" ที่กดข้ามโดยไม่ต้องดูวิดีโอได้
 * [FIX]  ปุ่มทำข้อสอบหลังเรียนใช้ postTest.canTake จาก backend และส่ง lessonId ไปหน้า exam
 * [FIX]  แถว "ทำข้อสอบก่อนเรียน" แสดงสถานะจริง (เดิม hard-code เป็น Completed เสมอ)
 * [FIX]  โน้ตบันทึกลง tbl_learn_note จริงผ่าน backend (เดิมเก็บ AsyncStorage ในเครื่องเท่านั้น
 *        หายถ้าเปลี่ยนเครื่อง/ล้างแอป/ล็อกอินเครื่องอื่น)
 * [FIX]  ไม่ fallback ไปคอร์ส/บทที่ 1 เมื่อ param หาย แต่แสดงข้อความแทน
 * [REMOVE] โค้ดเมนู/Modal ที่ไม่มีที่เรียกเปิด, logo/style ที่ไม่ได้ใช้
 *
 * ⚠ ต้องตั้ง path วิดีโอใน backend (getVideoUrl ใน course.service.ts) ให้ตรงกับที่เก็บไฟล์จริง
 * ⚠ ต้องสร้างตาม backend: endpoint POST .../complete (มีใน course.controller.ts แล้ว)
 */
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';

import AppHeader from '../../src/components/AppHeader';
import { useAuth } from '../../src/context/AuthContext';

import {
  CourseDetail,
  CourseLesson,
  LessonNote,
  LessonVideo,
  addLessonNote,
  getCourseDetail,
  getLessonNotes,
  markFileCompleted,
} from '../../src/services/course';

const PRIMARY = '#001B74';
const RED = '#E30613';
const BLUE = '#0B63CE';
const GREEN = '#16A34A';
const BG = '#F4F6FA';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const SOFT_BLUE = '#EEF7FF';

// ============================================================
// Screen: โหลดข้อมูล แล้วส่งต่อให้ LessonContent
// ============================================================

export default function LessonVideoScreen() {
  const params = useLocalSearchParams<{
    id: string; // course id
    lessonId?: string;
    fileId?: string;
    chapter?: string;
  }>();

  const { user } = useAuth();

  const courseId = Number(params.id);
  const lessonId = Number(params.lessonId);
  const userId = user?.id ? Number(user.id) : null;

  const [detail, setDetail] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasData = useRef(false);

  const load = useCallback(async () => {
    // [FIX] เดิม fallback เป็นคอร์ส/บทที่ 1 -> ตอนนี้แจ้งว่าข้อมูลไม่ครบ
    if (!courseId || !lessonId) {
      setError('ไม่พบข้อมูลบทเรียน');
      setLoading(false);
      return;
    }

    if (!userId) {
      setError('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
      setLoading(false);
      return;
    }

    try {
      if (!hasData.current) {
        setLoading(true);
      }

      setError(null);

      const response = await getCourseDetail(courseId, userId, 1);

      if (!response.success || !response.data) {
        setError(response.message ?? 'ไม่พบข้อมูลบทเรียน');
        return;
      }

      hasData.current = true;
      setDetail(response.data);
    } catch (err) {
      if (__DEV__) {
        console.log('LESSON LOAD ERROR:', err);
      }

      if (!hasData.current) {
        setError('ไม่สามารถโหลดบทเรียนได้');
      }
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId, userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const lessonIndex =
    detail?.lessons.findIndex((item) => item.id === lessonId) ?? -1;
  const lesson: CourseLesson | undefined =
    lessonIndex >= 0 ? detail?.lessons[lessonIndex] : undefined;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>กำลังโหลดบทเรียน...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !detail || !lesson || userId == null) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {error ?? 'ไม่พบข้อมูลบทเรียน'}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryText}>กลับ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // บทที่ยังไม่ปลดล็อก ห้ามเข้าเรียน (backend ก็ตรวจซ้ำตอนบันทึก)
  if (!lesson.canLearn) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            บทเรียนนี้ยังไม่ปลดล็อก กรุณาเรียนบทก่อนหน้าให้จบก่อน
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryText}>กลับ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // เลือกวิดีโอ: ตาม fileId ที่ส่งมา ไม่งั้นตัวแรกที่ยังไม่จบ ไม่งั้นตัวแรก
  const video: LessonVideo | undefined =
    lesson.videos.find((item) => String(item.id) === params.fileId) ??
    lesson.videos.find((item) => item.status !== 'pass') ??
    lesson.videos[0];

  return (
    <LessonContent
      // key = เปลี่ยนวิดีโอแล้วสร้าง player ใหม่ (source ของ useVideoPlayer ต้องนิ่ง)
      key={video?.id ?? 'no-video'}
      courseId={courseId}
      userId={userId}
      lesson={lesson}
      video={video}
      chapterNo={lessonIndex + 1}
      onReload={load}
    />
  );
}

// ============================================================
// LessonContent: player + รายการ + โน้ต
// ============================================================

function LessonContent({
  courseId,
  userId,
  lesson,
  video,
  chapterNo,
  onReload,
}: {
  courseId: number;
  userId: number;
  lesson: CourseLesson;
  video?: LessonVideo;
  chapterNo: number;
  onReload: () => void;
}) {
  const [note, setNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<LessonNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);

  const completedRef = useRef(video?.status === 'pass');
  const savingRef = useRef(false);
  const [videoDone, setVideoDone] = useState(video?.status === 'pass');

  const player = useVideoPlayer(video?.url ?? null, (instance) => {
    instance.loop = false;
  });

  const lessonDone = lesson.status === 'pass';
  const doneVideos = lesson.videos.filter((item) => item.status === 'pass').length;

  // ------------------------------------------------------------
  // [FIX] บันทึกการเรียนเมื่อวิดีโอเล่นจบจริง
  // ------------------------------------------------------------
  useEffect(() => {
    if (!video) {
      return;
    }

    const subscription = player.addListener('playToEnd', async () => {
      if (completedRef.current || savingRef.current) {
        return;
      }

      savingRef.current = true;

      try {
        const response = await markFileCompleted(
          courseId,
          lesson.id,
          video.id,
          userId,
        );

        if (!response.success) {
          throw new Error('mark complete failed');
        }

        completedRef.current = true;
        setVideoDone(true);

        const lessonFinished = response.data.lessonStatus === 'pass';

        Alert.alert(
          'สำเร็จ',
          lessonFinished
            ? 'เรียนจบบทนี้แล้ว สามารถทำแบบทดสอบหลังเรียนได้'
            : 'บันทึกการดูวิดีโอแล้ว',
          [
            {
              text: 'ตกลง',
              onPress: () => {
                if (lessonFinished) {
                  router.back();
                } else {
                  onReload();
                }
              },
            },
          ],
        );
      } catch (err) {
        if (__DEV__) {
          console.log('MARK COMPLETE ERROR:', err);
        }

        Alert.alert(
          'บันทึกไม่สำเร็จ',
          'ไม่สามารถบันทึกความคืบหน้าได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วดูวิดีโอให้จบอีกครั้ง',
        );
      } finally {
        savingRef.current = false;
      }
    });

    return () => subscription.remove();
  }, [player, video, courseId, lesson.id, userId, onReload]);

  // ------------------------------------------------------------
  // [FIX] โน้ต: บันทึกลง tbl_learn_note จริงผ่าน backend
  // (เดิมเก็บใน AsyncStorage ในเครื่องเท่านั้น หายถ้าเปลี่ยนเครื่อง/ล้างแอป/ย้ายไปเครื่องอื่น)
  // ------------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadNotes = async () => {
      try {
        setNotesLoading(true);

        const response = await getLessonNotes(courseId, lesson.id, userId);

        if (active && response.success) {
          setSavedNotes(response.data);
        }
      } catch (err) {
        if (__DEV__) {
          console.log('LOAD NOTES ERROR:', err);
        }
        // โหลดโน้ตไม่สำเร็จ ไม่ต้อง block การดูวิดีโอ แค่ไม่มีโน้ตให้เห็น
      } finally {
        if (active) {
          setNotesLoading(false);
        }
      }
    };

    loadNotes();

    return () => {
      active = false;
    };
  }, [courseId, lesson.id, userId]);

  const saveNote = async () => {
    const text = note.trim();

    if (!text || savingNote) {
      return;
    }

    try {
      setSavingNote(true);

      const response = await addLessonNote(courseId, lesson.id, userId, text);

      if (!response.success) {
        throw new Error('save note failed');
      }

      // [FIX] เอาโน้ตที่ backend บันทึกจริง (มี id/เวลาที่ถูกต้อง) มาต่อหน้าลิสต์
      setSavedNotes((prev) => [response.data, ...prev]);
      setNote('');
    } catch (err) {
      if (__DEV__) {
        console.log('SAVE NOTE ERROR:', err);
      }

      Alert.alert('บันทึกโน้ตไม่สำเร็จ', 'กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่');
    } finally {
      setSavingNote(false);
    }
  };

  const openExam = (examType: 'pretest' | 'posttest') => {
    router.push({
      pathname: `/exam/${courseId}`,
      params: {
        lessonId: String(lesson.id),
        chapter: String(lesson.lessonNo ?? chapterNo),
        examType,
      },
    } as any);
  };

  const selectVideo = (item: LessonVideo) => {
    if (item.id === video?.id) {
      return;
    }

    router.setParams({ fileId: String(item.id) });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.root}>
        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={90}
          keyboardOpeningTime={0}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <AppHeader />

          <View style={styles.pageBox}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={15} color="#fff" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <View style={styles.heroCard}>
              <View style={styles.heroIcon}>
                <Ionicons name="play" size={28} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.heroSmall}>LESSON VIDEO</Text>
                <Text style={styles.heroTitle}>วิดีโอบทเรียน</Text>
                <Text style={styles.heroSub}>
                  บทที่ {chapterNo} : {lesson.title}
                </Text>

                <View style={styles.heroBottom}>
                  <View style={styles.heroBadge}>
                    <Ionicons name="videocam-outline" size={13} color="#fff" />
                    <Text style={styles.heroBadgeText}>
                      {doneVideos}/{lesson.videos.length} วิดีโอ
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.heroBadge,
                      { backgroundColor: lessonDone ? GREEN : RED },
                    ]}
                  >
                    <Ionicons
                      name={lessonDone ? 'checkmark-circle' : 'play-circle'}
                      size={13}
                      color="#fff"
                    />
                    <Text style={styles.heroBadgeText}>
                      {lessonDone ? 'Completed' : 'Learning'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.videoCard}>
              {video?.url ? (
                <VideoView
                  style={styles.video}
                  player={player}
                  allowsFullscreen
                  allowsPictureInPicture
                  nativeControls
                />
              ) : (
                // [ADD] ไม่มีวิดีโอ/ไม่มี url
                <View style={[styles.video, styles.noVideo]}>
                  <Ionicons name="videocam-off-outline" size={36} color="#9CA3AF" />
                  <Text style={styles.noVideoText}>
                    {video ? 'ไม่พบไฟล์วิดีโอ' : 'บทเรียนนี้ไม่มีวิดีโอ'}
                  </Text>
                </View>
              )}

              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>
                  {video?.name ?? video?.filename ?? lesson.title}
                </Text>
                <Text style={styles.videoDesc}>
                  Watch this lesson carefully before taking the post-test.
                </Text>
              </View>

              {/* [FIX] แทนปุ่ม "กดเมื่อเรียนจบ" เดิม: ระบบบันทึกให้เองเมื่อดูจบ */}
              {video && (
                <View
                  style={[
                    styles.completeBtn,
                    videoDone && styles.completeBtnDone,
                    !videoDone && { backgroundColor: '#9CA3AF' },
                  ]}
                >
                  <Ionicons
                    name={videoDone ? 'checkmark-circle' : 'time-outline'}
                    size={18}
                    color="#fff"
                  />

                  <Text style={styles.completeBtnText}>
                    {videoDone
                      ? 'ดูวิดีโอนี้จบแล้ว'
                      : 'ดูวิดีโอให้จบเพื่อบันทึกความคืบหน้า'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Ionicons name="videocam-outline" size={22} color={BLUE} />
                <Text style={styles.infoLabel}>จำนวนวิดีโอ</Text>
                <Text style={styles.infoValue}>{lesson.videos.length}</Text>
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="book-outline" size={22} color={BLUE} />
                <Text style={styles.infoLabel}>บทเรียน</Text>
                <Text style={styles.infoValue}>บทที่ {chapterNo}</Text>
              </View>
            </View>

            <View style={styles.lessonListCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="list" size={18} color="#fff" />
                <Text style={styles.cardHeaderText}>รายการบทเรียน</Text>
              </View>

              {/* PRE TEST — [FIX] แสดงสถานะจริง */}
              <View style={styles.lessonRow}>
                <View
                  style={
                    !lesson.preTest.hasTest || lesson.preTest.completed
                      ? styles.lessonCircleDone
                      : styles.lessonCircle
                  }
                >
                  <Ionicons
                    name={
                      !lesson.preTest.hasTest || lesson.preTest.completed
                        ? 'checkmark'
                        : 'document-text-outline'
                    }
                    size={13}
                    color={
                      !lesson.preTest.hasTest || lesson.preTest.completed
                        ? '#fff'
                        : BLUE
                    }
                  />
                </View>

                <Text style={styles.lessonText}>ทำข้อสอบก่อนเรียน</Text>

                {!lesson.preTest.hasTest ? (
                  <Text style={styles.lessonStatus}>ไม่มีข้อสอบ</Text>
                ) : lesson.preTest.completed ? (
                  <Text style={styles.lessonStatus}>Completed</Text>
                ) : (
                  <TouchableOpacity
                    style={styles.examBtn}
                    onPress={() => openExam('pretest')}
                  >
                    <Text style={styles.examBtnText}>ทำข้อสอบ</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* VIDEOS — [FIX] แสดงทุกวิดีโอของบท (เดิมมีแถวเดียว) */}
              {lesson.videos.map((item, index) => {
                const isCurrent = item.id === video?.id;
                const isDone = item.status === 'pass';

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    style={isCurrent ? styles.lessonRowActive : styles.lessonRow}
                    onPress={() => selectVideo(item)}
                  >
                    <View
                      style={
                        isDone
                          ? [styles.lessonCircleActive, { backgroundColor: GREEN }]
                          : isCurrent
                            ? styles.lessonCircleActive
                            : styles.lessonCircle
                      }
                    >
                      <Ionicons
                        name={isDone ? 'checkmark' : 'play'}
                        size={12}
                        color={isDone || isCurrent ? '#fff' : BLUE}
                      />
                    </View>

                    <Text
                      style={isCurrent ? styles.lessonTextActive : styles.lessonText}
                      numberOfLines={1}
                    >
                      วิดีโอ {index + 1}: {item.name ?? item.filename}
                    </Text>

                    <Text
                      style={[
                        isCurrent ? styles.lessonStatusActive : styles.lessonStatus,
                        isDone && { color: GREEN },
                      ]}
                    >
                      {isDone ? 'Completed' : isCurrent ? 'Playing' : 'ยังไม่ดู'}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* POST TEST — [FIX] ใช้ canTake จาก backend */}
              <View style={styles.lessonRow}>
                <View style={styles.lessonCircle}>
                  <Ionicons name="document-text-outline" size={12} color={BLUE} />
                </View>

                <Text style={styles.lessonText}>ทำข้อสอบหลังเรียน</Text>

                {!lesson.postTest.hasTest ? (
                  <Text style={styles.lessonStatus}>ไม่มีข้อสอบ</Text>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.examBtn,
                      !lesson.postTest.canTake && styles.examBtnDisabled,
                    ]}
                    disabled={!lesson.postTest.canTake}
                    onPress={() => openExam('posttest')}
                  >
                    <Text
                      style={[
                        styles.examBtnText,
                        !lesson.postTest.canTake && styles.examBtnTextDisabled,
                      ]}
                    >
                      {lesson.postTest.canTake ? 'ทำข้อสอบ' : 'ล็อกอยู่'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <View style={styles.noteIcon}>
                  <Ionicons name="create-outline" size={18} color={PRIMARY} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.noteTitle}>My Learning Note</Text>
                  <Text style={styles.noteSub}>บันทึกสิ่งที่ได้จากบทเรียนนี้</Text>
                </View>

                <Text style={styles.counter}>{note.length}/500</Text>
              </View>

              <TextInput
                value={note}
                onChangeText={(text) => {
                  if (text.length <= 500) {
                    setNote(text);
                  }
                }}
                placeholder="พิมพ์โน้ตจากบทเรียนนี้..."
                placeholderTextColor="#9CA3AF"
                style={styles.noteInput}
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.noteBtn, savingNote && { opacity: 0.7 }]}
                disabled={savingNote}
                onPress={saveNote}
              >
                {savingNote ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={16} color="#fff" />
                    <Text style={styles.noteBtnText}>บันทึกโน้ต</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* [FIX] โน้ตมาจาก backend จริงแล้ว (LessonNote object ไม่ใช่ string เปล่าๆ) */}
              {notesLoading ? (
                <ActivityIndicator
                  size="small"
                  color={PRIMARY}
                  style={{ marginTop: 14 }}
                />
              ) : (
                savedNotes.length > 0 && (
                  <View style={styles.savedBox}>
                    {savedNotes.map((item, index) => (
                      <View key={item.id} style={styles.savedItem}>
                        <Text style={styles.savedNote}>
                          {index + 1}. {item.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                )
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 Thoresen e-Learning</Text>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  root: { flex: 1, backgroundColor: BG },

  scrollContent: { paddingBottom: 1 },

  pageBox: { paddingHorizontal: 16 },

  backBtn: {
    marginTop: 10,
    width: 78,
    height: 34,
    backgroundColor: BLUE,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 2,
  },

  heroCard: {
    marginTop: 14,
    backgroundColor: PRIMARY,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  heroSmall: {
    color: '#BFD0FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  heroTitle: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '900',
    marginTop: 3,
  },

  heroSub: {
    color: '#DCEBFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    lineHeight: 17,
  },

  heroBottom: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
  },

  heroBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },

  videoCard: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 5,
  },

  video: {
    width: '100%',
    height: 225,
    backgroundColor: '#000',
  },

  videoInfo: { padding: 15 },

  videoTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: PRIMARY,
  },

  videoDesc: {
    marginTop: 5,
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
  },

  completeBtn: {
    marginHorizontal: 15,
    marginBottom: 16,
    height: 46,
    borderRadius: 14,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  completeBtnDone: {
    backgroundColor: '#22C55E',
  },

  completeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 8,
  },

  infoRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },

  infoBox: {
    flex: 1,
    minHeight: 88,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },

  infoValue: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 3,
  },

  lessonListCard: {
    marginTop: 16,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff',
  },

  cardHeader: {
    height: 46,
    backgroundColor: BLUE,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  cardHeaderText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 9,
  },

  lessonRow: {
    minHeight: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  lessonRowActive: {
    minHeight: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SOFT_BLUE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  lessonCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  lessonCircleDone: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  lessonCircleActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  lessonText: {
    flex: 1,
    color: TEXT,
    fontSize: 12,
    fontWeight: '800',
  },

  lessonTextActive: {
    flex: 1,
    color: PRIMARY,
    fontSize: 12,
    fontWeight: '900',
  },

  lessonStatus: {
    color: BLUE,
    fontSize: 10,
    fontWeight: '800',
  },

  lessonStatusActive: {
    color: RED,
    fontSize: 10,
    fontWeight: '900',
  },

  examBtn: {
    height: 34,
    backgroundColor: PRIMARY,
    paddingHorizontal: 15,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  examBtnDisabled: {
    backgroundColor: '#E5E7EB',
  },

  examBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },

  examBtnTextDisabled: {
    color: '#9CA3AF',
  },

  noteCard: {
    marginTop: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    padding: 14,
    backgroundColor: '#fff',
  },

  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  noteIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: SOFT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  noteTitle: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: '900',
  },

  noteSub: {
    color: MUTED,
    fontSize: 10,
    marginTop: 2,
  },

  counter: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '700',
  },

  noteInput: {
    minHeight: 115,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 12,
    color: TEXT,
    fontSize: 12,
    backgroundColor: '#FAFAFA',
  },

  noteBtn: {
    height: 44,
    backgroundColor: RED,
    borderRadius: 14,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  noteBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },

  savedBox: { marginTop: 14 },

  savedItem: {
    backgroundColor: SOFT_BLUE,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
  },

  savedNote: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },

  footer: {
    backgroundColor: PRIMARY,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  footerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  // [ADD] style ใหม่สำหรับสถานะ loading / error / ไม่มีวิดีโอ
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 12,
    color: MUTED,
    fontSize: 13,
    fontWeight: '700',
  },

  errorText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },

  retryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },

  retryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },

  noVideo: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  noVideoText: {
    marginTop: 8,
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
  },

});
