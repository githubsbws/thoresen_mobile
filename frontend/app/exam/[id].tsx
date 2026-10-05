/**
 * ============================================================
 * app/exam/[id].tsx  —  หน้าทำข้อสอบ (id ในที่นี้คือ courseId)
 * ============================================================
 * เขียนใหม่ทั้งหน้า เดิมเป็น examBank hard-code ในแอป (เฉลยอยู่ในตัวแอป ใครแกะ APK ก็เห็นคำตอบ)
 * และตรวจ/บันทึกคะแนนฝั่งเครื่องอย่างเดียว ไม่เคยยิงไป backend เลย
 *
 * [FIX]  ดึงข้อสอบจริงจาก getLessonExam (backend อ่านจาก tbl_question/tbl_choice ไม่ส่งเฉลยมาด้วย)
 * [FIX]  ส่งคำตอบไปให้ backend ตรวจและบันทึกลง tbl_score จริงผ่าน submitLessonExam
 *        (เดิมคำนวณคะแนนเองฝั่งแอปทั้งหมด ใครแก้ค่าในเครื่องก็ปลอมผลสอบผ่านได้)
 * [FIX]  เวลาสอบ (timeLimitMinutes) และเกณฑ์ผ่าน (passPercent) มาจาก DB ต่อบทเรียน
 *        (เดิม hard-code 15 นาที / 80% เท่ากันทุกบท)
 * [FIX]  จำนวนบททั้งหมด/บทถัดไป ไม่ hard-code ตาม courseId อีกต่อไป (เดิมมี if/else ผูกกับ id)
 * [REMOVE] examBank และ makeExam ที่ hard-code คำถาม/เฉลยในแอป
 * [REMOVE] การเขียนผลสอบลง AsyncStorage เอง (เดิมเขียนคู่ขนานกับสิ่งที่ backend ควรเป็นเจ้าของ)
 *
 * ⚠ ยังไม่ทราบว่า "มีบทถัดไปหรือไม่" (hasNext) จากหน้านี้ตรงๆ จึงไม่ส่งค่าไป ให้ course-result
 *   ใช้ค่า default (true) ไปก่อน ถ้าต้องการให้แม่นตรง ควรส่ง hasNext มาจากหน้าที่เปิด exam นี้
 *   (course/[id].tsx หรือ lesson/[id].tsx ซึ่งรู้อยู่แล้วว่าเป็นบทสุดท้ายหรือไม่)
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import AppHeader from '../../src/components/AppHeader';
import { useAuth } from '../../src/context/AuthContext';

import {
  ExamResponse,
  ExamType,
  getLessonExam,
  submitLessonExam,
} from '../../src/services/course';

const PRIMARY = '#001B74';
const RED = '#E30613';
const BLUE = '#0B63CE';
const GREEN = '#22C55E';
const BG = '#fff';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const SOFT_BLUE = '#EEF7FF';

export default function ExamScreen() {
  const params = useLocalSearchParams<{
    id: string; // courseId
    lessonId?: string;
    chapter?: string;
    examType?: 'pretest' | 'posttest';
  }>();

  const { user } = useAuth();

  const courseId = Number(params.id);
  const lessonId = Number(params.lessonId);
  const chapterNo = Number(params.chapter ?? 1);
  const userId = user?.id ? Number(user.id) : null;

  // [FIX] แปลง 'pretest'/'posttest' (ของหน้านี้) เป็น 'pre'/'post' (ของ backend)
  const examType: ExamType = params.examType === 'pretest' ? 'pre' : 'post';

  const [exam, setExam] = useState<ExamResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!courseId || !lessonId) {
        setError('ไม่พบข้อมูลบทเรียนสำหรับข้อสอบนี้');
        setLoading(false);
        return;
      }

      if (!userId) {
        setError('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getLessonExam(
          courseId,
          lessonId,
          examType,
          userId,
        );

        if (!mounted) {
          return;
        }

        if (!response.success) {
          setError(response.message ?? 'ไม่พบข้อสอบสำหรับบทนี้');
          return;
        }

        setExam(response.data);
        setTimeLeft(response.data.timeLimitMinutes * 60);
      } catch (err: any) {
        if (__DEV__) {
          console.log('EXAM LOAD ERROR:', err);
        }

        if (mounted) {
          setError(
            err?.response?.status === 403
              ? 'บทเรียนนี้ยังไม่ปลดล็อก หรือยังดูวิดีโอไม่ครบ'
              : 'ไม่สามารถโหลดข้อสอบได้',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [courseId, lessonId, examType, userId]);

  const total = exam?.questions.length ?? 0;
  const q = exam?.questions[current];
  const answered = Object.keys(answers).length;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;
  const isLast = current === total - 1;

  // [FIX] ตรวจว่าตอบครบทุกข้อก่อนส่งจริง ๆ (เดิมกดส่งได้แม้ยังไม่ครบ)
  const allAnswered = total > 0 && answered === total;

  const submitExam = async () => {
    if (isSubmitting || !exam || !userId) {
      return;
    }

    if (!allAnswered) {
      Alert.alert('แจ้งเตือน', 'กรุณาตอบให้ครบทุกข้อก่อนส่งคำตอบ');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await submitLessonExam(
        courseId,
        lessonId,
        examType,
        userId,
        answers,
      );

      if (!response.success) {
        throw new Error(response.message ?? 'submit failed');
      }

      const { score, total: scoreTotal, passed, passPercent, details } =
        response.data;

      router.replace({
        pathname: '/course-result',
        params: {
          courseId: String(courseId),
          lessonId: String(lessonId),
          chapter: String(chapterNo),
          nextChapter: String(chapterNo + 1),
          courseName: exam.courseTitle ?? '',
          score: String(score),
          total: String(scoreTotal),
          passed: String(passed),
          passPercent: String(passPercent),
          examType: params.examType ?? 'posttest',
          details: JSON.stringify(details),
        },
      } as any);
    } catch (err) {
      if (__DEV__) {
        console.log('EXAM SUBMIT ERROR:', err);
      }

      Alert.alert(
        'ส่งคำตอบไม่สำเร็จ',
        'ไม่สามารถส่งคำตอบได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่ คำตอบที่ทำไว้ยังอยู่ครบ',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!started || isSubmitting || !exam) {
      return;
    }

    if (timeLeft <= 0) {
      submitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, timeLeft, isSubmitting, exam]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerText = `${minutes}:${String(seconds).padStart(2, '0')}`;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>กำลังโหลดข้อสอบ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !exam) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? 'ไม่พบข้อสอบ'}</Text>

          <TouchableOpacity style={styles.retryBigBtn} onPress={() => router.back()}>
            <Text style={styles.retryBigText}>กลับ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader />

        <View style={styles.pageBox}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={14} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          {!started ? (
            <View style={styles.startBox}>
              <View style={styles.hero}>
                <View style={styles.heroIcon}>
                  <Ionicons name="school" size={38} color="#fff" />
                </View>
                <Text style={styles.heroTitle}>
                  {examType === 'pre'
                    ? 'แบบทดสอบก่อนเรียน'
                    : 'แบบทดสอบหลังเรียน'}
                </Text>
                <Text style={styles.heroSub}>{exam.lessonTitle}</Text>
              </View>

              <View style={styles.infoCard}>
                <Info icon="book" label="หัวข้อ" value={exam.lessonTitle} />
                <Info
                  icon="help-circle"
                  label="จำนวนข้อสอบ"
                  value={`${total} Questions`}
                />
                <Info
                  icon="time"
                  label="เวลาที่กำหนด"
                  value={`${exam.timeLimitMinutes} Minutes`}
                />
                <Info
                  icon="ribbon"
                  label="เกณฑ์ผ่าน"
                  value={`${exam.passPercent}%`}
                />
              </View>

              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => {
                  setTimeLeft(exam.timeLimitMinutes * 60);
                  setStarted(true);
                }}
              >
                <Text style={styles.startText}>เริ่มทำข้อสอบ</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.examBox}>
              <View style={styles.examTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.topic}>{exam.lessonTitle}</Text>
                  <Text style={styles.courseName}>{exam.courseTitle}</Text>
                </View>
                <View style={styles.timePill}>
                  <Ionicons name="time-outline" size={15} color={RED} />
                  <Text style={styles.timeText}>{timerText}</Text>
                </View>
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  Question {current + 1} of {total}
                </Text>
                <Text style={styles.progressPercent}>{progress}%</Text>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>

              <View style={styles.numberRow}>
                {exam.questions.map((question, index) => {
                  const done = answers[question.id] !== undefined;
                  const active = index === current;

                  return (
                    <TouchableOpacity
                      key={question.id}
                      style={[
                        styles.numberCircle,
                        done && styles.numberDone,
                        active && styles.numberActive,
                      ]}
                      onPress={() => setCurrent(index)}
                    >
                      <Text
                        style={[
                          styles.numberText,
                          (done || active) && styles.numberTextActive,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {q && (
                <View style={styles.questionCard}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>ข้อที่ {current + 1}</Text>
                  </View>

                  <Text style={styles.questionText}>{q.title}</Text>

                  {q.choices.map((choice, index) => {
                    const selected = answers[q.id] === choice.id;
                    const letter = ['A', 'B', 'C', 'D', 'E', 'F'][index] ?? '?';

                    return (
                      <TouchableOpacity
                        key={choice.id}
                        style={[styles.option, selected && styles.optionActive]}
                        onPress={() =>
                          setAnswers({ ...answers, [q.id]: choice.id })
                        }
                      >
                        <View style={[styles.letter, selected && styles.letterActive]}>
                          <Text
                            style={[
                              styles.letterText,
                              selected && styles.letterTextActive,
                            ]}
                          >
                            {letter}
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.optionText,
                            selected && styles.optionTextActive,
                          ]}
                        >
                          {choice.text}
                        </Text>

                        {selected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={21}
                            color={PRIMARY}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.prevBtn, current === 0 && styles.disabled]}
                  disabled={current === 0}
                  onPress={() => setCurrent(current - 1)}
                >
                  <Ionicons name="chevron-back" size={16} color={PRIMARY} />
                  <Text style={styles.prevText}>ก่อนหน้า</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.nextBtn, isSubmitting && styles.disabled]}
                  disabled={isSubmitting}
                  onPress={() => {
                    if (isLast) {
                      submitExam();
                    } else {
                      setCurrent(current + 1);
                    }
                  }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.nextText}>
                        {isLast ? 'ส่งคำตอบ' : 'ถัดไป'}
                      </Text>
                      <Ionicons
                        name={isLast ? 'send' : 'chevron-forward'}
                        size={16}
                        color="#fff"
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>©2026 Thoresen e-learning</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Info({ icon, label, value }: any) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={19} color={PRIMARY} />
      </View>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  pageBox: { paddingHorizontal: 18 },

  backBtn: {
    width: 70,
    height: 30,
    backgroundColor: BLUE,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  backText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  startBox: { paddingTop: 42, minHeight: 650 },

  hero: {
    backgroundColor: PRIMARY,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
  },

  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },

  heroSub: {
    color: '#DCEBFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 7,
  },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 3,
  },

  infoItem: {
    minHeight: 58,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: SOFT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  infoLabel: { color: MUTED, fontSize: 11, fontWeight: '700' },

  infoValue: { color: TEXT, fontSize: 14, fontWeight: '900', marginTop: 3 },

  startBtn: {
    height: 50,
    backgroundColor: RED,
    borderRadius: 12,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  startText: { color: '#fff', fontSize: 15, fontWeight: '900', marginRight: 8 },

  examBox: { paddingTop: 26, minHeight: 650 },

  examTop: {
    backgroundColor: SOFT_BLUE,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  topic: { color: PRIMARY, fontSize: 13, fontWeight: '900' },

  courseName: { color: TEXT, fontSize: 11, fontWeight: '600', marginTop: 3 },

  timePill: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  timeText: { color: RED, fontSize: 12, fontWeight: '900', marginLeft: 4 },

  progressRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressText: { color: TEXT, fontSize: 12, fontWeight: '800' },

  progressPercent: { color: PRIMARY, fontSize: 12, fontWeight: '900' },

  progressTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
  },

  progressFill: { height: '100%', backgroundColor: PRIMARY },

  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 16,
  },

  numberCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  numberDone: { backgroundColor: PRIMARY, borderColor: PRIMARY },

  numberActive: { backgroundColor: RED, borderColor: RED },

  numberText: { color: MUTED, fontSize: 13, fontWeight: '800' },

  numberTextActive: { color: '#fff' },

  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 3,
  },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: SOFT_BLUE,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },

  badgeText: { color: PRIMARY, fontSize: 12, fontWeight: '900' },

  questionText: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 23,
    marginBottom: 16,
  },

  option: {
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
  },

  optionActive: { borderColor: PRIMARY, backgroundColor: SOFT_BLUE },

  letter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  letterActive: { backgroundColor: PRIMARY },

  letterText: { color: TEXT, fontSize: 13, fontWeight: '900' },

  letterTextActive: { color: '#fff' },

  optionText: { flex: 1, color: TEXT, fontSize: 13, lineHeight: 18, fontWeight: '700' },

  optionTextActive: { color: PRIMARY },

  actionRow: { flexDirection: 'row', marginTop: 18, marginBottom: 16 },

  prevBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 12,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabled: { opacity: 0.35 },

  prevText: { color: PRIMARY, fontSize: 14, fontWeight: '900' },

  nextBtn: {
    flex: 1,
    height: 48,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextText: { color: '#fff', fontSize: 14, fontWeight: '900', marginRight: 7 },

  footer: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    marginTop: 18,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  footerText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // [ADD] style ใหม่สำหรับสถานะ loading / error
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

  retryBigBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },

  retryBigText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },

});
