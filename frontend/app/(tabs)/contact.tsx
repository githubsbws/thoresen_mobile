import React, { useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../src/components/AppHeader';

const PRIMARY = '#001B74';
const RED = '#E30613';
const BG = '#F4F6FA';

const COMPANY_LOCATION = {
  latitude: 13.7449,
  longitude: 100.5448,
};

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

const people = [
  {
    name: 'Nattavut Tancharoen',
    role: 'Marine Personnel',
    phone: '022500569',
    ext: '291',
    email: 'Nattavut@thoresen.com',
    image: require('../../assets/images/contact/Nattavut.jpg'),
  },
  {
    name: 'Saroj Thongthiengtrong',
    role: 'Marine Personnel',
    phone: '022500569',
    ext: '112',
    email: 'Saroj_T@thoresen.com',
    image: require('../../assets/images/contact/Saroj.jpg'),
  },
  {
    name: 'Samranjit Thoolmala',
    role: 'Marine Engineer',
    phone: '022500569',
    ext: '306',
    email: 'Samranjit@thoresen.com',
    image: require('../../assets/images/contact/Samranjit.jpg'),
  },
  {
    name: 'Suraphong Phongkam',
    role: 'Master Mariner',
    phone: '022500569',
    ext: '321',
    email: 'Suraphong@thoresen.com',
    image: require('../../assets/images/contact/Suraphong.jpg'),
  },
  {
    name: 'Wanida Kerdaroon',
    role: 'Training Coordinator',
    phone: '022500569',
    ext: '231',
    email: 'Wanida@thoresen.com',
    image: require('../../assets/images/contact/Wanida.jpeg'),
  },
  {
    name: 'Nawanat Phongam',
    role: 'Human Resources Officer',
    phone: '022500569',
    ext: '280',
    email: 'nawanat_p@thoresen.com',
    image: require('../../assets/images/contact/Nawanat.jpeg'),
  },
];

export default function ContactScreen() {
  const [menuVisible, setMenuVisible] = useState(false);

  const sendEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const makeCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const openMap = () => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${COMPANY_LOCATION.latitude},${COMPANY_LOCATION.longitude}`
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader />
        <View style={styles.content}>
          

          <View style={styles.heroCard}>
            <View>
              <Text style={styles.heroSmall}>THORESEN CONTACT</Text>
              <Text style={styles.heroTitle}>Contact Us</Text>
              <Text style={styles.heroText}>
                Contact our team for training support, marine personnel, HR, and general inquiries.
              </Text>
            </View>

            <View style={styles.heroIcon}>
              <Ionicons name="call" size={28} color="#fff" />
            </View>
          </View>

          <View style={styles.infoRow}>
            <TouchableOpacity style={styles.infoBox} onPress={openMap}>
              <Ionicons name="location" size={24} color={PRIMARY} />
              <Text style={styles.infoTitle}>Address</Text>
              <Text style={styles.infoText}>
                26/23-34 Orakarn Building 10th Floor,{'\n'}
                Soi Chidlom, Lumpinee, Bangkok
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoBox} onPress={() => makeCall('022500569')}>
              <Ionicons name="call" size={24} color={PRIMARY} />
              <Text style={styles.infoTitle}>Phone</Text>
              <Text style={styles.infoText}>
                +66 (0) 2254 8437{'\n'}
                +66 (0) 2250 0569
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionRow}>
            <View>
              <Text style={styles.sectionTitle}>Our Team</Text>
              <Text style={styles.sectionSub}>Marine / Training / HR Contact</Text>
            </View>
          </View>

          <View style={styles.grid}>
            {people.map((item, index) => (
              <View key={index} style={styles.card}>
                <Image source={item.image} style={styles.photo} />

                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.role}>{item.role}</Text>

                <View style={styles.extBadge}>
                  <Text style={styles.extText}>Ext. {item.ext}</Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.emailBtn}
                    onPress={() => sendEmail(item.email)}
                  >
                    <Ionicons name="mail-outline" size={14} color="#fff" />
                    <Text style={styles.emailText}>Email</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => makeCall(item.phone)}
                  >
                    <Ionicons name="call-outline" size={17} color={PRIMARY} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.mapTitle}>Company Location</Text>

          <TouchableOpacity activeOpacity={0.9} onPress={openMap}>
            <View style={styles.mapFrame}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: COMPANY_LOCATION.latitude,
                  longitude: COMPANY_LOCATION.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                pointerEvents="none"
              >
                <Marker
                  coordinate={COMPANY_LOCATION}
                  title="Thoresen & Co., (Bangkok) Ltd."
                  description="Orakarn Building, Bangkok"
                />
              </MapView>

              <View style={styles.mapOverlay}>
                <Ionicons name="navigate" size={15} color="#fff" />
                <Text style={styles.mapOverlayText}>Open Google Maps</Text>
              </View>
            </View>
          </TouchableOpacity>
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

  header: {
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
    backgroundColor: PRIMARY,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  heroSmall: {
    color: '#BFD0FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  heroTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 5,
  },

  heroText: {
    color: '#E8EDFF',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    width: 230,
  },

  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  infoBox: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E8F0',
  },

  infoTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111',
    marginTop: 7,
    marginBottom: 5,
  },

  infoText: {
    fontSize: 9,
    color: '#666',
    lineHeight: 14,
    textAlign: 'center',
  },

  sectionRow: {
    marginBottom: 12,
  },

  sectionTitle: {
    color: PRIMARY,
    fontSize: 20,
    fontWeight: '900',
  },

  sectionSub: {
    color: '#777',
    fontSize: 11,
    marginTop: 2,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 9,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E8F0',
  },

  photo: {
    width: '100%',
    height: 190,
    borderRadius: 14,
    resizeMode: 'cover',
    backgroundColor: '#EEF2F7',
  },

  name: {
    marginTop: 9,
    fontSize: 11,
    color: '#111',
    fontWeight: '900',
    textAlign: 'center',
  },

  role: {
    marginTop: 3,
    fontSize: 9,
    color: '#777',
    textAlign: 'center',
  },

  extBadge: {
    backgroundColor: '#EFF4FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
  },

  extText: {
    color: PRIMARY,
    fontSize: 8.5,
    fontWeight: '800',
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  emailBtn: {
    height: 26,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  emailText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },

  callBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    marginLeft: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDE5F2',
  },

  mapTitle: {
    color: PRIMARY,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: 10,
  },

  mapFrame: {
    height: 170,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E4E8F0',
    backgroundColor: '#fff',
  },

  map: {
    flex: 1,
  },

  mapOverlay: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: PRIMARY,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  mapOverlayText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },

  footer: {
    height: 38,
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
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
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
});