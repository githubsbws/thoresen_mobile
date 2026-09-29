import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { newsList, NewsItem } from '../../src/data/news';
import { API_BASE_URL } from '../../src/services/api';

// ============================================================================
// THEME
// ============================================================================

const PRIMARY = '#001B74';
const RED = '#E30613';
const BG = '#F4F6FA';

// รูป fallback สำหรับตอนที่ข่าวไม่มี cms_picture (image เป็น null จาก backend)
const PLACEHOLDER_IMAGE =
  'https://placehold.co/600x400/DDE1E8/768095?text=No+Image';

// ============================================================================
// COMPONENT
// ============================================================================

export default function NewsDetailScreen() {
  // --------------------------------------------------------------------------
  // Get News ID from URL
  //
  // ตัวอย่าง:
  //
  // /news/1
  //
  // id = "1"
  // --------------------------------------------------------------------------

  const { id } = useLocalSearchParams<{ id: string }>();

  // --------------------------------------------------------------------------
  // Data State
  // --------------------------------------------------------------------------

  /**
   * ข่าวที่กำลังแสดง
   *
   * null = ยังไม่มีข้อมูล
   */
  const [news, setNews] = useState<NewsItem | null>(null);

  /**
   * ใช้สำหรับแสดง Loading ระหว่างดึงข้อมูล
   */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * ใช้เก็บข้อความ Error จาก API
   */
  const [error, setError] = useState<string | null>(null);

  // ==========================================================================
  // FETCH NEWS DETAIL
  // ==========================================================================
  //
  // เชื่อม API จริงแล้ว: ดึงข้อมูลผ่าน fetch(`${API_URL}/v1/news/${id}`) ด้านล่าง
  //
  // GET /v1/news/{id}
  //
  // (ถ้า fetch ล้มเหลวจะ fallback ไปหาใน newsList แทนอัตโนมัติ)
  // ==========================================================================

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const API_URL = API_BASE_URL;

        const response = await fetch(`${API_URL}/news/${id}`);

        if (response.ok) {
          const result = await response.json();

          if (result.success && result.data) {
            setNews(result.data);
            return;
          }
        }

        // API ไม่มีข่าวนี้ เช่น Mock ID ไม่อยู่ใน DB
        // ให้ใช้ Mock Data แทน โดยไม่แสดง Error
        const fallback = newsList.find(item => item.id === id);

        if (fallback) {
          setNews(fallback);
          return;
        }

        // ถ้าไม่มีทั้ง API และ Mock
        setError('ไม่พบข้อมูลข่าวสาร');

      } catch (err) {
        // Network error ใช้ Mock ก่อน
        const fallback = newsList.find(item => item.id === id);

        if (fallback) {
          setNews(fallback);
          return;
        }

        console.error('Fetch News Detail Error:', err);
        setError('ไม่สามารถโหลดข้อมูลข่าวสารได้');
      } finally {
        setIsLoading(false);
      }
    };

        fetchNewsDetail();
      }, [id]);

  // ==========================================================================
  // LOADING STATE
  // ==========================================================================

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerState}>
          <ActivityIndicator
            size="large"
            color={PRIMARY}
          />

          <Text style={styles.stateText}>
            Loading news...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================================
  // ERROR / NOT FOUND STATE
  // ==========================================================================

  if (error || !news) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>

          <Ionicons
            name={
              error
                ? 'warning-outline'
                : 'newspaper-outline'
            }
            size={64}
            color="#A0A8B8"
          />

          <Text style={styles.notFoundTitle}>
            {error
              ? 'เกิดข้อผิดพลาด'
              : 'ไม่พบข่าวนี้'}
          </Text>

          <Text style={styles.notFoundText}>
            {error ??
              'ไม่พบข้อมูลข่าวที่คุณกำลังค้นหา'}
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>
              กลับหน้าข่าว
            </Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================================
  // MAIN UI
  // ==========================================================================

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      {/* ==================================================================
          HEADER
      =================================================================== */}

      <View style={styles.header}>

        {/* Back Button */}

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={PRIMARY}
          />
        </TouchableOpacity>

        {/* Page Title */}

        <Text style={styles.headerTitle}>
          News Detail
        </Text>

        {/* Empty space เพื่อให้ Title อยู่ตรงกลาง */}

        <View style={styles.headerSpacer} />

      </View>

      {/* ==================================================================
          ARTICLE
      =================================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cover Image */}

        <Image
          source={{ uri: news.image || PLACEHOLDER_IMAGE }}
          style={styles.coverImage}
        />

        {/* ==============================================================
            ARTICLE CARD
        ================================================================= */}

        <View style={styles.articleCard}>

          {/* Category + Date */}

          <View style={styles.topRow}>

            <Text style={styles.category}>
              {news.category}
            </Text>

            <View style={styles.dateRow}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="#768095"
              />

              <Text style={styles.date}>
                {news.date}
              </Text>
            </View>

          </View>

          {/* Title */}

          <Text style={styles.title}>
            {news.title}
          </Text>

          {/* Summary */}

          <Text style={styles.summary}>
            {news.detail}
          </Text>

          {/* Divider */}

          <View style={styles.divider} />

          {/* Full Content */}

          <Text style={styles.content}>
            {news.content}
          </Text>

        </View>

        {/* ==================================================================
            INFORMATION CARD
        =================================================================== */}

        <View style={styles.infoCard}>

          <Ionicons
            name="information-circle-outline"
            size={22}
            color={PRIMARY}
          />

          <Text style={styles.infoText}>
            Stay updated with company announcements,
            training courses, safety news, and learning
            activities from THORESEN e-Learning.
          </Text>

        </View>

        {/* ==================================================================
            BACK BUTTON
        =================================================================== */}

        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color="#FFF"
          />

          <Text style={styles.bottomButtonText}>
            Back to News
          </Text>
        </TouchableOpacity>

      </ScrollView>
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

  // --------------------------------------------------------------------------
  // Loading / State
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

  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  notFoundTitle: {
    color: PRIMARY,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 14,
  },

  notFoundText: {
    color: '#596174',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },

  backButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 13,
    marginTop: 18,
  },

  backButtonText: {
    color: '#FFF',
    fontWeight: '800',
  },

  // --------------------------------------------------------------------------
  // Header
  // --------------------------------------------------------------------------

  header: {
    height: 62,
    paddingHorizontal: 14,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5EAF3',
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F4F4',
  },

  headerTitle: {
    flex: 1,
    color: PRIMARY,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },

  headerSpacer: {
    width: 42,
    height: 42,
  },

  // --------------------------------------------------------------------------
  // Article
  // --------------------------------------------------------------------------

  scrollContent: {
    paddingBottom: 30,
  },

  coverImage: {
    width: '100%',
    height: 245,
    backgroundColor: '#DDE1E8',
  },

  articleCard: {
    backgroundColor: '#FFF',
    margin: 14,
    marginTop: -22,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5EAF3',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  category: {
    color: '#FFF',
    backgroundColor: RED,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    fontSize: 10,
    fontWeight: '900',
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  date: {
    color: '#768095',
    fontSize: 11,
    fontWeight: '600',
  },

  title: {
    color: PRIMARY,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '900',
    marginTop: 18,
  },

  summary: {
    color: '#596174',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#E7EAF0',
    marginVertical: 18,
  },

  content: {
    color: '#333A48',
    fontSize: 14,
    lineHeight: 24,
  },

  // --------------------------------------------------------------------------
  // Information Card
  // --------------------------------------------------------------------------

  infoCard: {
    marginHorizontal: 14,
    backgroundColor: '#EAF0FF',
    borderWidth: 1,
    borderColor: '#D8E3FF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  infoText: {
    flex: 1,
    color: '#36415A',
    fontSize: 12,
    lineHeight: 19,
  },

  // --------------------------------------------------------------------------
  // Bottom Button
  // --------------------------------------------------------------------------

  bottomButton: {
    height: 50,
    marginHorizontal: 14,
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  bottomButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
});