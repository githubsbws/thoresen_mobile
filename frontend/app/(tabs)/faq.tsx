import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AppHeader from '../../src/components/AppHeader';
import { useLanguage } from '../../src/context/LanguageContext';
import FAQItem from '../../src/components/FAQItem';
import {
  getFaq,
  FAQItemData,
} from '../../src/services/faq';

const PRIMARY = '#001B74';
const RED = '#E30613';
const BG = '#F4F6FA';
const BORDER = '#E4E8F0';

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

export default function FAQScreen() {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const [faqData, setFaqData] = useState<FAQItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const { lang, toggleLang } = useLanguage();

  const handleMenuPress = (item: string) => {
    setMenuVisible(false);

    if (item === 'Home') router.push('/(tabs)/Home' as any);
    if (item === 'About Us') router.push('/(tabs)/about' as any);
    if (item === 'Course') router.push('/(tabs)/courses' as any);
    if (item === 'How to Use') router.push('/(tabs)/how-to-use' as any);
    if (item === 'FAQ') router.push('/(tabs)/faq' as any);
    if (item === 'Library') router.push('/(tabs)/library' as any);
    if (item === 'Terms & Conditions') router.push('/(tabs)/terms' as any);
    if (item === 'Report') router.push('/(tabs)/report' as any);
    if (item === 'Mess-room') router.push('/(tabs)/Mess-room' as any);
    if (item === 'Contact Us') router.push('/(tabs)/contact' as any);
    
  };
  useEffect(() => {
    loadFaq();
  }, [lang]);

  const loadFaq = async () => {
    try {
      setLoading(true);

      const langId = lang === 'en' ? 2 : 1;

      const data = await getFaq(langId);

      setFaqData(data.faqs);
      setOpenIndex(
        data.faqs.length > 0 ? 0 : null,
      );
    } catch (error) {
      console.log('FAQ ERROR', error);
    } finally {
      setLoading(false);
    }
  };
  const filteredFaq = useMemo(() => {
    const text = search.toLowerCase().trim();
    if (!text) return faqData;

    return faqData.filter(item =>
      item.category.toLowerCase().includes(text) ||
      (item.question ?? '').toLowerCase().includes(text) ||
      (item.answer ?? '').toLowerCase().includes(text)
    );
  }, [search, faqData]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.page}>
        <AppHeader />
        
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.pageBox}>
              <View style={styles.heroCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroSmall}>THORESEN SUPPORT</Text>
                  <Text style={styles.heroTitle}>
                    {lang === 'en' ? 'FAQ' : 'คำถามที่พบบ่อย'}
                  </Text>
                  <Text style={styles.heroDesc}>
                    {lang === 'en'
                      ? 'Find answers about courses, login, registration and more.'
                      : 'ค้นหาคำตอบเกี่ยวกับคอร์สเรียน การเข้าสู่ระบบ การสมัครสมาชิก และอื่น ๆ'}
                  </Text>
                </View>

                <View style={styles.heroIcon}>
                  <Ionicons name="help-buoy" size={30} color="#fff" />
                </View>
              </View>

              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={19} color="#98A2B3" />

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder={lang === 'en' ? 'Search FAQ...' : 'ค้นหาคำถาม...'}
                  placeholderTextColor="#98A2B3"
                  style={styles.searchInput}
                />

                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={20} color="#98A2B3" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.sectionRow}>
                <View>
                  <Text style={styles.sectionTitle}>
                    {lang === 'en' ? 'Question and Answer' : 'รายการคำถามที่พบบ่อย'}
                  </Text>
                  <Text style={styles.sectionSub}>
                    {lang === 'en' ? 'Tap each item to view answer' : 'แตะเพื่อดูคำตอบ'}
                  </Text>
                </View>

                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{filteredFaq.length}</Text>
                </View>
              </View>

              {filteredFaq.length > 0 ? (
                <View style={styles.faqList}>
                  {filteredFaq.map((item, index) => (
                    <FAQItem
                      key={`${item.category}-${index}`}
                      category={item.category}
                      question={item.question}
                      answer={item.answer}
                      isOpen={openIndex === index}
                      onPress={() =>
                        setOpenIndex(
                          openIndex === index
                            ? null
                            : index
                        )
                      }
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyBox}>
                  <Ionicons name="search-outline" size={42} color="#CBD5E1" />
                  <Text style={styles.emptyTitle}>
                    {lang === 'en' ? 'No FAQ Found' : 'ไม่พบคำถาม'}
                  </Text>
                  <Text style={styles.emptyText}>
                    {lang === 'en'
                      ? 'Try searching with another keyword.'
                      : 'ลองค้นหาด้วยคำอื่นอีกครั้ง'}
                  </Text>
                </View>
              )}
            </View> 
            <View style={styles.footer}>
              <Text style={styles.footerText}>© 2026 Thoresen e-Learning</Text>
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
              <Text style={styles.menuTitle}>Menu</Text>

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
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  page: {
    flex: 1,
    backgroundColor: BG,
    position: 'relative',
  },

  header: {
    height: 78,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logo: {
    width: 170,
    height: 52,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  langBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  langText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
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

  pageBox: 
  {
    display: 'flex',
    flex: 1,
    padding: 10,

  },

  scroll: {
    flex: 1,
  },

  content: {

    paddingBottom: 0,
  },

  breadcrumb: {
    fontSize: 10,
    color: '#667085',
    marginBottom: 12,
  },

  heroCard: {
    backgroundColor: PRIMARY,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  heroSmall: {
    color: '#BFD0FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },

  heroDesc: {
    color: '#E8EDFF',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
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

  searchBox: {
    height: 46,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: PRIMARY,
  },

  sectionSub: {
    color: '#777',
    fontSize: 11,
    marginTop: 2,
  },

  countBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '900',
  },

  faqList: {
    gap: 10,
  },

  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 42,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
  },

  emptyText: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
  },

  footer: {
    height: 38,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '100%',
  },

  footerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'flex-end',
    paddingTop: 92,
    paddingRight: 16,
  },

  menuBox: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 10,
    elevation: 8,
  },

  menuTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: PRIMARY,
    paddingHorizontal: 18,
    paddingBottom: 10,
  },

  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },

  menuText: {
    fontSize: 15,
    color: PRIMARY,
    fontWeight: '700',
  },
});