import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Share,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '../../src/context/AuthContext';

const PRIMARY = '#001B74';
const RED = '#E30613';
const GREEN = '#57C46B';
const BG = '#F4F6FA';
const TEXT = '#111827';
const MUTED = '#667085';
const BORDER = '#E4E8F0';

type CourseReference = {
  id: string;
  courseTitle: string;
};

type CompletedCertificate = {
  id: string;
  courseTitle: string;
  issuedDate: string;
  evaluationDate?: string;
};


const courseReferences: CourseReference[] = [
  {
    id: '1',
    courseTitle: 'Basic Management ( Gen 19 )',
  },
  {
    id: '2',
    courseTitle: 'Cargo Care Basic Course',
  },
  {
    id: '3',
    courseTitle: 'Maritime Labour Convention 2006',
  },
  {
    id: '4',
    courseTitle: 'Navigation Basic Course',
  },
  {
    id: '5',
    courseTitle: 'Technical Basic Course',
  },
  {
    id: '6',
    courseTitle: 'Quality and Safety Course',
  },
  {
    id: '7',
    courseTitle: 'Other Course',
  },
  {
    id: '8',
    courseTitle: 'Technical Advanced Course',
  },
  {
    id: 'bill-of-lading',
    courseTitle: 'Bill(s) of Lading Course ( Gen 17 )',
  },
  {
    id: 'cargo-hold-cleaning',
    courseTitle: 'Cargo Hold Cleaning Level 2',
  },
  {
    id: 'cargo-safety',
    courseTitle: 'Cargo Safety Operation',
  },
];

