import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppHeader from '../../src/components/AppHeader';

const PRIMARY = '#001B74';
const RED = '#E30613';
const BLUE = '#0B63CE';
const GREEN = '#16A34A';
const BG = '#F4F6FA';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const SOFT_BLUE = '#EEF7FF';

const logo = require('../../assets/images/banner/logo-new.png');
const lessonVideo1 = require('../../assets/videos/test_1.mp4');

const lessonBank: any = {
  '1-1': {
    title: 'Management Introduction',
    chapter: 'บทที่ 1',
    duration: '30 นาที',
    video: lessonVideo1,
  },
  '1-2': {
    title: 'Planning and Organizing',
    chapter: 'บทที่ 2',
    duration: '26 นาที',
    video: lessonVideo1,
  },
  '1-3': {
    title: 'Leadership Skills',
    chapter: 'บทที่ 3',
    duration: '35 นาที',
    video: lessonVideo1,
  },
  '2-1': {
    title: 'Cargo Handling',
    chapter: 'บทที่ 1',
    duration: '28 นาที',
    video: lessonVideo1,
  },
  '2-2': {
    title: 'Cargo Storage',
    chapter: 'บทที่ 2',
    duration: '31 นาที',
    video: lessonVideo1,
  },
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
];

export default function LessonVideoScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [note, setNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const params = useLocalSearchParams<{
    id: string;
    chapter?: string;
  }>();

  const courseId = String(params.id ?? '1');
  const chapterNo = Number(params.chapter ?? 1);
  const lessonKey = `${courseId}-${chapterNo}`;

  const lesson = lessonBank[lessonKey] ?? lessonBank['1-1'];

  const player = useVideoPlayer(lesson.video, player => {
    player.loop = false;
  });

  useEffect(() => {
    const loadProgress = async () => {
      const saved = await AsyncStorage.getItem(`course_progress_${courseId}`);

      if (saved) {
        const data = JSON.parse(saved);
        const watchedVideos: string[] = data.watchedVideos ?? [];
        setLessonCompleted(watchedVideos.includes(lessonKey));
      }
    };

    loadProgress();
  }, [courseId, lessonKey]);

  const completeLesson = async () => {
    const key = `course_progress_${courseId}`;
    const saved = await AsyncStorage.getItem(key);
    const oldData = saved ? JSON.parse(saved) : {};

    const watchedVideos: string[] = oldData.watchedVideos ?? [];
    const nextWatchedVideos = watchedVideos.includes(lessonKey)
      ? watchedVideos
      : [...watchedVideos, lessonKey];

    const nextData = {
      ...oldData,
      watchedVideos: nextWatchedVideos,
    };

    await AsyncStorage.setItem(key, JSON.stringify(nextData));
    setLessonCompleted(true);

    Alert.alert('สำเร็จ', 'สามารถทำแบบทดสอบหลังเรียนได้แล้ว', [
      {
        text: 'ตกลง',
        onPress: () => router.back(),
      },
    ]);
  };

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

  const saveNote = () => {
    if (!note.trim()) return;
    setSavedNotes([...savedNotes, note.trim()]);
    setNote('');
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
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
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
                  {lesson.chapter} : {lesson.title}
                </Text>

                <View style={styles.heroBottom}>
                  <View style={styles.heroBadge}>
                    <Ionicons name="time-outline" size={13} color="#fff" />
                    <Text style={styles.heroBadgeText}>{lesson.duration}</Text>
                  </View>

                  <View
                    style={[
                      styles.heroBadge,
                      { backgroundColor: lessonCompleted ? GREEN : RED },
                    ]}
                  >
                    <Ionicons
                      name={lessonCompleted ? 'checkmark-circle' : 'play-circle'}
                      size={13}
                      color="#fff"
                    />
                    <Text style={styles.heroBadgeText}>
                      {lessonCompleted ? 'Completed' : 'Learning'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.videoCard}>
              <VideoView
                style={styles.video}
                player={player}
                allowsFullscreen
                allowsPictureInPicture
                nativeControls
              />

              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>{lesson.title}</Text>
                <Text style={styles.videoDesc}>
                  Watch this lesson carefully before taking the post-test.
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.completeBtn,
                  lessonCompleted && styles.completeBtnDone,
                ]}
                onPress={completeLesson}
                disabled={lessonCompleted}
              >
                <Ionicons
                  name={lessonCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={18}
                  color="#fff"
                />

                <Text style={styles.completeBtnText}>
                  {lessonCompleted ? 'เรียนจบบทนี้แล้ว' : 'กดเมื่อเรียนจบบทนี้'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Ionicons name="time-outline" size={22} color={BLUE} />
                <Text style={styles.infoLabel}>ระยะเวลา</Text>
                <Text style={styles.infoValue}>{lesson.duration}</Text>
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="book-outline" size={22} color={BLUE} />
                <Text style={styles.infoLabel}>บทเรียน</Text>
                <Text style={styles.infoValue}>{lesson.chapter}</Text>
              </View>
            </View>

            <View style={styles.lessonListCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="list" size={18} color="#fff" />
                <Text style={styles.cardHeaderText}>รายการบทเรียน</Text>
              </View>

              <View style={styles.lessonRow}>
                <View style={styles.lessonCircleDone}>
                  <Ionicons name="checkmark" size={13} color="#fff" />
                </View>
                <Text style={styles.lessonText}>ทำข้อสอบก่อนเรียน</Text>
                <Text style={styles.lessonStatus}>Completed</Text>
              </View>

              <View style={styles.lessonRowActive}>
                <View
                  style={[
                    styles.lessonCircleActive,
                    lessonCompleted && { backgroundColor: GREEN },
                  ]}
                >
                  <Ionicons
                    name={lessonCompleted ? 'checkmark' : 'play'}
                    size={12}
                    color="#fff"
                  />
                </View>
                <Text style={styles.lessonTextActive}>วิดีโอ {lesson.chapter}</Text>
                <Text
                  style={[
                    styles.lessonStatusActive,
                    lessonCompleted && { color: GREEN },
                  ]}
                >
                  {lessonCompleted ? 'Completed' : 'Playing'}
                </Text>
              </View>

              <View style={styles.lessonRow}>
                <View style={styles.lessonCircle}>
                  <Ionicons name="document-text-outline" size={12} color={BLUE} />
                </View>

                <Text style={styles.lessonText}>ทำข้อสอบหลังเรียน</Text>

                <TouchableOpacity
                  style={[
                    styles.examBtn,
                    !lessonCompleted && styles.examBtnDisabled,
                  ]}
                  disabled={!lessonCompleted}
                  onPress={() =>
                    router.push({
                      pathname: `/exam/${courseId}`,
                      params: {
                        chapter: String(chapterNo),
                        examType: 'posttest',
                      },
                    } as any)
                  }
                >
                  <Text
                    style={[
                      styles.examBtnText,
                      !lessonCompleted && styles.examBtnTextDisabled,
                    ]}
                  >
                    {lessonCompleted ? 'ทำข้อสอบ' : 'ล็อกอยู่'}
                  </Text>
                </TouchableOpacity>
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
                onChangeText={text => {
                  if (text.length <= 500) setNote(text);
                }}
                placeholder="พิมพ์โน้ตจากบทเรียนนี้..."
                placeholderTextColor="#9CA3AF"
                style={styles.noteInput}
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity style={styles.noteBtn} onPress={saveNote}>
                <Ionicons name="save-outline" size={16} color="#fff" />
                <Text style={styles.noteBtnText}>บันทึกโน้ต</Text>
              </TouchableOpacity>

              {savedNotes.length > 0 && (
                <View style={styles.savedBox}>
                  {savedNotes.map((item, index) => (
                    <View key={`${item}-${index}`} style={styles.savedItem}>
                      <Text style={styles.savedNote}>
                        {index + 1}. {item}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 Thoresen e-Learning</Text>
          </View>
        </KeyboardAwareScrollView>

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
  safe: { flex: 1, backgroundColor: BG },
  root: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingBottom: 1 },

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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

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