import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import {
  getComplaintShips,
  getComplaintCaptcha,
  submitCrewComplaint,
  ShipItem,
} from '../src/services/complaint';

const PRIMARY = '#001B74';

export default function CrewComplaintScreen() {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language?.startsWith('th');

  const [vessels, setVessels] = useState<string[]>(['-- SELECT --']);
  const [vessel, setVessel] = useState('-- SELECT --');
  const [showVessel, setShowVessel] = useState(false);
  const [loadingShips, setLoadingShips] = useState(false);

  const [date, setDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const [message, setMessage] = useState('');

  // Image Upload
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

  // Captcha
  const [captchaCode, setCaptchaCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);

  // Submitting
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const monthName = new Date(year, month).toLocaleString('en-US', {
    month: 'long',
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const calendarDays = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectDate = (day: number) => {
    const dd = String(day).padStart(2, '0');
    const mm = String(month + 1).padStart(2, '0');
    setDate(`${dd}/${mm}/${year}`);
    setShowCalendar(false);
  };

  useEffect(() => {
    loadShips();
    loadCaptcha();
  }, []);

  const loadShips = async () => {
    try {
      setLoadingShips(true);
      const res = await getComplaintShips();
      const names = res.ships.map((s) => s.name);
      setVessels(['-- SELECT --', ...names]);
    } catch (err) {
      console.error('Failed to load ships:', err);
    } finally {
      setLoadingShips(false);
    }
  };

  const loadCaptcha = async () => {
    try {
      setLoadingCaptcha(true);
      const res = await getComplaintCaptcha();
      setCaptchaCode(res.code);
    } catch (err) {
      console.error('Failed to load captcha:', err);
      // Fallback local random code
      setCaptchaCode(Math.floor(1000 + Math.random() * 9000).toString());
    } finally {
      setLoadingCaptcha(false);
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          isThai ? 'ต้องการสิทธิ์เข้าถึง' : 'Permission Required',
          isThai
            ? 'กรุณาอนุญาตให้แอปเข้าถึงคลังรูปภาพเพื่อแนบไฟล์'
            : 'Please allow access to your photo library to attach an image.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64 || null);
        setImageName(asset.fileName || `photo_${Date.now()}.jpg`);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      Alert.alert(
        isThai ? 'เกิดข้อผิดพลาด' : 'Error',
        isThai ? 'ไม่สามารถเลือกรูปภาพได้' : 'Failed to pick image',
      );
    }
  };

  const removeImage = () => {
    setImageUri(null);
    setImageBase64(null);
    setImageName(null);
  };

  const handleSubmit = async () => {
    if (!vessel || vessel === '-- SELECT --') {
      Alert.alert(
        isThai ? 'แจ้งเตือน' : 'Notice',
        isThai ? 'กรุณาเลือกเรือ (Vessel Name)' : 'Please select a vessel.',
      );
      return;
    }

    if (!date) {
      Alert.alert(
        isThai ? 'แจ้งเตือน' : 'Notice',
        isThai ? 'กรุณาระบุวันที่เกิดปัญหา' : 'Please select the date of problem.',
      );
      return;
    }

    if (!message.trim()) {
      Alert.alert(
        isThai ? 'แจ้งเตือน' : 'Notice',
        isThai ? 'กรุณากรอกข้อความร้องเรียน' : 'Please enter your complaint message.',
      );
      return;
    }

    if (!inputCode.trim()) {
      Alert.alert(
        isThai ? 'แจ้งเตือน' : 'Notice',
        isThai ? 'กรุณากรอกรหัสความปลอดภัย' : 'Please enter the security code.',
      );
      return;
    }

    if (inputCode.trim() !== captchaCode.trim()) {
      Alert.alert(
        isThai ? 'รหัสไม่ถูกต้อง' : 'Invalid Code',
        isThai
          ? 'รหัสความปลอดภัยไม่ตรงกับที่แสดง กรุณาลองใหม่อีกครั้ง'
          : 'Security code is incorrect. Please try again.',
      );
      loadCaptcha();
      setInputCode('');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitCrewComplaint({
        ship: vessel,
        dateOfProblem: date,
        message: message.trim(),
        imageBase64: imageBase64 || undefined,
        imageName: imageName || undefined,
      });

      if (res.success) {
        Alert.alert(
          isThai ? 'ส่งเรื่องสำเร็จ' : 'Success',
          isThai
            ? 'ระบบได้รับเรื่องร้องเรียนของคุณแล้ว ทางบริษัทจะดำเนินการตรวจสอบอย่างเป็นความลับสูงสุด'
            : 'Your complaint has been submitted successfully and will be investigated strictly confidential.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ],
        );
      } else {
        Alert.alert(
          isThai ? 'ไม่สามารถส่งข้อมูลได้' : 'Failed',
          res.message || 'Unknown error',
        );
      }
    } catch (err: any) {
      console.error('Error submitting complaint:', err);
      Alert.alert(
        isThai ? 'เกิดข้อผิดพลาด' : 'Error',
        err?.response?.data?.message || err?.message || 'Failed to submit complaint',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.modalBox}>
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Ionicons name="alert-circle" size={22} color="#fff" />
            <Text style={styles.topBarTitle}>{t('crewComplaint', { defaultValue: 'Crew & Complaint' })}</Text>
          </View>

          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="close" size={30} color="#BFD0FF" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>{t('vesselName', { defaultValue: 'Vessel Name' })}</Text>

          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setShowVessel(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.selectText, vessel === '-- SELECT --' && { color: '#888' }]}>
              {vessel}
            </Text>
            {loadingShips ? (
              <ActivityIndicator size="small" color={PRIMARY} />
            ) : (
              <Ionicons name="chevron-down" size={20} color="#555" />
            )}
          </TouchableOpacity>

          <Text style={styles.label}>{t('dateOfProblem', { defaultValue: 'Date of problem' })}</Text>

          <TouchableOpacity
            style={styles.inputIcon}
            onPress={() => setShowCalendar(!showCalendar)}
            activeOpacity={0.8}
          >
            <Text style={[styles.dateText, !date && { color: '#999' }]}>
              {date || (isThai ? 'เลือกวันที่' : 'Select date')}
            </Text>
            <Ionicons name="calendar" size={22} color="#333" />
          </TouchableOpacity>

          {showCalendar && (
            <View style={styles.calendarBox}>
              <View style={styles.calendarHead}>
                <TouchableOpacity
                  onPress={() => {
                    if (month === 0) {
                      setMonth(11);
                      setYear(year - 1);
                    } else {
                      setMonth(month - 1);
                    }
                  }}
                >
                  <Ionicons name="chevron-back" size={22} color="#777" />
                </TouchableOpacity>

                <Text style={styles.calendarTitle}>
                  {monthName} {year}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    if (month === 11) {
                      setMonth(0);
                      setYear(year + 1);
                    } else {
                      setMonth(month + 1);
                    }
                  }}
                >
                  <Ionicons name="chevron-forward" size={22} color="#777" />
                </TouchableOpacity>
              </View>

              <View style={styles.weekRow}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <Text key={d} style={styles.weekText}>
                    {d}
                  </Text>
                ))}
              </View>

              <View style={styles.dayWrap}>
                {calendarDays.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayBox,
                      day === today.getDate() &&
                        month === today.getMonth() &&
                        year === today.getFullYear() &&
                        styles.todayBox,
                    ]}
                    disabled={!day}
                    onPress={() => day && selectDate(day)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        day === today.getDate() &&
                          month === today.getMonth() &&
                          year === today.getFullYear() &&
                          styles.todayText,
                      ]}
                    >
                      {day || ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <Text style={styles.label}>{t('message', { defaultValue: 'Message' })}</Text>

          <TextInput
            style={styles.messageBox}
            multiline
            textAlignVertical="top"
            placeholder={t('crewMessagePlaceholder', {
              defaultValue: 'Please describe the problem or complaint clearly...',
            })}
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
          />

          <Text style={styles.label}>{t('uploadPhoto', { defaultValue: 'Upload Photo' })}</Text>

          <TouchableOpacity style={styles.fileBox} onPress={pickImage} activeOpacity={0.8}>
            <Text style={styles.chooseBtn}>{t('chooseFile', { defaultValue: 'Choose File' })}</Text>
            <Text style={styles.noFile} numberOfLines={1}>
              {imageName || t('noFileChosen', { defaultValue: 'No file chosen' })}
            </Text>
          </TouchableOpacity>

          {imageUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={removeImage}>
                <Ionicons name="close-circle" size={24} color="#E30613" />
                <Text style={styles.removeImageText}>{isThai ? 'ลบรูป' : 'Remove'}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text style={styles.label}>{t('securityCode', { defaultValue: 'Security Code' })}</Text>

          <View style={styles.securityRow}>
            <View style={styles.captcha}>
              {loadingCaptcha ? (
                <ActivityIndicator size="small" color={PRIMARY} />
              ) : (
                <Text style={styles.captchaText}>{captchaCode}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={loadCaptcha}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={16} color="#111" />
              <Text style={styles.refreshText}>{t('refresh', { defaultValue: 'Refresh' })}</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.codeInput}
            placeholder={t('enterCode', { defaultValue: 'Enter code' })}
            placeholderTextColor="#999"
            keyboardType="number-pad"
            value={inputCode}
            onChangeText={setInputCode}
          />

          <Text style={styles.redNotice}>
            {t('crewNotice', {
              defaultValue:
                '* ข้อมูลของท่านจะถูกเก็บเป็นความลับสูงสุดตามนโยบายของบริษัท เพื่อความปลอดภัยและความเป็นธรรมของลูกเรือทุกท่าน',
            })}
          </Text>

          <View style={styles.yellowBox}>
            <Text style={styles.yellowText}>
              {t('crewHelp', {
                defaultValue:
                  'หากต้องการความช่วยเหลือเร่งด่วน ติดต่อฝ่ายบุคคลหรือฝ่ายปฏิบัติการเรือโดยตรง',
              })}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.confirmBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmText}>{t('confirm', { defaultValue: 'Confirm' })}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Modal transparent visible={showVessel} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowVessel(false)}
        >
          <View style={styles.vesselModal}>
            <View style={styles.vesselModalHead}>
              <Text style={styles.vesselModalTitle}>
                {isThai ? 'เลือกรายชื่อเรือ' : 'Select Vessel'}
              </Text>
              <TouchableOpacity onPress={() => setShowVessel(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {vessels.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.vesselItem,
                    item === vessel && styles.vesselActive,
                  ]}
                  onPress={() => {
                    setVessel(item);
                    setShowVessel(false);
                  }}
                >
                  <Text
                    style={[
                      styles.vesselText,
                      item === vessel && styles.vesselActiveText,
                    ]}
                  >
                    {item}
                  </Text>
                  {item === vessel ? (
                    <Ionicons name="checkmark" size={18} color={PRIMARY} />
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalBox: {
    width: '92%',
    maxHeight: '94%',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  topBar: {
    height: 64,
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  topBarTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },

  content: {
    padding: 18,
    paddingBottom: 30,
  },

  label: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
    marginTop: 6,
  },

  selectBox: {
    height: 46,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFCFF',
  },

  selectText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },

  inputIcon: {
    height: 46,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFCFF',
  },

  dateText: {
    flex: 1,
    fontSize: 15,
    color: '#111',
    fontWeight: '600',
  },

  calendarBox: {
    width: 285,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    marginBottom: 14,
    alignSelf: 'center',
  },

  calendarHead: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#F8F8F8',
  },

  calendarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#333',
  },

  weekRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingVertical: 4,
  },

  weekText: {
    width: 40,
    textAlign: 'center',
    fontWeight: '700',
    color: '#999',
    fontSize: 12,
  },

  dayWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 6,
  },

  dayBox: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
  },

  todayBox: {
    backgroundColor: PRIMARY,
    borderRadius: 6,
  },

  todayText: {
    color: '#fff',
    fontWeight: '900',
  },

  messageBox: {
    height: 140,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
    color: '#111',
  },

  fileBox: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },

  chooseBtn: {
    borderWidth: 1,
    borderColor: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: '#111',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
  },

  noFile: {
    flex: 1,
    color: '#4B5563',
    fontSize: 13,
  },

  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
  },

  previewImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#ddd',
  },

  removeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  removeImageText: {
    color: '#E30613',
    fontSize: 12,
    fontWeight: '700',
  },

  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  captcha: {
    height: 40,
    minWidth: 90,
    borderWidth: 1.5,
    borderColor: '#BDBDBD',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#F3F4F6',
    letterSpacing: 4,
  },

  captchaText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 4,
  },

  refreshBtn: {
    backgroundColor: '#FBBF24',
    height: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
    marginLeft: 8,
  },

  refreshText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
  },

  codeInput: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
  },

  redNotice: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
    fontWeight: '500',
  },

  yellowBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 22,
  },

  yellowText: {
    color: '#92400E',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    fontWeight: '600',
  },

  confirmBtn: {
    width: 200,
    height: 48,
    backgroundColor: PRIMARY,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },

  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  vesselModal: {
    width: '86%',
    maxHeight: 460,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 10,
  },

  vesselModalHead: {
    height: 50,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  vesselModalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: PRIMARY,
  },

  vesselItem: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  vesselActive: {
    backgroundColor: '#EFF6FF',
  },

  vesselText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },

  vesselActiveText: {
    color: PRIMARY,
    fontWeight: '800',
  },
});