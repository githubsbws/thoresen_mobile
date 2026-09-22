import React, { useRef, useState } from 'react';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  PanResponder,
} from 'react-native';

import '../../src/locales/i18n';
import { colors } from '../../src/theme';
import { useTranslation } from 'react-i18next';

const crewButton = require('../../assets/images/crew-complaint/crew-icon.png');

export default function TabsLayout() {
  const [showCrew, setShowCrew] = useState(false);
  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,

      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dy) > 5;
      },

      onPanResponderMove: (_, gesture) => {
        panY.setValue(gesture.dy);
      },

      onPanResponderRelease: () => {
        panY.extractOffset();
      },
    })
  ).current;

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textHint,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tabs.Screen
          name="Home"
          options={{
            title: 'หน้าหลัก',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="library"
          options={{
            title: 'เอกสาร',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="folder-open" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="news"
          options={{
            title: 'ข่าวสาร',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="notifications" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="contact"
          options={{
            title: 'ติดต่อ',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="call-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'โปรไฟล์',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen name="faq" options={{ href: null }} />
        <Tabs.Screen name="terms" options={{ href: null }} />
        <Tabs.Screen name="about" options={{ href: null }} />
        <Tabs.Screen name="how-to-use" options={{ href: null }} />
        <Tabs.Screen name="courses" options={{ href: null }} />
        <Tabs.Screen name="report" options={{ href: null }} />
        <Tabs.Screen name="exams" options={{ href: null }} />
        <Tabs.Screen name="Mess-room" options={{ href: null }} />
      </Tabs>

      <Animated.View
        style={[
          styles.crewFloating,
          showCrew ? styles.crewOpen : styles.crewClose,
          {
            transform: [{ translateY: panY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {showCrew && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/crew-complaint' as any)}
          >
            <Image
              source={crewButton}
              style={styles.crewImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.toggleBtn}
          activeOpacity={0.85}
          onPress={() => setShowCrew(!showCrew)}
        >
          <Ionicons
            name={showCrew ? 'chevron-forward' : 'chatbubble-ellipses'}
            size={22}
            color="#fff"
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
    height: 66,
    paddingBottom: 8,
    paddingTop: 6,
  },

  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
  },

  crewFloating: {
    position: 'absolute',
    bottom: 92,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 20,
  },

  crewOpen: {
    right: 8,
  },

  crewClose: {
    right: -6,
  },

  crewImage: {
    width: 74,
    height: 104,
  },

  toggleBtn: {
    width: 36,
    height: 64,
    backgroundColor: '#001B74',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});