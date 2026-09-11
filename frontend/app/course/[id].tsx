import React, {
  useCallback,
  useState,
} from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
  useLocalSearchParams,
  useFocusEffect,
} from "expo-router";

import AppHeader from "../../src/components/AppHeader";

import {
  getCourseDetail,
  CourseDetail,
  CourseLesson,
} from "../../src/services/course";

import {
  useAuth,
} from "../../src/context/AuthContext";


const PRIMARY = "#001B74";
const BLUE = "#0B63CE";
const LIGHT_BLUE = "#D9ECFA";
const ORANGE = "#F9C56A";
const GREEN = "#57C46B";
const BG = "#FFFFFF";
const TEXT = "#111827";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";


const menuList = [
  "Home",
  "About Us",
  "Course",
  "How to Use",
  "FAQ",
  "Contact Us",
  "Mess-room",
  "Library",
  "Terms & Conditions",
  "Report",
];


export default function CourseDetailScreen() {

  const params =
    useLocalSearchParams<{
      id: string;
      tab?: string;
    }>();

  const {
    id,
  } = params;

  const {
    user,
  } = useAuth();


  const [
    activeTab,
    setActiveTab,
  ] = useState<
    "detail" | "lessons"
  >(
    params.tab === "lessons"
      ? "lessons"
      : "detail",
  );


  const [
    menuVisible,
    setMenuVisible,
  ] = useState(false);


  const [
    courseData,
    setCourseData,
  ] = useState<CourseDetail | null>(
    null,
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );


  /*
   * ใช้สำหรับ reload หน้า
   * หลังจากกลับมาจาก lesson / exam
   */
  const [
    reloadKey,
    setReloadKey,
  ] = useState(0);


  /*
   * TODO:
   * ตอนนี้ evaluationDone ยังเป็น local state
   *
   * ถ้าภายหลัง API มี evaluation.completed
   * ให้ย้ายไปใช้ค่าจาก API ได้เลย
   */
  const [
    evaluationDone,
    setEvaluationDone,
  ] = useState(false);


  /*
   * ============================================================
   * LOAD COURSE
   * ============================================================
   */

  useFocusEffect(
    useCallback(() => {

      let mounted = true;


      const loadCourse =
        async () => {

          if (
            !id ||
            !user?.id
          ) {
            return;
          }


          try {

            setLoading(true);
            setError(null);


            const response =
              await getCourseDetail(
                Number(id),
                Number(user.id),
                1,
              );


            if (!mounted) {
              return;
            }


            if (
              !response.success ||
              !response.data
            ) {

              setError(
                response.message ??
                  "ไม่พบข้อมูลหลักสูตร",
              );

              setCourseData(null);

              return;
            }


            setCourseData(
              response.data,
            );

          } catch (err) {

            console.log(
              "COURSE DETAIL ERROR:",
              err,
            );


            if (mounted) {

              setError(
                "ไม่สามารถโหลดข้อมูลหลักสูตรได้",
              );

            }

          } finally {

            if (mounted) {
              setLoading(false);
            }

          }

        };


      if (
        params.tab === "lessons"
      ) {

        setActiveTab(
          "lessons",
        );

      }


      loadCourse();


      return () => {
        mounted = false;
      };

    }, [
      id,
      user?.id,
      params.tab,
      reloadKey,
    ]),
  );


  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {

    return (
      <SafeAreaView
        style={styles.safe}
        edges={["top"]}
      >

        <View style={styles.center}>

          <ActivityIndicator
            size="large"
            color={PRIMARY}
          />

          <Text
            style={styles.loadingText}
          >
            กำลังโหลดข้อมูลหลักสูตร...
          </Text>

        </View>

      </SafeAreaView>
    );

  }


  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (
    error ||
    !courseData
  ) {

    return (
      <SafeAreaView
        style={styles.safe}
        edges={["top"]}
      >

        <View style={styles.center}>

          <Text
            style={styles.errorText}
          >
            {error ??
              "ไม่พบข้อมูลหลักสูตร"}
          </Text>


          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {

              setError(null);
              setLoading(true);

              setReloadKey(
                (value) =>
                  value + 1,
              );

            }}
          >

            <Text
              style={styles.retryText}
            >
              ลองใหม่
            </Text>

          </TouchableOpacity>

        </View>

      </SafeAreaView>
    );

  }


  /*
   * ============================================================
   * DATA
   * ============================================================
   */

  const course =
    courseData.course;

  const lessons =
    courseData.lessons;


  const percent =
    Math.min(
      100,
      Math.max(
        0,
        courseData.progress.percent ??
          0,
      ),
    );


  /*
   * เรียนครบทุกบทหรือยัง
   */

  const lessonCompleted =
    courseData.progress.totalLessons >
      0 &&
    courseData.progress.passedLessons >=
      courseData.progress.totalLessons;


  /*
   * แบบทดสอบหลังเรียนผ่านทุกบท
   */

  const passedAllExams =
    lessons.length > 0 &&
    lessons.every(
      (
        lesson,
      ) =>
        !lesson.postTest.hasTest ||
        lesson.postTest.passed,
    );


  /*
   * หลักสูตรสมบูรณ์
   */

  const isCompleted =
    lessonCompleted &&
    passedAllExams;


  /*
   * ============================================================
   * MENU
   * ============================================================
   */

  const handleMenuPress =
    (item: string) => {

      setMenuVisible(false);


      if (
        item === "Home"
      ) {
        router.push(
          "/(tabs)/Home" as any,
        );
      }


      if (
        item === "About Us"
      ) {
        router.push(
          "/(tabs)/about" as any,
        );
      }


      if (
        item === "Course"
      ) {
        router.push(
          "/(tabs)/courses" as any,
        );
      }


      if (
        item === "Library"
      ) {
        router.push(
          "/(tabs)/library" as any,
        );
      }


      if (
        item === "How to Use"
      ) {
        router.push(
          "/(tabs)/how-to-use" as any,
        );
      }


      if (
        item === "FAQ"
      ) {
        router.push(
          "/(tabs)/faq" as any,
        );
      }


      if (
        item ===
        "Terms & Conditions"
      ) {
        router.push(
          "/(tabs)/terms" as any,
        );
      }


      if (
        item === "Report"
      ) {
        router.push(
          "/(tabs)/report" as any,
        );
      }

    };


  /*
   * ============================================================
   * OPEN LESSON
   * ============================================================
   */

  const openLesson =
    (
      lesson: CourseLesson,
    ) => {

      if (
        !lesson.canLearn
      ) {
        return;
      }


      router.push({
        pathname:
          `/lesson/${course.id}`,

        params: {
          lessonId:
            String(lesson.id),
        },

      } as any);

    };


  /*
   * ============================================================
   * OPEN PRE TEST
   * ============================================================
   */

  const openPreTest =
    (
      lesson: CourseLesson,
    ) => {

      if (
        !lesson.canLearn
      ) {
        return;
      }


      if (
        !lesson.preTest.hasTest
      ) {
        return;
      }


      router.push({

        pathname:
          `/exam/${course.id}`,

        params: {

          lessonId:
            String(lesson.id),

          examType:
            "pretest",

        },

      } as any);

    };


  /*
   * ============================================================
   * OPEN POST TEST
   * ============================================================
   */

  const openPostTest =
    (
      lesson: CourseLesson,
    ) => {

      if (
        !lesson.canLearn
      ) {
        return;
      }


      if (
        !lesson.postTest.hasTest
      ) {
        return;
      }


      if (
        !lesson.postTest.canTake
      ) {
        return;
      }


      router.push({

        pathname:
          `/exam/${course.id}`,

        params: {

          lessonId:
            String(lesson.id),

          examType:
            "posttest",

        },

      } as any);

    };


  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (

    <SafeAreaView
      style={styles.safe}
      edges={["top"]}
    >

      <View style={styles.root}>

        <ScrollView
          showsVerticalScrollIndicator={false}
        >

          <AppHeader />


          <View
            style={styles.pageBox}
          >

            {/* =================================================
                TITLE
            ================================================= */}

            <View
              style={styles.titleRow}
            >

              <Text
                style={styles.pageTitle}
              >
                {course.title}
              </Text>

            </View>


            {/* =================================================
                COURSE CARD
            ================================================= */}

            <View
              style={styles.courseCard}
            >

              {course.image && (

                <Image
                  source={{
                    uri: course.image,
                  }}
                  style={
                    styles.courseImage
                  }
                />

              )}


              <View
                style={styles.courseBody}
              >

                <View
                  style={
                    styles.progressTrack
                  }
                >

                  <View
                    style={[
                      styles.progressFill,
                      {
                        width:
                          `${percent}%`,

                        backgroundColor:
                          isCompleted
                            ? GREEN
                            : ORANGE,
                      },
                    ]}
                  />

                </View>


                <Text
                  style={
                    styles.progressText
                  }
                >
                  {percent}%{" "}
                  {isCompleted
                    ? "เรียนสมบูรณ์"
                    : "กำลังเรียน"}
                </Text>


                <View
                  style={
                    styles.teacherBox
                  }
                >

                  <View
                    style={
                      styles.teacherRow
                    }
                  >

                    <Text
                      style={
                        styles.teacherLabel
                      }
                    >
                      คำสอนหลักสูตร :
                    </Text>

                    <Text
                      style={
                        styles.teacherValue
                      }
                    >
                      {course.teacher ??
                        "-"}
                    </Text>

                  </View>


                  <View
                    style={
                      styles.teacherRow
                    }
                  >

                    <Text
                      style={
                        styles.teacherLabel
                      }
                    >
                      ผู้ปฏิบัติหลักสูตร :
                    </Text>

                    <Text
                      style={
                        styles.teacherValue
                      }
                    >
                      {course.assistant ??
                        "-"}
                    </Text>

                  </View>

                </View>

              </View>

            </View>


            {/* =================================================
                COURSE INFO
            ================================================= */}

            <View
              style={styles.infoGrid}
            >

              <View
                style={styles.infoCell}
              >

                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  ระยะเวลา
                </Text>

                <Ionicons
                  name="time-outline"
                  size={24}
                  color={BLUE}
                />

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {course.duration ??
                    "-"}
                </Text>

              </View>


              <View
                style={styles.infoCell}
              >

                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  จำนวนบทเรียน
                </Text>

                <Ionicons
                  name="book"
                  size={24}
                  color={BLUE}
                />

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {
                    courseData
                      .progress
                      .totalLessons
                  }{" "}
                  บทเรียน
                </Text>

              </View>

            </View>


            {/* =================================================
                STATUS
            ================================================= */}

            <View
              style={styles.statusBox}
            >

              <View
                style={
                  styles.statusHeader
                }
              >

                <Ionicons
                  name={
                    isCompleted
                      ? "checkmark-circle"
                      : "school-outline"
                  }
                  size={24}
                  color={
                    isCompleted
                      ? GREEN
                      : PRIMARY
                  }
                />


                <View
                  style={{
                    flex: 1,
                  }}
                >

                  <Text
                    style={
                      styles.statusTitle
                    }
                  >
                    {isCompleted
                      ? "เรียนครบแล้ว"
                      : "สถานะการเรียน"}
                  </Text>


                  <Text
                    style={
                      styles.statusDesc
                    }
                  >
                    {isCompleted
                      ? "คุณเรียนครบทุกบทและทำแบบทดสอบผ่านครบทั้งคอร์สแล้ว"
                      : "ต้องเรียนจบทุกบทของคอร์สนี้ก่อน จึงจะสามารถพิมพ์ใบประกาศได้"}
                  </Text>

                </View>

              </View>


              <View
                style={
                  styles.requirementList
                }
              >

                <View
                  style={
                    styles.requirementItem
                  }
                >

                  <Ionicons
                    name={
                      lessonCompleted
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={18}
                    color={
                      lessonCompleted
                        ? GREEN
                        : "#9CA3AF"
                    }
                  />

                  <Text
                    style={
                      styles.requirementText
                    }
                  >
                    เรียนครบทุกบท
                  </Text>

                </View>


                <View
                  style={
                    styles.requirementItem
                  }
                >

                  <Ionicons
                    name={
                      passedAllExams
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={18}
                    color={
                      passedAllExams
                        ? GREEN
                        : "#9CA3AF"
                    }
                  />

                  <Text
                    style={
                      styles.requirementText
                    }
                  >
                    ทำแบบทดสอบผ่านทุกบท
                  </Text>

                </View>

              </View>

            </View>


            {/* =================================================
                SCORE SUMMARY
            ================================================= */}

            <View
              style={
                styles.academicSummaryBox
              }
            >

              <View
                style={
                  styles.academicSummaryHeader
                }
              >

                <Ionicons
                  name="stats-chart"
                  size={20}
                  color="#fff"
                />

                <Text
                  style={
                    styles.academicSummaryTitle
                  }
                >
                  คะแนนสอบแต่ละบท
                </Text>

              </View>


              {lessons.map(
                (
                  lesson,
                  index,
                ) => {

                  const pretestScore =
                    lesson.preTest
                      .completed
                      ? `${lesson.preTest.score ?? 0}/${lesson.preTest.total ?? 0}`
                      : null;


                  const posttestScore =
                    lesson.postTest
                      .completed
                      ? `${lesson.postTest.score ?? 0}/${lesson.postTest.total ?? 0}`
                      : null;


                  return (

                    <View
                      key={lesson.id}
                      style={
                        styles.chapterScoreGroup
                      }
                    >

                      <View
                        style={
                          styles.chapterScoreGroupHeader
                        }
                      >

                        <Text
                          style={
                            styles.chapterScoreChapter
                          }
                        >
                          บทที่{" "}
                          {index + 1}
                        </Text>


                        <Text
                          style={
                            styles.chapterScoreName
                          }
                          numberOfLines={1}
                        >
                          {lesson.title}
                        </Text>

                      </View>


                      <View
                        style={
                          styles.chapterScoreRow
                        }
                      >

                        <Text
                          style={
                            styles.chapterScoreLabel
                          }
                        >
                          คะแนนก่อนเรียน
                        </Text>


                        <Text
                          style={
                            styles.chapterScoreValue
                          }
                        >
                          {pretestScore ??
                            "-"}
                        </Text>

                      </View>


                      <View
                        style={
                          styles.chapterScoreRow
                        }
                      >

                        <Text
                          style={
                            styles.chapterScoreLabel
                          }
                        >
                          คะแนนหลังเรียน
                        </Text>


                        <Text
                          style={
                            styles.chapterScoreValue
                          }
                        >
                          {posttestScore ??
                            "-"}
                        </Text>

                      </View>

                    </View>

                  );

                },
              )}

            </View>


            {/* =================================================
                EVALUATION
            ================================================= */}

            {isCompleted ? (

              <TouchableOpacity
                style={[
                  styles.evaluateBtn,
                  evaluationDone &&
                    styles.evaluateBtnDone,
                ]}
                activeOpacity={0.85}
                disabled={
                  evaluationDone
                }
                onPress={() =>
                  router.push({
                    pathname:
                      "/evaluation/[id]",

                    params: {
                      id: String(
                        course.id,
                      ),

                      courseName:
                        course.courseName,
                    },

                  } as any)
                }
              >

                <Ionicons
                  name={
                    evaluationDone
                      ? "checkmark-circle"
                      : "clipboard-outline"
                  }
                  size={20}
                  color="#fff"
                />


                <Text
                  style={
                    styles.evaluateText
                  }
                >
                  {evaluationDone
                    ? "ทำแบบประเมินเรียบร้อยแล้ว"
                    : "ทำแบบประเมิน"}
                </Text>

              </TouchableOpacity>

            ) : (

              <View
                style={
                  styles.evaluationLockedBox
                }
              >

                <Ionicons
                  name="lock-closed"
                  size={18}
                  color="#9CA3AF"
                />


                <Text
                  style={
                    styles.evaluationLockedText
                  }
                >
                  ต้องเรียนและทำแบบทดสอบหลังเรียนครบทุกบทก่อน
                </Text>

              </View>

            )}


            {/* =================================================
                CERTIFICATE
            ================================================= */}

            {isCompleted &&
            evaluationDone ? (

              <TouchableOpacity
                style={
                  styles.certificateBigBtn
                }
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname:
                      "/certificate/[id]",

                    params: {
                      id: String(
                        course.id,
                      ),

                      courseName:
                        course.courseName,
                    },

                  } as any)
                }
              >

                <Ionicons
                  name="ribbon"
                  size={22}
                  color="#fff"
                />


                <Text
                  style={
                    styles.certificateBigText
                  }
                >
                  พิมพ์ใบประกาศ
                </Text>

              </TouchableOpacity>

            ) : (

              <View
                style={
                  styles.certificateLockedBox
                }
              >

                <Ionicons
                  name="lock-closed"
                  size={18}
                  color="#9CA3AF"
                />


                <Text
                  style={
                    styles.certificateLockedText
                  }
                >
                  {!isCompleted
                    ? "ต้องเรียนจบทั้งคอร์สก่อน จึงจะพิมพ์ใบประกาศได้"
                    : "ต้องทำแบบประเมินก่อน จึงจะพิมพ์ใบประกาศได้"}
                </Text>

              </View>

            )}


            {/* =================================================
                TABS
            ================================================= */}

            <View
              style={styles.tabRow}
            >

              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab ===
                    "detail" &&
                    styles.tabBtnActive,
                ]}
                onPress={() =>
                  setActiveTab(
                    "detail",
                  )
                }
              >

                <Text
                  style={[
                    styles.tabText,
                    activeTab ===
                      "detail" &&
                      styles.tabTextActive,
                  ]}
                >
                  รายละเอียดหลักสูตร
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab ===
                    "lessons" &&
                    styles.tabBtnActive,
                ]}
                onPress={() =>
                  setActiveTab(
                    "lessons",
                  )
                }
              >

                <Text
                  style={[
                    styles.tabText,
                    activeTab ===
                      "lessons" &&
                      styles.tabTextActive,
                  ]}
                >
                  รายการหลักสูตร
                </Text>

              </TouchableOpacity>

            </View>


            {/* =================================================
                DETAIL TAB
            ================================================= */}

            {activeTab ===
              "detail" && (

              <View
                style={
                  styles.detailBox
                }
              >

                <Text
                  style={
                    styles.detailText
                  }
                >
                  {course.detail ??
                    ""}
                </Text>


                <View
                  style={
                    styles.bulletRow
                  }
                >

                  <Text
                    style={styles.bullet}
                  >
                    •
                  </Text>

                  <Text
                    style={
                      styles.bulletText
                    }
                  >
                    {course.title}
                  </Text>

                </View>


                <View
                  style={
                    styles.bulletRow
                  }
                >

                  <Text
                    style={styles.bullet}
                  >
                    •
                  </Text>

                  <Text
                    style={
                      styles.bulletText
                    }
                  >
                    {
                      courseData
                        .progress
                        .totalLessons
                    }{" "}
                    บทเรียน
                  </Text>

                </View>

              </View>

            )}


            {/* =================================================
                LESSON TAB
            ================================================= */}

            {activeTab ===
              "lessons" && (

              <View
                style={
                  styles.lessonPanel
                }
              >

                {lessons.map(
                  (
                    lesson,
                    groupIndex,
                  ) => {

                    const chapterNo =
                      groupIndex + 1;


                    const lessonUnlocked =
                      lesson.canLearn ===
                      true;


                    const pretestScore =
                      lesson.preTest
                        .completed
                        ? `${lesson.preTest.score ?? 0}/${lesson.preTest.total ?? 0}`
                        : null;


                    const posttestScore =
                      lesson.postTest
                        .completed
                        ? `${lesson.postTest.score ?? 0}/${lesson.postTest.total ?? 0}`
                        : null;


                    return (

                      <View
                        key={lesson.id}
                        style={
                          styles.chapterSection
                        }
                      >

                        {/* =======================================
                            CHAPTER HEADER
                        ======================================= */}

                        {groupIndex ===
                        0 ? (

                          <View
                            style={
                              styles.firstChapterHeader
                            }
                          >

                            <View
                              style={
                                styles.firstChapterTitleWrap
                              }
                            >

                              <Text
                                style={
                                  styles.firstChapterNo
                                }
                              >
                                บทที่{" "}
                                {chapterNo}
                              </Text>


                              <Text
                                style={
                                  styles.firstChapterTitle
                                }
                              >
                                {
                                  lesson.title
                                }
                              </Text>

                            </View>


                            <TouchableOpacity
                              style={
                                styles.docBtnDark
                              }
                              activeOpacity={
                                0.8
                              }
                            >

                              <Ionicons
                                name="download"
                                size={12}
                                color="#fff"
                              />

                              <Text
                                style={
                                  styles.docBtnDarkText
                                }
                              >
                                เอกสารประกอบ
                              </Text>

                            </TouchableOpacity>

                          </View>

                        ) : (

                          <View
                            style={
                              styles.blueChapterHeader
                            }
                          >

                            <View
                              style={
                                styles.blueChapterLeft
                              }
                            >

                              <Text
                                style={
                                  styles.blueChapterNo
                                }
                              >
                                บทที่{" "}
                                {chapterNo}
                              </Text>


                              <Text
                                style={
                                  styles.blueChapterTitle
                                }
                              >
                                {
                                  lesson.title
                                }
                              </Text>

                            </View>


                            <TouchableOpacity
                              style={
                                styles.docBtnWhite
                              }
                              activeOpacity={
                                0.8
                              }
                            >

                              <Ionicons
                                name="download"
                                size={12}
                                color={
                                  TEXT
                                }
                              />

                              <Text
                                style={
                                  styles.docBtnWhiteText
                                }
                              >
                                เอกสารประกอบ
                              </Text>

                            </TouchableOpacity>

                          </View>

                        )}


                        <View
                          style={
                            styles.examSections
                          }
                        >

                          {/* =====================================
                              PRE TEST
                          ===================================== */}

                          <View
                            style={
                              styles.examSection
                            }
                          >

                            <View
                              style={
                                styles.examSectionHeader
                              }
                            >

                              <View
                                style={[
                                  styles.examTypeIcon,
                                  styles.pretestIcon,
                                ]}
                              >

                                <Ionicons
                                  name="create-outline"
                                  size={20}
                                  color={
                                    BLUE
                                  }
                                />

                              </View>


                              <View
                                style={{
                                  flex: 1,
                                }}
                              >

                                <Text
                                  style={
                                    styles.examSectionTitle
                                  }
                                >
                                  แบบทดสอบก่อนเรียน
                                </Text>


                                <Text
                                  style={
                                    styles.examSectionDesc
                                  }
                                >
                                  ทำแบบทดสอบก่อนเริ่มเรียนบทนี้
                                </Text>

                              </View>

                            </View>


                            {pretestScore && (

                              <View
                                style={
                                  styles.lessonScoreResult
                                }
                              >

                                <Text
                                  style={
                                    styles.lessonScoreLabel
                                  }
                                >
                                  คะแนนสอบก่อนเรียน
                                </Text>


                                <Text
                                  style={
                                    styles.lessonScoreValue
                                  }
                                >
                                  {
                                    pretestScore
                                  }
                                </Text>

                              </View>

                            )}


                            {lesson.preTest
                              .hasTest ? (

                              <TouchableOpacity
                                style={[
                                  styles.examButton,
                                  styles.pretestButton,
                                  !lessonUnlocked &&
                                    styles.examButtonLocked,
                                ]}
                                activeOpacity={
                                  0.85
                                }
                                disabled={
                                  !lessonUnlocked
                                }
                                onPress={() =>
                                  openPreTest(
                                    lesson,
                                  )
                                }
                              >

                                <Text
                                  style={
                                    styles.examButtonText
                                  }
                                >
                                  {!lessonUnlocked
                                    ? "บทเรียนนี้ยังไม่ปลดล็อก"
                                    : lesson.preTest.completed
                                      ? "ทำแบบทดสอบอีกครั้ง"
                                      : "เริ่มทำแบบทดสอบก่อนเรียน"}
                                </Text>


                                <Ionicons
                                  name={
                                    !lessonUnlocked
                                      ? "lock-closed"
                                      : lesson.preTest.completed
                                        ? "checkmark-circle"
                                        : "arrow-forward"
                                  }
                                  size={
                                    20
                                  }
                                  color="#FFFFFF"
                                />

                              </TouchableOpacity>

                            ) : (

                              <View
                                style={[
                                  styles.evaluationLockedBox,
                                  {
                                    marginBottom:
                                      0,
                                  },
                                ]}
                              >

                                <Text
                                  style={
                                    styles.evaluationLockedText
                                  }
                                >
                                  ไม่มีแบบทดสอบก่อนเรียน
                                </Text>

                              </View>

                            )}

                          </View>


                          {/* =====================================
                              VIDEO
                          ===================================== */}

                          <View
                            style={
                              styles.examSection
                            }
                          >

                            <View
                              style={
                                styles.examSectionHeader
                              }
                            >

                              <View
                                style={[
                                  styles.examTypeIcon,
                                  styles.videoIcon,
                                ]}
                              >

                                <Ionicons
                                  name="play-circle-outline"
                                  size={22}
                                  color={
                                    BLUE
                                  }
                                />

                              </View>


                              <View
                                style={{
                                  flex: 1,
                                }}
                              >

                                <Text
                                  style={
                                    styles.examSectionTitle
                                  }
                                >
                                  วิดีโอบทเรียน
                                </Text>


                                <Text
                                  style={
                                    styles.examSectionDesc
                                  }
                                >
                                  ต้องดูวิดีโอให้จบก่อนทำแบบทดสอบประจำบท
                                </Text>

                              </View>

                            </View>


                            {lesson.videos &&
                            lesson.videos.length >
                              0 ? (

                              lesson.videos.map(
                                (
                                  video,
                                ) => (

                                  <TouchableOpacity
                                    key={
                                      video.id
                                    }
                                    style={[
                                      styles.examButton,
                                      styles.videoButton,
                                      !lessonUnlocked &&
                                        styles.examButtonLocked,
                                    ]}
                                    disabled={
                                      !lessonUnlocked
                                    }
                                    activeOpacity={
                                      0.85
                                    }
                                    onPress={() =>
                                      openLesson(
                                        lesson,
                                      )
                                    }
                                  >

                                    <View
                                      style={
                                        styles.videoButtonLeft
                                      }
                                    >

                                      <Ionicons
                                        name={
                                          video.status ===
                                          "pass"
                                            ? "checkmark-circle"
                                            : "play-circle"
                                        }
                                        size={
                                          22
                                        }
                                        color="#FFFFFF"
                                      />


                                      <View
                                        style={{
                                          marginLeft:
                                            10,
                                          flex: 1,
                                        }}
                                      >

                                        <Text
                                          style={
                                            styles.examButtonText
                                          }
                                          numberOfLines={
                                            2
                                          }
                                        >
                                          {
                                            video.name
                                          }
                                        </Text>


                                        {video.time && (

                                          <Text
                                            style={
                                              styles.videoTimeText
                                            }
                                          >
                                            {
                                              video.time
                                            }
                                          </Text>

                                        )}

                                      </View>

                                    </View>


                                    <Text
                                      style={
                                        styles.videoActionText
                                      }
                                    >
                                      {video.status ===
                                      "pass"
                                        ? "ดูอีกครั้ง"
                                        : "ดูวิดีโอ"}
                                    </Text>

                                  </TouchableOpacity>

                                ),
                              )

                            ) : (

                              <View
                                style={[
                                  styles.evaluationLockedBox,
                                  {
                                    marginBottom:
                                      0,
                                  },
                                ]}
                              >

                                <Text
                                  style={
                                    styles.evaluationLockedText
                                  }
                                >
                                  ไม่มีวิดีโอในบทเรียนนี้
                                </Text>

                              </View>

                            )}

                          </View>


                          {/* =====================================
                              POST TEST
                          ===================================== */}

                          <View
                            style={
                              styles.examSection
                            }
                          >

                            <View
                              style={
                                styles.examSectionHeader
                              }
                            >

                              <View
                                style={[
                                  styles.examTypeIcon,
                                  styles.posttestIcon,
                                ]}
                              >

                                <Ionicons
                                  name="ribbon-outline"
                                  size={20}
                                  color="#B45309"
                                />

                              </View>


                              <View
                                style={{
                                  flex: 1,
                                }}
                              >

                                <Text
                                  style={
                                    styles.examSectionTitle
                                  }
                                >
                                  แบบทดสอบหลังเรียน
                                </Text>


                                <Text
                                  style={
                                    styles.examSectionDesc
                                  }
                                >
                                  ทำแบบทดสอบหลังจากดูบทเรียนจบ
                                </Text>

                              </View>

                            </View>


                            {posttestScore && (

                              <View
                                style={
                                  styles.lessonScoreResult
                                }
                              >

                                <Text
                                  style={
                                    styles.lessonScoreLabel
                                  }
                                >
                                  คะแนนสอบบทนี้
                                </Text>


                                <Text
                                  style={
                                    styles.lessonScoreValue
                                  }
                                >
                                  {
                                    posttestScore
                                  }
                                </Text>

                              </View>

                            )}


                            {lesson.postTest
                              .hasTest ? (

                              <TouchableOpacity
                                style={[
                                  styles.examButton,
                                  styles.posttestButton,

                                  (
                                    !lessonUnlocked ||
                                    !lesson.postTest.canTake
                                  ) &&
                                    styles.examButtonLocked,
                                ]}
                                activeOpacity={
                                  0.85
                                }
                                disabled={
                                  !lessonUnlocked ||
                                  !lesson.postTest.canTake
                                }
                                onPress={() =>
                                  openPostTest(
                                    lesson,
                                  )
                                }
                              >

                                <Text
                                  style={
                                    styles.examButtonText
                                  }
                                >
                                  {!lessonUnlocked

                                    ? "บทเรียนนี้ยังไม่ปลดล็อก"

                                    : !lesson.postTest.canTake

                                      ? lesson.postTest.completed
                                        ? "ทำแบบทดสอบแล้ว"
                                        : "กรุณาดูบทเรียนให้จบก่อน"

                                      : lesson.postTest.completed
                                        ? "ทำแบบทดสอบอีกครั้ง"
                                        : "เริ่มทำแบบทดสอบประจำบท"}
                                </Text>


                                <Ionicons
                                  name={
                                    !lessonUnlocked ||
                                    !lesson.postTest.canTake

                                      ? "lock-closed"

                                      : lesson.postTest.completed
                                        ? "checkmark-circle"
                                        : "arrow-forward"
                                  }
                                  size={
                                    20
                                  }
                                  color="#FFFFFF"
                                />

                              </TouchableOpacity>

                            ) : (

                              <View
                                style={[
                                  styles.evaluationLockedBox,
                                  {
                                    marginBottom:
                                      0,
                                  },
                                ]}
                              >

                                <Text
                                  style={
                                    styles.evaluationLockedText
                                  }
                                >
                                  ไม่มีแบบทดสอบหลังเรียน
                                </Text>

                              </View>

                            )}

                          </View>

                        </View>

                      </View>

                    );

                  },
                )}

              </View>

            )}

          </View>


          {/* =====================================================
              FOOTER
          ===================================================== */}

          <View
            style={styles.footer}
          >

            <Text
              style={
                styles.footerText
              }
            >
              ©2026 Thoresen e-learning
            </Text>

          </View>

        </ScrollView>


        {/* =======================================================
            MENU MODAL
        ======================================================= */}

        <Modal
          visible={
            menuVisible
          }
          transparent
          animationType="fade"
          onRequestClose={() =>
            setMenuVisible(false)
          }
        >

          <TouchableOpacity
            style={
              styles.modalOverlay
            }
            activeOpacity={1}
            onPress={() =>
              setMenuVisible(false)
            }
          >

            <View
              style={
                styles.menuBox
              }
            >

              {menuList.map(
                (item) => (

                  <TouchableOpacity
                    key={item}
                    style={
                      styles.menuItem
                    }
                    onPress={() =>
                      handleMenuPress(
                        item,
                      )
                    }
                  >

                    <Text
                      style={
                        styles.menuText
                      }
                    >
                      {item}
                    </Text>


                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={
                        PRIMARY
                      }
                    />

                  </TouchableOpacity>

                ),
              )}

            </View>

          </TouchableOpacity>

        </Modal>

      </View>

    </SafeAreaView>

  );
}


