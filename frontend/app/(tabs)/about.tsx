import React, { useEffect,useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Linking,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../src/components/AppHeader';
import { getAbout,AboutData } from '../../src/services/about';

const PRIMARY = '#001B74';
const RED = '#B00000';
const BG = '#F4F6FA';

const logo = require('../../assets/images/banner/logo-new.png');


export default function AboutScreen() {
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);
  const { width } = useWindowDimensions();

  const [about, setAbout] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAbout();
  }, []);

  const loadAbout = async () => {
    try {
      const data = await getAbout(1);

      setAbout(data.about);
    } catch (error) {
      console.log('ABOUT ERROR', error);
    } finally {
      setLoading(false);
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
    if (route === 'Mess-room') router.push('/(tabs)/Mess-room'as any);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.root}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppHeader />

          <View style={styles.card}>
            <View style={styles.heroWrap}>
              <View style={styles.redBlock} />

              <View style={styles.imageCard}>
                <Image
                  source={{
                    uri: 'https://thorconn.com/uploads/tiny_uploads/ABOUT%20US3.jpg',
                  }}
                  style={styles.shipImage}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.titleBox}>
                <Text style={styles.redTitle}>{t('aboutRedTitle')}</Text>
                <Text style={styles.blueTitle}>{t('learning')}</Text>
                <Text style={styles.blueTitle}>{t('organisation')}</Text>

                <Text style={styles.smallTitle}>
                  {t('aboutSmallTitle')}
                </Text>

                <View style={styles.decorRow}>
                  <View style={styles.decorFill} />
                  <View style={styles.decorBorder} />
                </View>
              </View>
            </View>

            <Text style={styles.imageCaption}>
              T H O R E S E N   E - L E A R N I N G
            </Text>

            {about?.detail && (
              <RenderHTML
                contentWidth={width - 64}
                source={{
                  html: about.detail,
                }}
                baseStyle={{
                  color: '#374151',
                  fontSize: 13,
                  lineHeight: 22,
                }}
              />
            )}
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
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.menuBox}>
              {menuList.map((item) => (
                <TouchableOpacity
                  key={item.route}
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(item.route)}
                >
                  <Text style={styles.menuText}>{item.label}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={PRIMARY}
                  />
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
    borderBottomColor: '#E5E7EB',
  },
  logo: {
    width: 170,
    height: 52,
  },
  headerActions: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},

headerIconBtn: {
  width: 36,
  height: 36,
  borderRadius: 10,
  backgroundColor: '#F3F6FB',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
},

notificationDot: {
  position: 'absolute',
  top: 8,
  right: 8,
  width: 7,
  height: 7,
  borderRadius: 4,
  backgroundColor: '#E30613',
  borderWidth: 1.5,
  borderColor: '#FFFFFF',
},

  breadcrumb: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 14,
    marginHorizontal: 18,
    marginBottom: 12,
    fontWeight: '700',
  },

  card: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7EAF0',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },

  heroWrap: {
    minHeight: 390,
    position: 'relative',
    alignItems: 'center',
    marginBottom: 4,
  },
  redBlock: {
    position: 'absolute',
    left: 0,
    top: 18,
    width: '58%',
    height: 215,
    backgroundColor: RED,
    borderRadius: 18,
  },
  imageCard: {
    position: 'absolute',
    left: 18,
    top: 48,
    width: '68%',
    height: 260,
    backgroundColor: '#fff',
    padding: 7,
    borderRadius: 18,
    zIndex: 2,
    elevation: 4,
  },
  shipImage: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
  },
  titleBox: {
    position: 'absolute',
    right: 0,
    top: 54,
    width: '40%',
    minHeight: 270,
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 8,
    zIndex: 3,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#EEF0F5',
  },

  redTitle: {
    fontSize: 16,
    color: '#E30613',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 14,
  },
  blueTitle: {
    fontSize: 17,
    color: PRIMARY,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  smallTitle: {
    marginTop: 22,
    fontSize: 10,
    color: PRIMARY,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 16,
  },

  decorRow: {
    marginTop: 20,
    width: 64,
    height: 32,
  },
  decorFill: {
    width: 44,
    height: 26,
    backgroundColor: RED,
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  decorBorder: {
    width: 44,
    height: 26,
    borderWidth: 1.5,
    borderColor: RED,
    borderRadius: 4,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },

  imageCaption: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 10,
    letterSpacing: 3,
    marginTop: -32,
    marginBottom: 18,
    fontWeight: '800',
  },

  mainText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 23,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'justify',
  },
  bold: {
    fontWeight: '900',
    color: PRIMARY,
  },
  link: {
    color: '#0066CC',
    textDecorationLine: 'underline',
    fontWeight: '800',
  },

  footer: {
    marginTop: 20,
    height: 38,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  footerText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 88,
    paddingRight: 18,
  },
  menuBox: {
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuText: {
    fontSize: 15,
    color: PRIMARY,
    fontWeight: '800',
  },
});
