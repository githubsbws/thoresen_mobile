import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppHeader from '../../src/components/AppHeader';

const PRIMARY = '#001B74';
const RED = '#E30613';
const BLUE = '#0B63CE';
const GREEN = '#22C55E';
const BG = '#fff';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const SOFT_BLUE = '#EEF7FF';

const logo = require('../../assets/images/banner/logo-new.png');

const makeExam = (courseName: string, topic: string, chapter: number) => ({
  courseName: `${courseName} - บทที่ ${chapter}`,
  topic,
  questions: [
    {
      q: `${topic} ข้อใดคือหลักการสำคัญที่สุด`,
      choices: ['ทำงานให้เร็วที่สุด', 'ทำตามขั้นตอนอย่างถูกต้อง', 'ข้ามขั้นตอนที่ไม่จำเป็น', 'ทำเฉพาะตอนมีปัญหา'],
      answer: 1,
    },
    {
      q: `ก่อนเริ่ม ${topic} ควรทำอะไร`,
      choices: ['ตรวจสอบข้อมูลและความพร้อม', 'เริ่มทันทีโดยไม่ตรวจ', 'รอคำสั่งอย่างเดียว', 'ไม่ต้องวางแผน'],
      answer: 0,
    },
    {
      q: `${topic} ช่วยลดความเสี่ยงเรื่องใด`,
      choices: ['ความผิดพลาดในการทำงาน', 'จำนวนบทเรียน', 'เวลาเปิดแอป', 'สีของหน้าจอ'],
      answer: 0,
    },
    {
      q: `หากพบปัญหาระหว่าง ${topic} ควรทำอย่างไร`,
      choices: ['ปล่อยไว้', 'รายงานและบันทึกข้อมูล', 'ลบข้อมูล', 'ข้ามไปบทต่อไป'],
      answer: 1,
    },
    {
      q: `เป้าหมายของ ${topic} คืออะไร`,
      choices: ['ทำให้ครบเท่านั้น', 'ทำให้ปลอดภัย ถูกต้อง และตรวจสอบได้', 'ทำให้เร็วโดยไม่สนคุณภาพ', 'ทำโดยไม่ต้องสื่อสาร'],
      answer: 1,
    },
  ],
});

