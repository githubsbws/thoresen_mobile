import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const PRIMARY = '#001B74';
const BLUE = '#0B63CE';
const RED = '#E30613';
const GREEN = '#22C55E';
const ORANGE = '#F59E0B';
const BG = '#F4F6FA';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';

const logo = require('../assets/images/banner/logo-new.png');

type AnswerDetail = {
  id: number;
  question: string;
  selectedText: string;
  correctText: string;
  correct: boolean;
};

export default function CourseResultScreen() {
  const params = useLocalSearchParams<{
    courseId?: string;
    chapter?: string;
    nextChapter?: string;
    courseName?: string;
    score?: string;
    total?: string;
    passed?: string;
    examType?: 'pretest' | 'posttest';
    details?: string;
  }>();

  const courseId = String(params.courseId ?? '1');
  const chapterNo = Number(params.chapter ?? 1);
  const nextChapter = Number(params.nextChapter ?? chapterNo + 1);

  const courseName = String(
    params.courseName ?? 'Course Examination'
  );

  const score = Number(params.score ?? 0);
  const total = Number(params.total ?? 0);

  const passed = String(params.passed) === 'true';

  const examType: 'pretest' | 'posttest' =
    params.examType === 'posttest'
      ? 'posttest'
      : 'pretest';

  const examTitle =
    examType === 'pretest'
      ? 'แบบทดสอบก่อนเรียน'
      : 'แบบทดสอบหลังเรียน';

  const details = useMemo<AnswerDetail[]>(() => {
    if (!params.details) {
      return [];
    }

    try {
      const parsed = JSON.parse(String(params.details));

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }, [params.details]);

  const percent =
    total > 0
      ? Math.round((score / total) * 100)
      : 0;

  const correctCount = details.filter(
    item => item.correct
  ).length;

  const incorrectCount =
    details.length - correctCount;


  const goToCourseLessons = () => {
    router.replace({
      pathname: '/course/[id]',
      params: {
        id: courseId,
        tab: 'lessons',
      },
    } as any);
  };

  const retryExam = () => {
    router.replace({
      pathname: '/exam/[id]',
      params: {
        id: courseId,
        chapter: String(chapterNo),
        examType,
      },
    } as any);
  };

  /**
   * ปุ่มหลักด้านล่าง
   *
   * ก่อนเรียน:
   * กลับหน้ารายการหลักสูตรเพื่อไปดูวิดีโอ
   *
   * หลังเรียนผ่าน:
   * กลับหน้ารายการหลักสูตรเพื่อเห็นบทใหม่
   *
   * หลังเรียนไม่ผ่าน:
   * ทำข้อสอบใหม่
   */
  const handleMainButton = () => {
    if (
      examType === 'posttest' &&
      !passed
    ) {
      retryExam();
      return;
    }

    goToCourseLessons();
  };

  const mainButtonText = (() => {
    if (examType === 'pretest') {
      return 'กลับไปเรียนเนื้อหา';
    }

    if (!passed) {
      return 'ทำแบบทดสอบอีกครั้ง';
    }

    return 'เรียนเรื่องต่อไป';
  })();

  const mainButtonIcon = (() => {
    if (
      examType === 'posttest' &&
      !passed
    ) {
      return 'refresh';
    }

    return 'arrow-forward';
  })();

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
          {/* Header */}
          <View style={styles.topHeader}>
            <Image
              source={logo}
              style={styles.logo}
              resizeMode="contain"
            />

            <TouchableOpacity
              style={styles.closeButton}
              activeOpacity={0.8}
              onPress={goToCourseLessons}
            >
              <Ionicons
                name="close"
                size={26}
                color={PRIMARY}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.pageBox}>
            {/* Result hero */}
            <View
              style={[
                styles.resultHero,
                {
                  backgroundColor: passed
                    ? PRIMARY
                    : '#7F1D1D',
                },
              ]}
            >
              <View
                style={[
                  styles.resultIcon,
                  {
                    backgroundColor: passed
                      ? GREEN
                      : RED,
                  },
                ]}
              >
                <Ionicons
                  name={
                    passed
                      ? 'checkmark'
                      : 'close'
                  }
                  size={42}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.examType}>
                {examTitle}
              </Text>

              <Text style={styles.resultTitle}>
                {passed
                  ? examType === 'pretest'
                    ? 'ทำแบบทดสอบเรียบร้อยแล้ว'
                    : 'ผ่านแบบทดสอบแล้ว'
                  : 'ยังไม่ผ่านแบบทดสอบ'}
              </Text>

              <Text style={styles.courseName}>
                {courseName}
              </Text>

              <Text style={styles.chapterText}>
                บทที่ {chapterNo}
              </Text>
            </View>

            {/* Score card */}
            <View style={styles.scoreCard}>
              <Text style={styles.scoreHeading}>
                ผลคะแนน
              </Text>

              <View
                style={[
                  styles.scoreCircle,
                  {
                    borderColor: passed
                      ? GREEN
                      : RED,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.scoreNumber,
                    {
                      color: passed
                        ? GREEN
                        : RED,
                    },
                  ]}
                >
                  {score}
                </Text>

                <Text style={styles.scoreTotal}>
                  / {total}
                </Text>
              </View>

              <Text
                style={[
                  styles.percentText,
                  {
                    color: passed
                      ? GREEN
                      : RED,
                  },
                ]}
              >
                {percent}%
              </Text>

              <Text style={styles.scoreDescription}>
                {examType === 'pretest'
                  ? 'คะแนนนี้ใช้สำหรับวัดความรู้ก่อนเริ่มเรียน และไม่ส่งผลต่อการปลดล็อกบทถัดไป'
                  : passed
                    ? `ทำแบบทดสอบหลังเรียนผ่านแล้ว บทที่ ${nextChapter} ถูกปลดล็อกเรียบร้อย`
                    : 'ต้องได้อย่างน้อย 80% จึงจะผ่านและเปิดบทถัดไปได้'}
              </Text>
            </View>

            {/* Summary */}
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <View
                  style={[
                    styles.summaryIcon,
                    styles.correctIcon,
                  ]}
                >
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={GREEN}
                  />
                </View>

                <Text style={styles.summaryValue}>
                  {details.length > 0
                    ? correctCount
                    : score}
                </Text>

                <Text style={styles.summaryLabel}>
                  ตอบถูก
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <View
                  style={[
                    styles.summaryIcon,
                    styles.incorrectIcon,
                  ]}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={RED}
                  />
                </View>

                <Text style={styles.summaryValue}>
                  {details.length > 0
                    ? incorrectCount
                    : Math.max(total - score, 0)}
                </Text>

                <Text style={styles.summaryLabel}>
                  ตอบผิด
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <View
                  style={[
                    styles.summaryIcon,
                    styles.percentIcon,
                  ]}
                >
                  <Ionicons
                    name="stats-chart"
                    size={18}
                    color={BLUE}
                  />
                </View>

                <Text style={styles.summaryValue}>
                  {percent}%
                </Text>

                <Text style={styles.summaryLabel}>
                  คะแนนรวม
                </Text>
              </View>
            </View>

            {/* Progress explanation */}
            <View style={styles.nextStepCard}>
              <View style={styles.nextStepHeader}>
                <View style={styles.nextStepIcon}>
                  <Ionicons
                    name={
                      examType === 'pretest'
                        ? 'play-circle'
                        : passed
                          ? 'lock-open'
                          : 'information-circle'
                    }
                    size={23}
                    color={PRIMARY}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.nextStepTitle}>
                    ขั้นตอนถัดไป
                  </Text>

                  <Text style={styles.nextStepText}>
                    {examType === 'pretest'
                      ? 'กลับไปยังรายการหลักสูตร แล้วดูวิดีโอของบทนี้ให้จบก่อนทำแบบทดสอบหลังเรียน'
                      : passed
                        ? `กลับไปยังรายการหลักสูตร แล้วเริ่มเรียนบทที่ ${nextChapter} ได้ทันที`
                        : 'ทบทวนเนื้อหาแล้วกลับมาทำแบบทดสอบหลังเรียนอีกครั้ง'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Answer details */}
            {details.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.detailHeading}>
                  รายละเอียดคำตอบ
                </Text>

                {details.map((item, index) => (
                  <View
                    key={`${item.id}-${index}`}
                    style={styles.answerCard}
                  >
                    <View
                      style={
                        styles.answerHeader
                      }
                    >
                      <View
                        style={[
                          styles.answerNumber,
                          {
                            backgroundColor:
                              item.correct
                                ? GREEN
                                : RED,
                          },
                        ]}
                      >
                        <Text
                          style={
                            styles.answerNumberText
                          }
                        >
                          {index + 1}
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.answerQuestion
                        }
                      >
                        {item.question}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.answerContent
                      }
                    >
                      <Text
                        style={
                          styles.answerLabel
                        }
                      >
                        คำตอบของคุณ
                      </Text>

                      <Text
                        style={[
                          styles.answerValue,
                          {
                            color: item.correct
                              ? GREEN
                              : RED,
                          },
                        ]}
                      >
                        {item.selectedText}
                      </Text>

                      {!item.correct && (
                        <>
                          <Text
                            style={[
                              styles.answerLabel,
                              {
                                marginTop: 10,
                              },
                            ]}
                          >
                            คำตอบที่ถูกต้อง
                          </Text>

                          <Text
                            style={[
                              styles.answerValue,
                              {
                                color: GREEN,
                              },
                            ]}
                          >
                            {item.correctText}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Buttons */}
            <TouchableOpacity
              style={[
                styles.mainButton,
                examType === 'posttest' &&
                  !passed &&
                  styles.retryMainButton,
              ]}
              activeOpacity={0.85}
              onPress={handleMainButton}
            >
              <Text style={styles.mainButtonText}>
                {mainButtonText}
              </Text>

              <Ionicons
                name={mainButtonIcon}
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.courseButton}
              activeOpacity={0.85}
              onPress={goToCourseLessons}
            >
              <Ionicons
                name="list"
                size={19}
                color={PRIMARY}
              />

              <Text
                style={styles.courseButtonText}
              >
                กลับไปหน้ารายการหลักสูตร
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ©2026 Thoresen e-learning
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  root: {
    flex: 1,
    backgroundColor: BG,
  },

  scrollContent: {
    flexGrow: 1,
  },

  topHeader: {
    height: 78,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logo: {
    width: 170,
    height: 52,
  },

  closeButton: {
    width: 46,
    height: 46,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  pageBox: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  resultHero: {
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center',
  },

  resultIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  examType: {
    color: '#DCEBFF',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
  },

  resultTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },

  courseName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },

  chapterText: {
    color: '#DCEBFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },

  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
  },

  scoreHeading: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 14,
  },

  scoreCircle: {
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },

  scoreNumber: {
    fontSize: 35,
    fontWeight: '900',
  },

  scoreTotal: {
    color: MUTED,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 13,
  },

  percentText: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 12,
  },

  scoreDescription: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },

  summaryGrid: {
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryDivider: {
    width: 1,
    height: 66,
    backgroundColor: BORDER,
  },

  summaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  correctIcon: {
    backgroundColor: '#ECFDF3',
  },

  incorrectIcon: {
    backgroundColor: '#FEF2F2',
  },

  percentIcon: {
    backgroundColor: '#EFF6FF',
  },

  summaryValue: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '900',
  },

  summaryLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
  },

  nextStepCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 14,
    marginTop: 14,
  },

  nextStepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  nextStepIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  nextStepTitle: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '900',
  },

  nextStepText: {
    color: TEXT,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '600',
    marginTop: 4,
  },

  detailSection: {
    marginTop: 18,
  },

  detailHeading: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
  },

  answerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    marginBottom: 10,
  },

  answerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  answerNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  answerNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  answerQuestion: {
    flex: 1,
    color: TEXT,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },

  answerContent: {
    padding: 12,
  },

  answerLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '700',
  },

  answerValue: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
    marginTop: 3,
  },

  mainButton: {
    minHeight: 52,
    backgroundColor: PRIMARY,
    borderRadius: 13,
    paddingHorizontal: 18,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  retryMainButton: {
    backgroundColor: ORANGE,
  },

  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginRight: 9,
  },

  courseButton: {
    minHeight: 50,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  courseButtonText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 8,
  },

  footer: {
    minHeight: 42,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },

  footerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});