import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

const PRIMARY = "#001B74";
const RED = "#E30613";

const logo = require("../../assets/images/banner/logo-new.png");

type MenuRoute =
  | "Home"
  | "About Us"
  | "Course"
  | "How to Use"
  | "FAQ"
  | "Contact Us"
  | "Mess-room"
  | "Library"
  | "Terms & Conditions"
  | "Report";

type MenuItem = {
  label: string;
  route: MenuRoute;
  icon: keyof typeof Ionicons.glyphMap;
};

type AppHeaderProps = {
  showNotification?: boolean;
};

export default function AppHeader({
  showNotification = true,
}: AppHeaderProps) {
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);

  const menuList: MenuItem[] = [
    { label: t("home"), route: "Home", icon: "home-outline" },
    {
      label: t("about"),
      route: "About Us",
      icon: "information-circle-outline",
    },
    { label: t("course"), route: "Course", icon: "school-outline" },
    {
      label: t("howto"),
      route: "How to Use",
      icon: "help-buoy-outline",
    },
    { label: t("faq"), route: "FAQ", icon: "chatbubbles-outline" },
    { label: t("contact"), route: "Contact Us", icon: "call-outline" },
    {
      label: t("messroom"),
      route: "Mess-room",
      icon: "restaurant-outline",
    },
    { label: t("library"), route: "Library", icon: "library-outline" },
    {
      label: t("terms"),
      route: "Terms & Conditions",
      icon: "document-text-outline",
    },
    { label: t("report"), route: "Report", icon: "megaphone-outline" },
  ];

  const handleMenuPress = (route: MenuRoute) => {
    setMenuVisible(false);

    const routes: Record<MenuRoute, string> = {
      Home: "/(tabs)/Home",
      "About Us": "/(tabs)/about",
      Course: "/(tabs)/courses",
      "How to Use": "/(tabs)/how-to-use",
      FAQ: "/(tabs)/faq",
      "Contact Us": "/(tabs)/contact",
      "Mess-room": "/(tabs)/Mess-room",
      Library: "/(tabs)/library",
      "Terms & Conditions": "/(tabs)/terms",
      Report: "/(tabs)/report",
    };

    router.push(routes[route] as any);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />

        <View style={styles.headerActions}>
          {showNotification && (
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => router.push("/(tabs)/news" as any)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={PRIMARY}
              />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="menu" size={25} color={PRIMARY} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />

          <View style={styles.menuPanel}>
            <View style={styles.menuHeader}>
              <View>
                <Text style={styles.menuEyebrow}>THORESEN</Text>
                <Text style={styles.menuTitle}>Menu</Text>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setMenuVisible(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={25} color={PRIMARY} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.menuScrollContent}
            >
              {menuList.map((item) => (
                <TouchableOpacity
                  key={item.route}
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(item.route)}
                  activeOpacity={0.75}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconBox}>
                      <Ionicons
                        name={item.icon}
                        size={21}
                        color={PRIMARY}
                      />
                    </View>

                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#98A2B3"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F6",
  },

  logo: {
    width: 138,
    height: 42,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3F6FB",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: RED,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },

  menuOverlay: {
    flex: 1,
    alignItems: "flex-end",
    backgroundColor: "rgba(10,20,40,0.45)",
  },

  menuPanel: {
    width: "82%",
    maxWidth: 350,
    height: "100%",
    paddingTop: 58,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    elevation: 16,
  },

  menuHeader: {
    paddingHorizontal: 5,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F6",
  },

  menuEyebrow: {
    color: RED,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  menuTitle: {
    marginTop: 3,
    color: PRIMARY,
    fontSize: 24,
    fontWeight: "900",
  },

  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F4F9",
  },

  menuScrollContent: {
    paddingBottom: 30,
  },

  menuItem: {
    minHeight: 63,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F5",
  },

  menuItemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  menuIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3FF",
    marginRight: 13,
  },

  menuItemText: {
    flex: 1,
    color: "#101828",
    fontSize: 14,
    fontWeight: "800",
  },
});
