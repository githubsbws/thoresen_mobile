import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import {
  SafeAreaView,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import AppHeader from '../../src/components/AppHeader';

const PRIMARY = '#001B74';
const RED = '#E30613';
const BG = '#F4F6FA';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const TOP_INSET = initialWindowMetrics?.insets.top ?? 44;

type DocumentItem = {
  id: string;
  title: string;
  category: string;
  image: string;
  file: number;
};

type VideoItem = {
  id: string;
  title: string;
  image: string;
  source: number;
};

const tabs = [
  { key: 'documents', label: 'Documents', icon: 'document-text-outline' },
  { key: 'videos', label: 'Videos', icon: 'play-circle-outline' },
  { key: 'gallery', label: 'Gallery', icon: 'images-outline' },
] as const;

const categories = ['All', 'IT-Onboard', 'Safety', 'Training'];

const documents: DocumentItem[] = [
  {
    id: 'it-onboard-2020',
    title: 'IT-Onboard Training 2020',
    category: 'IT-Onboard',
    image:
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600',
    // สร้างโฟลเดอร์ assets/documents แล้วใส่ไฟล์ PDF ไว้ตามชื่อนี้
    file: require('../../assets/documents/IT-Onboard_2020.pdf'),
  },
];

const videos: VideoItem[] = [
  {
    id: 'training-01',
    title: 'Training Video',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
    // เปลี่ยนเป็น URL ไฟล์ .mp4 จริงของบริษัทได้
    source: require('../../assets/videos/training-video.mp4'),
  },
];

const folders = [
  { title: 'Team Building', date: '22.01.2026' },
  { title: 'Training Course', date: '22.01.2026' },
  { title: 'Event Gallery', date: '22.01.2026' },
  { title: 'Safety Campaign', date: '22.01.2026' },
];

function VideoPlayerModal({
  visible,
  item,
  onClose,
}: {
  visible: boolean;
  item: VideoItem | null;
  onClose: () => void;
}) {
  const player = useVideoPlayer(item?.source ?? null, playerInstance => {
    playerInstance.loop = false;

    if (item) {
      playerInstance.play();
    }
  });

  const handleClose = () => {
    player.pause();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.videoViewerSafe}>
        <StatusBar
          style="light"
          backgroundColor={PRIMARY}
          translucent={false}
        />

        <View
          style={[
            styles.viewerHeader,
            {
              paddingTop: TOP_INSET,
              height: TOP_INSET + 68,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={25} color="#fff" />
          </TouchableOpacity>

          <View style={styles.videoHeaderText}>
            <Text style={styles.viewerEyebrow}>
              TRAINING VIDEO
            </Text>

            <Text style={styles.viewerTitle} numberOfLines={1}>
              {item?.title}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={25} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.videoPage}
          contentContainerStyle={styles.videoPageContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.videoPlayerCard}>
            {item && (
              <VideoView
                player={player}
                style={styles.videoPlayer}
                contentFit="contain"
                nativeControls
                allowsFullscreen
                allowsPictureInPicture
              />
            )}
          </View>

          <View style={styles.videoDetailCard}>
            <View style={styles.videoDetailIcon}>
              <Ionicons name="play" size={20} color="#fff" />
            </View>

            <View style={styles.videoDetailText}>
              <Text style={styles.videoDetailTitle}>
                {item?.title}
              </Text>

              <Text style={styles.videoDetailSubtitle}>
                วิดีโอฝึกอบรมสำหรับพนักงานและลูกเรือ
              </Text>
            </View>
          </View>

          <View style={styles.videoTip}>
            <Ionicons
              name="information-circle-outline"
              size={19}
              color={PRIMARY}
            />

            <Text style={styles.videoTipText}>
              แตะปุ่มขยายเพื่อรับชมวิดีโอแบบเต็มหน้าจอ
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function LibraryScreen() {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]['key']>('documents');
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const filteredDocuments = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return documents.filter(item => {
      const categoryMatched =
        activeCategory === 'All' || item.category === activeCategory;
      const searchMatched =
        !keyword || item.title.toLowerCase().includes(keyword);
      return categoryMatched && searchMatched;
    });
  }, [activeCategory, search]);

  const filteredVideos = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return videos.filter(
      item => !keyword || item.title.toLowerCase().includes(keyword),
    );
  }, [search]);

  const currentTitle = useMemo(() => {
    if (activeTab === 'documents') return 'Document Library';
    if (activeTab === 'videos') return 'Multimedia Library';
    return 'Hall of Fame';
  }, [activeTab]);

  const prepareDocument = async (item: DocumentItem) => {
    const asset = Asset.fromModule(item.file);
    if (!asset.localUri) await asset.downloadAsync();
    const uri = asset.localUri ?? asset.uri;
    if (!uri) throw new Error('ไม่พบไฟล์ PDF');
    return uri;
  };

  const openDocument = async (item: DocumentItem) => {
    try {
      setLoadingDocument(true);
      const uri = await prepareDocument(item);
      setPdfTitle(item.title);
      setPdfUri(uri);
    } catch {
      Alert.alert('เปิดไฟล์ไม่สำเร็จ', 'กรุณาตรวจสอบว่าใส่ไฟล์ PDF ถูกตำแหน่งแล้ว');
    } finally {
      setLoadingDocument(false);
    }
  };

  const downloadDocument = async (item: DocumentItem) => {
    try {
      setLoadingDocument(true);
      const sourceUri = await prepareDocument(item);
      const targetUri = `${FileSystem.cacheDirectory}${item.id}.pdf`;
      await FileSystem.copyAsync({ from: sourceUri, to: targetUri });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('ดาวน์โหลดไม่สำเร็จ', 'อุปกรณ์นี้ไม่รองรับการบันทึกไฟล์');
        return;
      }

      await Sharing.shareAsync(targetUri, {
        mimeType: 'application/pdf',
        dialogTitle: `บันทึก ${item.title}`,
        UTI: 'com.adobe.pdf',
      });
    } catch {
      Alert.alert('ดาวน์โหลดไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoadingDocument(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.mainScrollContent}>
        <AppHeader />

        <View style={styles.content}>
          <View style={styles.heroCard}>
            <View style={styles.heroTextBox}>
              <Text style={styles.heroSmall}>THORESEN RESOURCES</Text>
              <Text style={styles.heroTitle}>Library Center</Text>
              <Text style={styles.heroDesc}>
                Access documents, training videos and company gallery.
              </Text>
            </View>
            <View style={styles.heroIcon}>
              <Ionicons name="folder-open" size={38} color="#fff" />
            </View>
          </View>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={19} color={MUTED} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search document or video..."
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>

          <View style={styles.tabRow}>
            {tabs.map(tab => (
              <TouchableOpacity
                    key={tab.key}
                    onPress={() => {
                      setActiveTab(tab.key);
                      setSearch('');

                      if (tab.key === 'documents') {
                        setActiveCategory('All');
                      }
                    }}
                    style={[
                      styles.tabItem,
                      activeTab === tab.key && styles.tabItemActive,
                    ]}
                  >
                <Ionicons
                  name={tab.icon}
                  size={19}
                  color={activeTab === tab.key ? '#fff' : PRIMARY}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>{currentTitle}</Text>

          {activeTab === 'documents' && (
                <>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                  >
                    {categories.map(category => (
                      <TouchableOpacity
                        key={category}
                        onPress={() => setActiveCategory(category)}
                        style={[
                          styles.categoryPill,
                          activeCategory === category && styles.categoryActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            activeCategory === category &&
                              styles.categoryTextActive,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {filteredDocuments.length > 0 ? (
                    <View style={styles.grid}>
                      {filteredDocuments.map(item => (
                        <View key={item.id} style={styles.card}>
                          <TouchableOpacity
                            onPress={() => openDocument(item)}
                            activeOpacity={0.85}
                          >
                            <View style={styles.mediaWrap}>
                              <Image
                                source={{ uri: item.image }}
                                style={styles.image}
                              />

                              <View style={styles.overlay} />

                              <View style={styles.badge}>
                                <Ionicons
                                  name="document-text"
                                  size={13}
                                  color="#fff"
                                />

                                <Text style={styles.badgeText}>
                                  PDF
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>

                          <View style={styles.cardBody}>
                            <Text
                              style={styles.cardTitle}
                              numberOfLines={2}
                            >
                              {item.title}
                            </Text>

                            <View style={styles.actionRow}>
                              <TouchableOpacity
                                style={styles.viewButton}
                                onPress={() => openDocument(item)}
                              >
                                <Ionicons
                                  name="eye-outline"
                                  size={15}
                                  color="#fff"
                                />

                                <Text style={styles.actionText}>
                                  เปิดดู
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.downloadButton}
                                onPress={() => downloadDocument(item)}
                              >
                                <Ionicons
                                  name="download-outline"
                                  size={17}
                                  color={PRIMARY}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyState}>
                      <View style={styles.emptyIcon}>
                        <Ionicons
                          name="document-text-outline"
                          size={32}
                          color={PRIMARY}
                        />
                      </View>

                      <Text style={styles.emptyTitle}>
                        ไม่พบเอกสาร
                      </Text>

                      <Text style={styles.emptyDescription}>
                        ยังไม่มีเอกสารในหมวดนี้
                      </Text>

                      <TouchableOpacity
                        style={styles.showAllButton}
                        onPress={() => {
                          setActiveCategory('All');
                          setSearch('');
                        }}
                      >
                        <Text style={styles.showAllButtonText}>
                          ดูเอกสารทั้งหมด
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}

          {activeTab === 'videos' && (
            <View style={styles.grid}>
              {filteredVideos.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() => setSelectedVideo(item)}
                >
                  <View style={styles.mediaWrap}>
                    <Image source={{ uri: item.image }} style={styles.image} />
                    <View style={styles.overlay} />
                    <View style={styles.playButton}>
                      <Ionicons name="play" size={22} color={PRIMARY} />
                    </View>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.videoHint}>แตะเพื่อเล่นวิดีโอ</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'gallery' && (
            <View style={styles.grid}>
              {folders.map(item => (
                <View key={item.title} style={styles.folderCard}>
                  <Ionicons name="folder" size={54} color="#F6B23C" />
                  <Text style={styles.folderTitle}>{item.title}</Text>
                  <Text style={styles.folderDate}>{item.date}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
              <View style={styles.footer}>
                  <Text style={styles.footerText}>© 2026 Thoresen e-Learning</Text>
                </View>
      </ScrollView>
               
      {loadingDocument && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>กำลังเตรียมไฟล์...</Text>
        </View>
      )}

      <Modal
        visible={Boolean(pdfUri)}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setPdfUri(null)}
      >
        <SafeAreaView style={styles.viewerSafe} edges={['top', 'bottom']}>
          <StatusBar style="light" backgroundColor={PRIMARY} />
          <View style={styles.viewerHeader}>
            <Text style={styles.viewerTitle} numberOfLines={1}>
              {pdfTitle}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setPdfUri(null)}
            >
              <Ionicons name="close" size={25} color="#fff" />
            </TouchableOpacity>
          </View>
          {pdfUri && (
            <WebView
              source={{ uri: pdfUri }}
              style={styles.pdfViewer}
              originWhitelist={['*']}
              allowFileAccess
              allowingReadAccessToURL={FileSystem.cacheDirectory ?? undefined}
              startInLoadingState
              renderLoading={() => (
                <ActivityIndicator style={styles.webLoading} color={PRIMARY} />
              )}
            />
          )}
        </SafeAreaView>
      </Modal>

      <VideoPlayerModal
        key={selectedVideo?.id ?? 'no-video'}
        visible={Boolean(selectedVideo)}
        item={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: BG 
  },

  mainScrollContent:{
    flexGrow: 1,
  },
  content: { 
    flex:1,
    paddingHorizontal: 16, 
    paddingBottom: 30 
  },
  heroCard: {
    marginTop: 18,
    backgroundColor: PRIMARY,
    borderRadius: 26,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextBox: { flex: 1, paddingRight: 12 },
  heroSmall: {
    color: '#BFD1FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 7,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 7,
  },
  heroDesc: { color: '#E7EEFF', fontSize: 13, fontWeight: '600', lineHeight: 20 },
  heroIcon: {
    width: 74,
    height: 74,
    borderRadius: 24,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    height: 54,
    borderWidth: 1,
    borderColor: '#E3E8F2',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    marginTop: 16,
    marginBottom: 15,
  },
  input: { flex: 1, fontSize: 13, color: TEXT, paddingHorizontal: 9 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tabItem: {
    flex: 1,
    minHeight: 68,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E4E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  tabText: { marginTop: 5, fontSize: 11, color: PRIMARY, fontWeight: '800' },
  tabTextActive: { color: '#fff' },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: TEXT,
    marginBottom: 14,
  },
  categoryScroll: { marginBottom: 14 },
  categoryPill: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryActive: { backgroundColor: RED, borderColor: RED },
  categoryText: { fontSize: 11, color: MUTED, fontWeight: '800' },
  categoryTextActive: { color: '#fff' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E7EAF0',
    elevation: 3,
  },
  mediaWrap: { height: 112, position: 'relative' },
  image: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    height: 24,
    borderRadius: 8,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 7,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  cardBody: { padding: 10 },
  cardTitle: {
    color: TEXT,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 16,
    minHeight: 34,
  },
  actionRow: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  viewButton: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  actionText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  downloadButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    position: 'absolute',
    alignSelf: 'center',
    top: 35,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoHint: { color: MUTED, fontSize: 10, fontWeight: '600' },
  folderCard: {
    width: '48%',
    minHeight: 145,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    elevation: 3,
  },
  folderTitle: {
    fontSize: 12,
    color: TEXT,
    fontWeight: '900',
    marginTop: 6,
    textAlign: 'center',
  },
  folderDate: { fontSize: 10, color: MUTED, marginTop: 4, fontWeight: '600' },
  footer: {
    height: 38,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  footerText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,27,116,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { color: '#fff', fontWeight: '800', marginTop: 12 },
  viewerSafe: { flex: 1, backgroundColor: '#0B1020' },
  videoViewerSafe: { flex: 1, backgroundColor: BG },
  viewerHeader: {
    minHeight: 68,
    paddingHorizontal: 12,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoHeaderText: {
    flex: 1,
    paddingHorizontal: 12,
  },
  viewerEyebrow: {
    color: '#AFC6FF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  viewerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfViewer: { flex: 1, backgroundColor: '#fff' },
  webLoading: { position: 'absolute', alignSelf: 'center', top: '45%' },
  videoPage: {
    flex: 1,
    backgroundColor: BG,
  },
  videoPageContent: {
    padding: 16,
    paddingBottom: 34,
  },
  videoPlayerCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 5,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  videoDetailCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoDetailIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDetailText: {
    flex: 1,
    marginLeft: 12,
  },
  videoDetailTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '900',
  },
  videoDetailSubtitle: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 17,
    marginTop: 4,
  },
  videoTip: {
    marginTop: 12,
    padding: 13,
    borderRadius: 14,
    backgroundColor: '#EAF0FF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoTipText: {
    flex: 1,
    marginLeft: 8,
    color: PRIMARY,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
  minHeight: 210,
  borderRadius: 20,
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: BORDER,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  marginBottom: 18,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 12,
    color: TEXT,
    fontSize: 16,
    fontWeight: '900',
  },

  emptyDescription: {
    marginTop: 4,
    color: MUTED,
    fontSize: 11,
    fontWeight: '600',
  },

  showAllButton: {
    marginTop: 14,
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  showAllButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
});