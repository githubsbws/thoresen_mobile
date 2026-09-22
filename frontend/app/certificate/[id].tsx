import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY = '#001B74';
const RED = '#E30613';
const GREEN = '#57C46B';
const BG = '#F4F6FA';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';

const logo = require('../../assets/images/banner/logo-new.png');

export default function CertificateScreen() {
  const { id, courseName, studentName } = useLocalSearchParams<{
    id: string;
    courseName?: string;
    studentName?: string;
  }>();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [certificateUnlocked, setCertificateUnlocked] = useState(false);

  const displayStudentName =
    typeof studentName === 'string' && studentName.trim()
      ? studentName
      : 'Captain Somchai';

  const displayCourseName =
    typeof courseName === 'string' && courseName.trim()
      ? courseName
      : 'Thoresen E-Learning Course';

  const completionDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const certificateNumber = `THR-${new Date().getFullYear()}-${id ?? '001'}`;

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    const createCertificateHtml = () => {
    const safeStudentName = escapeHtml(displayStudentName);
    const safeCourseName = escapeHtml(displayCourseName);
    const safeCourseId = escapeHtml(id ?? '001');
    const safeCertificateNumber = escapeHtml(certificateNumber);

                return `
                  <!DOCTYPE html>
                  <html lang="en">
                    <head>
                      <meta charset="UTF-8" />

                      <style>
                        @page {
                          size: A4 landscape;
                          margin: 0;
                        }

                        * {
                          box-sizing: border-box;
                        }

                        body {
                          margin: 0;
                          padding: 0;
                          background: #ffffff;
                          font-family: Arial, Helvetica, sans-serif;
                          color: #111827;
                        }

                        .page {
                          width: 100%;
                          height: 100%;
                          min-height: 595px;
                          padding: 28px;
                          background: #ffffff;
                        }

                        .outer-border {
                          width: 100%;
                          height: 100%;
                          min-height: 539px;
                          border: 10px solid #001B74;
                          padding: 10px;
                        }

                        .inner-border {
                          width: 100%;
                          min-height: 519px;
                          border: 3px solid #E30613;
                          padding: 35px 55px;
                          text-align: center;
                          position: relative;
                        }

                        .brand {
                          color: #001B74;
                          font-size: 18px;
                          font-weight: 800;
                          letter-spacing: 3px;
                          margin-bottom: 12px;
                        }

                        .title {
                          color: #001B74;
                          font-size: 46px;
                          font-weight: 900;
                          letter-spacing: 4px;
                          margin: 0;
                        }

                        .subtitle {
                          color: #6B7280;
                          font-size: 17px;
                          font-weight: 600;
                          margin-top: 16px;
                        }

                        .student-name {
                          display: inline-block;
                          color: #E30613;
                          font-size: 38px;
                          font-weight: 900;
                          margin-top: 16px;
                          padding: 0 30px 8px;
                          border-bottom: 2px solid #001B74;
                        }

                        .course-name {
                          color: #001B74;
                          font-size: 25px;
                          font-weight: 900;
                          margin-top: 15px;
                        }

                        .details {
                          margin-top: 25px;
                          display: flex;
                          flex-direction: row;
                          justify-content: space-between;
                          text-align: left;
                          padding: 0 45px;
                        }

                        .detail-box {
                          width: 30%;
                          text-align: center;
                        }

                        .detail-label {
                          color: #6B7280;
                          font-size: 12px;
                          font-weight: 700;
                        }

                        .detail-value {
                          color: #111827;
                          font-size: 14px;
                          font-weight: 900;
                          margin-top: 6px;
                        }

                        .signature-row {
                          margin-top: 46px;
                          display: flex;
                          flex-direction: row;
                          justify-content: space-between;
                          padding: 0 55px;
                        }

                        .signature-box {
                          width: 220px;
                          border-top: 1px solid #111827;
                          padding-top: 8px;
                          color: #001B74;
                          font-size: 13px;
                          font-weight: 800;
                        }

                        .seal {
                          position: absolute;
                          right: 30px;
                          top: 25px;
                          width: 76px;
                          height: 76px;
                          border-radius: 50%;
                          background: #57C46B;
                          color: #ffffff;
                          font-size: 42px;
                          line-height: 76px;
                          font-weight: 900;
                          text-align: center;
                        }
                      </style>
                    </head>

                    <body>
                      <div class="page">
                        <div class="outer-border">
                          <div class="inner-border">
                            <div class="seal">✓</div>

                            <div class="brand">
                              THORESEN E-LEARNING
                            </div>

                            <h1 class="title">
                              CERTIFICATE
                            </h1>

                            <div class="subtitle">
                              This certificate is proudly presented to
                            </div>

                            <div class="student-name">
                              ${safeStudentName}
                            </div>

                            <div class="subtitle">
                              for successfully completing the course
                            </div>

                            <div class="course-name">
                              ${safeCourseName}
                            </div>

                            <div class="details">
                              <div class="detail-box">
                                <div class="detail-label">Course ID</div>
                                <div class="detail-value">${safeCourseId}</div>
                              </div>

                              <div class="detail-box">
                                <div class="detail-label">Completion Date</div>
                                <div class="detail-value">${completionDate}</div>
                              </div>

                              <div class="detail-box">
                                <div class="detail-label">Certificate No.</div>
                                <div class="detail-value">${safeCertificateNumber}</div>
                              </div>
                            </div>

                            <div class="signature-row">
                              <div class="signature-box">
                                Course Instructor
                              </div>

                              <div class="signature-box">
                                Thoresen Training Department
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </body>
                  </html>
                `;
              };
                useEffect(() => {
                const checkCertificatePermission = async () => {
                  try {
                    if (!id) {
                      Alert.alert('เกิดข้อผิดพลาด', 'ไม่พบรหัสหลักสูตร', [
                        {
                          text: 'ตกลง',
                          onPress: () => router.back(),
                        },
                      ]);
                      return;
                    }

                    const raw = await AsyncStorage.getItem(
                      `course_progress_${id}`,
                    );

                    const progress = raw ? JSON.parse(raw) : null;
                    const evaluationCompleted =
                      progress?.evaluationDone === true;

                    if (!evaluationCompleted) {
                      Alert.alert(
                        'ยังไม่สามารถออกใบประกาศได้',
                        'กรุณาเรียนให้ครบและทำแบบประเมินก่อน',
                        [
                          {
                            text: 'ตกลง',
                            onPress: () => router.back(),
                          },
                        ],
                      );

                      return;
                    }

                    setCertificateUnlocked(true);
                  } catch (error) {
                    console.error('Certificate permission error:', error);

                    Alert.alert(
                      'เกิดข้อผิดพลาด',
                      'ไม่สามารถตรวจสอบสถานะหลักสูตรได้',
                      [
                        {
                          text: 'ตกลง',
                          onPress: () => router.back(),
                        },
                      ],
                    );
                  } finally {
                    setIsChecking(false);
                  }
                };

                checkCertificatePermission();
              }, [id]);

              const downloadCertificate = async () => {
                if (isGenerating || !certificateUnlocked) {
                  return;
                }

                try {
                  setIsGenerating(true);

                  const { uri } = await Print.printToFileAsync({
                    html: createCertificateHtml(),
                    width: 842,
                    height: 595,
                    base64: false,
                  });

                  const canShare = await Sharing.isAvailableAsync();

                  if (!canShare) {
                    Alert.alert(
                      'สร้าง PDF สำเร็จ',
                      `สร้างใบประกาศสำเร็จแล้ว\n\nตำแหน่งไฟล์:\n${uri}`,
                    );
                    return;
                  }

                  await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'บันทึกใบประกาศ PDF',
                    UTI: 'com.adobe.pdf',
                  });
                } catch (error) {
                  console.error('Certificate PDF error:', error);

                  Alert.alert(
                    'เกิดข้อผิดพลาด',
                    'ไม่สามารถสร้างไฟล์ใบประกาศ PDF ได้ กรุณาลองใหม่อีกครั้ง',
                  );
                } finally {
                  setIsGenerating(false);
                }
              };

              return (
                <SafeAreaView style={styles.safe} edges={['top']}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                      <Image source={logo} style={styles.logo} resizeMode="contain" />
                    </View>

                    <View style={styles.page}>
                      <TouchableOpacity
                        style={styles.backBtn}
                        activeOpacity={0.8}
                        onPress={() => router.back()}
                      >
                        <Ionicons name="chevron-back" size={15} color="#fff" />
                        <Text style={styles.backText}>Back</Text>
                      </TouchableOpacity>

                      <View style={styles.heroCard}>
                        <View style={styles.heroContent}>
                          <Text style={styles.heroSmall}>THORESEN E-LEARNING</Text>
                          <Text style={styles.heroTitle}>Certificate</Text>
                          <Text style={styles.heroSub}>Course ID: {id ?? '001'}</Text>
                        </View>

                        <View style={styles.heroIcon}>
                          <Ionicons name="ribbon" size={38} color="#fff" />
                        </View>
                      </View>

                      <View style={styles.certCard}>
                        <View style={styles.certBorder}>
                          <Text style={styles.certSmall}>
                            CERTIFICATE OF COMPLETION
                          </Text>

                          <Ionicons name="ribbon" size={52} color={GREEN} />

                          <Text style={styles.certText}>This certifies that</Text>

                          <Text style={styles.name}>{displayStudentName}</Text>

                          <Text style={styles.certText}>
                            has successfully completed
                          </Text>

                          <Text style={styles.courseName}>
                            {displayCourseName}
                          </Text>

                          <View style={styles.line} />

                          <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                              <Text style={styles.infoLabel}>Completion Date</Text>
                              <Text style={styles.infoValue}>{completionDate}</Text>
                            </View>

                            <View style={styles.infoItem}>
                              <Text style={styles.infoLabel}>Certificate No.</Text>
                              <Text style={styles.infoValue}>{certificateNumber}</Text>
                            </View>
                          </View>

                          <Text style={styles.signature}>
                            Thoresen Training Department
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.downloadBtn,
                          (isGenerating || isChecking || !certificateUnlocked) && styles.downloadBtnDisabled,
                        ]}
                        activeOpacity={0.85}
                        disabled={isGenerating || isChecking || !certificateUnlocked}
                        onPress={downloadCertificate}
                      >
                        {isGenerating ? (
                          <>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text style={styles.downloadText}>
                              กำลังสร้างไฟล์ PDF...
                            </Text>
                          </>
                        ) : (
                          <>
                            <Ionicons
                              name="download-outline"
                              size={18}
                              color="#fff"
                            />

                            <Text style={styles.downloadText}>
                              Download Certificate PDF
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                      <Text style={styles.footerText}>
                        ©2026 Thoresen e-learning
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

  header: {
    height: 78,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  logo: {
    width: 170,
    height: 52,
  },

  page: {
    paddingHorizontal: 16,
  },

  backBtn: {
    marginTop: 12,
    width: 78,
    height: 34,
    backgroundColor: PRIMARY,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 2,
  },

  heroCard: {
    marginTop: 14,
    backgroundColor: PRIMARY,
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  heroContent: {
    flex: 1,
    paddingRight: 12,
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

  heroSub: {
    color: '#DCEBFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },

  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },

  certCard: {
    marginTop: 18,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 4,
  },

  certBorder: {
    borderWidth: 2,
    borderColor: PRIMARY,
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
  },

  certSmall: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 14,
    textAlign: 'center',
  },

  certText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
    textAlign: 'center',
  },

  name: {
    color: PRIMARY,
    fontSize: 25,
    fontWeight: '900',
    marginTop: 10,
    textAlign: 'center',
  },

  courseName: {
    color: TEXT,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 10,
    textAlign: 'center',
  },

  line: {
    width: '80%',
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 22,
  },

  infoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },

  infoItem: {
    flex: 1,
  },

  infoLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },

  infoValue: {
    color: TEXT,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
    textAlign: 'center',
  },

  signature: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 26,
    textAlign: 'center',
  },

  downloadBtn: {
    marginTop: 16,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },

  downloadBtnDisabled: {
    opacity: 0.65,
  },

  downloadText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },

  footer: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    marginTop: 22,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },

  footerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});