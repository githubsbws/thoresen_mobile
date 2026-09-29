import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { API_BASE_URL } from '../../src/services/api';

const PRIMARY = '#001B74';
const RED = '#E30613';
const BG = '#F4F6FA';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const TOP_INSET = initialWindowMetrics?.insets.top ?? 44;


// ==================
// TYPE DEFINITIONS
// ==================
type DocumentItem = {
  id: string;
  title: string;
  category: string;
  // DB จริง (tbl_library_file) ไม่มีคอลัมน์รูปปก/thumbnail ให้
  // จึงต้อง optional และมี fallback icon ตอนแสดงผล (ดู renderMediaThumb ด้านล่าง)
  image?: string;
  // สำหรับกรณีที่ใช้ไฟล์ PDF จาก local asset (require) หรือจาก URL
  file?: number;
  // สำหรับกรณีที่ใช้ไฟล์ PDF จาก URL (เช่น API หรือ Cloud Storage)
  fileUrl?: string;
};

type VideoItem = {
  id: string;
  title: string;
  // DB จริงไม่มี thumbnail ให้เช่นกัน ดู renderMediaThumb ด้านล่าง
  image?: string;
  // สำหรับกรณีที่ใช้วิดีโอจาก local asset (require) หรือจาก URL
  source?: any;
  // สำหรับกรณีที่ใช้วิดีโอจาก URL (เช่น API หรือ Cloud Storage)
  videoUrl?: string;
};

// ==========================================
// GALLERY TYPE DEFINITION
// ==========================================
// โครงสร้างข้อมูลโฟลเดอร์ Gallery สำหรับเก็บข้อมูลโฟลเดอร์ และเตรียมอาร์เรย์ URL รูปภาพรองรับ API จากระบบ Admin ในอนาคต
type GalleryFolderItem = {
  id?: string;
  title: string;
  // date คือ ISO string ของ galleryFolder.createdAt ที่ backend ดึงมาจาก DB จริง
  // (ดู library.service.ts -> folder.createdAt.toISOString())
  // ฝั่งนี้มีหน้าที่ format ให้อ่านง่ายผ่าน formatGalleryDate() ด้านล่าง
  date: string;
  images?: string[]; // อาร์เรย์เก็บ URL รูปภาพภายในโฟลเดอร์
};

