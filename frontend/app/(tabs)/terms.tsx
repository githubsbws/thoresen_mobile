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
const TEXT = '#111827';
const MUTED = '#667085';
const BORDER = '#E4E8F0';

const logoImg = require('../../assets/images/banner/logo-new.png');

export default function TermsScreen() {
  const { t } = useTranslation();
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
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={16} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.heroCard}>
            <View>
              <Text style={styles.heroSmall}>THORESEN POLICY</Text>
              <Text style={styles.heroTitle}>{t('terms')}</Text>
              <Text style={styles.heroSub}>
                Please read the terms and conditions carefully before using this system.
              </Text>
            </View>

            <View style={styles.heroIcon}>
              <Ionicons name="document-text" size={30} color="#fff" />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.numBadge}>
                <Text style={styles.numText}>01</Text>
              </View>

              <Text style={styles.heading}>{t('termsHeading1')}</Text>
            </View>

            <Text style={styles.paragraph}>{t('termsParagraph1')}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.numBadge}>
                <Text style={styles.numText}>02</Text>
              </View>

              <Text style={styles.heading}>{t('termsHeading2')}</Text>
            </View>

            <Text style={styles.paragraph}>{t('termsParagraph2')}</Text>
          </View>

          <TouchableOpacity style={styles.acceptBtn}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.acceptText}>{t('accept')}</Text>
          </TouchableOpacity>
          
        </ScrollView>
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 {t('footer')}</Text>
        </View>


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

              {menuList.map(item => (
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 0,
  },
  backBtn: {
    marginTop: 12,
    width: 78,
    height: 34,
    borderRadius: 18,
    backgroundColor: PRIMARY,
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
    justifyContent: 'space-between',
  },

  heroSmall: {
    color: '#BFD0FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  heroTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 4,
  },

  heroSub: {
    color: '#E8EDFF',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 245,
  },

  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  card: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  numBadge: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  numText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: '900',
  },

  heading: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    color: TEXT,
    lineHeight: 22,
  },

  paragraph: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 21,
  },

  acceptBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 8,
    flexDirection: 'row',
    gap: 7,
  },

  acceptText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },

  footer: {
  height: 44,
  backgroundColor: PRIMARY,
  justifyContent: 'center',
  alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  footerText: {
    color: '#fff',
    fontSize: 10,
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
    top: 92,
    right: 16,
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 10,
    elevation: 10,
  },

  menuTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: PRIMARY,
    paddingHorizontal: 20,
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