import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

const NAVY = '#001B74';
const DARK_NAVY = '#00114A';
const BLUE = '#0B63CE';
const RED = '#C1121F';
const WHITE = '#FFFFFF';
const BG = '#F7F8FC';
const TEXT = '#111827';
const MUTED = '#7A8292';
const BORDER = '#E6E9F0';

type FocusedField = 'username' | 'password' | null;

export default function LoginScreen() {
  const { width, height } = useWindowDimensions();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);

  const { login, isAuthenticating } = useAuth();

  const screen = useMemo(() => {
    const contentWidth = Math.min(width, 480);
    const compact = height < 720;

    return {
      compact,
      contentWidth,
      headerHeight: compact ? 300 : Math.min(350, height * 0.42),
      formPadding: width < 380 ? 22 : 26,
      logoSize: compact ? 78 : 90,
      brandSize: width < 380 ? 30 : 34,
    };
  }, [width, height]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert(
        'กรุณากรอกข้อมูล',
        'กรุณากรอกอีเมลหรือชื่อผู้ใช้และรหัสผ่าน',
      );
      return;
    }

    try {
      await login(username.trim(), password);
      router.replace('/(tabs)/Home' as any);
    } catch (error: any) {
      Alert.alert(
        'เข้าสู่ระบบไม่สำเร็จ',
        error?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      );
    }
  };

  const showComingSoon = (title: string) => {
    Alert.alert(title, 'ระบบนี้อยู่ระหว่างการพัฒนา');
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_NAVY} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          contentContainerStyle={[
            styles.scrollContent,
            { minHeight: height },
          ]}
        >
          <View style={[styles.page, { width: screen.contentWidth }]}> 
            <View style={[styles.header, { height: screen.headerHeight }]}> 
              <View style={styles.redGlowTop} />
              <View style={styles.redArcTop} />
              <View style={styles.blueShape} />
              <View style={styles.redArcRight} />
              <View style={styles.redDot} />

              <View style={styles.dotsTop}>
                {Array.from({ length: 42 }).map((_, index) => (
                  <View key={index} style={styles.dot} />
                ))}
              </View>

              <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View
                  style={[
                    styles.logoOuter,
                    {
                      width: screen.logoSize,
                      height: screen.logoSize,
                      borderRadius: screen.logoSize / 2,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.logoCircle,
                      {
                        width: screen.logoSize - 8,
                        height: screen.logoSize - 8,
                        borderRadius: (screen.logoSize - 8) / 2,
                      },
                    ]}
                  >
                    <Ionicons
                      name="boat-outline"
                      size={screen.logoSize * 0.47}
                      color={WHITE}
                    />
                    <View style={styles.logoAccent}>
                      <View style={styles.logoAccentWhite} />
                      <View style={styles.logoAccentRed} />
                    </View>
                  </View>
                </View>

                <Text style={[styles.brand, { fontSize: screen.brandSize }]}> 
                  THORESEN
                </Text>

                <View style={styles.brandSubtitleRow}>
                  <View style={styles.brandLine} />
                  <Text style={styles.brandSubtitleRed}>E</Text>
                  <Text style={styles.brandSubtitle}>-LEARNING PLATFORM</Text>
                  <View style={styles.brandLine} />
                </View>

                <Text style={styles.headerDescription}>
                  Online training system for crew learning,{`\n`}
                  course evaluation and certificates.
                </Text>
              </SafeAreaView>
            </View>

            <View
              style={[
                styles.formSection,
                {
                  paddingHorizontal: screen.formPadding,
                  minHeight: Math.max(520, height - screen.headerHeight + 28),
                },
              ]}
            >
              <View style={styles.handle} />

              <View style={styles.headingSection}>
                <Text style={styles.title}>เข้าสู่ระบบ</Text>
                <View style={styles.titleRedLine} />
                <Text style={styles.description}>
                  กรุณาเข้าสู่ระบบเพื่อเริ่มเรียนคอร์สของคุณ
                </Text>
              </View>

              <Text style={styles.label}>อีเมล หรือ ชื่อผู้ใช้</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'username' && styles.inputContainerFocused,
                ]}
              >
                <View style={styles.inputIcon}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={focusedField === 'username' ? NAVY : MUTED}
                  />
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="กรอกอีเมลหรือชื่อผู้ใช้"
                  placeholderTextColor="#A1A8B4"
                  value={username}
                  onChangeText={setUsername}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                />

                {username.length > 0 && (
                  <TouchableOpacity
                    style={styles.inputAction}
                    onPress={() => setUsername('')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={19} color="#B8BFCA" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.label}>รหัสผ่าน</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'password' && styles.inputContainerFocused,
                ]}
              >
                <View style={styles.inputIcon}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={focusedField === 'password' ? NAVY : MUTED}
                  />
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="กรอกรหัสผ่าน"
                  placeholderTextColor="#A1A8B4"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />

                <TouchableOpacity
                  style={styles.inputAction}
                  onPress={() => setShowPassword(prev => !prev)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={showPassword ? NAVY : MUTED}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={styles.rememberButton}
                  onPress={() => setRememberMe(prev => !prev)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      rememberMe && styles.checkboxActive,
                    ]}
                  >
                    {rememberMe && (
                      <Ionicons name="checkmark" size={13} color={WHITE} />
                    )}
                  </View>
                  <Text style={styles.rememberText}>จดจำฉันไว้</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => showComingSoon('ลืมรหัสผ่าน')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotText}>ลืมรหัสผ่าน?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isAuthenticating && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isAuthenticating}
                activeOpacity={0.88}
              >
                {isAuthenticating ? (
                  <ActivityIndicator color={WHITE} />
                ) : (
                  <>
                    <Text style={styles.loginText}>เข้าสู่ระบบ</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={22}
                      color={WHITE}
                      style={styles.loginArrow}
                    />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <View style={styles.dividerBadge}>
                  <Text style={styles.dividerText}>หรือ</Text>
                </View>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => showComingSoon('Google Login')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.googleLetter}>G</Text>
                  <Text style={styles.socialText}>เข้าสู่ระบบด้วย Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => showComingSoon('LINE Login')}
                  activeOpacity={0.8}
                >
                  <View style={styles.lineIcon}>
                    <Text style={styles.lineLetter}>LINE</Text>
                  </View>
                  <Text style={styles.socialText}>เข้าสู่ระบบด้วย LINE</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.registerRow}>
                <Text style={styles.registerNormal}>ยังไม่มีบัญชี? </Text>
                <TouchableOpacity
                  onPress={() => router.push('/register' as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.registerText}>สมัครสมาชิก</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dotsBottom}>
                {Array.from({ length: 30 }).map((_, index) => (
                  <View key={index} style={styles.dotBottom} />
                ))}
              </View>
              <View style={styles.bottomGlow} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: '#151515' },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#151515',
  },
  page: {
    maxWidth: 480,
    minHeight: '100%',
    backgroundColor: DARK_NAVY,
    overflow: 'hidden',
  },
  header: {
    width: '100%',
    backgroundColor: DARK_NAVY,
    overflow: 'hidden',
    position: 'relative',
  },
  headerSafe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingBottom: 30,
  },
  redGlowTop: {
    position: 'absolute',
    top: -85,
    left: -80,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(239,35,60,0.22)',
  },
  redArcTop: {
    position: 'absolute',
    top: -98,
    left: -93,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: RED,
  },
  blueShape: {
    position: 'absolute',
    right: -45,
    bottom: -55,
    width: 210,
    height: 145,
    backgroundColor: 'rgba(20,63,148,0.28)',
    transform: [{ rotate: '-32deg' }],
  },
  redArcRight: {
    position: 'absolute',
    right: -90,
    bottom: -5,
    width: 175,
    height: 175,
    borderRadius: 88,
    borderWidth: 1,
    borderColor: 'rgba(239,35,60,0.42)',
  },
  redDot: {
    position: 'absolute',
    right: 37,
    bottom: 94,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: RED,
  },
  dotsTop: {
    position: 'absolute',
    right: 13,
    top: 20,
    width: 75,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    opacity: 0.42,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#3F7DFF',
  },
  logoOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
    marginBottom: 12,
  },
  logoCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BLUE,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  logoAccent: {
    position: 'absolute',
    bottom: 14,
    flexDirection: 'row',
  },
  logoAccentWhite: {
    width: 15,
    height: 2.5,
    borderRadius: 3,
    backgroundColor: WHITE,
  },
  logoAccentRed: {
    width: 15,
    height: 2.5,
    borderRadius: 3,
    backgroundColor: RED,
  },
  brand: {
    color: WHITE,
    fontWeight: '900',
    letterSpacing: 2.4,
    lineHeight: 40,
  },
  brandSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  brandLine: {
    width: 18,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 7,
  },
  brandSubtitleRed: {
    color: RED,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandSubtitle: {
    color: '#E8EDFA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headerDescription: {
    color: 'rgba(255,255,255,0.67)',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 13,
  },
  formSection: {
    flexGrow: 1,
    marginTop: -30,
    backgroundColor: BG,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    paddingTop: 11,
    paddingBottom: 26,
    position: 'relative',
    overflow: 'hidden',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 8,
    backgroundColor: '#D8DCE5',
    alignSelf: 'center',
    marginBottom: 15,
  },
  headingSection: { marginBottom: 13 },
  title: {
    color: NAVY,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '900',
  },
  titleRedLine: {
    width: 26,
    height: 3,
    borderRadius: 3,
    backgroundColor: RED,
    marginTop: 2,
  },
  description: {
    color: MUTED,
    fontSize: 11.5,
    lineHeight: 18,
    marginTop: 8,
  },
  label: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  inputContainer: {
    height: 49,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 9,
    elevation: 3,
  },
  inputContainerFocused: {
    borderColor: BLUE,
    shadowColor: BLUE,
    shadowOpacity: 0.14,
    elevation: 5,
  },
  inputIcon: {
    width: 46,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F0F1F5',
  },
  input: {
    flex: 1,
    height: 49,
    color: TEXT,
    fontSize: 12.5,
    paddingHorizontal: 12,
    paddingVertical: 0,
  },
  inputAction: {
    width: 42,
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 0,
    marginBottom: 13,
  },
  rememberButton: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#CAD0DC',
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  checkboxActive: { backgroundColor: RED, borderColor: RED },
  rememberText: { color: '#4B5263', fontSize: 11.5, fontWeight: '600' },
  forgotText: { color: RED, fontSize: 11.5, fontWeight: '800' },
  loginButton: {
    height: 51,
    borderRadius: 15,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: RED,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 11,
    elevation: 7,
  },
  loginButtonDisabled: { opacity: 0.65 },
  loginText: { color: WHITE, fontSize: 15, fontWeight: '900' },
  loginArrow: { position: 'absolute', right: 17 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 13,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerBadge: {
    minWidth: 36,
    height: 25,
    borderRadius: 13,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 9,
    borderWidth: 1,
    borderColor: '#ECEEF3',
  },
  dividerText: { color: MUTED, fontSize: 10.5, fontWeight: '700' },
  socialRow: { flexDirection: 'row', gap: 9 },
  socialButton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 2,
  },
  googleLetter: {
    color: '#4285F4',
    fontSize: 17,
    fontWeight: '900',
    marginRight: 6,
  },
  lineIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#06C755',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  lineLetter: { color: WHITE, fontSize: 5.2, fontWeight: '900' },
  socialText: {
    flexShrink: 1,
    color: TEXT,
    fontSize: 9.5,
    fontWeight: '700',
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    zIndex: 2,
  },
  registerNormal: { color: MUTED, fontSize: 11.5 },
  registerText: { color: RED, fontSize: 11.5, fontWeight: '900' },
  dotsBottom: {
    position: 'absolute',
    left: 6,
    bottom: 8,
    width: 58,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    opacity: 0.35,
  },
  dotBottom: {
    width: 2.5,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#3F7DFF',
  },
  bottomGlow: {
    position: 'absolute',
    right: -42,
    bottom: -54,
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: 'rgba(239,35,60,0.92)',
  },
});