const formatDate = (value?: string) => {
  if (!value) {
    return new Date().toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function ProfileScreen() {
  const { user, logout, isAuthenticating } = useAuth();

  const [completedCertificates, setCompletedCertificates] = useState<
    CompletedCertificate[]
  >([]);

  const [isLoadingCertificates, setIsLoadingCertificates] = useState(true);

  const initials = useMemo(() => {
    return (user?.name || 'U U')
      .split(' ')
      .filter(Boolean)
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

  /*
    โหลดข้อมูลทุกครั้งที่กลับเข้าหน้า Profile

    เงื่อนไข:
    - ต้องมี evaluationDone === true
    - จึงถือว่าเรียนครบและมีสิทธิ์รับใบประกาศ
  */
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadCompletedCertificates = async () => {
        try {
          setIsLoadingCertificates(true);

          const certificateResults = await Promise.all(
            courseReferences.map(async course => {
              try {
                const storageKey = `course_progress_${course.id}`;
                const rawProgress = await AsyncStorage.getItem(storageKey);

                if (!rawProgress) {
                  return null;
                }

                const progress = JSON.parse(rawProgress);

                /*
                  evaluationDone จะถูกบันทึกจากหน้า evaluation/[id].tsx
                  หลังจากผู้ใช้เรียนครบและส่งแบบประเมินแล้ว
                */
                if (progress?.evaluationDone !== true) {
                  return null;
                }

                const certificate: CompletedCertificate = {
                  id: course.id,
                  courseTitle: course.courseTitle,
                  issuedDate: formatDate(progress.evaluationDate),
                  evaluationDate: progress.evaluationDate,
                };

                return certificate;
              } catch (error) {
                console.log(
                  `ไม่สามารถอ่าน progress ของคอร์ส ${course.id}`,
                  error,
                );

                return null;
              }
            }),
          );

          const completed = certificateResults.filter(
            (item): item is CompletedCertificate => item !== null,
          );

      
          completed.sort((a, b) => {
            const timeA = a.evaluationDate
              ? new Date(a.evaluationDate).getTime()
              : 0;

            const timeB = b.evaluationDate
              ? new Date(b.evaluationDate).getTime()
              : 0;

            return timeB - timeA;
          });

          if (isMounted) {
            setCompletedCertificates(completed);
          }
        } catch (error) {
          console.error('Load certificates error:', error);

          if (isMounted) {
            setCompletedCertificates([]);

            Alert.alert(
              'เกิดข้อผิดพลาด',
              'ไม่สามารถโหลดข้อมูลใบประกาศได้',
            );
          }
        } finally {
          if (isMounted) {
            setIsLoadingCertificates(false);
          }
        }
      };

      loadCompletedCertificates();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const showComingSoon = (title: string) => {
    Alert.alert(title, 'ฟังก์ชันนี้อยู่ระหว่างการพัฒนา');
  };


  const handleDownloadCert = (certificate: CompletedCertificate) => {
    router.push({
      pathname: '/certificate/[id]',
      params: {
        id: certificate.id,
        courseName: certificate.courseTitle,
        studentName: user?.name || 'Captain Somchai',
      },
    } as any);
  };

  const handleOpenCertificate = (certificate: CompletedCertificate) => {
    router.push({
      pathname: '/certificate/[id]',
      params: {
        id: certificate.id,
        courseName: certificate.courseTitle,
        studentName: user?.name || 'Captain Somchai',
      },
    } as any);
  };

  const handleShareCert = async (
    certificate: CompletedCertificate,
  ) => {
    try {
      await Share.share({
        title: 'THORESEN Certificate',
        message:
          `ฉันได้รับใบประกาศนียบัตรจาก THORESEN ` +
          `ในหลักสูตร ${certificate.courseTitle}`,
      });
    } catch (error) {
      console.error('Share certificate error:', error);

      Alert.alert(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถแชร์ข้อมูลใบประกาศได้',
      );
    }
  };

  const handleHelp = () => {
    Alert.alert(
      'ช่วยเหลือ / FAQ',
      'ต้องการติดต่อฝ่ายช่วยเหลือหรือไม่?',
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
        {
          text: 'ส่งอีเมล',
          onPress: async () => {
            const url =
              'mailto:support@thoresen.com?subject=THORESEN Support';

            try {
              await Linking.openURL(url);
            } catch {
              Alert.alert(
                'ไม่สามารถเปิดอีเมลได้',
                'กรุณาตรวจสอบแอปอีเมลในเครื่อง',
              );
            }
          },
        },
        {
          text: 'โทร',
          onPress: async () => {
            try {
              await Linking.openURL('tel:022500569');
            } catch {
              Alert.alert(
                'ไม่สามารถโทรได้',
                'อุปกรณ์นี้ไม่รองรับการโทร',
              );
            }
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบใช่หรือไม่?',
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
        {
          text: 'ออกจากระบบ',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login' as any);
            } catch (error) {
              console.error('Logout error:', error);

              Alert.alert(
                'เกิดข้อผิดพลาด',
                'ไม่สามารถออกจากระบบได้',
              );
            }
          },
        },
      ],
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      label: 'แก้ไขโปรไฟล์',
      onPress: () => showComingSoon('แก้ไขโปรไฟล์'),
    },
    {
      icon: 'notifications-outline',
      label: 'การแจ้งเตือน',
      onPress: () => showComingSoon('การแจ้งเตือน'),
    },
    {
      icon: 'help-circle-outline',
      label: 'ช่วยเหลือ / FAQ',
      onPress: handleHelp,
    },
    {
      icon: 'document-text-outline',
      label: 'เงื่อนไขการใช้งาน',
      onPress: () => router.push('/(tabs)/terms' as any),
    },
    {
      icon: 'call-outline',
      label: 'ติดต่อเรา',
      onPress: () => router.push('/(tabs)/contact' as any),
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSmall}>THORESEN</Text>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>

          <TouchableOpacity
            style={styles.editTopBtn}
            activeOpacity={0.8}
            onPress={() => showComingSoon('แก้ไขโปรไฟล์')}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>
              {user?.name || '—'}
            </Text>

            <Text style={styles.role}>
              {user?.role || 'User'}
            </Text>

            <View style={styles.vesselBadge}>
              <Ionicons
                name="boat-outline"
                size={13}
                color={PRIMARY}
              />

              <Text style={styles.vesselText}>
                {user?.vessel || 'THORESEN'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>
              {Math.max(
                courseReferences.length -
                  completedCertificates.length,
                0,
              )}
            </Text>

            <Text style={styles.statLabel}>
              กำลังเรียน
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNum}>
              {completedCertificates.length}
            </Text>

            <Text style={styles.statLabel}>
              เรียนจบแล้ว
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNum}>
              {completedCertificates.length}
            </Text>

            <Text style={styles.statLabel}>
              ใบประกาศ
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>
                My Certificates
              </Text>

              <Text style={styles.sectionSub}>
                ใบประกาศจากหลักสูตรที่เรียนสำเร็จ
              </Text>
            </View>

            <View style={styles.certCount}>
              <Text style={styles.certCountText}>
                {completedCertificates.length}
              </Text>
            </View>
          </View>

          {isLoadingCertificates ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator
                size="large"
                color={PRIMARY}
              />

              <Text style={styles.loadingText}>
                กำลังโหลดใบประกาศ...
              </Text>
            </View>
          ) : completedCertificates.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="ribbon-outline"
                  size={34}
                  color={MUTED}
                />
              </View>

              <Text style={styles.emptyTitle}>
                ยังไม่มีใบประกาศ
              </Text>

              <Text style={styles.emptyText}>
                เมื่อเรียนครบ ทำแบบทดสอบผ่านทุกบท และส่งแบบประเมิน
                ใบประกาศจะปรากฏในหน้านี้
              </Text>

              <TouchableOpacity
                style={styles.goCourseBtn}
                activeOpacity={0.85}
                onPress={() =>
                  router.push('/(tabs)/courses' as any)
                }
              >
                <Ionicons
                  name="book-outline"
                  size={17}
                  color="#fff"
                />

                <Text style={styles.goCourseText}>
                  ไปยังหลักสูตร
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            completedCertificates.map(certificate => (
              <TouchableOpacity
                key={certificate.id}
                style={styles.certCard}
                activeOpacity={0.85}
                onPress={() =>
                  handleOpenCertificate(certificate)
                }
              >
                <View style={styles.certTop}>
                  <View style={styles.certBadge}>
                    <Ionicons
                      name="ribbon"
                      size={26}
                      color="#D97706"
                    />
                  </View>

                  <View style={styles.certInfo}>
                    <Text style={styles.certBrand}>
                      THORESEN CERTIFICATE
                    </Text>

                    <Text
                      style={styles.certTitle}
                      numberOfLines={2}
                    >
                      {certificate.courseTitle}
                    </Text>

                    <View style={styles.completeRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={GREEN}
                      />

                      <Text style={styles.completeText}>
                        เรียนสำเร็จแล้ว
                      </Text>
                    </View>

                    <Text style={styles.certDate}>
                      วันที่ออก: {certificate.issuedDate}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#A0AEC0"
                  />
                </View>

                <View style={styles.certActions}>
                  <TouchableOpacity
                      style={styles.viewCertificateBtn}
                      activeOpacity={0.8}
                      onPress={event => {
                        event.stopPropagation();
                        handleOpenCertificate(certificate);
                      }}
                    >
                      <Ionicons
                        name="eye-outline"
                        size={17}
                        color="#fff"
                      />

                      <Text style={styles.viewCertificateText}>
                        ดูใบประกาศ
                      </Text>
                    </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.shareBtn}
                    activeOpacity={0.8}
                    onPress={event => {
                      event.stopPropagation();
                      handleShareCert(certificate);
                    }}
                  >
                    <Ionicons
                      name="share-social-outline"
                      size={16}
                      color={PRIMARY}
                    />

                    <Text style={styles.shareBtnText}>
                      แชร์
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.menuSection}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              activeOpacity={0.75}
              onPress={item.onPress}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={PRIMARY}
                />
              </View>

              <Text style={styles.menuLabel}>
                {item.label}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={17}
                color="#A0AEC0"
              />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.logoutItem}
            activeOpacity={0.75}
            onPress={handleLogout}
            disabled={isAuthenticating}
          >
            <View
              style={[
                styles.menuIcon,
                styles.logoutIcon,
              ]}
            >
              {isAuthenticating ? (
                <ActivityIndicator
                  size="small"
                  color={RED}
                />
              ) : (
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={RED}
                />
              )}
            </View>

            <Text
              style={[
                styles.menuLabel,
                styles.logoutText,
              ]}
            >
              ออกจากระบบ
            </Text>

            <Ionicons
              name="chevron-forward"
              size={17}
              color="#A0AEC0"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 Thoresen e-Learning
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  scrollContent: {
    flexGrow: 1,
  },

  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerSmall: {
    color: '#BFD0FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },

  editTopBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -52,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 3,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#EFF4FF',
  },

  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '900',
  },

  role: {
    color: MUTED,
    fontSize: 12,
    marginTop: 3,
  },

  vesselBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#EFF4FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  vesselText: {
    color: PRIMARY,
    fontSize: 10,
    fontWeight: '800',
  },

  statsCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 18,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
  },

  statNum: {
    fontSize: 22,
    fontWeight: '900',
    color: PRIMARY,
  },

  statLabel: {
    fontSize: 10,
    color: MUTED,
    marginTop: 2,
    fontWeight: '700',
    textAlign: 'center',
  },

  statDivider: {
    width: 1,
    backgroundColor: BORDER,
    marginVertical: 12,
  },

  section: {
    paddingHorizontal: 16,
    marginTop: 18,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    color: PRIMARY,
    fontSize: 20,
    fontWeight: '900',
  },

  sectionSub: {
    color: MUTED,
    fontSize: 11,
    marginTop: 2,
  },

  certCount: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
  },

  certCountText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },

  loadingBox: {
    minHeight: 180,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  loadingText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
  },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    color: PRIMARY,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 14,
  },

  emptyText: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
    textAlign: 'center',
  },

  goCourseBtn: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 16,
  },

  goCourseText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },

  certCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 2,
  },

  certTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  certBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  certInfo: {
    flex: 1,
  },

  certBrand: {
    fontSize: 9,
    fontWeight: '900',
    color: PRIMARY,
    letterSpacing: 0.7,
  },

  certTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: TEXT,
    marginTop: 4,
    lineHeight: 18,
  },

  completeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },

  completeText: {
    color: GREEN,
    fontSize: 10,
    fontWeight: '900',
  },

  certDate: {
    fontSize: 10,
    color: '#98A2B3',
    marginTop: 4,
  },

  certActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 13,
  },

  viewCertificateBtn: {
    flex: 2,
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },

  viewCertificateText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },

  shareBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PRIMARY,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 8,
  },

  shareBtnText: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: '900',
  },

  menuSection: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },

  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  logoutIcon: {
    backgroundColor: '#FFF1F1',
  },

  menuLabel: {
    flex: 1,
    fontSize: 14,
    color: TEXT,
    fontWeight: '700',
  },

  logoutText: {
    color: RED,
  },

  footer: {
    height: 42,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  footerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});