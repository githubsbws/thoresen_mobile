import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppHeader from '../../src/components/AppHeader';

const PRIMARY = '#001B74';
const BLUE = '#0B63CE';
const RED = '#E30613';
const BG = '#F4F6FA';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';

const logo = require('../../assets/images/banner/logo-new.png');

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
];

const questions = [
  'เนื้อหาหลักสูตรเข้าใจง่าย',
  'วิดีโอประกอบการเรียนมีความเหมาะสม',
  'แบบทดสอบสอดคล้องกับเนื้อหา',
  'รูปแบบการใช้งานระบบสะดวก',
  'โดยรวมพึงพอใจกับหลักสูตรนี้',
];

export default function EvaluationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [menuVisible, setMenuVisible] = useState(false);
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0, 0]);
  const [comment, setComment] = useState('');

  const handleMenuPress = (item: string) => {
    setMenuVisible(false);

    if (item === 'Home') router.push('/(tabs)/Home' as any);
    if (item === 'About Us') router.push('/(tabs)/about' as any);
    if (item === 'Course') router.push('/(tabs)/courses' as any);
    if (item === 'Library') router.push('/(tabs)/library' as any);
    if (item === 'How to Use') router.push('/(tabs)/how-to-use' as any);
    if (item === 'FAQ') router.push('/(tabs)/faq' as any);
    if (item === 'Terms & Conditions') router.push('/(tabs)/terms' as any);
    if (item === 'Contact Us') router.push('/(tabs)/contact' as any);
    if (item === 'Mess-room') router.push('/(tabs)/Mess-room' as any);
  };

  const setScore = (index: number, value: number) => {
    const next = [...scores];
    next[index] = value;
    setScores(next);
  };

 const submitEvaluation = async () => {
  if (scores.some(item => item === 0)) {
    Alert.alert('แจ้งเตือน', 'กรุณาให้คะแนนให้ครบทุกข้อ');
    return;
  }

  try {
    const key = `course_progress_${id}`;

    const raw = await AsyncStorage.getItem(key);
    const progress = raw ? JSON.parse(raw) : {};

    await AsyncStorage.setItem(
      key,
      JSON.stringify({
        ...progress,
        evaluationDone: true,
        evaluationDate: new Date().toISOString(),
        evaluation: {
          scores,
          comment,
        },
      })
    );

    Alert.alert(
      'สำเร็จ',
      'ส่งแบบประเมินเรียบร้อยแล้ว',
      [
        {
          text: 'ตกลง',
          onPress: () => router.replace(`/course/${id}` as any),
        },
      ]
    );
  } catch (e) {
    Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกแบบประเมินได้');
    console.log(e);
  }
};

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
                กรุณาให้คะแนนความพึงพอใจตั้งแต่ 1 - 5 คะแนน
              </Text>
            </View>

            <View style={styles.formCard}>
              {questions.map((question, index) => (
                <View key={question} style={styles.questionBox}>
                  <Text style={styles.questionText}>
                    {index + 1}. {question}
                  </Text>

                  <View style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map(value => (
                      <TouchableOpacity
                        key={value}
                        onPress={() => setScore(index, value)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={scores[index] >= value ? 'star' : 'star-outline'}
                          size={30}
                          color={scores[index] >= value ? '#F59E0B' : '#CBD5E1'}
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
                style={styles.submitBtn}
                activeOpacity={0.85}
                onPress={submitEvaluation}
              >
                <Text style={styles.submitText}>ส่งแบบประเมิน</Text>
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>©2026 Thoresen e-learning</Text>
          </View>
        </ScrollView>

        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.menuBox}>
              {menuList.map(item => (
                <TouchableOpacity
                  key={item}
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(item)}
                >
                  <Text style={styles.menuText}>{item}</Text>
                  <Ionicons name="chevron-forward" size={18} color={PRIMARY} />
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
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

  topHeader: {
    height: 78,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  logo: {
    width: 170,
    height: 52,
  },
  menuBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 18,
  },
  menuBox: {
    width: 240,
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