/*
 * ================================================================
 * STYLES
 *
 * UI เดิม
 * ================================================================
 */

const styles =
  StyleSheet.create({

    safe: {
      flex: 1,
      backgroundColor: BG,
    },

    root: {
      flex: 1,
      backgroundColor: "#fff",
    },


    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
    },

    loadingText: {
      marginTop: 12,
      color: MUTED,
      fontSize: 13,
      fontWeight: "700",
    },

    errorText: {
      color: TEXT,
      fontSize: 14,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 14,
    },

    retryButton: {
      backgroundColor: PRIMARY,
      borderRadius: 8,
      paddingHorizontal: 22,
      paddingVertical: 10,
    },

    retryText: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "800",
    },


    topHeader: {
      height: 78,
      backgroundColor: "#fff",
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    logo: {
      width: 170,
      height: 52,
    },

    menuBtn: {
      width: 52,
      height: 52,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: PRIMARY,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",

      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowRadius: 6,
      elevation: 4,
    },


    pageBox: {
      paddingHorizontal: 18,
    },

    titleRow: {
      marginTop: 8,
      marginBottom: 12,
    },

    pageTitle: {
      fontSize: 18,
      color: TEXT,
      fontWeight: "900",
    },

    breadcrumb: {
      fontSize: 11,
      color: TEXT,
      alignSelf: "flex-end",
      marginTop: 8,
    },


    courseCard: {
      backgroundColor: "#F3F3F3",
      overflow: "hidden",
      marginBottom: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: BORDER,
    },

    courseImage: {
      width: "100%",
      height: 220,
      resizeMode: "cover",
    },

    courseBody: {
      padding: 12,
      backgroundColor: "#F3F3F3",
    },

    progressTrack: {
      height: 7,
      backgroundColor: "#E5E7EB",
      overflow: "hidden",
    },

    progressFill: {
      height: "100%",
    },

    progressText: {
      fontSize: 13,
      color: TEXT,
      fontWeight: "800",
      marginTop: 9,
    },


    teacherBox: {
      marginTop: 8,
    },

    teacherRow: {
      flexDirection: "row",
      marginTop: 4,
    },

    teacherLabel: {
      width: 112,
      color: MUTED,
      fontSize: 11,
    },

    teacherValue: {
      flex: 1,
      color: TEXT,
      fontSize: 11,
      fontWeight: "800",
    },


    infoGrid: {
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 10,
      overflow: "hidden",
      flexDirection: "row",
      marginBottom: 12,
      backgroundColor: "#fff",
    },

    infoCell: {
      flex: 1,
      minHeight: 82,
      alignItems: "center",
      justifyContent: "center",
      borderRightWidth: 1,
      borderRightColor: BORDER,
      paddingVertical: 10,
    },

    infoLabel: {
      fontSize: 10,
      color: TEXT,
      fontWeight: "700",
      marginBottom: 8,
    },

    infoValue: {
      marginTop: 6,
      fontSize: 11,
      color: TEXT,
      fontWeight: "700",
    },

    infoValueMuted: {
      marginTop: 6,
      fontSize: 10,
      color: MUTED,
    },


    evaluateBtn: {
      height: 46,
      backgroundColor: "#16A34A",
      borderRadius: 10,
      marginBottom: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },

    evaluateBtnDisabled: {
      backgroundColor: "#D1D5DB",
    },

    evaluateText: {
      color: "#fff",
      fontWeight: "900",
      marginLeft: 8,
      fontSize: 14,
    },


    summaryBtn: {
      height: 44,
      backgroundColor: PRIMARY,
      paddingHorizontal: 14,
      marginBottom: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    summaryText: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "900",
    },


    academicSummaryBox: {
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 16,
    },

    academicSummaryHeader: {
      minHeight: 46,
      backgroundColor: PRIMARY,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
    },

    academicSummaryTitle: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "900",
      marginLeft: 9,
    },

    chapterScoreGroup: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: BORDER,
    },

    chapterScoreGroupHeader: {
      marginBottom: 8,
    },

    chapterScoreInfo: {
      flex: 1,
      paddingRight: 12,
    },

    chapterScoreChapter: {
      color: PRIMARY,
      fontSize: 12,
      fontWeight: "900",
      marginBottom: 3,
    },

    chapterScoreName: {
      color: TEXT,
      fontSize: 12,
      fontWeight: "700",
    },

    chapterScoreRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 4,
    },

    chapterScoreBox: {
      minWidth: 78,
      alignItems: "flex-end",
    },

    chapterScoreLabel: {
      color: MUTED,
      fontSize: 11,
      fontWeight: "600",
    },

    chapterScoreValue: {
      color: PRIMARY,
      fontSize: 15,
      fontWeight: "900",
    },


    lessonScoreResult: {
      minHeight: 46,
      backgroundColor: "#F0FDF4",
      borderWidth: 1,
      borderColor: "#BBF7D0",
      borderRadius: 9,
      paddingHorizontal: 12,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    lessonScoreLabel: {
      color: "#166534",
      fontSize: 12,
      fontWeight: "700",
    },

    lessonScoreValue: {
      color: "#166534",
      fontSize: 16,
      fontWeight: "900",
    },


    tabRow: {
      flexDirection: "row",
      backgroundColor: "#fff",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: BORDER,
      marginBottom: 16,
      overflow: "hidden",
    },

    tabBtn: {
      flex: 1,
      minHeight: 50,
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 4,
      borderBottomColor: "transparent",
    },

    tabBtnActive: {
      borderBottomColor: PRIMARY,
    },

    tabText: {
      fontSize: 13,
      color: MUTED,
      fontWeight: "800",
      textAlign: "center",
    },

    tabTextActive: {
      color: PRIMARY,
      fontWeight: "900",
    },


    detailBox: {
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 10,
      padding: 14,
      marginBottom: 22,
    },

    detailText: {
      color: TEXT,
      fontSize: 10.5,
      lineHeight: 16,
      marginBottom: 8,
    },

    bulletRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: 3,
    },

    bullet: {
      fontSize: 11,
      color: TEXT,
      marginRight: 5,
    },

    bulletText: {
      fontSize: 10.5,
      color: TEXT,
      lineHeight: 15,
    },


    lessonPanel: {
      backgroundColor: "#D9ECFA",
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 14,
      marginBottom: 22,
    },

    chapterSection: {
      marginBottom: 12,
    },


    firstChapterHeader: {
      minHeight: 34,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 2,
      marginBottom: 6,
    },

    firstChapterTitleWrap: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    firstChapterNo: {
      color: BLUE,
      fontSize: 16,
      fontWeight: "500",
      marginRight: 14,
    },

    firstChapterTitle: {
      color: BLUE,
      fontSize: 16,
      fontWeight: "500",
    },


    blueChapterHeader: {
      minHeight: 35,
      backgroundColor: "#2384D1",
      borderRadius: 5,
      paddingLeft: 13,
      paddingRight: 5,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 4,
      marginBottom: 6,
    },

    blueChapterLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      paddingRight: 8,
    },

    blueChapterNo: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "500",
      marginRight: 14,
    },

    blueChapterTitle: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "700",
      flexShrink: 1,
    },


    docBtnDark: {
      backgroundColor: "#184E7D",
      borderRadius: 5,
      paddingHorizontal: 10,
      paddingVertical: 7,
      flexDirection: "row",
      alignItems: "center",
    },

    docBtnDarkText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "700",
      marginLeft: 4,
    },

    docBtnWhite: {
      minWidth: 135,
      height: 27,
      backgroundColor: "#fff",
      borderRadius: 4,
      paddingHorizontal: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    noDocBtn: {
      minWidth: 150,
    },

    docBtnWhiteText: {
      color: TEXT,
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 1,
    },


    lessonRows: {
      backgroundColor: "transparent",
    },

    lessonItem: {
      minHeight: 39,
      paddingHorizontal: 10,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: "#C8DDEE",
    },

    lessonItemLocked: {
      opacity: 0.55,
    },

    lessonLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    lessonStatusCircle: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: BLUE,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 13,
    },

    lessonStatusDone: {
      backgroundColor: BLUE,
    },

    lessonStatusActive: {
      backgroundColor: "#fff",
    },

    activeHalfDot: {
      width: 9,
      height: 18,
      borderTopLeftRadius: 9,
      borderBottomLeftRadius: 9,
      backgroundColor: BLUE,
      alignSelf: "flex-start",
    },

    lessonTitle: {
      color: TEXT,
      fontSize: 12,
      fontWeight: "600",
      flexShrink: 1,
    },

    lessonTitleLock: {
      color: TEXT,
    },

    lessonRight: {
      marginLeft: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },

    scoreWrap: {
      flexDirection: "row",
      alignItems: "center",
    },

    scoreLabel: {
      color: TEXT,
      fontSize: 10,
      marginRight: 6,
    },

    scoreBox: {
      width: 55,
      height: 26,
      backgroundColor: "#fff",
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
    },

    scoreText: {
      color: TEXT,
      fontSize: 13,
      fontWeight: "800",
    },

    timeWrap: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
    },

    timeText: {
      color: TEXT,
      fontSize: 11,
      marginLeft: 4,
    },

    actionSmallBtn: {
      backgroundColor: BLUE,
      borderRadius: 5,
      minWidth: 70,
      height: 27,
      paddingHorizontal: 8,
      alignItems: "center",
      justifyContent: "center",
    },

    actionSmallText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "700",
    },


    footer: {
      backgroundColor: PRIMARY,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 40,
      marginTop: 18,
      paddingHorizontal: 18,
      borderTopLeftRadius: 14,
      borderTopRightRadius: 14,
    },

    footerText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "700",
      textAlign: "center",
    },


    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.25)",
      alignItems: "flex-end",
      paddingTop: 80,
      paddingRight: 18,
    },

    menuBox: {
      width: 230,
      backgroundColor: "#fff",
      borderRadius: 18,
      paddingVertical: 8,
      elevation: 8,
    },

    menuItem: {
      paddingVertical: 13,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    menuText: {
      fontSize: 15,
      color: PRIMARY,
      fontWeight: "700",
    },


    certificateBtn: {
      marginTop: 7,
      backgroundColor: GREEN,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },

    certificateBtnDisabled: {
      backgroundColor: "#E5E7EB",
    },

    certificateBtnText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "900",
    },

    certificateBtnTextDisabled: {
      color: "#9CA3AF",
    },


    statusBox: {
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
    },

    statusHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },

    statusTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: TEXT,
      marginBottom: 4,
    },

    statusDesc: {
      fontSize: 11,
      lineHeight: 16,
      color: MUTED,
      fontWeight: "600",
    },

    requirementList: {
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: BORDER,
      paddingTop: 10,
    },

    requirementItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },

    requirementText: {
      marginLeft: 8,
      fontSize: 12,
      color: TEXT,
      fontWeight: "700",
    },


    evaluationDoneBox: {
      height: 44,
      borderRadius: 10,
      backgroundColor: "#ECFDF3",
      borderWidth: 1,
      borderColor: "#BBF7D0",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },

    evaluationDoneText: {
      marginLeft: 8,
      color: GREEN,
      fontSize: 13,
      fontWeight: "900",
    },


    certificateBigBtn: {
      height: 50,
      borderRadius: 12,
      backgroundColor: PRIMARY,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },

    certificateBigText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "900",
      marginLeft: 8,
    },


    certificateLockedBox: {
      minHeight: 50,
      borderRadius: 12,
      backgroundColor: "#F3F4F6",
      borderWidth: 1,
      borderColor: BORDER,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      paddingHorizontal: 14,
    },

    certificateLockedText: {
      color: "#9CA3AF",
      fontSize: 12,
      fontWeight: "700",
      marginLeft: 8,
      textAlign: "center",
    },


    examSections: {
      padding: 12,
      backgroundColor: "#F8FAFC",
    },

    examSection: {
      backgroundColor: "#FFFFFF",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      padding: 14,
      marginBottom: 12,
    },

    examSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 13,
    },

    examTypeIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 11,
    },

    pretestIcon: {
      backgroundColor: "#E8F1FF",
    },

    posttestIcon: {
      backgroundColor: "#FFF3D6",
    },

    examSectionTitle: {
      color: "#111827",
      fontSize: 14,
      fontWeight: "900",
    },

    examSectionDesc: {
      color: "#6B7280",
      fontSize: 11,
      marginTop: 3,
    },


    examButton: {
      height: 48,
      borderRadius: 11,
      backgroundColor: PRIMARY,
      paddingHorizontal: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    pretestButton: {
      backgroundColor: BLUE,
    },

    posttestButton: {
      backgroundColor: "#E30613",
    },

    examButtonLocked: {
      backgroundColor: "#9CA3AF",
      opacity: 0.7,
    },

    examButtonText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "900",
      flex: 1,
    },


    videoIcon: {
      backgroundColor: "#E8F4FF",
    },

    videoButton: {
      backgroundColor: BLUE,
      minHeight: 58,
      height: "auto",
      paddingVertical: 10,
    },

    videoButtonLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },

    videoTimeText: {
      color: "#DCEBFF",
      fontSize: 10,
      marginTop: 3,
    },

    videoActionText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "900",
      marginLeft: 8,
    },


    evaluateBtnDone: {
      backgroundColor: GREEN,
      opacity: 0.8,
    },


    evaluationLockedBox: {
      minHeight: 50,
      borderRadius: 12,
      backgroundColor: "#F3F4F6",
      borderWidth: 1,
      borderColor: "#E5E7EB",
      paddingHorizontal: 14,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    evaluationLockedText: {
      flex: 1,
      color: "#6B7280",
      fontSize: 12,
      fontWeight: "700",
      textAlign: "center",
    },

  });