import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AppHeader from '../../src/components/AppHeader';

const PRIMARY = '#001B74';
const RED = '#E30613';
const BLUE = '#0B63CE';
const BG = '#FFFFFF';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const SOFT_BLUE = '#EEF7FF';

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
  'Report',
];

export default function MessRoomScreen() {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleMenuPress = (item: string) => {
    setMenuVisible(false);

    if (item === 'Home') router.push('/(tabs)/Home' as any);
    if (item === 'About Us') router.push('/(tabs)/about' as any);
    if (item === 'Course') router.push('/(tabs)/courses' as any);
    if (item === 'Library') router.push('/(tabs)/library' as any);
    if (item === 'How to Use') router.push('/(tabs)/how-to-use' as any);
    if (item === 'FAQ') router.push('/(tabs)/faq' as any);
    if (item === 'Mess-room') router.push('/(tabs)/mess-room' as any);
    if (item === 'Terms & Conditions') router.push('/(tabs)/terms' as any);
    if (item === 'Report') router.push('/(tabs)/report' as any);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.root}>
        <AppHeader />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          



          <View style={styles.pageBox}>
            <Text style={styles.pageTitle}>Virtual Classroom</Text>

            <Text style={styles.pageSubtitle}>
              Includes a list of virtual classrooms that are currently online
            </Text>

            <View style={styles.serverCard}>
              <View style={styles.serverIcon}>
                <Ionicons name="cloud-offline-outline" size={46} color="#fff" />
              </View>

              <Text style={styles.serverTitle}>
                Unable to contact Streaming Server.
              </Text>

              <Text style={styles.serverDesc}>
                Please check your connection or try again later.
              </Text>

              <TouchableOpacity style={styles.refreshBtn}>
                <Ionicons name="refresh" size={17} color="#fff" />
                <Text style={styles.refreshText}>Refresh</Text>
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
              {menuList.map((item) => (
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
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },

  topHeader: {
    height: 105,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 170,
    height: 72,
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

  pageBox: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 38,
  },
  pageTitle: {
    fontSize: 26,
    color: TEXT,
    fontWeight: '900',
    marginBottom: 8,
  },
  pageSubtitle: {
    color: TEXT,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 78,
  },

  serverCard: {
    minHeight: 230,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  serverIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  serverTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  serverDesc: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 18,
  },
  refreshBtn: {
    height: 42,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 18,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 7,
  },

  footer: {
    backgroundColor: PRIMARY,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
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