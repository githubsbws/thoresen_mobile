import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function RegisterScreen() {
  const { register, isAuthenticating } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('แจ้งเตือน', 'รหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      await register(email, password, name);
      router.replace('/(tabs)' as any);
    } catch (error: any) {
      Alert.alert(
        'สมัครสมาชิกไม่สำเร็จ',
        error?.message || 'กรุณาลองใหม่'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#0B3D91" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Ionicons name="boat" size={54} color="#0B3D91" />
          <Text style={styles.brand}>THORESEN</Text>
          <Text style={styles.subBrand}>E-LEARNING PLATFORM</Text>
        </View>

        <Text style={styles.title}>สมัครสมาชิก</Text>
        <Text style={styles.subtitle}>สร้างบัญชีเพื่อเข้าใช้งานระบบ</Text>

        <Text style={styles.label}>ชื่อ-นามสกุล</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกชื่อ-นามสกุล"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>อีเมล</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกอีเมล"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>รหัสผ่าน</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกรหัสผ่าน"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
        <TextInput
          style={styles.input}
          placeholder="ยืนยันรหัสผ่าน"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>สมัครสมาชิก</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.normalText}>มีบัญชีแล้ว? </Text>
          <TouchableOpacity onPress={() => router.replace('/login' as any)}>
            <Text style={styles.loginText}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 22,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0B3D91',
    marginTop: 8,
    letterSpacing: 2,
  },
  subBrand: {
    fontSize: 12,
    color: '#6B7280',
    letterSpacing: 2,
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 15,
    color: '#111827',
  },
  button: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#0B3D91',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  normalText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginText: {
    fontSize: 14,
    color: '#0B3D91',
    fontWeight: '700',
  },
});