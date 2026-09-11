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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AppHeader from '../src/components/AppHeader';
const PRIMARY = '#001B74';
const RED = '#E30613';

const logoImg = require('../assets/images/banner/logo-new.png');
const crewButton = require('../assets/images/crew-complaint/crew-icon.png');

type SelectKey = 'division' | 'department' | 'level' | 'status' | 'fromYear' | 'toYear' | null;

export default function ReportRegisterOfficeScreen() {
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showCrew, setShowCrew] = useState(false);
  const [openSelect, setOpenSelect] = useState<SelectKey>(null);

  const [division, setDivision] = useState(t('selectDivision'));
  const [department, setDepartment] = useState(t('selectDepartment'));
  const [level, setLevel] = useState(t('selectLevel'));
  const [status, setStatus] = useState(t('status'));
  const [fromYear, setFromYear] = useState(t('selectFromYear'));
  const [toYear, setToYear] = useState(t('selectToYear'));

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

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.breadcrumb}>
            
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={18} color="#fff" />
            <Text style={styles.backText}>{t('back')}</Text>
          </TouchableOpacity>

          <View style={styles.searchBox}>
            <View style={styles.searchHeader}>
              <View style={styles.searchTitleRow}>
                <Ionicons name="search" size={24} color="#fff" />
                <Text style={styles.searchTitle}>{t('search')}</Text>
              </View>
              <Ionicons name="chevron-down" size={28} color="#fff" />
            </View>

            <View style={styles.formBody}>
              <Text style={styles.label}>{t('division')}</Text>
              <CustomSelect
                value={division}
                open={openSelect === 'division'}
                options={[t('selectDivision'), 'Commercial', 'FIN & ACT', 'HR & ADM', 'IT', 'MOD', 'TCB Center']}
                onOpen={() => setOpenSelect(openSelect === 'division' ? null : 'division')}
                onSelect={(value) => { setDivision(value); setOpenSelect(null); }}
              />

              <Text style={styles.label}>{t('department')}</Text>
              <CustomSelect
                value={department}
                open={openSelect === 'department'}
                options={[t('selectDepartment'), 'ACT', 'ADM', 'BIU', 'Chartering', 'FIN', 'HR', 'Ins. & Clam', 'MAR', 'MOD Center', 'MPD', 'MTT', 'Operation', 'Procurement', 'QAS', 'TCB Center', 'Technical']}
                maxHeight={330}
                onOpen={() => setOpenSelect(openSelect === 'department' ? null : 'department')}
                onSelect={(value) => { setDepartment(value); setOpenSelect(null); }}
              />

              <Text style={styles.label}>{t('level')}</Text>
              <CustomSelect
                value={level}
                open={openSelect === 'level'}
                options={[t('selectLevel'), 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9']}
                onOpen={() => setOpenSelect(openSelect === 'level' ? null : 'level')}
                onSelect={(value) => { setLevel(value); setOpenSelect(null); }}
              />

              <Text style={styles.label}>{t('chartType')}</Text>
              <View style={styles.checkboxRow}>
                <View style={styles.checkbox} />
                <Text style={styles.checkboxText}>{t('columnChart')}</Text>
                <View style={styles.checkbox} />
                <Text style={styles.checkboxText}>{t('pieChart')}</Text>
              </View>

              <Text style={styles.label}>{t('startDate')}</Text>
              <View style={styles.dateInput}>
                <TextInput placeholder={t('startDate')} placeholderTextColor="#999" style={styles.input} />
                <Ionicons name="calendar" size={22} color="#333" />
              </View>

              <Text style={styles.label}>{t('endDate')}</Text>
              <View style={styles.dateInput}>
                <TextInput value="2032-05-02" style={styles.input} />
                <Ionicons name="calendar" size={22} color="#333" />
              </View>

              <Text style={styles.label}>{t('fromYear')}</Text>
              <CustomSelect
                value={fromYear}
                open={openSelect === 'fromYear'}
                options={[t('selectFromYear'), '2026', '2027', '2028', '2029', '2030', '2031', '2032']}
                onOpen={() => setOpenSelect(openSelect === 'fromYear' ? null : 'fromYear')}
                onSelect={(value) => { setFromYear(value); setOpenSelect(null); }}
              />

              <Text style={styles.label}>{t('toYear')}</Text>
              <CustomSelect
                value={toYear}
                open={openSelect === 'toYear'}
                options={[t('selectToYear'), '2026', '2027', '2028', '2029', '2030', '2031', '2032']}
                onOpen={() => setOpenSelect(openSelect === 'toYear' ? null : 'toYear')}
                onSelect={(value) => { setToYear(value); setOpenSelect(null); }}
              />

              <TouchableOpacity style={styles.searchBtn}>
                <Ionicons name="search" size={22} color="#fff" />
                <Text style={styles.searchBtnText}>{t('search')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.downLine}>
            <View style={styles.lineSide} />
            <Ionicons name="chevron-down" size={30} color="#999" />
            <View style={styles.lineSide} />
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>{t('registerReportOfficeStaff')}</Text>
            <Text style={styles.noData}>{t('noDataFound')}</Text>
          </View>
          <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 {t('footer')}</Text>
        </View>
        </ScrollView>

        <View style={[styles.crewFloating, showCrew ? styles.crewOpen : styles.crewClose]}>
          {showCrew && (
            <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/crew-complaint' as any)}>
              <Image source={crewButton} style={styles.crewImage} resizeMode="contain" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.toggleBtn} activeOpacity={0.85} onPress={() => setShowCrew(!showCrew)}>
            <Ionicons name={showCrew ? 'chevron-forward' : 'chatbubble-ellipses'} size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setMenuVisible(false)} />
            <View style={styles.menuBox}>
              <Text style={styles.menuTitle}>{t('menu')}</Text>
              {menuList.map((item) => (
                <TouchableOpacity key={item.route} style={styles.menuItem} onPress={() => handleMenuPress(item.route)}>
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

function CustomSelect({ value, options, open, onOpen, onSelect, maxHeight = 220 }: {
  value: string;
  options: string[];
  open: boolean;
  onOpen: () => void;
  onSelect: (value: string) => void;
  maxHeight?: number;
}) {
  return (
    <View style={styles.selectWrap}>
      <TouchableOpacity style={styles.selectBox} onPress={onOpen} activeOpacity={0.8}>
        <Text style={styles.selectText}>{value}</Text>
        <Ionicons name="chevron-down" size={20} color="#555" />
      </TouchableOpacity>
      {open && (
        <View style={[styles.optionBox, { maxHeight }]}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
            {options.map((item, index) => (
              <TouchableOpacity key={`${item}-${index}`} style={[styles.optionItem, index === 0 && styles.optionFirst]} onPress={() => onSelect(item)}>
                <Text style={[styles.optionText, index === 0 && styles.optionTextFirst]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff' },
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
  logo: { width: 170, height: 52  },
  menuBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },
  breadcrumb: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbDark: { fontSize: 18, color: '#111' },
  breadcrumbSlash: { fontSize: 18, color: '#bbb', marginHorizontal: 10 },
  breadcrumbGray: { fontSize: 18, color: '#6B7280', flex: 1 },
  backBtn: {
    marginLeft: 20,
    width: 112,
    height: 46,
    backgroundColor: '#1685E5',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  backText: { color: '#fff', fontSize: 19, fontWeight: '700' },
  searchBox: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    backgroundColor: '#fff',
    borderRadius: 4,
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
  searchTitleRow: { flexDirection: 'row', alignItems: 'center' },
  searchTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginLeft: 2 },
  formBody: { paddingHorizontal: 18, paddingVertical: 16, paddingBottom: 24 },
  label: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 8, marginTop: 10 },
  selectWrap: { marginBottom: 14, zIndex: 20 },
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
  selectText: { fontSize: 16, color: '#555' },
  optionBox: { borderWidth: 1, borderColor: '#777', backgroundColor: '#fff', marginTop: -1, zIndex: 999 },
  optionItem: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 20 },
  optionFirst: { backgroundColor: '#2168CC' },
  optionText: { fontSize: 16, color: '#333' },
  optionTextFirst: { color: '#fff', fontWeight: '700' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#C9CED6', borderRadius: 3, marginRight: 8 },
  checkboxText: { fontSize: 17, fontWeight: '700', color: '#333', marginRight: 18 },
  dateInput: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 5,
    paddingHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: { flex: 1, fontSize: 16, color: '#555' },
  searchBtn: {
    width: 140,
    height: 52,
    backgroundColor: PRIMARY,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontSize: 19, fontWeight: '700', marginLeft: 4 },
  downLine: { marginHorizontal: 20, marginTop: 18, marginBottom: 18, flexDirection: 'row', alignItems: 'center' },
  lineSide: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  resultBox: {
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  resultTitle: { color: PRIMARY, fontSize: 20, fontWeight: '900', marginBottom: 8 },
  noData: { fontSize: 17, color: '#777' },
  footer: { height: 44, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center' },
  footerText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  crewFloating: {
    position: 'absolute',
    bottom: 95,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  crewOpen: { right: 0 },
  crewClose: { right: -15 },
  crewImage: { width: 96, height: 138 },
  toggleBtn: {
    width: 38,
    height: 78,
    backgroundColor: PRIMARY,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
  menuBackdrop: { ...StyleSheet.absoluteFillObject },
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
  menuTitle: { fontSize: 20, fontWeight: '900', color: PRIMARY, paddingHorizontal: 22, paddingBottom: 10 },
  menuItem: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },
  menuItemText: { fontSize: 14, fontWeight: '700', color: PRIMARY },
});
