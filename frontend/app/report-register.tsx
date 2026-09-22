import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AppHeader from '../src/components/AppHeader';
import { API_BASE_URL } from '../src/services/api';
import { ReportChart } from '../src/components/ReportChart';
const PRIMARY = '#001B74';
const RED = '#E30613';
const BLUE = '#1685E5';

const logoImg = require('../assets/images/banner/logo-new.png');
const crewButton = require('../assets/images/crew-complaint/crew-icon.png');

const daysOptions = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const monthsOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const yearOptions = Array.from({ length: 21 }, (_, i) => String(2018 + i));

type SelectKey =
  | 'department'
  | 'position'
  | 'status'
  | 'fromYear'
  | 'toYear'
  | null;

export default function ReportRegisterScreen() {
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showCrew, setShowCrew] = useState(false);
  const [openSelect, setOpenSelect] = useState<SelectKey>(null);

  const [department, setDepartment] = useState(t('selectDepartment'));
  const [position, setPosition] = useState(t('selectPosition'));
  const [status, setStatus] = useState(t('status'));
  const [fromYear, setFromYear] = useState(t('selectFromYear'));
  const [toYear, setToYear] = useState(t('selectToYear'));
  const [chartType, setChartType] = useState<'column' | 'pie'>('column');

  const [startDate, setStartDate] = useState('02-10-2021');
  const [endDate, setEndDate] = useState('31-12-2026');
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [targetDateField, setTargetDateField] = useState<'start' | 'end'>('start');
  const [selDay, setSelDay] = useState('01');
  const [selMonth, setSelMonth] = useState('01');
  const [selYear, setSelYear] = useState('2026');
  const [reportResults, setReportResults] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    handleSearch();
  }, []);

  const openDatePicker = (field: 'start' | 'end') => {
    setTargetDateField(field);
    const val = field === 'start' ? startDate : endDate;
    const parts = (val || '01-01-2026').split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        setSelYear(parts[0]);
        setSelMonth(parts[1]);
        setSelDay(parts[2]);
      } else {
        setSelDay(parts[0]);
        setSelMonth(parts[1]);
        setSelYear(parts[2]);
      }
    } else {
      setSelDay('01');
      setSelMonth('01');
      setSelYear('2026');
    }
    setDateModalVisible(true);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const backendHost = API_BASE_URL.replace('/v1', '');
      const url = `${backendHost}/report/search?employeeType=ship&department=${encodeURIComponent(department)}&position=${encodeURIComponent(position)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
      console.log('[ReportRegister] Fetching:', url);
      const res = await fetch(url);
      const data = await res.json();
      console.log('[ReportRegister] Response:', JSON.stringify(data));
      const results = data.data || data.results || (Array.isArray(data) ? data : []);
      setReportResults(results);
      if (data.chartData && Array.isArray(data.chartData) && data.chartData.length > 0) {
        setChartData(data.chartData);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.log('[ReportRegister] Error:', err);
      setReportResults([]);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };


  const menuList = [
    { label: t('home'), route: 'Home' },
    { label: t('about'), route: 'About Us' },
    { label: t('course'), route: 'Course' },
    { label: t('howto'), route: 'How to Use' },
    { label: t('faq'), route: 'FAQ' },
    { label: t('contact'), route: 'Contact Us' },
    { label: t('messroom'), route: 'Mess-room' },
    { label: t('library'), route: 'Library' },
    { label: t('terms'), route: 'Terms & Conditions' },
    { label: t('report'), route: 'Report' },
  ];

  const positions = [
    t('selectPosition'),
    'AB',
    'ACT',
    'ADM',
    'ASSISTANT ELECTRICIAN',
    'BIU',
    'BOSUN',
    'Chartering',
    'CHIEF COOK',
    'CHIEF ENGINEER',
    'CHIEF OFFICER',
    'D-BOY',
    'D-CADET',
    'D-FITTER',
    'E-BOY',
    'E-CADET',
    'E-FITTER',
    'ELECTRICIAN ENGINEER',
    'FIN',
    'FOURTH ENGINEER',
    'HR',
    'Ins. & Clam',
    'MAR',
    'MASTER',
    'MESSMAN',
    'MOD Center',
    'MPD',
    'MTT',
    'OILER',
    'Operation',
    'Procurement',
    'QAS',
    'SECOND ENGINEER',
    'SECOND OFFICER',
    'TCB Center',
    'Technical',
    'THIRD ENGINEER',
    'THIRD OFFICER',
  ];

  const handleMenuPress = (route: string) => {
    setMenuVisible(false);

    if (route === 'Home') router.push('/(tabs)/Home' as any);
    if (route === 'About Us') router.push('/(tabs)/about' as any);
    if (route === 'Course') router.push('/(tabs)/courses' as any);
    if (route === 'How to Use') router.push('/(tabs)/how-to-use' as any);
    if (route === 'FAQ') router.push('/(tabs)/faq' as any);
    if (route === 'Contact Us') router.push('/(tabs)/contact' as any);
    if (route === 'Library') router.push('/(tabs)/library' as any);
    if (route === 'Terms & Conditions') router.push('/(tabs)/terms' as any);
    if (route === 'Report') router.push('/(tabs)/report' as any);

    if (route === 'Mess-room') alert(t('developing'));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <AppHeader />

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.breadcrumb}>
            
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={18} color="#fff" />
            <Text style={styles.backText}>{t('back')}</Text>
          </TouchableOpacity>

          <View style={styles.searchCard}>
            <View style={styles.searchHeader}>
              <View style={styles.searchTitleRow}>
                <Ionicons name="search" size={22} color="#fff" />
                <Text style={styles.searchTitle}>{t('search')}</Text>
              </View>
              <Ionicons name="chevron-down" size={26} color="#fff" />
            </View>

            <View style={styles.formBody}>
              <Text style={styles.label}>{t('department')}</Text>
              <CustomSelect
                value={department}
                open={openSelect === 'department'}
                options={[t('selectDepartment'), 'DECK DEPARTMENT', 'ENGINE DEPARTMENT']}
                onOpen={() => setOpenSelect(openSelect === 'department' ? null : 'department')}
                onSelect={(value) => {
                  setDepartment(value);
                  setOpenSelect(null);
                }}
              />

              <Text style={styles.label}>{t('position')}</Text>
              <CustomSelect
                value={position}
                open={openSelect === 'position'}
                options={positions}
                maxHeight={390}
                onOpen={() => setOpenSelect(openSelect === 'position' ? null : 'position')}
                onSelect={(value) => {
                  setPosition(value);
                  setOpenSelect(null);
                }}
              />

              <Text style={styles.label}>{t('chartType')}</Text>

              <View style={styles.checkboxRow}>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setChartType('column')} activeOpacity={0.8}>
                  <View style={[styles.checkbox, chartType === 'column' && { backgroundColor: PRIMARY, borderColor: PRIMARY }]} />
                  <Text style={styles.checkboxText}>{t('columnChart')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setChartType('pie')} activeOpacity={0.8}>
                  <View style={[styles.checkbox, chartType === 'pie' && { backgroundColor: PRIMARY, borderColor: PRIMARY }]} />
                  <Text style={styles.checkboxText}>{t('pieChart')}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>{t('age')}</Text>
              <TextInput
                style={styles.textInput}
                placeholder={t('from')}
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.textInput}
                placeholder={t('to')}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>{t('status')}</Text>
              <CustomSelect
                value={status}
                open={openSelect === 'status'}
                options={[t('status'), t('approved'), t('disapproved'), t('suspension')]}
                onOpen={() => setOpenSelect(openSelect === 'status' ? null : 'status')}
                onSelect={(value) => {
                  setStatus(value);
                  setOpenSelect(null);
                }}
              />

              <Text style={styles.label}>{t('startDate')}</Text>
              <TouchableOpacity
                style={styles.dateInput}
                activeOpacity={0.8}
                onPress={() => openDatePicker('start')}
              >
                <TextInput
                  value={startDate}
                  editable={false}
                  placeholder="DD-MM-YYYY"
                  placeholderTextColor="#999"
                  style={styles.dateText}
                />
                <Ionicons name="calendar" size={22} color={PRIMARY} />
              </TouchableOpacity>

              <Text style={styles.label}>{t('endDate')}</Text>
              <TouchableOpacity
                style={styles.dateInput}
                activeOpacity={0.8}
                onPress={() => openDatePicker('end')}
              >
                <TextInput
                  value={endDate}
                  editable={false}
                  placeholder="DD-MM-YYYY"
                  placeholderTextColor="#999"
                  style={styles.dateText}
                />
                <Ionicons name="calendar" size={22} color={PRIMARY} />
              </TouchableOpacity>


              <Text style={styles.label}>{t('fromYear')}</Text>
              <CustomSelect
                value={fromYear}
                open={openSelect === 'fromYear'}
                options={[t('selectFromYear'), '2021', '2022', '2023', '2024', '2025', '2026']}
                onOpen={() => setOpenSelect(openSelect === 'fromYear' ? null : 'fromYear')}
                onSelect={(value) => {
                  setFromYear(value);
                  setOpenSelect(null);
                }}
              />

              <Text style={styles.label}>{t('toYear')}</Text>
              <CustomSelect
                value={toYear}
                open={openSelect === 'toYear'}
                options={[t('selectToYear'), '2021', '2022', '2023', '2024', '2025', '2026']}
                onOpen={() => setOpenSelect(openSelect === 'toYear' ? null : 'toYear')}
                onSelect={(value) => {
                  setToYear(value);
                  setOpenSelect(null);
                }}
              />

              <TouchableOpacity style={[styles.searchBtn, isLoading && { opacity: 0.7 }]} activeOpacity={0.85} onPress={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="search" size={21} color="#fff" />
                )}
                <Text style={styles.searchBtnText}>{isLoading ? 'Searching...' : t('search')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.downLine}>
            <View style={styles.lineSide} />
            <Ionicons name="chevron-down" size={28} color="#9CA3AF" />
            <View style={styles.lineSide} />
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>{t('registerReportShipStaff')}</Text>
            {isLoading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={{ color: '#64748B', marginTop: 12, fontSize: 14 }}>Loading results...</Text>
              </View>
            ) : (
              <>
                {reportResults.length > 0 && (
                  <ReportChart
                    type={chartType}
                    title="Ship Staff Registration Chart"
                    data={
                      chartData.length > 0
                        ? chartData
                        : reportResults.slice(0, 6).map((item: any, idx: number) => ({
                            label: item.dept || item.department || `Staff ${idx + 1}`,
                            value: 1,
                          }))
                    }
                  />
                )}
                {reportResults.length === 0 ? (
                  <Text style={styles.noData}>{t('noDataFound')}</Text>
                ) : (
                  reportResults.map((item: any, idx: number) => (
                    <View key={idx} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16, color: PRIMARY }}>{item.name || `Staff #${item.id}`}</Text>
                      <Text style={{ color: '#555' }}>Dept: {item.dept || item.department || 'Deck'} | Pos: {item.pos || item.position || 'Staff'}</Text>
                      <Text style={{ color: '#777', fontSize: 12, marginTop: 2 }}>Registered: {item.registerDate || 'N/A'} | Status: {item.status || 'Approved'}</Text>
                    </View>
                  ))
                )}
              </>
            )}
          </View>

          <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 {t('footer')}</Text>
        </View>
        </ScrollView>

        <View
          style={[
            styles.crewFloating,
            showCrew ? styles.crewOpen : styles.crewClose,
          ]}
        >
          {showCrew && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/crew-complaint' as any)}
            >
              <Image source={crewButton} style={styles.crewImage} resizeMode="contain" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.toggleBtn}
            activeOpacity={0.85}
            onPress={() => setShowCrew(!showCrew)}
          >
            <Ionicons
              name={showCrew ? 'chevron-forward' : 'chatbubble-ellipses'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>


        {/* Scroll Date Picker Modal */}
        <Modal
          visible={dateModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDateModalVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 20 }}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setDateModalVisible(false)}
            />
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 20,
              elevation: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: PRIMARY }}>
                  {targetDateField === 'start' ? t('startDate') || 'Start Date' : t('endDate') || 'End Date'}
                </Text>
                <TouchableOpacity onPress={() => setDateModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={{
                backgroundColor: '#F1F5F9',
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 14,
                borderWidth: 1,
                borderColor: '#CBD5E1'
              }}>
                <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 2 }}>Selected Date (DD-MM-YYYY)</Text>
                <Text style={{ fontSize: 22, fontWeight: '800', color: PRIMARY, letterSpacing: 1 }}>
                  {selDay}-{selMonth}-{selYear}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 160, marginBottom: 16 }}>
                <View style={{ flex: 1, marginRight: 4, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, overflow: 'hidden' }}>
                  <View style={{ backgroundColor: PRIMARY, paddingVertical: 6, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Day (วัน)</Text>
                  </View>
                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                    {daysOptions.map(d => (
                      <TouchableOpacity
                        key={d}
                        style={{
                          paddingVertical: 8,
                          alignItems: 'center',
                          backgroundColor: selDay === d ? '#DBEAFE' : '#fff',
                          borderBottomWidth: 1,
                          borderBottomColor: '#F1F5F9',
                        }}
                        onPress={() => setSelDay(d)}
                      >
                        <Text style={{ fontSize: 15, fontWeight: selDay === d ? 'bold' : 'normal', color: selDay === d ? PRIMARY : '#333' }}>
                          {d}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={{ flex: 1, marginHorizontal: 2, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, overflow: 'hidden' }}>
                  <View style={{ backgroundColor: PRIMARY, paddingVertical: 6, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Month (เดือน)</Text>
                  </View>
                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                    {monthsOptions.map(m => (
                      <TouchableOpacity
                        key={m}
                        style={{
                          paddingVertical: 8,
                          alignItems: 'center',
                          backgroundColor: selMonth === m ? '#DBEAFE' : '#fff',
                          borderBottomWidth: 1,
                          borderBottomColor: '#F1F5F9',
                        }}
                        onPress={() => setSelMonth(m)}
                      >
                        <Text style={{ fontSize: 15, fontWeight: selMonth === m ? 'bold' : 'normal', color: selMonth === m ? PRIMARY : '#333' }}>
                          {m}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={{ flex: 1, marginLeft: 4, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, overflow: 'hidden' }}>
                  <View style={{ backgroundColor: PRIMARY, paddingVertical: 6, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Year (ปี)</Text>
                  </View>
                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                    {yearOptions.map(y => (
                      <TouchableOpacity
                        key={y}
                        style={{
                          paddingVertical: 8,
                          alignItems: 'center',
                          backgroundColor: selYear === y ? '#DBEAFE' : '#fff',
                          borderBottomWidth: 1,
                          borderBottomColor: '#F1F5F9',
                        }}
                        onPress={() => setSelYear(y)}
                      >
                        <Text style={{ fontSize: 15, fontWeight: selYear === y ? 'bold' : 'normal', color: selYear === y ? PRIMARY : '#333' }}>
                          {y}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 8,
                    backgroundColor: '#E2E8F0',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => setDateModalVisible(false)}
                >
                  <Text style={{ fontWeight: 'bold', color: '#475569' }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 8,
                    backgroundColor: PRIMARY,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    const formatted = `${selDay}-${selMonth}-${selYear}`;
                    if (targetDateField === 'start') {
                      setStartDate(formatted);
                    } else {
                      setEndDate(formatted);
                    }
                    setDateModalVisible(false);
                  }}
                >
                  <Text style={{ fontWeight: 'bold', color: '#fff' }}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"

          onRequestClose={() => setMenuVisible(false)}
        >
          <View style={styles.menuOverlay}>
            <TouchableOpacity
              style={styles.menuBackdrop}
              activeOpacity={1}
              onPress={() => setMenuVisible(false)}
            />

            <View style={styles.menuBox}>
              <Text style={styles.menuTitle}>{t('menu')}</Text>
              {menuList.map((item) => (
                <TouchableOpacity
                  key={item.route}
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(item.route)}
                >
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#64748B" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function CustomSelect({
  value,
  options,
  open,
  onOpen,
  onSelect,
  maxHeight = 210,
}: {
  value: string;
  options: string[];
  open: boolean;
  onOpen: () => void;
  onSelect: (value: string) => void;
  maxHeight?: number;
}) {
  return (
    <View style={styles.selectWrap}>
      <TouchableOpacity style={styles.selectBox} onPress={onOpen} activeOpacity={0.85}>
        <Text style={styles.selectText}>{value}</Text>
        <Ionicons name="chevron-down" size={20} color="#555" />
      </TouchableOpacity>

      {open && (
        <View style={[styles.optionBox, { maxHeight }]}> 
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
            {options.map((item, index) => (
              <TouchableOpacity
                key={`${item}-${index}`}
                style={[styles.optionItem, index === 0 && styles.optionFirst]}
                onPress={() => onSelect(item)}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 78,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 170,
    height: 52  },
  menuBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  breadcrumb: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbHome: {
    fontSize: 18,
    color: '#111',
  },
  breadcrumbSlash: {
    fontSize: 18,
    color: '#B7BBC3',
    marginHorizontal: 10,
  },
  breadcrumbCurrent: {
    fontSize: 18,
    color: '#6B7280',
    flex: 1,
  },
  backBtn: {
    marginLeft: 20,
    width: 112,
    height: 46,
    backgroundColor: BLUE,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  backText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
  },
  searchCard: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 18,
  },
  searchHeader: {
    height: 58,
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginLeft: 2,
  },
  formBody: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  selectWrap: {
    marginBottom: 12,
    zIndex: 20,
  },
  selectBox: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 5,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
    color: '#555',
  },
  optionBox: {
    borderWidth: 1,
    borderColor: '#777',
    backgroundColor: '#fff',
    marginTop: -1,
    zIndex: 999,
  },
  optionItem: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  optionFirst: {
    backgroundColor: '#B8E7F3',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#C9CED6',
    borderRadius: 3,
    marginRight: 8,
  },
  checkboxText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginRight: 18,
  },
  textInput: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 5,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  dateInput: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 5,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#555',
  },
  searchBtn: {
    width: 150,
    height: 52,
    backgroundColor: PRIMARY,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
    marginLeft: 4,
  },
  downLine: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lineSide: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  resultBox: {
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  resultTitle: {
    color: PRIMARY,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  noData: {
    fontSize: 17,
    color: '#777',
  },
  footer: {
    height: 44,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  crewFloating: {
    position: 'absolute',
    bottom: 95,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 20,
  },
  crewOpen: {
    right: 0,
  },
  crewClose: {
    right: -15,
  },
  crewImage: {
    width: 96,
    height: 138,
  },
  toggleBtn: {
    width: 38,
    height: 78,
    backgroundColor: PRIMARY,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  menuBox: {
    position: 'absolute',
    top: 95,
    right: 18,
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 10,
    elevation: 10,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: PRIMARY,
    paddingHorizontal: 22,
    paddingBottom: 10,
  },
  menuItem: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
  },
});
