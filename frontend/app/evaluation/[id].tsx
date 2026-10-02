/**
 * ============================================================
 * app/evaluation/[id].tsx  —  แบบประเมินหลักสูตร (id = courseId)
 * ============================================================
 * [FIX]  ดึงคำถามจริงจาก tbl_evaluate ผ่าน getCourseEvaluation แทนคำถาม 5 ข้อ hard-code
 * [FIX]  ส่งคะแนนไปบันทึกที่ tbl_eval_ans จริงผ่าน submitCourseEvaluation
 *        (เดิมเขียนแค่ AsyncStorage ในเครื่อง ทำให้หน้า certificate ปลดล็อกได้แม้ไม่เคยส่งจริง)
 * [REMOVE] โค้ดเมนู (menuVisible/menuList/handleMenuPress/Modal) ที่ไม่มีที่เรียกเปิดใช้
 *
 * ⚠ ข้อจำกัดที่ต้องแจ้งตรงๆ: backend ยังไม่มีที่เก็บคอมเมนต์ข้อความอิสระถาวร
 * (tbl_eval_ans ไม่มีคอลัมน์รองรับ) ช่องคอมเมนต์นี้จึงยังคงไว้ให้กรอกได้ตามเดิม แต่จะไม่ถูก
 * บันทึกจริงจนกว่า backend จะมีคอลัมน์ใหม่รองรับ (ดู TODO ใน course.service.ts ฝั่ง backend)
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import AppHeader from '../../src/components/AppHeader';
import { useAuth } from '../../src/context/AuthContext';

import {
  EvaluationItem,
  getCourseEvaluation,
  submitCourseEvaluation,
} from '../../src/services/course';

const PRIMARY = '#001B74';
const BLUE = '#0B63CE';
const RED = '#E30613';
const BG = '#F4F6FA';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';

export default function EvaluationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const courseId = Number(id);
  const userId = user?.id ? Number(user.id) : null;

  const [items, setItems] = useState<EvaluationItem[]>([]);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [comment, setComment] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!courseId || !userId) {
        setError('ไม่พบข้อมูลผู้ใช้หรือหลักสูตร');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getCourseEvaluation(courseId, userId);

        if (!mounted) {
          return;
        }

        if (!response.success) {
          setError('ไม่สามารถโหลดแบบประเมินได้');
          return;
        }

        setItems(response.data.items);
        setAlreadyDone(response.data.completed);
      } catch (err) {
        if (__DEV__) {
          console.log('EVALUATION LOAD ERROR:', err);
        }

        if (mounted) {
          setError('ไม่สามารถโหลดแบบประเมินได้');
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
  }, [courseId, userId]);

  const setScore = (evaId: number, value: number) => {
    setScores((prev) => ({ ...prev, [evaId]: value }));
  };

  const submitEvaluation = async () => {
    if (!courseId || !userId || submitting) {
      return;
    }

    if (items.some((item) => !scores[item.id])) {
      Alert.alert('แจ้งเตือน', 'กรุณาให้คะแนนให้ครบทุกข้อ');
      return;
    }

    try {
      setSubmitting(true);

      const response = await submitCourseEvaluation(
        courseId,
        userId,
        items.map((item) => ({ evaId: item.id, score: scores[item.id] })),
        comment,
      );

      if (!response.success) {
        throw new Error('submit failed');
      }

      Alert.alert('สำเร็จ', 'ส่งแบบประเมินเรียบร้อยแล้ว', [
        {
          text: 'ตกลง',
          onPress: () => router.replace(`/course/${courseId}` as any),
        },
      ]);
    } catch (e) {
      if (__DEV__) {
        console.log('EVALUATION SUBMIT ERROR:', e);
      }

      Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกแบบประเมินได้ กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>กำลังโหลดแบบประเมิน...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryText}>กลับ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.root}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppHeader />
          <View style={styles.pageBox}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={15} color="#fff" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <View style={styles.heroCard}>
              <View style={styles.heroIcon}>
                <Ionicons name="newspaper-outline" size={30} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.heroSmall}>COURSE EVALUATION</Text>
                <Text style={styles.heroTitle}>แบบประเมินหลักสูตร</Text>
                <Text style={styles.heroSub}>Course ID : {id}</Text>
              </View>
            </View>

            <View style={styles.noticeBox}>
              <Ionicons name="information-circle-outline" size={20} color={BLUE} />
              <Text style={styles.noticeText}>
                {alreadyDone
                  ? 'คุณส่งแบบประเมินนี้ไปแล้ว ส่งซ้ำได้ถ้าต้องการแก้ไขคำตอบ'
                  : 'กรุณาให้คะแนนความพึงพอใจตั้งแต่ 1 - 5 คะแนน'}
              </Text>
            </View>

            {items.length === 0 ? (
              <View style={styles.formCard}>
                <Text style={styles.emptyText}>
                  หลักสูตรนี้ยังไม่มีแบบประเมินให้ทำ
                </Text>
              </View>
            ) : (
              <View style={styles.formCard}>
                {items.map((item, index) => (
                  <View key={item.id} style={styles.questionBox}>
                    <Text style={styles.questionText}>
                      {index + 1}. {item.title}
                    </Text>

                    <View style={styles.starRow}>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <TouchableOpacity
                          key={value}
                          onPress={() => setScore(item.id, value)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name={
                              (scores[item.id] ?? 0) >= value
                                ? 'star'
                                : 'star-outline'
                            }
                            size={30}
                            color={
                              (scores[item.id] ?? 0) >= value
                                ? '#F59E0B'
                                : '#CBD5E1'
                            }
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}

                <View style={styles.commentBox}>
                  <Text style={styles.commentTitle}>ความคิดเห็นเพิ่มเติม</Text>

                  <TextInput
                    value={comment}
                    onChangeText={setComment}
                    placeholder="พิมพ์ความคิดเห็นเพิ่มเติม..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                    style={styles.commentInput}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                  activeOpacity={0.85}
                  disabled={submitting}
                  onPress={submitEvaluation}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.submitText}>ส่งแบบประเมิน</Text>
                      <Ionicons name="send" size={18} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>©2026 Thoresen e-learning</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  root: {
    flex: 1,
    backgroundColor: BG,
  },

  pageBox: {
    paddingHorizontal: 16,
  },

  backBtn: {
    marginTop: 12,
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
    width: 60,
    height: 60,
    borderRadius: 22,
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
    marginTop: 5,
  },

  noticeBox: {
    marginTop: 14,
    backgroundColor: '#EEF7FF',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D7E9FF',
  },

  noticeText: {
    flex: 1,
    marginLeft: 8,
    color: TEXT,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },

  formCard: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 15,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 4,
  },

  questionBox: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },

  questionText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 10,
  },

  starRow: {
    flexDirection: 'row',
    gap: 8,
  },

  commentBox: {
    marginTop: 16,
  },

  commentTitle: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 9,
  },

  commentInput: {
    minHeight: 120,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    color: TEXT,
    fontSize: 13,
    lineHeight: 19,
  },

  submitBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 16,
    backgroundColor: RED,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },

  footer: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    marginTop: 22,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },

  footerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

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

  retryBtn: {
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

  emptyText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 20,
  },

});