const examBank: any = {
  '1-1': {
    courseName: 'Basic Management - บทที่ 1',
    topic: 'Management Introduction',
    questions: [
      {
        q: 'ข้อใดคือความหมายของการบริหารจัดการที่เหมาะสมที่สุด',
        choices: ['การทำงานคนเดียวให้เร็วที่สุด', 'การวางแผน จัดการ ควบคุม และใช้ทรัพยากรให้บรรลุเป้าหมาย', 'การสั่งงานโดยไม่ต้องติดตามผล', 'การแก้ปัญหาเฉพาะหน้าเท่านั้น'],
        answer: 1,
      },
      {
        q: 'ขั้นตอนแรกของกระบวนการ PDCA คือข้อใด',
        choices: ['Do', 'Check', 'Plan', 'Act'],
        answer: 2,
      },
      {
        q: 'การติดตามผลการทำงานมีประโยชน์อย่างไร',
        choices: ['ช่วยให้รู้ปัญหาและปรับปรุงงานได้ทันเวลา', 'ทำให้ไม่ต้องวางแผนงาน', 'ลดความจำเป็นในการสื่อสาร', 'ทำให้งานเสร็จโดยไม่ต้องตรวจสอบ'],
        answer: 0,
      },
      {
        q: 'ผู้นำที่ดีควรมีลักษณะใด',
        choices: ['สั่งอย่างเดียวไม่รับฟัง', 'รับฟังทีม สื่อสารชัดเจน และตัดสินใจเหมาะสม', 'หลีกเลี่ยงการแก้ปัญหา', 'มอบหมายงานโดยไม่บอกเป้าหมาย'],
        answer: 1,
      },
      {
        q: 'เป้าหมายหลักของการบริหารเวลาคืออะไร',
        choices: ['ทำงานหลายอย่างพร้อมกันเสมอ', 'เลื่อนงานสำคัญออกไปก่อน', 'จัดลำดับความสำคัญและใช้เวลาให้เกิดประโยชน์สูงสุด', 'ทำเฉพาะงานที่ง่ายที่สุด'],
        answer: 2,
      },
    ],
  },
  '1-2': makeExam('Basic Management', 'Planning and Organizing', 2),
  '1-3': makeExam('Basic Management', 'Leadership Skills', 3),
  '1-4': makeExam('Basic Management', 'Final Review', 4),

  '2-1': {
    courseName: 'Cargo Care - บทที่ 1',
    topic: 'Cargo Handling',
    questions: [
      {
        q: 'Cargo Care หมายถึงข้อใด',
        choices: ['การดูแลสินค้าให้ปลอดภัยและคงสภาพระหว่างขนส่ง', 'การจัดเก็บเอกสารเท่านั้น', 'การซ่อมเครื่องยนต์เรือ', 'การกำหนดเส้นทางเดินเรือ'],
        answer: 0,
      },
      {
        q: 'ก่อนรับสินค้าขึ้นเรือควรตรวจสอบสิ่งใดเป็นอันดับสำคัญ',
        choices: ['สีของตู้สินค้า', 'ความพร้อมของระวางสินค้า ความสะอาด และความปลอดภัย', 'จำนวนลูกเรือบนเรือ', 'ชื่อบริษัทคู่ค้าเท่านั้น'],
        answer: 1,
      },
      {
        q: 'การจัดเก็บสินค้าที่ดีช่วยลดความเสี่ยงเรื่องใด',
        choices: ['สินค้าเสียหายหรือปนเปื้อน', 'เวลาเรียนของพนักงาน', 'จำนวนเอกสารประชุม', 'ความเร็วอินเทอร์เน็ต'],
        answer: 0,
      },
      {
        q: 'หากพบว่าสินค้าเสียหายควรทำอย่างไร',
        choices: ['ปล่อยไว้จนจบทริป', 'รายงาน บันทึกหลักฐาน และแจ้งผู้เกี่ยวข้อง', 'ลบข้อมูลทั้งหมด', 'ไม่ต้องแจ้งใคร'],
        answer: 1,
      },
      {
        q: 'เอกสารเกี่ยวกับสินค้าควรจัดการอย่างไร',
        choices: ['เก็บให้ครบ ถูกต้อง และตรวจสอบได้', 'เก็บไว้เฉพาะบางหน้า', 'ส่งต่อโดยไม่ตรวจสอบ', 'ไม่จำเป็นต้องจัดเก็บ'],
        answer: 0,
      },
    ],
  },
  '2-2': makeExam('Cargo Care', 'Cargo Storage', 2),
  '2-3': makeExam('Cargo Care', 'Cargo Safety', 3),

  '3-1': makeExam('Maritime Labour Convention', 'Introduction to MLC', 1),
  '3-2': makeExam('Maritime Labour Convention', 'Seafarer Rights', 2),
  '3-3': makeExam('Maritime Labour Convention', 'Working Conditions', 3),
  '3-4': makeExam('Maritime Labour Convention', 'Final Test', 4),

  '4-1': makeExam('Navigation', 'Navigation Basic', 1),
  '4-2': makeExam('Navigation', 'Route Planning', 2),
  '4-3': makeExam('Navigation', 'Safety Navigation', 3),

  '5-1': makeExam('Technical Basic', 'Technical Basic', 1),
  '5-2': makeExam('Technical Basic', 'Machinery System', 2),
  '5-3': makeExam('Technical Basic', 'Maintenance', 3),

  '6-1': makeExam('Quality and Safety', 'ความปลอดภัยพื้นฐาน', 1),
  '6-2': makeExam('Quality and Safety', 'การใช้อุปกรณ์ป้องกัน', 2),
  '6-3': makeExam('Quality and Safety', 'การป้องกันอัคคีภัย', 3),
  '6-4': makeExam('Quality and Safety', 'สถานการณ์ฉุกเฉิน', 4),

  '7-1': makeExam('Other Course', 'Course Introduction', 1),
  '7-2': makeExam('Other Course', 'Training Topic', 2),

  '8-1': makeExam('Technical Advanced', 'Engineering Basic', 1),
  '8-2': makeExam('Technical Advanced', 'Technical Operation', 2),
};

const fallbackExam = examBank['1-1'];

