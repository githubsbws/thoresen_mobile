import React from 'react';
import {
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
import { newsList } from '../../src/data/news';

const PRIMARY = '#001B74';
const RED = '#E30613';
const BG = '#F4F6FA';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const news = newsList.find(item => item.id === id);

  if (!news) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Ionicons
            name="newspaper-outline"
            size={64}
            color="#A0A8B8"
          />

          <Text style={styles.notFoundTitle}>
            ไม่พบข่าวนี้
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
     <View style={styles.header}>
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

            <Text style={styles.headerTitle}>
              News Detail
            </Text>

            <View style={styles.headerSpacer} />
          </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Image
          source={{ uri: news.image }}
          style={styles.coverImage}
        />

        <View style={styles.articleCard}>
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

          <Text style={styles.title}>
            {news.title}
          </Text>

          <Text style={styles.summary}>
            {news.detail}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.content}>
            {news.content}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={PRIMARY}
          />

          <Text style={styles.infoText}>
            Stay updated with company announcements, training courses,
            safety news, and learning activities from THORESEN e-Learning.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color="#fff"
          />

          <Text style={styles.bottomButtonText}>
            Back to News
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
  height: 62,
  paddingHorizontal: 14,
  backgroundColor: '#fff',
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

  scrollContent: {
    paddingBottom: 30,
  },

  coverImage: {
    width: '100%',
    height: 245,
    backgroundColor: '#DDE1E8',
  },

  articleCard: {
    backgroundColor: '#fff',
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
    color: '#fff',
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
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
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

  backButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 13,
    marginTop: 18,
  },

  backButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
});