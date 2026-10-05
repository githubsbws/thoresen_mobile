import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import AppHeader from '../../src/components/AppHeader';
import { newsList, NewsItem } from '../../src/data/news';
import { API_BASE_URL } from '../../src/services/api';

// ============================================================================
// THEME
// ============================================================================

const PRIMARY = '#001B74';
const RED = '#E30613';
const BG = '#F4F6FA';

// รูป fallback สำหรับตอนที่ข่าวไม่มี cms_picture (image เป็น null จาก backend)
// กันไม่ให้ <Image> พังตอน uri เป็น null/undefined
const PLACEHOLDER_IMAGE =
  'https://placehold.co/600x400/DDE1E8/768095?text=No+Image';

// ============================================================================
// MENU
// ============================================================================

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

// ============================================================================
// COMPONENT
// ============================================================================

export default function NewsScreen() {
  // --------------------------------------------------------------------------
  // UI State
  // --------------------------------------------------------------------------

  const [menuVisible, setMenuVisible] = useState(false);

  // --------------------------------------------------------------------------
  // Data State
  //
  //
  // เมื่อเชื่อม API จริง:
  //  เปิด useEffect ด้านล่าง
  // --------------------------------------------------------------------------

  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // ==========================================================================
  // API: FETCH NEWS
  // ==========================================================================
  
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // --------------------------------------------------------------------
        // TODO: เปิดใช้งานเมื่อ Backend API พร้อม 
        //
        // หมายเหตุ: path จริงของ backend คือ /v1/news (ไม่ใช่ /api/v1/news)
        // เพราะ main.ts ตั้ง app.setGlobalPrefix('v1') ไว้ ให้เช็คให้ตรงกันเสมอ
        //
        // # URL เก็บใน env variable 
        // 
        // --------------------------------------------------------------------
        //
        const API_URL = API_BASE_URL;
        const response = await fetch(`${API_URL}/news`);
        
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const result = await response.json();

        console.log('========== NEWS API DEBUG ==========');
        console.log('NEWS API URL:', `${API_URL}/news`);
        console.log('NEWS API STATUS:', response.status);
        console.log('NEWS API SUCCESS:', result.success);
        console.log('NEWS API DATA COUNT:', result.data?.length);

        result.data?.forEach((item: NewsItem, index: number) => {
          console.log(`NEWS [${index}]`);
          console.log('  id:', item.id);
          console.log('  title:', item.title);
          console.log('  image:', item.image);
        });
        
        if (!result.success) {
          throw new Error('Unable to load news data');
        }
        
        setNewsData(result.data);
        
      } catch (err) {
        console.error('Fetch News Error:', err);

        setError('ไม่สามารถโหลดข้อมูลข่าวสารได้');


      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  // ==========================================================================
  // PREPARE DATA FOR UI
  // ==========================================================================

  /**
   * ข่าวตัวแรกใช้เป็น Hero News
   */
  const mainNews = newsList[0];

  /**
   * ข่าวที่เหลือใช้แสดงใน Latest News
   */
  const otherNews = newsData.slice(1);

  // ==========================================================================
  // LOADING STATE
  // ==========================================================================

  if (isLoading && newsData.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={PRIMARY} />

          <Text style={styles.stateText}>
            กำลังโหลดข่าวสาร...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================================
  // EMPTY STATE
  // ==========================================================================

  if (!mainNews) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader />

        <View style={styles.centerState}>
          <Ionicons
            name="newspaper-outline"
            size={56}
            color="#A0A8B8"
          />

          <Text style={styles.emptyTitle}>
            No news available
          </Text>

          <Text style={styles.emptyText}>
            ยังไม่มีข้อมูลข่าวสารในขณะนี้
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================================
  // MAIN UI
  // ==========================================================================

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================================
            HEADER
        ================================================================= */}

        <AppHeader />

        <View style={styles.content}>

          {/* ==============================================================
              API ERROR
          ================================================================= */}

          {error && (
            <View style={styles.errorBox}>
              <Ionicons
                name="warning-outline"
                size={20}
                color={RED}
              />

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}

          {/* ==============================================================
              HERO NEWS
          ================================================================= */}

          <TouchableOpacity
            style={styles.heroCard}
            activeOpacity={0.9}
            onPress={() =>
              router.push(`/news/${mainNews.id}` as any)
            }
          >
            <Image
              source={{ uri: mainNews.image || PLACEHOLDER_IMAGE }}
              style={styles.heroImage}
            />

            <View style={styles.heroOverlay}>

              <Text style={styles.heroBadge}>
                {mainNews.category}
              </Text>

              <Text style={styles.heroTitle}>
                {mainNews.title}
              </Text>

              <Text
                style={styles.heroDetail}
                numberOfLines={2}
              >
                {mainNews.detail}
              </Text>

              <View style={styles.heroBottom}>
                <Text style={styles.heroDate}>
                  {mainNews.date}
                </Text>

                <View style={styles.readMoreRow}>
                  <Text style={styles.readMoreText}>
                    Read more
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color="#fff"
                  />
                </View>
              </View>

            </View>
          </TouchableOpacity>

          {/* ==============================================================
              ABOUT NEWS
          ================================================================= */}

          <View style={styles.aboutBox}>
            <Text style={styles.aboutTitle}>
              Thoresen News & Updates
            </Text>

            <Text style={styles.aboutText}>
              Stay updated with company announcements,
              training courses, safety news, and learning
              activities from THORESEN e-Learning.
            </Text>
          </View>

          {/* ==============================================================
              LATEST NEWS HEADER
          ================================================================= */}

          <View style={styles.sectionRow}>
            <View>
              <Text style={styles.sectionTitle}>
                Latest News
              </Text>

              <Text style={styles.sectionSub}>
                ข่าวสารและประกาศล่าสุด
              </Text>
            </View>
          </View>

          {/* ==============================================================
              NEWS LIST
          ================================================================= */}

          <View style={styles.newsList}>
            {otherNews.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.newsCard}
                activeOpacity={0.85}
                onPress={() =>
                  router.push(`/news/${item.id}` as any)
                }
              >
                {/* News Image */}

                <Image
                  source={{ uri: item.image || PLACEHOLDER_IMAGE }}
                  style={styles.newsImage}
                />

                {/* News Content */}

                <View style={styles.newsContent}>

                  <View style={styles.newsTop}>
                    <Text style={styles.newsCategory}>
                      {item.category}
                    </Text>

                    <Text style={styles.newsDate}>
                      {item.date}
                    </Text>
                  </View>

                  <Text
                    style={styles.newsTitle}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>

                  <View style={styles.newsBottom}>
                    <Text
                      style={styles.newsDetail}
                      numberOfLines={2}
                    >
                      {item.detail}
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={PRIMARY}
                    />
                  </View>

                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* ==============================================================
              QUOTE
          ================================================================= */}

          <View style={styles.quoteCard}>
            <Ionicons
              name="school-outline"
              size={24}
              color={PRIMARY}
            />

            <Text style={styles.quoteText}>
              “Learn well, grow well” is one of our core
              values. We aim to encourage staff learning
              and development within our organization.
            </Text>
          </View>

        </View>

        {/* ================================================================
            FOOTER
        ================================================================= */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 Thoresen e-Learning
          </Text>
        </View>

      </ScrollView>

      {/* ==================================================================
          MENU MODAL
      =================================================================== */}

      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.menuOverlay}>

          {/* Click outside to close */}

          <TouchableOpacity
            style={styles.menuBackdrop}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />

          {/* Menu */}

          <View style={styles.menuBox}>
            <Text style={styles.menuTitle}>
              Menu
            </Text>

            {menuList.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);

                  router.push(item.route as any);
                }}
              >
                <Text style={styles.menuItemText}>
                  {item.label}
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            ))}
          </View>

        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  content: {
    padding: 14,
  },

  // --------------------------------------------------------------------------
  // Loading / Empty / Error
  // --------------------------------------------------------------------------

  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  stateText: {
    marginTop: 12,
    color: '#596174',
    fontSize: 14,
  },

  emptyTitle: {
    marginTop: 14,
    color: PRIMARY,
    fontSize: 20,
    fontWeight: '900',
  },

  emptyText: {
    marginTop: 6,
    color: '#596174',
    fontSize: 13,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFD5D5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  errorText: {
    flex: 1,
    color: RED,
    fontSize: 12,
    fontWeight: '700',
  },

  // --------------------------------------------------------------------------
  // Hero News
  // --------------------------------------------------------------------------

  heroCard: {
    height: 210,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#DDD',
    marginBottom: 14,
  },

  heroImage: {
    width: '100%',
    height: '100%',
  },

  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 27, 116, 0.72)',
  },

  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: RED,
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },

  heroTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },

  heroDetail: {
    color: '#E8EDFF',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  heroDate: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 8,
  },

  heroBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  readMoreText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // --------------------------------------------------------------------------
  // About
  // --------------------------------------------------------------------------

  aboutBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5EAF3',
    marginBottom: 18,
  },

  aboutTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: PRIMARY,
    marginBottom: 6,
  },

  aboutText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 19,
  },

  // --------------------------------------------------------------------------
  // Section
  // --------------------------------------------------------------------------

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
    fontSize: 11,
    color: '#777',
    marginTop: 2,
  },

  // --------------------------------------------------------------------------
  // News List
  // --------------------------------------------------------------------------

  newsList: {
    gap: 12,
  },

  newsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E4E8F0',
  },

  newsImage: {
    width: 92,
    height: 92,
    borderRadius: 13,
    backgroundColor: '#DDD',
  },

  newsContent: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 4,
  },

  newsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  newsCategory: {
    color: RED,
    fontSize: 9,
    fontWeight: '900',
  },

  newsDate: {
    color: '#999',
    fontSize: 9,
    fontWeight: '600',
  },

  newsTitle: {
    fontSize: 13,
    color: '#111',
    fontWeight: '900',
    marginTop: 6,
    lineHeight: 18,
  },

  newsBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  newsDetail: {
    flex: 1,
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
    marginTop: 4,
  },

  // --------------------------------------------------------------------------
  // Quote
  // --------------------------------------------------------------------------

  quoteCard: {
    marginTop: 16,
    backgroundColor: '#EFF4FF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDE7FF',
  },

  quoteText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    color: '#333',
    lineHeight: 19,
  },

  // --------------------------------------------------------------------------
  // Footer
  // --------------------------------------------------------------------------

  footer: {
    height: 42,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  footerText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // --------------------------------------------------------------------------
  // Menu
  // --------------------------------------------------------------------------

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
    backgroundColor: '#FFF',
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
});