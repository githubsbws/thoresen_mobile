import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

const PRIMARY = '#001B74';

const vessels = [
  '-- SELECT --',
  'THOR ACHIEVER',
  'THOR BRAVE',
  'THOR BREEZE',
  'THOR CHAICHANA',
  'THOR CHAIYO',
  'THOR COURAGE',
  'THOR FAH',
  'THOR FEARLESS',
  'THOR FORTUNE',
  'THOR FRIENDSHIP',
  'THOR FUTURE',
  'THOR INFINITY',
  'THOR INSUVI',
  'THOR MADOC',
  'THOR MAGNHILD',
  'THOR MAXIMUS',
  'THOR MENELAUS',
  'THOR MERCURY',
  'THOR MONADIC',
  'THOR NIRAMIT',
];

export default function CrewComplaintScreen() {
  const { t } = useTranslation();

  const [vessel, setVessel] = useState('-- SELECT --');
  const [showVessel, setShowVessel] = useState(false);

  const [date, setDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.modalBox}>
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Ionicons name="alert-circle" size={22} color="#fff" />
            <Text style={styles.topBarTitle}>{t('crewComplaint')}</Text>
          </View>

          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={30} color="#4C57A8" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>{t('vesselName')}</Text>

          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setShowVessel(true)}
          >
            <Text style={styles.selectText}>{vessel}</Text>
            <Ionicons name="chevron-down" size={20} color="#555" />
          </TouchableOpacity>

          <Text style={styles.label}>{t('dateOfProblem')}</Text>

          <TouchableOpacity
            style={styles.inputIcon}
            onPress={() => setShowCalendar(true)}
          >
            <Text style={[styles.dateText, !date && { color: '#999' }]}>
              {date || ''}
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
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
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

          <Text style={styles.label}>{t('message')}</Text>

          <TextInput
            style={styles.messageBox}
            multiline
            textAlignVertical="top"
            placeholder={t('crewMessagePlaceholder')}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>{t('uploadPhoto')}</Text>

          <TouchableOpacity style={styles.fileBox}>
            <Text style={styles.chooseBtn}>{t('chooseFile')}</Text>
            <Text style={styles.noFile}>{t('noFileChosen')}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>{t('securityCode')}</Text>

          <View style={styles.securityRow}>
            <View style={styles.captcha}>
              <Text style={styles.captchaText}>{t('clickToRefresh')}</Text>
            </View>

            <TouchableOpacity style={styles.refreshBtn}>
              <Text style={styles.refreshText}>{t('refresh')}</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.codeInput}
            placeholder={t('enterCode')}
            placeholderTextColor="#999"
          />

          <Text style={styles.redNotice}>{t('crewNotice')}</Text>

          <View style={styles.yellowBox}>
            <Text style={styles.yellowText}>{t('crewHelp')}</Text>
          </View>

          <TouchableOpacity style={styles.confirmBtn}>
            <Text style={styles.confirmText}>{t('confirm')}</Text>
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
            <ScrollView>
              {vessels.map(item => (
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
                  <Text style={styles.vesselText}>{item}</Text>
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
    backgroundColor: '#FBEFF5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalBox: {
    width: '92%',
    maxHeight: '96%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 8,
  },

  topBar: {
    height: 72,
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
    fontSize: 20,
    fontWeight: '900',
  },

  content: {
    padding: 18,
    paddingBottom: 30,
  },

  label: {
    fontSize: 18,
    fontWeight: '900',
    color: '#333',
    marginBottom: 8,
  },

  selectBox: {
    height: 46,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 4,
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectText: {
    fontSize: 16,
    color: '#555',
  },

  inputIcon: {
    height: 46,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 4,
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#111',
  },

  calendarBox: {
    width: 285,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 5,
    marginBottom: 14,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
  },

  weekRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },

  weekText: {
    width: 40,
    height: 30,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '800',
    color: '#999',
  },

  dayWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  dayBox: {
    width: 40,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayText: {
    color: '#666',
    fontSize: 15,
  },

  todayBox: {
    backgroundColor: '#2EA3F2',
  },

  todayText: {
    color: '#fff',
    fontWeight: '900',
  },

  messageBox: {
    height: 165,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 8,
  },

  fileBox: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  chooseBtn: {
    borderWidth: 1,
    borderColor: '#999',
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: '#111',
    marginRight: 8,
  },

  noFile: {
    color: '#555',
    fontSize: 15,
  },

  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  captcha: {
    height: 34,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  captchaText: {
    fontSize: 17,
    color: '#555',
  },

  refreshBtn: {
    backgroundColor: '#FFC107',
    height: 40,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 6,
    marginLeft: 6,
  },

  refreshText: {
    fontSize: 16,
    color: '#111',
  },

  codeInput: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 28,
  },

  redNotice: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 28,
  },

  yellowBox: {
    backgroundColor: 'yellow',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 28,
  },

  yellowText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
  },

  confirmBtn: {
    width: 180,
    height: 48,
    backgroundColor: '#5B5FA3',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },

  confirmText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  vesselModal: {
    width: '84%',
    maxHeight: 520,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#555',
  },

  vesselItem: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  vesselActive: {
    backgroundColor: '#B7E5F4',
  },

  vesselText: {
    fontSize: 16,
    color: '#333',
  },
});