// แปลง ISO date string ที่ได้จาก backend (galleryFolder.createdAt) ให้เป็นรูปแบบวันที่มาตรฐานสากล
// ใช้ ISO 8601 (YYYY-MM-DD) เช่น "2026-01-22T00:00:00.000Z" -> "2026-01-22"
// ไม่ใช้ toLocaleDateString('th-TH') เพราะ locale นี้จะแปลงปีเป็น พ.ศ. ให้อัตโนมัติ
// (เช่น 2026 กลายเป็น 2569) ซึ่งไม่ตรงกับค่าที่เก็บใน DB และไม่ใช่มาตรฐานสากล
// ถ้า parse ไม่ได้ (เช่น mock data เก่า หรือ backend ส่งค่าผิดรูปแบบ) จะคืนค่าดิบกลับไปแทน กันหน้าจอพัง
function formatGalleryDate(dateString: string): string {
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) return dateString;
  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, '0');
  const dd = String(parsed.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const tabs = [
  { key: 'documents', label: 'Documents', icon: 'document-text-outline' },
  { key: 'videos', label: 'Videos', icon: 'play-circle-outline' },
  { key: 'gallery', label: 'Gallery', icon: 'images-outline' },
] as const;

// หมายเหตุ: เดิมมี hardcode รายชื่อหมวดหมู่ไว้ตรงนี้ (['All', 'IT-Onboard', 'Safety', 'Training'])
// แต่หมวดจริงจาก DB (tbl_library_type.library_type_name) มีหลายสิบชื่อและไม่ตรงกับที่ hardcode ไว้เลย
// (เช่น "Technical", "Loss Prevention", "Draft Survey" ฯลฯ) จึงเปลี่ยนไปคำนวณจากข้อมูลจริงแทน
// ดู categories useMemo ภายใน component ด้านล่าง

// =====================================
// MOCK DATA SECTION - สำหรับกรณีไม่มี API
// =====================================
const MOCK_DOCUMENTS: DocumentItem[] = [
  {
    id: 'it-onboard-2020',
    title: 'IT-Onboard Training 2020',
    category: 'IT-Onboard',
    image:
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600',
    file: require('../../assets/documents/IT-Onboard_2020.pdf'),
  },
];

const MOCK_VIDEOS: VideoItem[] = [
  {
    id: 'training-01',
    title: 'Training Video',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
    source: null,
  },
];

// ==========================================
// GALLERY MOCK DATA
// ==========================================
// รายการโฟลเดอร์เริ่มต้น (UI รูปแบบเดิม) ถ้าหากฝั่ง Admin มีการเพิ่มโฟลเดอร์ใหม่ สามารถส่งข้อมูลเพิ่มเข้ามาในอาร์เรย์นี้ได้
const MOCK_FOLDERS: GalleryFolderItem[] = [
  { id: '1', title: 'Team Building', date: '2026-01-22T00:00:00.000Z', images: [] },
  { id: '2', title: 'Training Course', date: '2026-01-22T00:00:00.000Z', images: [] },
  { id: '3', title: 'Event Gallery', date: '2026-01-22T00:00:00.000Z', images: [] },
  { id: '4', title: 'Safety Campaign', date: '2026-01-22T00:00:00.000Z', images: [] },
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
  const videoSource = item?.videoUrl ?? item?.source ?? null;

  const player = useVideoPlayer(videoSource, playerInstance => {
    playerInstance.loop = false;
    if (item && videoSource) {
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
            <Text style={styles.viewerEyebrow}>TRAINING VIDEO</Text>
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
            {item && videoSource ? (
              <VideoView
                player={player}
                style={styles.videoPlayer}
                contentFit="contain"
                nativeControls
                allowsFullscreen
                allowsPictureInPicture
              />
            ) : (
              <View
                style={[
                  styles.videoPlayer,
                  { justifyContent: 'center', alignItems: 'center' },
                ]}
              >
                <Ionicons name="alert-circle-outline" size={40} color="#fff" />
                <Text style={{ color: '#fff', marginTop: 8, fontSize: 12 }}>
                  ยังไม่มีไฟล์วิดีโอในระบบ
                </Text>
              </View>
            )}
          </View>

          <View style={styles.videoDetailCard}>
            <View style={styles.videoDetailIcon}>
              <Ionicons name="play" size={20} color="#fff" />
            </View>

            <View style={styles.videoDetailText}>
              <Text style={styles.videoDetailTitle}>{item?.title}</Text>
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

  // ==========================================
  // STATE & FETCH DATA FROM API SECTION
  // ==========================================
  const [documents, setDocuments] = useState<DocumentItem[]>(MOCK_DOCUMENTS);
  const [videos, setVideos] = useState<VideoItem[]>(MOCK_VIDEOS);
  const [gallery, setGallery] = useState<GalleryFolderItem[]>(MOCK_FOLDERS);
  const [isFetching, setIsFetching] = useState(false);

  // ==========================================
  // GALLERY STATES
  // ==========================================
  // จัดการสถานะการเปิดโฟลเดอร์ และรูปภาพขนาดใหญ่ภายใน Gallery
  const [selectedFolder, setSelectedFolder] = useState<GalleryFolderItem | null>(null);
  const [isGalleryModalVisible, setIsGalleryModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  
  // --------------------------------------------------------------------
  // อ่าน URL จาก .env (frontend project) ตัวแปรชื่อ EXPO_PUBLIC_API_URL
  // ต้องขึ้นต้นด้วย EXPO_PUBLIC_ เท่านั้น Expo ถึงจะ inject ให้ใช้ได้
  // และต้อง restart `expo start` ทุกครั้งที่แก้ไฟล์ .env
  //
  // หมายเหตุ: controller ฝั่ง backend ใช้ @Controller('library') รวมกับ
  // global prefix 'v1' (ตั้งไว้ใน main.ts) จึงได้ path จริงคือ /v1/library
  //
  // ถ้า fetch ล้มเหลว (เช่น ยังไม่ได้ต่อ VPN, backend ยังไม่พร้อม)
  // จะแค่ log error ไว้ แล้วปล่อยให้ documents/videos/gallery ยังเป็น
  // Mock Data ที่ตั้งต้นไว้ตอน useState (ไม่ set ค่าอะไรทับ)
  // --------------------------------------------------------------------
  useEffect(() => {
    const fetchLibraryData = async () => {
      try {
        setIsFetching(true);

        const API_URL = API_BASE_URL;

        const response = await fetch(`${API_URL}/library`);

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setDocuments(result.data.documents || []);
          setVideos(result.data.videos || []);
          setGallery(result.data.gallery || []);
        }
      } catch (error) {
        console.error('Fetch Library Error:', error);
        // ไม่ set ค่าอะไรทับ ยังเป็น Mock Data เดิม
      } finally {
        setIsFetching(false);
      }
    };

    fetchLibraryData();
  }, []);
  

  // คำนวณรายชื่อหมวดหมู่จากข้อมูลจริงที่ backend ส่งมา (unique category ของ documents)
  // แทนการ hardcode ไว้ตายตัว เพราะหมวดจริงจาก tbl_library_type มีหลายสิบชื่อและเปลี่ยนได้เรื่อย ๆ
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        documents
          .map(item => item.category)
          .filter((c): c is string => !!c && c.trim().length > 0),
      ),
    );
    return ['All', ...uniqueCategories];
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return documents.filter(item => {
      const categoryMatched =
        activeCategory === 'All' || item.category === activeCategory;
      const searchMatched =
        !keyword || item.title.toLowerCase().includes(keyword);
      return categoryMatched && searchMatched;
    });
  }, [documents, activeCategory, search]);

  const filteredVideos = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return videos.filter(
      item => !keyword || item.title.toLowerCase().includes(keyword),
    );
  }, [videos, search]);

  // ==========================================
  // GALLERY FILTER
  // ==========================================
  // กรองข้อมูลโฟลเดอร์ Gallery ตามคำค้นหา (Search)
  const filteredGallery = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return gallery.filter(
      item => !keyword || item.title.toLowerCase().includes(keyword),
    );
  }, [gallery, search]);

  const currentTitle = useMemo(() => {
    if (activeTab === 'documents') return 'Document Library';
    if (activeTab === 'videos') return 'Multimedia Library';
    return 'Hall of Fame';
  }, [activeTab]);

  // ============================
  // DOCUMENT HANDLER FUNCTIONS
  // ============================
  const prepareDocument = async (item: DocumentItem) => {
    //รับ url จาก backend/storage และตรวจสอบว่ามีไฟล์ PDF อยู่หรือไม่ หากมีให้ดาวน์โหลดและเก็บไว้ใน cache directory ของอุปกรณ์
    if (item.fileUrl) {
      const localUri = `${FileSystem.cacheDirectory}${item.id}.pdf`;
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (!fileInfo.exists) {
        const downloadResult = await FileSystem.downloadAsync(
          item.fileUrl,
          localUri,
        );
        return downloadResult.uri;
      }
      return localUri;
    }
    // สำหรับกรณีที่ใช้ไฟล์ PDF จาก local asset (require) หรือจาก URL
    if (item.file) {
      const asset = Asset.fromModule(item.file);
      if (!asset.localUri) await asset.downloadAsync();
      const uri = asset.localUri ?? asset.uri;
      if (uri) return uri;
    }

    throw new Error('ไม่พบไฟล์ PDF');
  };

  const openDocument = async (item: DocumentItem) => {
    try {
      setLoadingDocument(true);
      const uri = await prepareDocument(item);
      setPdfTitle(item.title);
      setPdfUri(uri);
    } catch {
      Alert.alert(
        'เปิดไฟล์ไม่สำเร็จ',
        'กรุณาตรวจสอบว่าไฟล์ PDF ถูกต้องหรือ URL ถูกตำแหน่งแล้ว',
      );
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

  // ==========================================
  // GALLERY HANDLER FUNCTIONS
  // ==========================================
  // ฟังก์ชันสำหรับเปิดดูรายละเอียดอัลบั้มรูปภาพเมื่อผู้ใช้คลิกเลือกโฟลเดอร์
  const handleOpenFolder = (folder: GalleryFolderItem) => {
    setSelectedFolder(folder);
    setIsGalleryModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainScrollContent}
      >
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

          {isFetching ? (
            <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 20 }} />
          ) : (
            <>
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
                              {item.image ? (
                                <Image
                                  source={{ uri: item.image }}
                                  style={styles.image}
                                />
                              ) : (
                                <View
                                  style={[styles.image, styles.imagePlaceholder]}
                                >
                                  <Ionicons
                                    name="document-text-outline"
                                    size={36}
                                    color={MUTED}
                                  />
                                </View>
                              )}
                              <View style={styles.overlay} />
                              <View style={styles.badge}>
                                <Ionicons
                                  name="document-text"
                                  size={13}
                                  color="#fff"
                                />
                                <Text style={styles.badgeText}>PDF</Text>
                              </View>
                            </View>
                          </TouchableOpacity>

                          <View style={styles.cardBody}>
                            <Text style={styles.cardTitle} numberOfLines={2}>
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
                                <Text style={styles.actionText}>เปิดดู</Text>
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
                      <Text style={styles.emptyTitle}>ไม่พบเอกสาร</Text>
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
                        {item.image ? (
                          <Image source={{ uri: item.image }} style={styles.image} />
                        ) : (
                          <View style={[styles.image, styles.imagePlaceholder]}>
                            <Ionicons
                              name="play-circle-outline"
                              size={36}
                              color={MUTED}
                            />
                          </View>
                        )}
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

               {/* ========================================== 
               TAB GALLERY (แสดงโฟลเดอร์ในแท็บ Hall of Fame) 
               ==========================================  */}
              {/* แสดงรายการโฟลเดอร์การ์ดสีขาว + ไอคอนโฟลเดอร์สีเหลือง และรับข้อมูลจาก API ที่ Admin เพิ่มเข้ามาใหม่ได้อัตโนมัติ */}
              {activeTab === 'gallery' && (
                <View style={styles.grid}>
                  {filteredGallery.map(item => (
                    <TouchableOpacity
                      key={item.id ?? item.title}
                      style={styles.folderCard}
                      onPress={() => handleOpenFolder(item)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="folder" size={54} color="#F6B23C" />
                      <Text style={styles.folderTitle}>{item.title}</Text>
                      <Text style={styles.folderDate}>
                        {formatGalleryDate(item.date)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
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

      {/* PDF Modal */}
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

      {/* Video Modal */}
      <VideoPlayerModal
        key={selectedVideo?.id ?? 'no-video'}
        visible={Boolean(selectedVideo)}
        item={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />

      {/* ========================================== */}
      {/* GALLERY ALBUM MODAL & LIGHTBOX */}
      {/* ========================================== */}
      {/* หน้าต่างแสดงรูปภาพทั้งหมดในโฟลเดอร์นั้นๆ ถ้าโฟลเดอร์นั้นมีรูปจะแสดงในแบบ Grid 2 คอลัมน์ แต่ถ้าไม่มีจะแสดง Empty State */}
      <Modal
        visible={isGalleryModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsGalleryModalVisible(false)}
      >
        <SafeAreaView style={styles.viewerSafe} edges={['top', 'bottom']}>
          <StatusBar style="light" backgroundColor={PRIMARY} />
          <View style={styles.viewerHeader}>
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={() => setIsGalleryModalVisible(false)}
            >
              <Ionicons name="chevron-back" size={25} color="#fff" />
            </TouchableOpacity>

            <View style={styles.videoHeaderText}>
              <Text style={styles.viewerEyebrow}>GALLERY ALBUM</Text>
              <Text style={styles.viewerTitle} numberOfLines={1}>
                {selectedFolder?.title}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsGalleryModalVisible(false)}
            >
              <Ionicons name="close" size={25} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* ตรวจสอบว่ามีข้อมูลรูปภาพในโฟลเดอร์หรือไม่ */}
          {selectedFolder?.images && selectedFolder.images.length > 0 ? (
            <FlatList
              data={selectedFolder.images}
              numColumns={2}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.galleryGridContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.gridImageWrapper}
                  onPress={() => setSelectedImage(item)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: item }} style={styles.gridImage} />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={[styles.emptyState, { margin: 20 }]}>
              <View style={styles.emptyIcon}>
                <Ionicons name="images-outline" size={32} color={PRIMARY} />
              </View>
              <Text style={styles.emptyTitle}>ยังไม่มีรูปภาพ</Text>
              <Text style={styles.emptyDescription}>
                ขณะนี้ยังไม่มีข้อมูลรูปภาพในโฟลเดอร์นี้
              </Text>
            </View>
          )}

          {/* Lightbox สำหรับแสดงรูปภาพขนาดเต็มเมื่อผู้ใช้แตะที่รูปใดรูปหนึ่ง */}
          {selectedImage && (
            <Modal
              transparent
              visible={Boolean(selectedImage)}
              onRequestClose={() => setSelectedImage(null)}
            >
              <TouchableOpacity
                style={styles.lightboxBg}
                activeOpacity={1}
                onPress={() => setSelectedImage(null)}
              >
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </Modal>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  mainScrollContent: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: 16, paddingBottom: 30 },
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
  heroTitle: { color: '#fff', fontSize: 30, fontWeight: '900', marginBottom: 7 },
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
  imagePlaceholder: {
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  
  // ==========================================
  // GALLERY STYLES
  // ==========================================
  // สไตล์สำหรับโฟลเดอร์, ตาราง Grid รูปภาพ และ Lightbox
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
  
  galleryGridContainer: {
    padding: 12,
  },
  gridImageWrapper: {
    flex: 1,
    margin: 6,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  lightboxBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '85%',
  },

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
  videoHeaderText: { flex: 1, paddingHorizontal: 12 },
  viewerEyebrow: {
    color: '#AFC6FF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  viewerTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
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
  videoPage: { flex: 1, backgroundColor: BG },
  videoPageContent: { padding: 16, paddingBottom: 34 },
  videoPlayerCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 5,
  },
  videoPlayer: { width: '100%', height: '100%', backgroundColor: '#000' },
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
  videoDetailText: { flex: 1, marginLeft: 12 },
  videoDetailTitle: { color: TEXT, fontSize: 16, fontWeight: '900' },
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
  emptyTitle: { marginTop: 12, color: TEXT, fontSize: 16, fontWeight: '900' },
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
  showAllButtonText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});