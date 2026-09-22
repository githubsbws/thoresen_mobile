import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../src/components/AppHeader';
const PRIMARY = '#001B74';
const RED = '#E30613';
const BG = '#F4F6FA';

const logoImg = require('../../assets/images/banner/logo-new.png');

const img1 = 'https://thorconn.com/themes/template2/images/report-item-1.png';
const img2 = 'https://thorconn.com/themes/template2/images/report-item-2.png';
const img3 = 'https://thorconn.com/themes/template2/images/report-item-3.png';
const img4 = 'https://thorconn.com/themes/template2/images/report-item-4.png';
const img5 = 'https://thorconn.com/themes/template2/images/report-item-5.png';
const img6 = 'https://thorconn.com/themes/template2/images/report-item-6.png';
const img7 = 'https://thorconn.com/themes/template2/images/report-item-7.png';
const img8 = 'https://thorconn.com/themes/template2/images/report-item-8.png';
const img9 = 'https://thorconn.com/themes/template2/images/report-item-9.png';
const img10 = 'https://thorconn.com/themes/template2/images/report-item-10.png';

type TabType = 'register' | 'training' | 'evaluation';

type ReportItem = {
  title: string;
  image: string;
  route: string;
};

export default function ReportScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('register');
  const [menuVisible, setMenuVisible] = useState(false);

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

  const data: Record<TabType, ReportItem[]> = {
    register: [
      {
        title: t('overviewRegisterReport'),
        image: img1,
        route: '/report-overview',
      },
      {
        title: t('registerReportShipStaff'),
        image: img2,
        route: '/report-register',
      },
      {
        title: t('registerReportOfficeStaff'),
        image: img3,
        route: '/report-register-office',
      },
    ],
    training: [
      {
        title: t('overviewTrainingCourseReport'),
        image: img4,
        route: '/report-training-overview',
      },
      {
        title: t('trainingCourseShipStaff'),
        image: img5,
        route: '/report-training-ship',
      },
      {
        title: t('trainingCourseOfficeStaff'),
        image: img6,
        route: '/report-training-office',
      },
      {
        title: t('trainingEvaluationReport'),
        image: img7,
        route: '/report-test-overview',
      },
      {
        title: t('overviewTestReport'),
        image: img8,
        route: '/report-test-ship',
      },
      {
        title: t('testResultShipStaff'),
        image: img9,
        route: '/report-test-ship',
      },
    ],
    evaluation: [
      {
        title: t('testResultOfficeStaff'),
        image: img10,
        route: '/report-evaluation',
      },
    ],
  };

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

    if (route === 'Mess-room') {
      alert(t('developing'));
    }
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
          <View style={styles.hero}>
            <View>
              <Text style={styles.heroSmall}>THORESEN E-LEARNING</Text>
              <Text style={styles.heroTitle}>Report Center</Text>
              <Text style={styles.heroDesc}>
                View registration, training and evaluation reports.
              </Text>
            </View>

            <View style={styles.heroIconBox}>
              <Ionicons name="bar-chart" size={42} color="#fff" />
            </View>
          </View>

          <View style={styles.tabs}>
            <TabButton
              icon="document-text-outline"
              title={t('registerReport')}
              active={activeTab === 'register'}
              onPress={() => setActiveTab('register')}
            />

            <TabButton
              icon="school-outline"
              title={t('trainingReport')}
              active={activeTab === 'training'}
              onPress={() => setActiveTab('training')}
            />

            <TabButton
              icon="analytics-outline"
              title={t('trainingEvaluationReport')}
              active={activeTab === 'evaluation'}
              onPress={() => setActiveTab('evaluation')}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('report')}</Text>
            <Text style={styles.sectionCount}>{data[activeTab].length} Items</Text>
          </View>

          <View style={styles.cardWrap}>
            {data[activeTab].map((item, index) => (
              <ReportCard
                key={`${item.title}-${index}`}
                title={item.title}
                image={item.image}
                onPress={() => router.push(item.route as any)}
              />
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 {t('footer')}</Text>
          </View>
        </ScrollView>


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
              <View style={styles.menuHead}>
                <Text style={styles.menuTitle}>{t('menu')}</Text>

                <TouchableOpacity onPress={() => setMenuVisible(false)}>
                  <Ionicons name="close" size={24} color={PRIMARY} />
                </TouchableOpacity>
              </View>

              {menuList.map((item) => (
                <TouchableOpacity
                  key={item.route}
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(item.route)}
                  activeOpacity={0.8}
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

function TabButton({
  icon,
  title,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tabBtn, active && styles.tabBtnActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons
        name={icon}
        size={21}
        color={active ? '#fff' : PRIMARY}
        style={styles.tabIcon}
      />

      <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function ReportCard({
  title,
  image,
  onPress,
}: {
  title: string;
  image: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.reportCard}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <View style={styles.imageBox}>
        <Image source={{ uri: image }} style={styles.reportImg} resizeMode="contain" />
      </View>

      <View style={styles.cardBottom}>
        <View style={styles.cardTextBox}>
          <Text style={styles.reportTitle}>{title}</Text>
          <Text style={styles.reportSub}>Tap to view report details</Text>
        </View>

        <View style={styles.arrowBox}>
          <Ionicons name="arrow-forward" size={22} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    height: 78,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logo: {
    width: 170,
    height: 52,
  },
  menuBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingBottom: 0,
    flexGrow: 1,
  },

  hero: {
    marginHorizontal: 18,
    marginTop: 20,
    padding: 22,
    borderRadius: 26,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroSmall: {
    color: '#BFD1FF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 31,
    fontWeight: '900',
    marginBottom: 8,
  },
  heroDesc: {
    color: '#E7EEFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    maxWidth: 220,
  },
  heroIconBox: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    marginTop: 18,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    minHeight: 76,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E4E8F0',
    elevation: 2,
  },
  tabBtnActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  tabIcon: {
    marginBottom: 5,
  },
  tabText: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 16,
  },
  tabTextActive: {
    color: '#fff',
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '800',
    color: RED,
    backgroundColor: '#FFE8EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  cardWrap: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    gap: 18,
  },
  reportCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7EAF0',
    elevation: 3,
  },
  imageBox: {
    height: 165,
    borderRadius: 20,
    backgroundColor: '#F8FAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  reportImg: {
    width: 210,
    height: 135,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTextBox: {
    flex: 1,
    paddingRight: 12,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 25,
  },
  reportSub: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '700',
    color: '#7A8494',
  },
  arrowBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    height: 38,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuBox: {
    position: 'absolute',
    top: 95,
    right: 18,
    width: 290,
    maxHeight: '78%',
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 10,
    elevation: 12,
  },
  menuHead: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: PRIMARY,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '800',
    color: PRIMARY,
  },

content: {
  flex: 1,
},
});
