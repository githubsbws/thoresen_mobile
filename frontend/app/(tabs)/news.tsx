import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AppHeader from '../../src/components/AppHeader';
import { newsList, NewsItem } from '../../src/data/news';

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


  export default function NewsScreen() {
    const [menuVisible, setMenuVisible] = useState(false);
    const mainNews = newsList[0];
    const otherNews = newsList.slice(1);

   return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
       <AppHeader />
        <View style={styles.content}>
          
          <TouchableOpacity
                style={styles.heroCard}
                activeOpacity={0.9}
                onPress={() => router.push(`/news/${mainNews.id}` as any)}
              >
                <Image source={{ uri: mainNews.image }} style={styles.heroImage} />

                <View style={styles.heroOverlay}>
                  <Text style={styles.heroBadge}>{mainNews.category}</Text>

                  <Text style={styles.heroTitle}>
                    {mainNews.title}
                  </Text>

                  <Text style={styles.heroDetail} numberOfLines={2}>
                    {mainNews.detail}
                  </Text>

                  <View style={styles.heroBottom}>
                    <Text style={styles.heroDate}>{mainNews.date}</Text>

                    <View style={styles.readMoreRow}>
                      <Text style={styles.readMoreText}>Read more</Text>
                      <Ionicons name="arrow-forward" size={14} color="#fff" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

                    <View style={styles.aboutBox}>
                      <Text style={styles.aboutTitle}>Thoresen News & Updates</Text>
                      <Text style={styles.aboutText}>
                        Stay updated with company announcements, training courses, safety news,
                        and learning activities from THORESEN e-Learning.
                      </Text>
                    </View>

                    <View style={styles.sectionRow}>
                      <View>
                        <Text style={styles.sectionTitle}>Latest News</Text>
                        <Text style={styles.sectionSub}>ข่าวสารและประกาศล่าสุด</Text>
                      </View>

                    
                    </View>

                    <View style={styles.newsList}>
                        {otherNews.map(item => (
                          <TouchableOpacity
                            key={item.id}
                            style={styles.newsCard}
                            activeOpacity={0.85}
                            onPress={() => router.push(`/news/${item.id}` as any)}
                          >
                            <Image
                              source={{ uri: item.image }}
                              style={styles.newsImage}
                            />

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

                          <View style={styles.quoteCard}>
                            <Ionicons name="school-outline" size={24} color={PRIMARY} />
                            <Text style={styles.quoteText}>
                              “Learn well, grow well” is one of our core values. We aim to encourage
                              staff learning and development within our organization.
                            </Text>
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

                      
                    </SafeAreaView>
                  );
                }



const styles = StyleSheet.create({

  safe: {
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
    color: '#666',
    marginBottom: 12,
  },

  heroCard: {
    height: 210,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#ddd',
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
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },

  heroTitle: {
    color: '#fff',
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
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 8,
  },

  aboutBox: {
    backgroundColor: '#fff',
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

  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },

  adminBtn: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  adminActive: {
    backgroundColor: RED,
  },

  adminText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },

  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  newsList: {
    gap: 12,
  },

  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E4E8F0',
    position: 'relative',
  },

  newsImage: {
    width: 92,
    height: 92,
    borderRadius: 13,
    backgroundColor: '#ddd',
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

  newsDetail: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
    marginTop: 4,
  },

  deleteBtn: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: '#FFF0F0',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

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

  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 22,
  },

  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: PRIMARY,
    marginBottom: 14,
  },

  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
  },

  textArea: {
    height: 110,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },

  cancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    color: '#333',
    fontWeight: '800',
  },

  saveText: {
    color: '#fff',
    fontWeight: '800',
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
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },

  newsBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});