export default function ExamScreen() {
  const params = useLocalSearchParams<{
  id: string;
  chapter?: string;
  examType?: 'pretest' | 'posttest';
}>();

const examType =
  params.examType === 'pretest'
    ? 'pretest'
    : 'posttest';

  const { id } = params;
  const chapterNo = Number(params.chapter ?? 1);
  const examKey = `${id}-${chapterNo}`;
  const exam = examBank[examKey] ?? fallbackExam;

  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const q = exam.questions[current];
  const total = exam.questions.length;
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / total) * 100);
  const isLast = current === total - 1;

  const score = exam.questions.reduce((sum: number, item: any, index: number) => {
    return answers[index] === item.answer ? sum + 1 : sum;
  }, 0);

  const submitExam = async () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    const details = exam.questions.map((item: any, index: number) => ({
      id: index + 1,
      question: item.q,
      selectedText:
        answers[index] !== undefined
          ? item.choices[answers[index]]
          : 'ยังไม่ได้ตอบ',
      correctText: item.choices[item.answer],
      correct: answers[index] === item.answer,
    }));

    const passScore = Math.ceil(total * 0.8);
    const passed = score >= passScore;
    const examId = `${id}-${chapterNo}-${examType}`;

    // แยกผลก่อนเรียนและหลังเรียน ไม่ให้เขียนทับกัน
    await AsyncStorage.setItem(
      `exam_result_${id}_${chapterNo}_${examType}`,
      JSON.stringify({
        courseId: id,
        chapter: chapterNo,
        examType,
        score,
        total,
        passed,
        completedAt: new Date().toISOString(),
      })
    );

    const progressKey = `course_progress_${id}`;
    const oldProgressRaw = await AsyncStorage.getItem(progressKey);
    const oldProgress = oldProgressRaw ? JSON.parse(oldProgressRaw) : {};

    const oldUnlocked = Number(oldProgress.unlockedChapter ?? 1);
    const oldScores: Record<string, string> = oldProgress.examScores ?? {};
    const oldPassedExams: string[] = oldProgress.passedExams ?? [];

    const nextPassedExams =
      passed && !oldPassedExams.includes(examId)
        ? [...oldPassedExams, examId]
        : oldPassedExams;

    const totalChapter =
      id === '1' ? 4 :
      id === '2' ? 3 :
      id === '3' ? 4 :
      id === '4' ? 3 :
      id === '5' ? 3 :
      id === '6' ? 4 :
      id === '7' ? 2 : 2;

    // เปิดบทถัดไปเฉพาะเมื่อผ่านแบบทดสอบหลังเรียน
    const nextUnlockedChapter =
      passed && examType === 'posttest'
        ? Math.min(Math.max(oldUnlocked, chapterNo + 1), totalChapter + 1)
        : oldUnlocked;

    await AsyncStorage.setItem(
      progressKey,
      JSON.stringify({
        ...oldProgress,
        courseId: id,
        unlockedChapter: nextUnlockedChapter,
        passedExams: nextPassedExams,
        examScores: {
          ...oldScores,
          [examId]: `${score}/${total}`,
        },
        lastScore: score,
        lastTotal: total,
        lastExamType: examType,
        updatedAt: new Date().toISOString(),
      })
    );

    router.replace({
      pathname: '/course-result',
      params: {
        courseId: String(id),
        chapter: String(chapterNo),
        nextChapter: String(chapterNo + 1),
        courseName: exam.courseName,
        score: String(score),
        total: String(total),
        passed: String(passed),
        examType,
        details: JSON.stringify(details),
      },
    } as any);
  };

  useEffect(() => {
    if (!started || isSubmitted) return;

    if (timeLeft <= 0) {
      submitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [started, timeLeft, isSubmitted]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerText = `${minutes}:${String(seconds).padStart(2, '0')}`;

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
                  {examType === 'pretest'
                    ? 'แบบทดสอบก่อนเรียน'
                    : 'แบบทดสอบหลังเรียน'}
                </Text>
                <Text style={styles.heroSub}>{exam.courseName}</Text>
              </View>

              <View style={styles.infoCard}>
                <Info icon="book" label="หัวข้อ" value={exam.topic} />
                <Info icon="help-circle" label="จำนวนข้อสอบ" value="5 Questions" />
                <Info icon="time" label="เวลาที่กำหนด" value="15 Minutes" />
                <Info icon="ribbon" label="คะแนนเต็ม" value="5 Points" />
              </View>

              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => {
                  setTimeLeft(15 * 60);
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
                  <Text style={styles.topic}>{exam.topic}</Text>
                  <Text style={styles.courseName}>{exam.courseName}</Text>
                </View>
                <View style={styles.timePill}>
                  <Ionicons name="time-outline" size={15} color={RED} />
                  <Text style={styles.timeText}>{timerText}</Text>
                </View>
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.progressText}>Question {current + 1} of {total}</Text>
                <Text style={styles.progressPercent}>{progress}%</Text>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>

              <View style={styles.numberRow}>
                {exam.questions.map((_: any, index: number) => {
                  const done = answers[index] !== undefined;
                  const active = index === current;

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.numberCircle,
                        done && styles.numberDone,
                        active && styles.numberActive,
                      ]}
                      onPress={() => setCurrent(index)}
                    >
                      <Text style={[styles.numberText, (done || active) && styles.numberTextActive]}>
                        {index + 1}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.questionCard}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>ข้อที่ {current + 1}</Text>
                </View>

                <Text style={styles.questionText}>{q.q}</Text>

                {q.choices.map((choice: string, index: number) => {
                  const selected = answers[current] === index;
                  const letter = ['A', 'B', 'C', 'D'][index];

                  return (
                    <TouchableOpacity
                      key={`${current}-${choice}`}
                      style={[styles.option, selected && styles.optionActive]}
                      onPress={() => setAnswers({ ...answers, [current]: index })}
                    >
                      <View style={[styles.letter, selected && styles.letterActive]}>
                        <Text style={[styles.letterText, selected && styles.letterTextActive]}>
                          {letter}
                        </Text>
                      </View>

                      <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                        {choice}
                      </Text>

                      {selected && <Ionicons name="checkmark-circle" size={21} color={PRIMARY} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

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
                  style={[styles.nextBtn, isSubmitted && styles.disabled]}
                  disabled={isSubmitted}
                  onPress={() => {
                    if (isLast) submitExam();
                    else setCurrent(current + 1);
                  }}
                >
                  <Text style={styles.nextText}>{isLast ? 'ส่งคำตอบ' : 'ถัดไป'}</Text>
                  <Ionicons name={isLast ? 'send' : 'chevron-forward'} size={16} color="#fff" />
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

  topHeader: {
    height: 78,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { width: 170, height: 52 },
  menuBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

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
});