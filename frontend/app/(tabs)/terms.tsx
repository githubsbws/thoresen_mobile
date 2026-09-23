import React, { useState } from 'react';
import {
  View,
  Text,
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
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={16} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <Text style={styles.heroSmall}>THORESEN POLICY</Text>
              <Text style={styles.heroTitle}>{t('terms')}</Text>
              <Text style={styles.heroSub}>
                Please read the terms and conditions carefully before using this system.
              </Text>
            </View>

            <View style={styles.heroIcon}>
              <Ionicons name="document-text" size={28} color="#fff" />
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

          <TouchableOpacity
            style={styles.acceptBtn}
            activeOpacity={0.85}
            onPress={() => router.back()}
          >
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

              {menuList.map((item) => (
                <TouchableOpacity
                  key={item.route}
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(item.route)}
                >
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#64748B" />
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
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  backBtn: {
    width: 76,
    height: 32,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  backText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 3,
  },
  heroCard: {
    backgroundColor: PRIMARY,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  heroContent: {
    flex: 1,
    paddingRight: 10,
  },
  heroSmall: {
    color: '#BFD0FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  heroSub: {
    color: '#E8EDFF',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  numBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
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
    fontSize: 15,
    fontWeight: '900',
    color: TEXT,
    lineHeight: 20,
  },
  paragraph: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 20,
  },
  acceptBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    flexDirection: 'row',
    gap: 8,
  },
  acceptText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  footer: {
    height: 40,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
    ...StyleSheet.absoluteFill,
  },
  menuBox: {
    position: 'absolute',
    top: 92,
    right: 16,
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 10,
    elevation: 10,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: PRIMARY,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  menuItem: {
    paddingHorizontal: 18,
    paddingVertical: 13,
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