import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Easing,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import i18n from "../../src/locales/i18n";
import {
  getHome,
  Banner,
  Course,
  News,
  Video,
} from "../../src/services/home";

const PRIMARY = "#001B74";
const SECONDARY = "#0A4FB3";
const ACCENT = "#2563EB";
const RED = "#E30613";
const BACKGROUND = "#F4F7FC";
const TEXT = "#101828";
const MUTED = "#667085";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const logoImg = require("../../assets/images/banner/logo-new.png");
const cityImg = require("../../assets/images/banner/city.png");
const seaImg = require("../../assets/images/banner/sea.png");
const portImg = require("../../assets/images/banner/ship-left.png");
const shipCenterImg = require("../../assets/images/banner/ship-center.png");
const shipRightImg = require("../../assets/images/banner/ship-right.png");
const roadImg = require("../../assets/images/banner/tanon.png");
const carImg = require("../../assets/images/banner/car1.png");
const trainImg = require("../../assets/images/banner/rodfi.png");



export default function HomeScreen() {
  const { t } = useTranslation();

  const introOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(24)).current;
  const shipOneAnim = useRef(new Animated.Value(SCREEN_WIDTH + 120)).current;
  const shipTwoAnim = useRef(new Animated.Value(-180)).current;
  const carAnim = useRef(new Animated.Value(0)).current;
  const trainAnim = useRef(new Animated.Value(0)).current;

  const [banners, setBanners] = useState<Banner[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [video, setVideo] = useState<Video | null>(null);

  const [currentAd, setCurrentAd] = useState(0);

  const [showIntro, setShowIntro] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  const menuList = [
    { label: t("home"), route: "Home", icon: "home-outline" },
    {label: t("about"),route: "About Us", icon: "information-circle-outline",},
    { label: t("course"), route: "Course", icon: "school-outline" },
    { label: t("howto"), route: "How to Use", icon: "help-buoy-outline" },
    { label: t("faq"), route: "FAQ", icon: "chatbubbles-outline" },
    { label: t("contact"), route: "Contact Us", icon: "call-outline" },
    { label: t("messroom"), route: "Mess-room", icon: "restaurant-outline" },
    { label: t("library"), route: "Library", icon: "library-outline" },
    { label: t("terms"), route: "Terms & Conditions",icon: "document-text-outline",},
    { label: t("report"), route: "Report", icon: "megaphone-outline" },
  ];

  const startSceneAnimation = () => {
    carAnim.setValue(0);
    trainAnim.setValue(0);
    shipOneAnim.setValue(SCREEN_WIDTH + 120);
    shipTwoAnim.setValue(-180);

    Animated.loop(
      Animated.timing(carAnim, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(trainAnim, {
          toValue: 1,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
      ]),
    ).start();

    Animated.loop(
      Animated.parallel([
        Animated.timing(shipOneAnim, {
          toValue: -280,
          duration: 19000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shipTwoAnim, {
          toValue: SCREEN_WIDTH + 180,
          duration: 23000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  useEffect(() => {
    startSceneAnimation();

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const introTimer = setTimeout(() => {
      Animated.timing(introOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => setShowIntro(false));
    }, 3500);

    return () => clearTimeout(introTimer);
  }, []);
  useEffect(() => {
    loadHome();
  }, []);

  const loadHome = async () => {
    try {
      const data = await getHome();

      setBanners(data.banners);
      setCourses(data.courses);
      setNews(data.news);
      setVideo(data.videos);

      setCurrentAd(0);
    } catch (error) {
      console.error("Load home error:", error);
    }
  };
  
  useEffect(() => {
    if (banners.length <= 1) return;

    const adTimer = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % banners.length);
    }, 4500);

    return () => clearInterval(adTimer);
  }, [banners.length]);

  const handleMenuPress = (route: string) => {
    setMenuVisible(false);

    if (route === "Home") router.push("/(tabs)/Home" as any);
    if (route === "About Us") router.push("/(tabs)/about" as any);
    if (route === "Course") router.push("/(tabs)/courses" as any);
    if (route === "How to Use") router.push("/(tabs)/how-to-use" as any);
    if (route === "FAQ") router.push("/(tabs)/faq" as any);
    if (route === "Contact Us") router.push("/(tabs)/contact" as any);
    if (route === "Library") router.push("/(tabs)/library" as any);
    if (route === "Terms & Conditions") router.push("/(tabs)/terms" as any);
    if (route === "Report") router.push("/(tabs)/report" as any);
    if (route === "Mess-room") router.push("/(tabs)/Mess-room" as any);
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === "en" ? "th" : "en";
    i18n.changeLanguage(nextLang);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View
        style={[
          styles.page,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslate }],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Image source={logoImg} style={styles.logo} resizeMode="contain" />

            <View style={styles.headerActions}>
            

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

              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => setMenuVisible(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="menu" size={25} color={PRIMARY} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroCard}>
            <LinearGradient
              colors={[PRIMARY, SECONDARY, "#1885D8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.heroTopContent}>
              <View style={styles.heroCopy}>
                <View style={styles.heroPill}>
                  <Ionicons name="sparkles" size={13} color="#FFFFFF" />
                  <Text style={styles.heroPillText}>THORESEN E-LEARNING</Text>
                </View>

                <Text style={styles.heroHeading}>
                  Learning at sea,{`\n`}made simple.
                </Text>
                <Text style={styles.heroDescription}>
                  Access maritime courses, manuals and company updates from one
                  place.
                </Text>

                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => router.push("/(tabs)/courses" as any)}
                  activeOpacity={0.86}
                >
                  <Text style={styles.startBtnText}>Start Learning</Text>
                  <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.scene}>
              <Image
                source={seaImg}
                style={styles.seaImage}
                resizeMode="stretch"
              />

              <Animated.Image
                source={trainImg}
                resizeMode="contain"
                style={[
                  styles.train,
                  {
                    transform: [
                      {
                        translateX: trainAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [SCREEN_WIDTH + 160, -220],
                        }),
                      },
                    ],
                  },
                ]}
              />

              <Image
                source={cityImg}
                style={styles.cityImage}
                resizeMode="stretch"
              />
              <Image
                source={roadImg}
                style={styles.roadImage}
                resizeMode="stretch"
              />
              <Image
                source={portImg}
                style={styles.portImage}
                resizeMode="contain"
              />

              <Animated.Image
                source={shipCenterImg}
                style={[
                  styles.smallShip,
                  { transform: [{ translateX: shipTwoAnim }] },
                ]}
                resizeMode="contain"
              />

              <Animated.Image
                source={shipRightImg}
                style={[
                  styles.bigShip,
                  { transform: [{ translateX: shipOneAnim }] },
                ]}
                resizeMode="contain"
              />

              <Animated.Image
                source={carImg}
                style={[
                  styles.car,
                  {
                    transform: [
                      {
                        translateX: carAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-70, SCREEN_WIDTH + 70],
                        }),
                      },
                    ],
                  },
                ]}
                resizeMode="contain"
              />
            </View>

            {showIntro && (
              <Animated.View
                style={[styles.introOverlay, { opacity: introOpacity }]}
                pointerEvents="none"
              >
                <View style={styles.introLogoCircle}>
                  <Ionicons name="boat" size={30} color={PRIMARY} />
                </View>
                <Text style={styles.introTitle}>Welcome aboard</Text>
                <Text style={styles.introSubtitle}>
                  Thoresen & Co., (Bangkok) Ltd.
                </Text>
              </Animated.View>
            )}
          </View>

          <View style={styles.sectionBlock}>
            <SectionHeader
              title="Quick Access"
              subtitle="Everything you need in one tap"
            />

            <View style={styles.quickGrid}>
              <QuickCard
                title={t("library")}
                subtitle="Manuals & documents"
                icon="library-outline"
                iconBackground="#E8F0FF"
                iconColor="#2563EB"
                onPress={() => router.push("/(tabs)/library" as any)}
              />
              <QuickCard
                title={t("howto")}
                subtitle="How to use the app"
                icon="help-buoy-outline"
                iconBackground="#FFF1E8"
                iconColor="#F97316"
                onPress={() => router.push("/(tabs)/how-to-use" as any)}
              />
              <QuickCard
                title={t("faq")}
                subtitle="Frequently asked questions"
                icon="chatbubbles-outline"
                iconBackground="#E8FBFF"
                iconColor="#0891B2"
                onPress={() => router.push("/(tabs)/faq" as any)}
              />
              <QuickCard
                title={t("report")}
                subtitle="Send crew feedback"
                icon="megaphone-outline"
                iconBackground="#FFE9ED"
                iconColor={RED}
                onPress={() => router.push("/(tabs)/report" as any)}
              />
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <SectionHeader
              title={t("advertising")}
              subtitle="Latest announcements"
            />

            {banners.length > 0 && (
              <View style={styles.adCard}>
                <Image
                  source={{ uri: banners[currentAd].image }}
                  style={styles.adImage}
                  resizeMode="cover"
                />

                <LinearGradient
                  colors={["transparent", "rgba(0,27,116,0.78)"]}
                  style={styles.adGradient}
                />

                {banners.length > 1 && (
                  <>
                    <TouchableOpacity
                      style={[styles.adArrow, styles.adArrowLeft]}
                      onPress={() =>
                        setCurrentAd(
                          (prev) => (prev - 1 + banners.length) % banners.length
                        )
                      }
                    >
                      <Ionicons name="chevron-back" size={19} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.adArrow, styles.adArrowRight]}
                      onPress={() =>
                        setCurrentAd((prev) => (prev + 1) % banners.length)
                      }
                    >
                      <Ionicons name="chevron-forward" size={19} color="#FFFFFF" />
                    </TouchableOpacity>
                  </>
                )}

                <View style={styles.adBottomRow}>
                  <View>
                    <Text style={styles.adBadge}>ANNOUNCEMENT</Text>

                    <Text style={styles.adTitle}>
                      {banners[currentAd].title}
                    </Text>
                  </View>

                  {banners.length > 1 && (
                    <View style={styles.dotsRow}>
                      {banners.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.dot,
                            index === currentAd && styles.activeDot,
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          <View style={styles.sectionBlock}>
            <SectionHeader
              title={t("course")}
              subtitle="Continue your maritime learning"
              onViewAll={() => router.push("/(tabs)/courses" as any)}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {courses.map((item, index) => (
                <CourseCard
                  key={item.id}
                  title={item.title ?? ""}
                  image={item.picture ?? ""}
                  index={index}
                  onPress={() => {
                    if (item.url !== "#") {
                      router.push(item.url as any);
                    }
                  }}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.sectionBlock}>
            <SectionHeader
              title={t("news")}
              subtitle="Company news and updates"
              onViewAll={() => router.push("/(tabs)/news" as any)}
            />

            <View style={styles.newsList}>
              {news.map((item, index) => (
                <NewsCard
                  key={item.id}
                  title={item.title ?? ""}
                  image={item.picture ?? ""}
                  date={
                    item.createDate
                      ? new Date(item.createDate).toLocaleDateString(
                          i18n.language === "th"
                            ? "th-TH"
                            : "en-US",
                        )
                      : ""
                  }
                  isLast={index === news.length - 1}
                  onPress={() => {
                    if (item.link) {
                      router.push(item.link as any);
                    }
                  }}
                />
              ))}
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <SectionHeader
              title={t("video")}
              subtitle="Watch and learn anywhere"
            />

            {video && (
              <View style={styles.videoContainer}>
                <VideoCard
                  title={video.title ?? ""}
                  videoUrl={video.path}
                />
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 Thoresen e-Learning</Text>
          </View>
        </ScrollView>
      </Animated.View>

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
                <Text style={styles.menuTitle}>{t("menu")}</Text>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setMenuVisible(false)}
              >
                <Ionicons name="close" size={22} color={PRIMARY} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
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
                        name={item.icon as any}
                        size={20}
                        color={PRIMARY}
                      />
                    </View>
                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#98A2B3" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

            function SectionHeader({
              title,
              subtitle,
              onViewAll,
            }: {
              title: string;
              subtitle: string;
              onViewAll?: () => void;
            }) {
              return (
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleWrap}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    <Text style={styles.sectionSubtitle}>{subtitle}</Text>
                  </View>

                  {onViewAll && (
                    <TouchableOpacity
                      style={styles.viewAllBtn}
                      onPress={onViewAll}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.viewAllText}>View all</Text>
                      <Ionicons name="arrow-forward" size={15} color={PRIMARY} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            }

            function QuickCard({
              title,
              subtitle,
              icon,
              iconBackground,
              iconColor,
              onPress,
            }: {
              title: string;
              subtitle: string;
              icon: any;
              iconBackground: string;
              iconColor: string;
              onPress: () => void;
            }) {
              return (
                <TouchableOpacity
                  style={styles.quickCard}
                  onPress={onPress}
                  activeOpacity={0.82}
                >
                  <View style={[styles.quickIconBox, { backgroundColor: iconBackground }]}>
                    <Ionicons name={icon} size={25} color={iconColor} />
                  </View>

                  <Text style={styles.quickTitle} numberOfLines={1}>
                    {title}
                  </Text>
                  <Text style={styles.quickSubtitle} numberOfLines={2}>
                    {subtitle}
                  </Text>

                  <View style={styles.quickArrow}>
                    <Ionicons name="arrow-forward" size={14} color={PRIMARY} />
                  </View>
                </TouchableOpacity>
              );
            }

            function CourseCard({
              title,
              image,
              index,
              onPress,
            }: {
              title: string;
              image: string;
              index: number;
              onPress: () => void;
            }) {
              return (
                <TouchableOpacity
                  style={styles.courseCard}
                  onPress={onPress}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: image.trim() }}
                    style={styles.courseImage}
                    resizeMode="cover"
                  />

                  <View style={styles.courseImageOverlay}>
                    <View style={styles.courseNumberBadge}>
                      <Text style={styles.courseNumberText}>
                        {String(index + 1).padStart(2, "0")}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.courseBody}>
                    <Text style={styles.courseCategory}>MARITIME COURSE</Text>
                    <Text style={styles.courseTitle} numberOfLines={2}>
                      {title}
                    </Text>

                    <View style={styles.courseFooterRow}>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#F5A623" />
                        <Text style={styles.ratingText}>4.9</Text>
                      </View>

                      <View style={styles.continueBtn}>
                        <Text style={styles.continueText}>Open</Text>
                        <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }

            function NewsCard({
              title,
              image,
              date,
              isLast,
              onPress,
            }: {
              title: string;
              image: string;
              date: string;
              isLast: boolean;
              onPress: () => void;
            }) {
              return (
                <TouchableOpacity
                  style={[styles.newsCard, isLast && styles.newsCardLast]}
                  onPress={onPress}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: image.trim() }}
                    style={styles.newsImage}
                    resizeMode="cover"
                  />

                  <View style={styles.newsBody}>
                    <Text style={styles.newsLabel}>LATEST NEWS</Text>
                    <Text style={styles.newsTitle} numberOfLines={2}>
                      {title}
                    </Text>
                    <View style={styles.newsMetaRow}>
                      <Ionicons name="calendar-outline" size={13} color="#98A2B3" />
                      <Text style={styles.newsDate}>{date}</Text>
                    </View>
                  </View>

                  <View style={styles.newsArrowBox}>
                    <Ionicons name="chevron-forward" size={18} color={PRIMARY} />
                  </View>
                </TouchableOpacity>
              );
            }

            function VideoCard({
                title,
                videoUrl,
              }: {
                title: string;
                videoUrl: string | null;
              }) {
                if (!videoUrl) {
                  return null;
                }

                const player = useVideoPlayer(
                  videoUrl,
                  (currentPlayer) => {
                    currentPlayer.loop = true;
                  },
                );

                return (
                  <View style={styles.videoCard}>
                    <VideoView
                      player={player}
                      style={styles.videoPlayer}
                      nativeControls
                      contentFit="cover"
                      allowsFullscreen
                    />
                  </View>
                );
              }

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  page: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scrollContent: {
    paddingBottom: 0,
  },
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
  languageBtn: {
    height: 29,
    minWidth: 38,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
  },
  languageText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
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
  heroCard: {
    minHeight: 370,
    marginHorizontal: 12,
    marginTop: 5,
    borderRadius: 17,
    overflow: "hidden",
    position: "relative",
    elevation: 6,
    shadowColor: "#001B74",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  heroTopContent: {
    minHeight: 205,
    paddingHorizontal: 18,
    paddingTop: 18,
    zIndex: 15,
  },
  heroCopy: {
    maxWidth: "88%",
  },
  heroPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    marginBottom: 10,
  },
  heroPillText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  heroHeading: {
    color: "#FFFFFF",
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  heroDescription: {
    marginTop: 5,
    maxWidth: 260,
    color: "rgba(255,255,255,0.82)",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500",
  },
  startBtn: {
    marginTop: 12,
    height: 32,
    alignSelf: "flex-start",
    paddingHorizontal: 15,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: RED,
  },
  startBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  scene: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 178,
    overflow: "hidden",
  },
  seaImage: {
    position: "absolute",
    left: -20,
    bottom: -20,
    width: "120%",
    height: 160,
    zIndex: 1,
    top: 22,
  },
  train: {
    position: "absolute",
    top: 40,
    width: 155,
    height: 44,
    zIndex: 2,
  },
  cityImage: {
    position: "absolute",
    left: -8,
    top: 30,
    width: "105%",
    height: 68,
    zIndex: 3,
  },
  roadImage: {
    position: "absolute",
    left: -35,
    top: 82,
    width: "116%",
    height: 29,
    zIndex: 4,
  },
  portImage: {
    position: "absolute",
    left: -35,
    bottom: -8,
    width: 180,
    height: 108,
    zIndex: 8,
  },
  smallShip: {
    position: "absolute",
    top: 97,
    width: 108,
    height: 62,
    zIndex: 6,
  },
  bigShip: {
    position: "absolute",
    top: 110,
    width: 215,
    height: 88,
    zIndex: 7,
  },
  car: {
    position: "absolute",
    top: 86,
    width: 24,
    height: 17,
    zIndex: 20,
  },
  introOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,27,116,0.88)",
  },
  introLogoCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  introTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
  },
  introSubtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionBlock: {
    marginTop: 20,
  },
  sectionHeader: {
    paddingHorizontal: 17,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionTitleWrap: {
    flex: 1,
    paddingRight: 10,
  },
  sectionTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.25,
  },
  sectionSubtitle: {
    marginTop: 3,
    color: MUTED,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500",
  },
  viewAllBtn: {
    height: 32,
    paddingHorizontal: 11,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EAF0FF",
  },
  viewAllText: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: "800",
  },
  quickGrid: {
    paddingHorizontal: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickCard: {
    width: "48.4%",
    minHeight: 116,
    marginBottom: 11,
    padding: 11,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF5",
    elevation: 2,
    shadowColor: "#101828",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  quickIconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },
  quickTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "900",
  },
  quickSubtitle: {
    marginTop: 4,
    paddingRight: 24,
    color: MUTED,
    fontSize: 9,
    lineHeight: 12,
  },
  quickArrow: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 24,
    height: 24,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3FF",
  },
  adCard: {
    height: 200,
    marginHorizontal: 12,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    backgroundColor: PRIMARY,
    elevation: 4,
    shadowColor: "#001B74",
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
  },
  adImage: {
    width: "100%",
    height: "100%",
  },
  adGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  adArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  adArrowLeft: {
    left: 10,
  },
  adArrowRight: {
    right: 10,
  },
  adBottomRow: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  adBadge: {
    color: "#C9D7FF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  adTitle: {
    maxWidth: 245,
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  activeDot: {
    width: 12,
    backgroundColor: "#FFFFFF",
  },
  horizontalList: {
    paddingHorizontal: 14,
    paddingBottom: 5,
    gap: 13,
  },
  courseCard: {
    width: SCREEN_WIDTH * 0.64,
    borderRadius: 17,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6EBF3",
    elevation: 3,
    shadowColor: "#101828",
    shadowOpacity: 0.08,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
  },
  courseImage: {
    width: "100%",
    height: 118,
  },
  courseImageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 118,
    padding: 12,
    alignItems: "flex-end",
  },
  courseNumberBadge: {
    width: 32,
    height: 29,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,27,116,0.88)",
  },
  courseNumberText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  courseBody: {
    padding: 12,
  },
  courseCategory: {
    color: ACCENT,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  courseTitle: {
    minHeight: 34,
    marginTop: 6,
    color: TEXT,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  courseFooterRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  ratingText: {
    color: "#475467",
    fontSize: 11,
    fontWeight: "800",
  },
  continueBtn: {
    height: 29,
    paddingHorizontal: 10,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: PRIMARY,
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  newsList: {
    marginHorizontal: 12,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6EBF3",
    elevation: 2,
    shadowColor: "#101828",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  newsCard: {
    minHeight: 82,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F6",
  },
  newsCardLast: {
    borderBottomWidth: 0,
  },
  newsImage: {
    width: 66,
    height: 60,
    borderRadius: 11,
    backgroundColor: "#E8EEF8",
  },
  newsBody: {
    flex: 1,
    paddingHorizontal: 9,
  },
  newsLabel: {
    color: RED,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  newsTitle: {
    marginTop: 4,
    color: TEXT,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  newsMetaRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  newsDate: {
    color: "#98A2B3",
    fontSize: 9,
    fontWeight: "600",
  },
  newsArrowBox: {
    width: 26,
    height: 26,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3FF",
  },
  videoCard: {
    width: SCREEN_WIDTH * 0.64,
    height: 145,
    borderRadius: 17,
    overflow: "hidden",
    backgroundColor: "#101828",
    borderWidth: 1,
    borderColor: "#E6EBF3",
    elevation: 3,
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
  },
  videoCaption: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  videoPlayIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: RED,
    marginRight: 9,
  },
  videoTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  footer: {
  height: 38,
  marginTop: 18,
  backgroundColor: PRIMARY,
  alignItems: 'center',
  justifyContent: 'center',
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
},

footerText: {
  color: '#FFFFFF',
  fontSize: 10,
  fontWeight: '700',
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
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F4F9",
  },
  menuItem: {
    minHeight: 59,
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
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3FF",
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    color: TEXT,
    fontSize: 11,
    fontWeight: "800",
  },
});
