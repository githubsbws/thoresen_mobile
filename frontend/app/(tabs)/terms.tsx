import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../src/components/AppHeader';
import { getConditions, ConditionData } from '../../src/services/conditions';

const PRIMARY = '#001B74';
const RED = '#E30613';
const BG = '#F4F6FA';
const TEXT = '#111827';
const MUTED = '#4B5563';
const BORDER = '#E5E7EB';

export default function TermsScreen() {
  const { t, i18n } = useTranslation();

  const [condition, setCondition] = useState<ConditionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const isThai = i18n.language?.startsWith('th');

  const fetchConditions = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const langId = isThai ? 2 : 1;
      const res = await getConditions(langId);
      setCondition(res.condition);
    } catch (error) {
      console.error('Failed to load terms & conditions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, [i18n.language]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConditions(false);
  };

  const handleAccept = () => {
    setAccepted(true);
    Alert.alert(
      isThai ? 'บันทึกการยอมรับแล้ว' : 'Terms Accepted',
      isThai
        ? 'คุณได้ยอมรับข้อกำหนดและเงื่อนไขการใช้งานเรียบร้อยแล้ว'
        : 'You have agreed to the Terms & Conditions.',
      [
        {
          text: 'OK',
          onPress: () => {
            if (router.canGoBack()) {
              router.back();
            }
          },
        },
      ],
    );
  };

  const handleOpenEmail = () => {
    Linking.openURL('mailto:Shipping-IT@thoresen.com');
  };

  const handleOpenWeb = () => {
    Linking.openURL('https://thorconn.com/dashboard/terms');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <AppHeader />

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PRIMARY]}
            />
          }
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={16} color="#fff" />
            <Text style={styles.backText}>{t('back', { defaultValue: 'Back' })}</Text>
          </TouchableOpacity>

          {/* Hero Header Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroTextCol}>
              <Text style={styles.heroSmall}>THORESEN POLICY</Text>
              <Text style={styles.heroTitle}>
                {condition?.title || (isThai ? 'ข้อกำหนด & เงื่อนไข' : 'Terms & Conditions')}
              </Text>
              <Text style={styles.heroSub}>
                {isThai
                  ? 'โปรดอ่านและทำความเข้าใจข้อกำหนดและเงื่อนไขก่อนเข้าใช้งานระบบ'
                  : 'Please read the terms and conditions carefully before using this system.'}
              </Text>
            </View>

            <View style={styles.heroIcon}>
              <Ionicons name="document-text" size={30} color="#fff" />
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={PRIMARY} />
              <Text style={styles.loadingText}>
                {isThai ? 'กำลังโหลดข้อกำหนดและเงื่อนไข...' : 'Loading terms & conditions...'}
              </Text>
            </View>
          ) : condition ? (
            <>
              {/* Introduction Box */}
              {condition.intro ? (
                <View style={styles.introCard}>
                  <View style={styles.introIconWrap}>
                    <Ionicons name="information-circle" size={22} color={PRIMARY} />
                  </View>
                  <Text style={styles.introText}>{condition.intro}</Text>
                </View>
              ) : null}

              {/* Numbered Clause Cards (01 - 06) */}
              {condition.items && condition.items.length > 0 ? (
                condition.items.map((item) => (
                  <View key={item.number} style={styles.clauseCard}>
                    <View style={styles.clauseHeader}>
                      <View style={styles.numBadge}>
                        <Text style={styles.numText}>{item.number}</Text>
                      </View>
                      <Text style={styles.clauseTitle}>
                        {isThai ? `ข้อที่ ${parseInt(item.number, 10)}` : `Clause ${parseInt(item.number, 10)}`}
                      </Text>
                    </View>
                    <Text style={styles.clauseParagraph}>{item.text}</Text>
                  </View>
                ))
              ) : null}

              {/* Contact & Policy Box */}
              <View style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <Ionicons name="shield-checkmark" size={20} color={PRIMARY} />
                  <Text style={styles.contactTitle}>
                    {isThai ? 'ข้อมูลเพิ่มเติม & นโยบายความเป็นส่วนตัว' : 'Additional Info & Privacy Policy'}
                  </Text>
                </View>

                <Text style={styles.contactDesc}>
                  {isThai
                    ? 'เอกสาร “นโยบายการคุ้มครองข้อมูลส่วนบุคคล” และข้อกำหนดเพิ่มเติม สามารถติดต่อสอบถามได้ที่:'
                    : 'For Privacy Policy documents and further details, please contact:'}
                </Text>

                <View style={styles.companyInfoBox}>
                  <Text style={styles.companyName}>
                    {isThai
                      ? 'ฝ่าย ไอที บริษัท โทรีเซน (กรุงเทพ) จำกัด'
                      : 'IT Department, Thoresen & Co. (Bangkok) Ltd.'}
                  </Text>
                  <Text style={styles.companyAddress}>
                    {isThai
                      ? '26/32-34 อาคารอรกานต์ ชั้น 10 ซอยชิดลม ถนนเพลินจิต แขวงลุมพินี เขตปทุมวัน กรุงเทพฯ 10330'
                      : '26/32-34 Orakarn Building, 10th Floor, Soi Chidlom, Ploenchit Road, Lumpinee, Pathumwan, Bangkok 10330'}
                  </Text>
                </View>

                {/* Email Action */}
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={handleOpenEmail}
                  activeOpacity={0.7}
                >
                  <View style={styles.actionIconBox}>
                    <Ionicons name="mail" size={16} color={PRIMARY} />
                  </View>
                  <Text style={styles.actionText}>Shipping-IT@thoresen.com</Text>
                  <Ionicons name="open-outline" size={16} color={MUTED} style={styles.actionExternal} />
                </TouchableOpacity>

                {/* Web Action */}
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={handleOpenWeb}
                  activeOpacity={0.7}
                >
                  <View style={styles.actionIconBox}>
                    <Ionicons name="globe-outline" size={16} color={PRIMARY} />
                  </View>
                  <Text style={styles.actionText}>thorconn.com/dashboard/terms</Text>
                  <Ionicons name="open-outline" size={16} color={MUTED} style={styles.actionExternal} />
                </TouchableOpacity>
              </View>

              {/* Accept Button */}
              <TouchableOpacity
                style={[styles.acceptBtn, accepted && styles.acceptBtnDone]}
                onPress={handleAccept}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={accepted ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.acceptText}>
                  {accepted
                    ? isThai
                      ? 'ยอมรับข้อกำหนดแล้ว'
                      : 'Terms Accepted'
                    : isThai
                    ? 'ยอมรับข้อกำหนดและเงื่อนไข'
                    : 'Accept Terms & Conditions'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.clauseCard}>
              <Text style={styles.emptyText}>
                {isThai ? 'ไม่พบข้อมูลข้อกำหนดและเงื่อนไข' : 'No terms and conditions found.'}
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 {t('footer', { defaultValue: 'Thoresen. All rights reserved.' })}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  container: {
    flex: 1,
    backgroundColor: BG,
  },

  scroll: {
    flex: 1,
    backgroundColor: BG,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  backBtn: {
    marginTop: 12,
    width: 78,
    height: 34,
    borderRadius: 18,
    backgroundColor: PRIMARY,
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
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },

  heroTextCol: {
    flex: 1,
    paddingRight: 8,
  },

  heroSmall: {
    color: '#BFD0FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },

  heroSub: {
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

  introCard: {
    marginTop: 14,
    backgroundColor: '#EEF4FF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#D4E2FF',
  },

  introIconWrap: {
    marginRight: 10,
    marginTop: 2,
  },

  introText: {
    flex: 1,
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '600',
    lineHeight: 20,
  },

  clauseCard: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  clauseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  numBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  numText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '900',
  },

  clauseTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT,
  },

  clauseParagraph: {
    fontSize: 13.5,
    color: '#374151',
    lineHeight: 22,
  },

  contactCard: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },

  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  contactTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: PRIMARY,
  },

  contactDesc: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 19,
    marginBottom: 10,
  },

  companyInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: PRIMARY,
    marginBottom: 12,
  },

  companyName: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 4,
  },

  companyAddress: {
    fontSize: 12,
    color: MUTED,
    lineHeight: 18,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  actionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  actionText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: PRIMARY,
  },

  actionExternal: {
    marginLeft: 6,
  },

  loadingBox: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '600',
  },

  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },

  acceptBtn: {
    height: 50,
    borderRadius: 16,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 8,
    flexDirection: 'row',
    gap: 8,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },

  acceptBtnDone: {
    backgroundColor: '#059669',
  },

  acceptText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },

  footer: {
    height: 44,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  footerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});