import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AppHeader from '../../src/components/AppHeader';

const PRIMARY = '#001B74';
const RED = '#E30613';
const BG = '#F4F6FA';

const menuList = [
  { label: 'Home', route: '/(tabs)/Home' },
  { label: 'About Us', route: '/(tabs)/about' },
  { label: 'Course', route: '/(tabs)/courses' },
  { label: 'How to Use', route: '/(tabs)/how-to-use' },
  { label: 'FAQ', route: '/(tabs)/faq' },
  { label: 'Contact Us', route: '/(tabs)/contact' },
  { label: 'Mess-room', route: '/(tabs)/Mess-room' },
  { label: 'Library', route: '/(tabs)/library' },
  { label: 'Terms & Conditions', route: '/(tabs)/terms' },
  { label: 'Report', route: '/(tabs)/report' },
];

const usabilityItems = [
  {
    id: '1',
    title: 'How to register Thoresen E-Learning system for Ship Staff',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900',
    pdfUrl:
      'https://thorconn.com/uploads/tiny_uploads/How%20to%20register%20Thoresen%20E-Learning%20system_Ship%20Staff.pdf',
  },
  {
    id: '2',
    title: 'How to register Thoresen E-Learning system for office Staff',
    image: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=900',
    pdfUrl:
      'https://thorconn.com/uploads/tiny_uploads/How%20to%20register%20Thoresen%20E-Learning%20system_Office%20Staff.pdf',
  },
  {
    id: '3',
    title: 'How to submit Crew Complaint Chanel',
    image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=900',
    pdfUrl:
      'https://www.thorconn.com/uploads/tiny_uploads/Manual/How%20To%20Submit%20Crew%20Complaint%20Chanel.pdf',
  },
  {
    id: '4',
    title: 'How to Reprint Your Certificate',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900',
    pdfUrl:
      'https://www.thorconn.com/uploads/tiny_uploads/Manual/How%20To%20Reprint%20Your%20Certificate.pdf',
  },
  {
    id: '5',
    title: 'How to Create A New Password',
    image: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=900',
    pdfUrl:
      'https://thorconn.com/uploads/tiny_uploads/Manual/HOW%20TO%20CREATE%20A%20NEW%20PASSWORD.pdf',
  },
];

export default function HowToUseScreen() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const filteredItems = usabilityItems.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const featured = filteredItems[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader />

        <View style={styles.content}>
          

          <View style={styles.heroCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroSmall}>THORESEN GUIDE</Text>
              <Text style={styles.heroTitle}>How to Use</Text>
              <Text style={styles.heroText}>
                คู่มือการใช้งานระบบ e-Learning สำหรับพนักงานเรือและพนักงานออฟฟิศ
              </Text>
            </View>

            <View style={styles.heroIcon}>
              <Ionicons name="book" size={28} color="#fff" />
            </View>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#98A2B3" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search manual..."
              placeholderTextColor="#98A2B3"
              style={styles.searchInput}
            />
          </View>

          {featured && (
            <TouchableOpacity
              style={styles.mainCard}
              activeOpacity={0.85}
              onPress={() => setSelected(featured)}
            >
              <Image source={{ uri: featured.image }} style={styles.mainImage} />

              <View style={styles.mainOverlay}>
                <Text style={styles.mainBadge}>FEATURED GUIDE</Text>
                <Text style={styles.mainTitle} numberOfLines={2}>
                  {featured.title}
                </Text>
                <View style={styles.openRow}>
                  <Text style={styles.openSmall}>Tap to open PDF</Text>
                  <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.sectionRow}>
            <View>
              <Text style={styles.sectionTitle}>Manual List</Text>
              <Text style={styles.sectionSub}>เอกสารคู่มือทั้งหมด</Text>
            </View>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>{filteredItems.length}</Text>
            </View>
          </View>

          <View style={styles.grid}>
            {filteredItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => setSelected(item)}
              >
                <Image source={{ uri: item.image }} style={styles.cardImage} />

                <View style={styles.pdfBadge}>
                  <Ionicons name="document-text" size={12} color="#fff" />
                  <Text style={styles.pdfText}>PDF</Text>
                </View>

                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                <View style={styles.cardBottom}>
                  <Text style={styles.cardSub}>Open manual</Text>
                  <Ionicons name="chevron-forward" size={15} color={PRIMARY} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Thoresen e-Learning</Text>
        </View>
      </ScrollView>

      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            style={styles.menuBackdrop}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />

          <View style={styles.menuBox}>
            <Text style={styles.menuTitle}>Menu</Text>

            {menuList.map(item => (
              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push(item.route as any);
                }}
              >
                <Text style={styles.menuItemText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#64748B" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={!!selected} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSelected(null)}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="document-text" size={42} color="#fff" />
            </View>

            <Text style={styles.modalTitle}>Open Manual</Text>

            <Text style={styles.modalDesc}>{selected?.title}</Text>

            <TouchableOpacity
              style={styles.openBtn}
              onPress={() => {
                if (selected?.pdfUrl) {
                  Linking.openURL(selected.pdfUrl);
                  setSelected(null);
                } else {
                  alert('ไม่พบไฟล์ PDF');
                }
              }}
            >
              <Text style={styles.openBtnText}>Open PDF</Text>
              <Ionicons name="open-outline" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelected(null)}
            >
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
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

  content: {
    padding: 14,
  },

  breadcrumb: {
    fontSize: 10,
    color: '#667085',
    marginBottom: 12,
  },

  heroCard: {
    backgroundColor: PRIMARY,
    borderRadius: 20,
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
    fontSize: 27,
    fontWeight: '900',
    marginTop: 5,
  },

  heroText: {
    color: '#E8EDFF',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },

  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  searchBox: {
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E8F0',
    marginBottom: 14,
  },

  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#111',
    marginLeft: 8,
  },

  mainCard: {
    height: 190,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#ddd',
    marginBottom: 18,
  },

  mainImage: {
    width: '100%',
    height: '100%',
  },

  mainOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 15,
    backgroundColor: 'rgba(0,27,116,0.74)',
  },

  mainBadge: {
    alignSelf: 'flex-start',
    backgroundColor: RED,
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },

  mainTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 21,
  },

  openRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  openSmall: {
    color: '#E8EDFF',
    fontSize: 10,
    fontWeight: '700',
  },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    color: PRIMARY,
    fontSize: 20,
    fontWeight: '900',
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
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E4E8F0',
  },

  cardImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
  },

  pdfBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: RED,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  pdfText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  },

  cardTitle: {
    fontSize: 11,
    color: '#111827',
    fontWeight: '900',
    lineHeight: 15,
    marginTop: 9,
    minHeight: 32,
  },

  cardBottom: {
    marginTop: 7,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardSub: {
    color: '#667085',
    fontSize: 9,
    fontWeight: '700',
  },

  footer: {
    height: 42,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  footerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
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

  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'flex-end',
    paddingTop: 92,
    paddingRight: 16,
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
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 26,
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },

  modalIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: PRIMARY,
    marginBottom: 8,
  },

  modalDesc: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },

  openBtn: {
    width: '100%',
    height: 46,
    backgroundColor: PRIMARY,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  openBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },

  closeBtn: {
    marginTop: 10,
    height: 40,
    justifyContent: 'center',
  },

  closeText: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '800',
  },
});