import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * ============================================================
 * สรุปสิ่งที่แก้ (ค้นหา [FIX] / [ADD] / [REMOVE] ในโค้ด)
 * ============================================================
 * [FIX]  แก้ N+1 query: เดิม 1 บทเรียนยิง query ~5 ครั้ง (checkLessonPass + getGenId ซ้ำ)
 *        ตอนนี้โหลดข้อมูลการเรียนของทุกบทเป็นชุดเดียว (loadLearningData / loadTestStatuses)
 * [FIX]  checkLessonPass: นับเฉพาะไฟล์ที่ active = 'y' (เดิม count ไม่กรอง แต่ getLessonFiles กรอง
 *        ทำให้มีวิดีโอที่ปิดใช้งานแล้วบทนั้นไม่มีวันผ่าน) และเลิกใช้ raw SQL ที่นับซ้ำได้
 * [FIX]  test status: ถือว่า "ผ่าน" ถ้าเคยผ่านสักครั้ง (เดิมดูแค่คะแนนล่าสุด สอบซ้ำแล้วตก = ล็อกกลับ)
 * [FIX]  canLearnLesson: ใช้สถานะเดียวกับ checkLessonPass และไม่บังคับผ่าน pre-test บทก่อนหน้า
 *        (ตรงกับข้อความในหน้า course-result ที่บอกว่า pre-test ไม่ส่งผลต่อการปลดล็อก)
 * [ADD]  postTest.canTake (หน้า course/[id].tsx ใช้แต่เดิม backend ไม่ส่ง -> ปุ่มสอบล็อกตลอด)
 * [ADD]  myCourses / completedCourses (เดิม return [] ตลอด)
 * [ADD]  progress.completed / passedAllExams: นิยาม "เรียนจบ" ที่เดียวให้ตรงกันทั้งหน้า list และ detail
 * [ADD]  courseDateStart/End/DayLearn ใน list, url วิดีโอ, evaluation, categories สำหรับ chips
 * [ADD]  markFileCompleted: บันทึกการดูวิดีโอ (⚠ ต้องตรวจ schema ตามหมายเหตุในฟังก์ชัน)
 * [FIX]  หมวดหมู่ไม่พบ -> 404 (เดิมคืน success: true + category: null)
 * [REMOVE] debug block/console.log ใน getCoursesByCategory, getCategories, getAdminMediaUrl, LessonStatus
 *
 * ============================================================
 * รอบนี้ (เพิ่มระบบสอบ/ประเมิน/ใบประกาศให้ต่อกับ DB จริง อิงจาก schema.prisma ที่ได้รับมา)
 * ============================================================
 * [FIX]  markFileCompleted: เพิ่ม learn_date / learn_file_date / course_id ที่ขาดไป
 *        (ยืนยันจาก schema แล้วว่าเป็น DateTime ที่ไม่มี default -> เดิม insert จะ error เสมอ)
 * [ADD]  getLessonExam / submitLessonExam: ดึงข้อสอบจริงจาก tbl_manage + tbl_grouptesting +
 *        tbl_question + tbl_choice แทนชุดคำถาม hard-code ในแอป และบันทึกผลลง tbl_score จริง
 *        ดูสมมติฐานเรื่อง cate_amount / step_id / choice_answer ที่ท้ายไฟล์ (ANALYSIS NOTES)
 * [ADD]  getCourseEvaluation / submitCourseEvaluation: ต่อกับ tbl_evaluate + tbl_eval_ans จริง
 *        (ตามที่ยืนยันว่ามีข้อมูลจริง ส่วนชุด q_* ไม่มีข้อมูลจึงไม่ใช้)
 *        ⚠ ข้อจำกัด: tbl_eval_ans ไม่มีช่องเก็บคอมเมนต์ข้อความอิสระ คอมเมนต์จึงยังไม่ถูกบันทึกถาวร
 * [ADD]  getCertificate: เช็คสิทธิ์ + ดึงเลขที่ใบประกาศจาก tbl_passcourse_number (ตามที่ยืนยันว่า
 *        เป็นตารางที่มีข้อมูลจริง ส่วน tbl_coursepasscours ไม่มีข้อมูลจึงไม่ใช้) และดึงชื่อจริงจาก
 *        tbl_profiles แทนชื่อปลอมที่ client เคยส่งมาเอง
 * [ADD]  getLessonNotes / addLessonNote: บันทึกโน้ตของผู้เรียนลง tbl_learn_note จริง
 *        (เดิมเก็บใน AsyncStorage ในเครื่องเท่านั้น หายถ้าเปลี่ยนเครื่อง/ล้างแอป)
 * [ADD]  getLessonDocuments: ดึงเอกสารประกอบจาก tbl_file_pdf + tbl_file_doc (โครงสร้างเหมือนกัน
 *        ทั้งคู่ จึงดึงมารวมกัน) ให้ปุ่ม "เอกสารประกอบ" ที่เคยกดไม่ได้เลยใช้งานได้จริง
 * [ADD]  markCourseCompletedIfEligible: สร้างแถว tbl_passcourse_number อัตโนมัติเมื่อเรียนจบ
 *        ทุกบท + ผ่านข้อสอบทุกบท + ทำแบบประเมินครบ (เดิมไม่มีจุดไหนเขียนตารางนี้เลย)
 * [ADD]  teacher/assistant: join tbl_course_teacher -> tbl_teacher (schema ไม่มี @relation ให้
 *        จึง query 2 ขั้นเอง) fallback ไป course_lecturer ถ้าไม่มีข้อมูลใน tbl_course_teacher
 *
 * ดูสรุปสมมติฐานทั้งหมดพร้อมเหตุผลได้ที่ท้ายไฟล์นี้ (ANALYSIS NOTES)
 */

// ============================================================
// [ADD] ค่าคงที่สำหรับเช็คสิทธิ์คอร์ส (enrollment) — ยังไม่ยืนยัน 100% ตั้งใจแยกไว้ตรงนี้
// ที่เดียว เพื่อให้แก้ได้ง่ายทีเดียวบรรทัดเดียวเมื่อได้คำตอบจากแอดมิน/คนดูแลระบบเดิม
// ============================================================

/**
 * ค่า org_user_status ที่ถือว่า "มีสิทธิ์เรียนคอร์สนี้"
 * ยังไม่ยืนยัน 100% — จากข้อมูลที่เช็คมา (0 = 674 แถว, 1 = 116 แถว) แต่เป็นฐานข้อมูลทดสอบ
 * ตีความไม่ได้แน่ชัดจากรูปแบบข้อมูลอย่างเดียว
 * TODO: ยืนยันกับแอดมิน/คนดูแลระบบเดิม หรือเช็คจากหน้าแอดมินที่ใช้ assign สิทธิ์ (ถ้ามี)
 * แล้วแก้เลขนี้ค่าเดียว ไม่ต้องแก้ logic ที่อื่น
 */
const ENROLLMENT_ALLOWED_STATUS = 1;

/**
 * คอร์สที่ "ไม่มีแถวเลย" ใน tbl_chk_usercourse ควรเปิดให้ทุกคนเรียนได้ไหม
 * ยืนยันแล้วในระดับหนึ่งจากข้อมูลจริง (ไม่ใช่ test data): คอร์ส active ทั้งหมด 147 คอร์ส
 * มีแค่ 19 คอร์ส (13%) ที่ถูกอ้างถึงในตารางนี้เลย ถ้าตีความว่า "ไม่มีแถว = ปิด" จะแปลว่า
 * 87% ของคอร์สทั้งระบบเข้าไม่ได้เลยสักคนเดียว ซึ่งไม่สมเหตุสมผล จึงตั้งเป็น true
 */
const COURSE_WITH_NO_RESTRICTION_ROWS_IS_OPEN = true;

type LessonPassStatus = 'pass' | 'learning' | 'notLearn';
type TestType = 'pre' | 'post';

type TestStatus = {
  hasTest: boolean;
  completed: boolean;
  passed: boolean;
  score: number | null;
  total: number | null;
  percent: number;
  // [ADD] ใช้ได้เฉพาะ postTest: ดูวิดีโอครบและบทถูกปลดล็อกแล้วหรือยัง
  canTake?: boolean;
};

// แถวจาก tbl_lesson เท่าที่ใช้ในไฟล์นี้
type LessonRef = {
  id: number;
  course_id: number;
  sequence_id?: number | null;
  [key: string]: any;
};

type LearningData = {
  filesByLesson: Map<number, any[]>;
  learnsByLesson: Map<number, any[]>;
  learnFilesByLearn: Map<number, any[]>;
};

// context ที่ใช้คำนวณสถานะของบทเรียนหลายบทพร้อมกัน (โหลดครั้งเดียว)
type LessonContext = {
  learning: LearningData;
  tests: Map<string, TestStatus>;
  statusOf: (lessonId: number) => LessonPassStatus;
  testOf: (lessonId: number, type: TestType) => TestStatus;
};

const NO_TEST: TestStatus = {
  hasTest: false,
  completed: false,
  passed: false,
  score: null,
  total: null,
  percent: 0,
};

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // Helpers
  // ============================================================

  private getMediaUrl(path: string | null): string | null {
    if (!path) {
      return null;
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // [FIX] เดิมถ้าไม่ได้ตั้ง MEDIA_URL จะได้ URL เป็น "undefined/..." โดยไม่มี error
    const base = process.env.MEDIA_URL?.replace(/\/+$/, '');

    if (!base) {
      this.logger.warn('MEDIA_URL is not set - media URLs will be null');
      return null;
    }

    return `${base}/${path.replace(/^\//, '')}`;
  }

  // [ADD] url ของวิดีโอ ให้หน้า lesson/[id].tsx เล่นได้
  // ⚠ TODO: แก้ path ให้ตรงกับที่เก็บไฟล์วิดีโอจริง (ผมไม่เห็น path นี้ในโค้ดที่ส่งมา จึงเดาไว้ก่อน)
  private getVideoUrl(
    lessonId: number,
    filename: string | null,
  ): string | null {
    if (!filename) {
      return null;
    }

    // ============================================================
    // 🧪 TEMP FOR TESTING ONLY — ลบบล็อกนี้ทิ้งเมื่อได้ path วิดีโอจริงแล้ว
    // ============================================================
    // สลับไปใช้วิดีโอตัวอย่างสาธารณะแทน path ที่เดาไว้ (ยังไม่ยืนยัน) ชั่วคราว
    // เพื่อให้ทดสอบ flow "ดูจบ -> ปลดล็อกสอบ -> บทถัดไป" ได้ก่อน โดยไม่ต้องรอ path จริง
    // วิธีหา path จริง: เปิดเว็บ/แอปเก่าที่ดูวิดีโอได้ -> DevTools > Network -> กดเล่นวิดีโอ
    // -> ดู URL ของไฟล์ .mp4 ที่โหลดมา แล้วเอามาแทนบรรทัด getMediaUrl ด้านล่าง
    if (process.env.USE_TEST_VIDEO === 'true') {
      // ⚠ URL เดิม (commondatastorage.googleapis.com/gtv-videos-bucket) ปิดสิทธิ์การเข้าถึงแล้ว
      // (AccessDenied) เปลี่ยนมาใช้ตัวนี้แทน ก่อนใช้ แนะนำวางลิงก์นี้ในเบราว์เซอร์เพื่อเช็คว่า
      // ยังเปิดได้จริงก่อน (แหล่งข้อมูลสาธารณะแบบนี้ปิด/ย้ายได้ตลอดเวลาโดยไม่แจ้งล่วงหน้า)
      return 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4';
      // สำรอง ถ้าตัวบนใช้ไม่ได้: 'https://www.w3schools.com/html/mov_bbb.mp4'
    }
    // ============================================================
    // 🧪 END TEMP BLOCK
    // ============================================================

    // ⚠ path นี้ยังเป็นการเดา (ยังไม่ยืนยันกับ path จริงบนเซิร์ฟเวอร์) แก้ตรงนี้เมื่อรู้ path จริง
    return this.getMediaUrl(`lesson/${lessonId}/video/${filename}`);
  }

  // ============================================================
  // GET /course
  // ============================================================

  async getCourseData(userId: number, langId: number = 1) {
    const user = await this.prisma.tbl_users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        data: {
          categories: [],
          courses: [],
          myCourses: [],
          completedCourses: [],
        },
      };
    }

    const [categories, courseRows] = await Promise.all([
      this.prisma.tbl_category.findMany({
        where: { cate_show: 1, active: 'y', lang_id: langId },
        orderBy: { cate_id: 'asc' },
      }),
      this.prisma.tbl_course_online.findMany({
        where: {
          active: 'y',
          status: '1',
          course_status: 0,
          lang_id: langId,
          tbl_category: { cate_show: 1, active: 'y', lang_id: langId },
        },
      }),
    ]);

    // [FIX] สร้างสรุปของทุกคอร์สแบบ batch (เดิมทีละคอร์ส ทีละบท)
    const allCourses = await this.buildCourseSummaries(
      userId,
      courseRows,
      langId,
    );

    // [ADD] กรองเฉพาะคอร์สที่ user คนนี้มีสิทธิ์เห็น (tbl_chk_usercourse)
    // เดิมทุกคนเห็นทุกคอร์สหมด ไม่มีการเช็คสิทธิ์เลย (ดูค่าคงที่ ENROLLMENT_* ด้านบนไฟล์)
    const accessMap = await this.getCourseAccessMap(
      allCourses.map((course) => course.id),
      userId,
    );
    const courses = allCourses.filter((course) => accessMap.get(course.id));

    // [ADD] เดิม getMyCourses / getCompletedCourses return [] ตลอด
    const myCourses = courses.filter((course) => course.status === 'learning');
    const completedCourses = courses.filter(
      (course) => course.status === 'completed',
    );

    const categoryData = categories.map((item) => ({
      id: item.cate_id,
      title: item.cate_title,
      shortDetail: item.cate_short_detail,
      detail: item.cate_detail,
      image: item.cate_image
        ? this.getMediaUrl(
            `category/${item.cate_id}/original/${item.cate_image}`,
          )
        : null,
    }));

    return {
      success: true,
      data: {
        categories: categoryData,
        courses,
        myCourses,
        completedCourses,
      },
    };
  }

  // ============================================================
  // GET /course-category/:id
  // ============================================================

  async getCoursesByCategory(
    categoryId: number,
    userId: number,
    langId: number = 1,
  ) {
    const category = await this.prisma.tbl_category.findFirst({
      where: {
        cate_id: categoryId,
        cate_show: 1,
        active: 'y',
        lang_id: langId,
      },
    });

    // [FIX] เดิมคืน success: true + category: null ซึ่งขัดกับ type ฝั่ง frontend
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // [REMOVE] debug block (query ซ้ำ + console.log จำนวนมาก) ถูกลบแล้ว

    const [courseRows, allCategories] = await Promise.all([
      this.prisma.tbl_course_online.findMany({
        where: {
          cate_id: categoryId,
          active: 'y',
          status: '1',
          course_status: 0,
          lang_id: langId,
        },
        // ⚠ ตรวจใน schema ว่า field ชื่อ sortOrder จริงไหม (field อื่นเป็น snake_case)
        orderBy: [{ sortOrder: 'asc' }, { course_id: 'asc' }],
      }),
      // [ADD] รายชื่อหมวดทั้งหมดให้หน้า category ทำ chip เอง (เดิม hard-code ชื่อหมวดไว้ในแอป)
      this.prisma.tbl_category.findMany({
        where: { cate_show: 1, active: 'y', lang_id: langId },
        orderBy: { cate_id: 'asc' },
        select: { cate_id: true, cate_title: true },
      }),
    ]);

    const allCourses = await this.buildCourseSummaries(
      userId,
      courseRows,
      langId,
    );

    // [ADD] กรองเฉพาะคอร์สที่มีสิทธิ์ (เหมือน getCourseData)
    const accessMap = await this.getCourseAccessMap(
      allCourses.map((course) => course.id),
      userId,
    );
    const courses = allCourses.filter((course) => accessMap.get(course.id));

    return {
      success: true,
      data: {
        category: {
          id: category.cate_id,
          title: category.cate_title,
          shortDetail: category.cate_short_detail,
          detail: category.cate_detail,
          image: category.cate_image
            ? this.getMediaUrl(
                `category/${category.cate_id}/original/${category.cate_image}`,
              )
            : null,
        },
        categories: allCategories.map((item) => ({
          id: item.cate_id,
          title: item.cate_title,
        })),
        courses,
      },
    };
  }

  // ============================================================
  // GET /course/:id
  // ============================================================

  async getCourseDetail(
    courseId: number,
    userId: number,
    langId: number = 1,
  ) {
    // [ADD] เช็คสิทธิ์ก่อนอ่านรายละเอียดคอร์ส (กันคนที่ไม่มีสิทธิ์ยิง endpoint นี้ตรงๆ
    // ทั้งที่หน้ารายการกรองออกไปแล้ว)
    await this.assertCourseAccess(courseId, userId);

    const course = await this.prisma.tbl_course_online.findFirst({
      where: {
        course_id: courseId,
        active: 'y',
        status: '1',
        course_status: 0,
        lang_id: langId,
      },
      include: { tbl_category: true },
    });

    if (!course) {
      return {
        success: false,
        message: 'Course not found',
        data: null,
      };
    }

    const [genMap, lessons, teacherInfo] = await Promise.all([
      this.getGenMap([courseId]),
      this.prisma.tbl_lesson.findMany({
        where: {
          course_id: courseId,
          active: 'y',
          lang_id: langId,
          type: 'vdo',
        },
        orderBy: [{ lesson_no: 'asc' }, { id: 'asc' }],
      }),
      // [ADD] ชื่อผู้สอน/ผู้ช่วยสอนจริง
      this.getCourseTeachers(course.course_id, course.course_lecturer),
    ]);

    // [FIX] โหลดข้อมูลการเรียน + ผลสอบของทุกบทเป็นชุดเดียว
    const ctx = await this.loadLessonContext(userId, lessons, genMap);

    const lessonData = lessons.map((lesson) =>
      this.buildLessonDetail(lesson, ctx),
    );

    const summary = this.summarizeCourse(lessons, ctx);

    return {
      success: true,
      data: {
        course: {
          id: course.course_id,
          courseNumber: course.course_number ?? null,
          title: course.course_title ?? null,
          shortTitle: course.course_short_title ?? null,
          detail: course.course_detail ?? null,
          image: course.course_picture
            ? this.getMediaUrl(
                `courseonline/${course.course_id}/original/${course.course_picture}`,
              )
            : null,
          categoryId: course.cate_id ?? null,
          category: course.tbl_category
            ? {
                id: course.tbl_category.cate_id,
                title: course.tbl_category.cate_title,
              }
            : null,
          courseDateStart: course.course_date_start ?? null,
          courseDateEnd: course.course_date_end ?? null,
          courseDayLearn: course.course_day_learn ?? null,

          // [ADD] field ที่หน้า detail ใช้ แต่เดิม backend ไม่ส่ง (แสดง "-" / undefined เสมอ)
          courseName: course.course_title ?? null,
          duration: course.course_day_learn
            ? `${course.course_day_learn} วัน`
            : null,
          // [FIX] ดึงชื่อจริงแล้ว (ดูหมายเหตุ getCourseTeachers)
          teacher: teacherInfo.teacher,
          assistant: teacherInfo.assistant,

          // [ADD] ให้ shape ตรงกับ interface Course (lessonCount / status / progress เป็น required)
          lessonCount: summary.totalLessons,
          progress: summary.percent,
          passedLessons: summary.passedLessons,
          passed: summary.completed,
          status: this.courseStatus(summary),
        },

        lessons: lessonData,

        progress: {
          totalLessons: summary.totalLessons,
          passedLessons: summary.passedLessons,
          percent: summary.percent,
          // [ADD] frontend ใช้ค่าเหล่านี้แทนการคำนวณเอง จะได้ตรงกับหน้า list
          passedAllExams: summary.passedAllExams,
          completed: summary.completed,
        },

        // [FIX] ต่อกับ tbl_evaluate/tbl_eval_ans จริงแล้ว (เดิม completed: false ตายตัว)
        evaluation: await this.getEvaluationStatus(courseId, userId),
      },
    };
  }

  // ============================================================
  // GET /course/:id/lessons/:lessonId/exam?type=pre|post
  // ============================================================

  /**
   * [ADD] ดึงข้อสอบจริงจาก DB (แทน examBank ที่ hard-code ในแอปเดิม ซึ่งเห็นเฉลยได้จากตัวแอป)
   * ไม่ส่ง choice_answer (เฉลย) กลับไปเด็ดขาด
   */
  async getLessonExam(
    courseId: number,
    lessonId: number,
    type: TestType,
    userId: number,
  ) {
    await this.assertCourseAccess(courseId, userId); // [ADD]

    const lesson = await this.getLessonOrThrow(courseId, lessonId);
    const genMap = await this.getGenMap([courseId]);
    const ctx = await this.loadLessonContext(userId, [lesson], genMap);

    if (!this.canLearn(lesson, ctx)) {
      throw new ForbiddenException('Lesson is locked');
    }

    if (type === 'post') {
      const postStatus = ctx.testOf(lessonId, 'post');
      const videoDone = ctx.statusOf(lessonId) === 'pass';

      if (!videoDone) {
        // [FIX] เดิมฝั่งแอปเช็คเองแบบหลวมๆ ตอนนี้ backend เป็นคนตัดสินให้แน่นอน
        throw new ForbiddenException(
          'Must finish all videos before taking the post-test',
        );
      }

      void postStatus; // เผื่ออนาคตอยากเช็คว่าเคยผ่านแล้วห้ามสอบซ้ำ (ตอนนี้อนุญาตให้สอบซ้ำได้)
    }

    const group = await this.getPrimaryTestGroup(lessonId, type);

    if (!group) {
      throw new NotFoundException('No exam configured for this lesson');
    }

    // [ADD] cate_amount = จำนวนข้อที่ใช้สอบ (ดูสมมติฐานท้ายไฟล์), เรียง ques_id แบบ deterministic
    // เพราะไม่มีตารางเก็บว่าตอนแสดงผลแจกข้อไหนไปบ้าง ถ้าสุ่มทุกครั้งจะตรวจคะแนนไม่ตรงกับที่เห็น
    const amount = lesson.cate_amount ?? 2;

    const questions = await this.prisma.tbl_question.findMany({
      where: { group_id: group.group_id, active: 'y' },
      orderBy: { ques_id: 'asc' },
      take: amount,
    });

    if (questions.length === 0) {
      throw new NotFoundException('No questions configured for this exam');
    }

    const choices = await this.prisma.tbl_choice.findMany({
      where: {
        ques_id: { in: questions.map((question) => question.ques_id) },
        active: 'y',
      },
      orderBy: { choice_id: 'asc' },
    });

    return {
      success: true,
      data: {
        lessonId,
        type,
        courseTitle: (
          await this.prisma.tbl_course_online.findUnique({
            where: { course_id: courseId },
            select: { course_title: true },
          })
        )?.course_title,
        lessonTitle: lesson.title,
        // [ADD] จาก tbl_lesson.time_test (นาที) แทน 15 นาที hard-code เดิม
        timeLimitMinutes: lesson.time_test ?? 15,
        // [ADD] จาก tbl_lesson.cate_percent แทน 80% hard-code เดิม
        passPercent: lesson.cate_percent ?? 60,
        questions: questions.map((question) => ({
          id: question.ques_id,
          title: question.ques_title,
          // ไม่ส่ง choice_answer กลับไปเด็ดขาด
          choices: choices
            .filter((choice) => choice.ques_id === question.ques_id)
            .map((choice) => ({
              id: choice.choice_id,
              text: choice.choice_detail,
            })),
        })),
      },
    };
  }

  // ============================================================
  // POST /course/:id/lessons/:lessonId/exam
  // ============================================================

  /**
   * [ADD] ตรวจข้อสอบฝั่ง server แล้วบันทึกลง tbl_score จริง (เดิมตรวจฝั่งแอปแล้วเก็บ AsyncStorage
   * เท่านั้น เฉลยอยู่ในแอป ไม่มีการยืนยันฝั่ง server เลย)
   */
  async submitLessonExam(
    courseId: number,
    lessonId: number,
    type: TestType,
    userId: number,
    answers: Record<number, number>,
  ) {
    await this.assertCourseAccess(courseId, userId); // [ADD]

    const lesson = await this.getLessonOrThrow(courseId, lessonId);
    const genMap = await this.getGenMap([courseId]);
    const genId = genMap.get(courseId) ?? 0;

    const group = await this.getPrimaryTestGroup(lessonId, type);

    if (!group) {
      throw new NotFoundException('No exam configured for this lesson');
    }

    const amount = lesson.cate_amount ?? 2;

    // ต้องใช้ query แบบเดียวกับตอนแสดงผลเป๊ะๆ ไม่งั้นชุดคำถามจะไม่ตรงกัน
    const questions = await this.prisma.tbl_question.findMany({
      where: { group_id: group.group_id, active: 'y' },
      orderBy: { ques_id: 'asc' },
      take: amount,
    });

    if (questions.length === 0) {
      throw new NotFoundException('No questions configured for this exam');
    }

    const choices = await this.prisma.tbl_choice.findMany({
      where: {
        ques_id: { in: questions.map((question) => question.ques_id) },
        active: 'y',
      },
    });

    let correctCount = 0;

    // [ADD] choice_answer === 1 คือคำตอบที่ถูก (ดูสมมติฐานท้ายไฟล์)
    const details = questions.map((question) => {
      const questionChoices = choices.filter(
        (choice) => choice.ques_id === question.ques_id,
      );

      const correctChoice = questionChoices.find(
        (choice) => choice.choice_answer === 1,
      );

      const selectedChoiceId = answers[question.ques_id];
      const selectedChoice = questionChoices.find(
        (choice) => choice.choice_id === selectedChoiceId,
      );

      const isCorrect =
        selectedChoiceId != null &&
        correctChoice != null &&
        selectedChoiceId === correctChoice.choice_id;

      if (isCorrect) {
        correctCount += 1;
      }

      return {
        id: question.ques_id,
        question: question.ques_title,
        selectedText: selectedChoice?.choice_detail ?? 'ยังไม่ได้ตอบ',
        correctText: correctChoice?.choice_detail ?? null,
        correct: isCorrect,
      };
    });

    const total = questions.length;
    const percent = total > 0 ? (correctCount / total) * 100 : 0;
    const passPercent = lesson.cate_percent ?? 60;
    const passed = percent >= passPercent;

    await this.prisma.tbl_score.create({
      data: {
        course_id: courseId,
        gen_id: genId,
        user_id: userId,
        lesson_id: lessonId,
        type,
        score_number: correctCount,
        score_total: total,
        score_past: passed ? 'y' : 'n',
        create_date: new Date(),
        active: 'y',
      },
    });

    // ผ่านข้อสอบหลังเรียนของบทสุดท้าย + ประเมินครบแล้ว -> ปลดล็อกใบประกาศให้อัตโนมัติ
    if (passed && type === 'post') {
      await this.markCourseCompletedIfEligible(courseId, userId);
    }

    return {
      success: true,
      data: {
        lessonId,
        type,
        score: correctCount,
        total,
        passed,
        passPercent,
        details,
      },
    };
  }

  // ============================================================
  // GET /course/:id/evaluation
  // ============================================================

  /**
   * [ADD] ใช้ tbl_evaluate (คำถามของคอร์ส) + tbl_eval_ans (คำตอบผู้ใช้) ตามที่ยืนยันว่ามีข้อมูลจริง
   */
  async getCourseEvaluation(courseId: number, userId: number) {
    await this.assertCourseAccess(courseId, userId); // [ADD]

    const status = await this.getEvaluationStatus(courseId, userId);

    return { success: true, data: status };
  }

  private async getEvaluationStatus(courseId: number, userId: number) {
    const items: any[] = await this.prisma.tbl_evaluate.findMany({
      where: { course_id: courseId, active: 'y' },
      orderBy: { eva_id: 'asc' },
    });

    if (items.length === 0) {
      // ไม่มีคำถามประเมินตั้งไว้เลย -> ถือว่าไม่บังคับทำ
      return { required: false, completed: true, items: [] };
    }

    const answers: any[] = await this.prisma.tbl_eval_ans.findMany({
      where: {
        course_id: courseId,
        user_id: userId,
        active: 'y',
        eva_id: { in: items.map((item) => item.eva_id) },
      },
    });

    const answeredIds = new Set(answers.map((answer) => answer.eva_id));

    return {
      required: true,
      completed: items.every((item) => answeredIds.has(item.eva_id)),
      items: items.map((item) => ({
        id: item.eva_id,
        title: item.eva_title,
        answered: answeredIds.has(item.eva_id),
      })),
    };
  }

  // ============================================================
  // POST /course/:id/evaluation
  // ============================================================

  /**
   * [ADD] บันทึกคะแนนแบบประเมินลง tbl_eval_ans จริง
   *
   * ⚠ ข้อจำกัดที่ต้องแจ้งตรงๆ: tbl_eval_ans ไม่มีช่องเก็บคอมเมนต์ข้อความอิสระ
   * (มีแค่ eval_answer เป็นตัวเลขต่อ 1 คำถาม) พารามิเตอร์ comment ด้านล่างนี้จึงยังไม่ถูกบันทึก
   * ลง DB จริง แค่ตอบกลับ commentSaved: false ให้ frontend รู้ตัว ถ้าต้องการเก็บคอมเมนต์จริง
   * ต้องเพิ่มคอลัมน์ใหม่ใน tbl_eval_ans (เช่น eval_comment TEXT) ก่อน
   */
  async submitCourseEvaluation(
    courseId: number,
    userId: number,
    answers: { evaId: number; score: number }[],
    _comment?: string,
  ) {
    await this.assertCourseAccess(courseId, userId); // [ADD]

    const items: any[] = await this.prisma.tbl_evaluate.findMany({
      where: { course_id: courseId, active: 'y' },
    });

    const validIds = new Set(items.map((item) => item.eva_id));

    for (const answer of answers) {
      if (!validIds.has(answer.evaId)) {
        continue;
      }

      const existing = await this.prisma.tbl_eval_ans.findFirst({
        where: { course_id: courseId, user_id: userId, eva_id: answer.evaId },
      });

      if (existing) {
        await this.prisma.tbl_eval_ans.updateMany({
          where: { eval_user_id: existing.eval_user_id },
          data: { eval_answer: answer.score, active: 'y' },
        });
      } else {
        await this.prisma.tbl_eval_ans.create({
          data: {
            course_id: courseId,
            eva_id: answer.evaId,
            user_id: userId,
            eval_answer: answer.score,
            create_date: new Date(),
            active: 'y',
          },
        });
      }
    }

    await this.markCourseCompletedIfEligible(courseId, userId);

    return {
      success: true,
      data: {
        ...(await this.getEvaluationStatus(courseId, userId)),
        commentSaved: false, // [ADD] ดูหมายเหตุข้างบน
      },
    };
  }

  // ============================================================
  // GET /course/:id/certificate
  // ============================================================

  /**
   * [ADD] เช็คสิทธิ์ใบประกาศจาก tbl_passcourse_number จริง (เดิมเช็คจาก AsyncStorage ในเครื่อง
   * ซึ่งแก้ไขเองได้) และดึงชื่อจริงจาก tbl_profiles (เดิมใช้ชื่อปลอมที่ client ส่งมาเอง)
   */
  async getCertificate(courseId: number, userId: number) {
    await this.assertCourseAccess(courseId, userId); // [ADD]

    const genMap = await this.getGenMap([courseId]);
    const genId = genMap.get(courseId) ?? 0;

    const [passRecord, profile, course] = await Promise.all([
      this.prisma.tbl_passcourse_number.findFirst({
        where: { course_id: courseId, user_id: userId, gen_id: genId },
        orderBy: { id: 'desc' },
      }),
      this.prisma.tbl_profiles.findUnique({ where: { user_id: userId } }),
      this.prisma.tbl_course_online.findUnique({
        where: { course_id: courseId },
        select: { course_title: true },
      }),
    ]);

    if (!passRecord) {
      return {
        success: true,
        data: { eligible: false },
      };
    }

    const studentName =
      profile?.firstname || profile?.lastname
        ? `${profile.firstname ?? ''} ${profile.lastname ?? ''}`.trim()
        : null;

    return {
      success: true,
      data: {
        eligible: true,
        certificateNumber: passRecord.code_number,
        completionDate: passRecord.created_date,
        studentName, // null ถ้าไม่มีข้อมูลโปรไฟล์ -> frontend ต้อง fallback เอง ห้าม hardcode ชื่อปลอม
        courseName: course?.course_title ?? null,
      },
    };
  }

  /**
   * [ADD] สร้างแถว tbl_passcourse_number อัตโนมัติเมื่อครบเงื่อนไขจบคอร์ส
   * (เดิมไม่มีจุดไหนในระบบเขียนตารางนี้เลย ใบประกาศเลยปลดล็อกไม่ได้จริง)
   *
   * ⚠ ข้อจำกัด: การนับเลขที่ code_number ทำแบบ count+1 ธรรมดา ถ้ามี 2 คำขอพร้อมกันเป๊ะๆ
   * (race condition) อาจได้เลขซ้ำได้ ระบบเดิมที่มีข้อมูล 2.5M แถวอาจมีกลไกกันเลขซ้ำที่เข้มกว่านี้
   * (เช่น unique constraint ในฐานข้อมูล) แนะนำให้ผู้ดูแลระบบตรวจสอบ constraint ที่ตาราง
   * ก่อนใช้งานจริงจัง
   */
  private async markCourseCompletedIfEligible(courseId: number, userId: number) {
    const genMap = await this.getGenMap([courseId]);
    const genId = genMap.get(courseId) ?? 0;

    const existing = await this.prisma.tbl_passcourse_number.findFirst({
      where: { course_id: courseId, user_id: userId, gen_id: genId },
    });

    if (existing) {
      return;
    }

    const lessons = await this.prisma.tbl_lesson.findMany({
      where: { course_id: courseId, active: 'y', type: 'vdo' },
    });

    const ctx = await this.loadLessonContext(userId, lessons, genMap);
    const summary = this.summarizeCourse(lessons, ctx);

    if (!summary.completed) {
      return;
    }

    const evaluation = await this.getEvaluationStatus(courseId, userId);

    if (!evaluation.completed) {
      return;
    }

    const countForCourse = await this.prisma.tbl_passcourse_number.count({
      where: { course_id: courseId, gen_id: genId },
    });

    const codeNumber = String(countForCourse + 1).padStart(4, '0');

    await this.prisma.tbl_passcourse_number.create({
      data: {
        course_id: courseId,
        gen_id: genId,
        user_id: userId,
        code_number: codeNumber,
        created_date: new Date(),
      },
    });
  }

  /**
   * [ADD] ชื่อผู้สอน/ผู้ช่วยสอน
   * schema ไม่มี @relation ระหว่าง tbl_course_teacher <-> tbl_teacher จึง query เอง 2 ขั้น
   * เลือก 2 แถวแรกเรียงตาม id เป็น teacher/assistant ตามลำดับ
   * ถ้าไม่มีข้อมูลใน tbl_course_teacher เลย fallback ไปที่ course_lecturer (คอลัมน์เดี่ยวบน
   * tbl_course_online) เป็น teacher, assistant เป็น null
   *
   * ⚠ หมายเหตุ: จากรูปที่ส่งมา tbl_teacher ทั้งระบบมีอยู่แค่ 1 แถว ส่วนใหญ่คอร์สจะไม่มีข้อมูลนี้
   * และแสดงเป็น "-" ตามที่ตั้งใจไว้ (ไม่ใช่บั๊ก)
   */
  private async getCourseTeachers(
    courseId: number,
    courseLecturerId: number | null | undefined,
  ): Promise<{ teacher: string | null; assistant: string | null }> {
    const rows: any[] = await this.prisma.tbl_course_teacher.findMany({
      where: { course_id: courseId },
      orderBy: { id: 'asc' },
    });

    const teacherIds = [
      ...new Set(
        [
          ...rows.map((row) => row.teacher_id),
          courseLecturerId,
        ].filter((id): id is number => !!id),
      ),
    ];

    if (teacherIds.length === 0) {
      return { teacher: null, assistant: null };
    }

    const teachers: any[] = await this.prisma.tbl_teacher.findMany({
      where: { teacher_id: { in: teacherIds }, active: 'y' },
    });

    const nameOf = (teacherId: number | null | undefined) =>
      teachers.find((teacher) => teacher.teacher_id === teacherId)
        ?.teacher_name ?? null;

    if (rows.length > 0) {
      return {
        teacher: nameOf(rows[0].teacher_id),
        assistant: rows[1] ? nameOf(rows[1].teacher_id) : null,
      };
    }

    // ไม่มีข้อมูลใน tbl_course_teacher -> fallback ไป course_lecturer
    return { teacher: nameOf(courseLecturerId), assistant: null };
  }

  /**
   * [ADD] เหมือน getCourseTeachers แต่ทำหลายคอร์สพร้อมกันเป็น batch เดียว
   * ใช้กับหน้ารายการ (list/category) ที่มีหลายคอร์สในหน้าเดียว เพื่อไม่ให้เกิด N+1 query
   */
  private async getCourseTeachersBatch(
    courses: { course_id: number; course_lecturer?: number | null }[],
  ): Promise<Map<number, { teacher: string | null; assistant: string | null }>> {
    const result = new Map<
      number,
      { teacher: string | null; assistant: string | null }
    >();

    if (courses.length === 0) {
      return result;
    }

    const courseIds = courses.map((course) => course.course_id);

    const rows: any[] = await this.prisma.tbl_course_teacher.findMany({
      where: { course_id: { in: courseIds } },
      orderBy: { id: 'asc' },
    });

    const rowsByCourse = new Map<number, any[]>();

    for (const row of rows) {
      if (row.course_id == null) {
        continue;
      }

      const list = rowsByCourse.get(row.course_id) ?? [];
      list.push(row);
      rowsByCourse.set(row.course_id, list);
    }

    const teacherIds = [
      ...new Set(
        [
          ...rows.map((row) => row.teacher_id),
          ...courses.map((course) => course.course_lecturer),
        ].filter((id): id is number => !!id),
      ),
    ];

    const teachers: any[] =
      teacherIds.length > 0
        ? await this.prisma.tbl_teacher.findMany({
            where: { teacher_id: { in: teacherIds }, active: 'y' },
          })
        : [];

    const nameOf = (teacherId: number | null | undefined) =>
      teachers.find((teacher) => teacher.teacher_id === teacherId)
        ?.teacher_name ?? null;

    for (const course of courses) {
      const courseRows = rowsByCourse.get(course.course_id) ?? [];

      if (courseRows.length > 0) {
        result.set(course.course_id, {
          teacher: nameOf(courseRows[0].teacher_id),
          assistant: courseRows[1] ? nameOf(courseRows[1].teacher_id) : null,
        });
      } else {
        result.set(course.course_id, {
          teacher: nameOf(course.course_lecturer),
          assistant: null,
        });
      }
    }

    return result;
  }

  /**
   * ดึงชุดข้อสอบหลักของบท (ดูสมมติฐานเรื่อง step_id ท้ายไฟล์)
   * เลือก tbl_grouptesting ที่ active และ step_id น้อยที่สุด ผ่าน tbl_manage (id=lessonId, type)
   */
  private async getPrimaryTestGroup(lessonId: number, type: TestType) {
    const manage = await this.prisma.tbl_manage.findFirst({
      where: { id: lessonId, type, active: 'y', group_id: { not: null } },
    });

    if (!manage?.group_id) {
      return null;
    }

    return this.prisma.tbl_grouptesting.findFirst({
      where: { group_id: manage.group_id, active: 'y' },
      orderBy: { step_id: 'asc' },
    });
  }

  // ============================================================
  // GET/POST /course/:id/lessons/:lessonId/notes
  // ============================================================

  /**
   * [ADD] ดึงโน้ตของผู้เรียนคนนี้ในบทนี้ จาก tbl_learn_note จริง
   * (เดิม lesson/[id].tsx เก็บลง AsyncStorage คีย์ `lesson_notes_${userId}_${lessonId}`
   * ในเครื่องเท่านั้น หายถ้าเปลี่ยนเครื่อง/ล้างแอป/ล็อกอินเครื่องอื่น)
   */
  async getLessonNotes(courseId: number, lessonId: number, userId: number) {
    await this.assertCourseAccess(courseId, userId); // [ADD]
    await this.getLessonOrThrow(courseId, lessonId);

    const notes: any[] = await this.prisma.tbl_learn_note.findMany({
      where: {
        course_id: courseId,
        lesson_id: lessonId,
        user_id: userId,
        active: 'y',
      },
      orderBy: { note_id: 'desc' },
    });

    return {
      success: true,
      data: notes.map((note) => ({
        id: note.note_id,
        text: note.note_text,
        createdAt: note.created_date,
      })),
    };
  }

  async addLessonNote(
    courseId: number,
    lessonId: number,
    userId: number,
    text: string,
  ) {
    await this.assertCourseAccess(courseId, userId); // [ADD]
    await this.getLessonOrThrow(courseId, lessonId);

    const genMap = await this.getGenMap([courseId]);
    const genId = genMap.get(courseId) ?? 0;

    const note = await this.prisma.tbl_learn_note.create({
      data: {
        course_id: courseId,
        gen_id: genId,
        user_id: userId,
        lesson_id: lessonId,
        note_text: text,
        active: 'y',
        created_by: userId,
        created_date: new Date(),
      },
    });

    return {
      success: true,
      data: {
        id: note.note_id,
        text: note.note_text,
        createdAt: note.created_date,
      },
    };
  }

  // ============================================================
  // GET /course/:id/lessons/:lessonId/documents
  // ============================================================

  /**
   * [ADD] เอกสารประกอบของบทเรียน (ปุ่ม "เอกสารประกอบ" ที่เดิมกดไม่ได้เลย เพราะไม่มี endpoint)
   *
   * ⚠ schema มี 2 ตารางโครงสร้างเหมือนกันเป๊ะ (lesson_id, file_name, filename, file_position)
   * คือ tbl_file_pdf กับ tbl_file_doc แต่ไม่มีข้อมูลตัวอย่างให้เช็คว่าระบบเดิมใช้ตารางไหนจริง
   * จึงดึงมารวมกันทั้งสองตารางไปก่อน (ถ้าตารางไหนไม่มีข้อมูลของบทนี้ก็จะไม่มีผลอะไร)
   *
   * ⚠ path ของไฟล์ (getMediaUrl) เป็นการเดาแบบเดียวกับวิดีโอ ยังไม่ยืนยัน (ดูวิธีหา path จริง
   * ใน getVideoUrl ด้านบน — เปิด DevTools > Network ตอนกดดาวน์โหลดเอกสารจากเว็บ/แอปเก่า)
   *
   * [ADD] เพิ่ม userId เข้ามาเพื่อเช็คสิทธิ์คอร์สด้วย (เดิม method นี้ไม่มี userId เลย
   * ใครก็เรียก endpoint นี้ข้ามคอร์สที่ตัวเองไม่มีสิทธิ์ได้ — เปลี่ยน signature ตรงนี้
   * ทำให้ controller ที่เรียกใช้ต้องแก้ตามด้วย ดูใน course.controller.ts)
   */
  async getLessonDocuments(
    courseId: number,
    lessonId: number,
    userId: number,
  ) {
    await this.assertCourseAccess(courseId, userId); // [ADD]
    await this.getLessonOrThrow(courseId, lessonId);

    const [pdfRows, docRows]: [any[], any[]] = await Promise.all([
      this.prisma.tbl_file_pdf.findMany({
        where: { lesson_id: lessonId, active: 'y' },
        orderBy: { file_position: 'asc' },
      }),
      this.prisma.tbl_file_doc.findMany({
        where: { lesson_id: lessonId, active: 'y' },
        orderBy: { file_position: 'asc' },
      }),
    ]);

    const documents = [
      ...pdfRows.map((row) => this.toLessonDocument(lessonId, row, 'pdf')),
      ...docRows.map((row) => this.toLessonDocument(lessonId, row, 'doc')),
    ];

    return { success: true, data: { documents } };
  }

  private toLessonDocument(
    lessonId: number,
    row: any,
    kind: 'pdf' | 'doc',
  ) {
    return {
      id: `${kind}-${row.id}`,
      name: row.file_name || row.filename,
      // ⚠ เดา path (ดูหมายเหตุใน getLessonDocuments)
      url: this.getMediaUrl(`lesson/${lessonId}/${kind}/${row.filename}`),
    };
  }

  // ============================================================
  // [ADD] Enrollment — เช็คว่า user มีสิทธิ์เรียนคอร์สนี้ไหม (tbl_chk_usercourse)
  // ============================================================
  // เดิมไม่มีจุดไหนในระบบเช็คเรื่องนี้เลย ทุกคนเห็น/เรียนได้ทุกคอร์สหมด (ช่องโหว่ authorization)
  // ดูค่าคงที่ ENROLLMENT_ALLOWED_STATUS / COURSE_WITH_NO_RESTRICTION_ROWS_IS_OPEN ด้านบนไฟล์

  /**
   * เช็คสิทธิ์คอร์สเดียว คืน true/false (ไม่ throw) ใช้ตอนกรองลิสต์คอร์สหลายอันพร้อมกัน
   */
  private async hasCourseAccess(
    courseId: number,
    userId: number,
  ): Promise<boolean> {
    const map = await this.getCourseAccessMap([courseId], userId);
    return map.get(courseId) ?? COURSE_WITH_NO_RESTRICTION_ROWS_IS_OPEN;
  }

  /**
   * เช็คสิทธิ์คอร์สเดียว แล้ว throw ถ้าไม่มีสิทธิ์ ใช้ตอนเข้าถึงคอร์ส/บทเรียนเจาะจง
   * (detail, exam, evaluation, certificate, notes, documents, markFileCompleted)
   */
  private async assertCourseAccess(
    courseId: number,
    userId: number,
  ): Promise<void> {
    const allowed = await this.hasCourseAccess(courseId, userId);

    if (!allowed) {
      throw new ForbiddenException(
        'You do not have permission to access this course',
      );
    }
  }

  /**
   * เช็คสิทธิ์หลายคอร์สพร้อมกันเป็น batch เดียว (ใช้ตอนกรองหน้ารายการ/หมวดหมู่ ที่มีหลายคอร์ส
   * ในหน้าเดียว เพื่อไม่ให้เกิด N+1 query)
   */
  private async getCourseAccessMap(
    courseIds: number[],
    userId: number,
  ): Promise<Map<number, boolean>> {
    const result = new Map<number, boolean>();

    if (courseIds.length === 0) {
      return result;
    }

    const rows: any[] = await this.prisma.tbl_chk_usercourse.findMany({
      where: { course_id: { in: courseIds } },
    });

    const rowsByCourse = new Map<number, any[]>();

    for (const row of rows) {
      if (row.course_id == null) {
        continue;
      }

      const list = rowsByCourse.get(row.course_id) ?? [];
      list.push(row);
      rowsByCourse.set(row.course_id, list);
    }

    for (const courseId of courseIds) {
      const courseRows = rowsByCourse.get(courseId);

      if (!courseRows || courseRows.length === 0) {
        // ไม่มีแถวเลย -> ใช้ค่า default (ดูหมายเหตุที่ค่าคงที่ด้านบนไฟล์)
        result.set(courseId, COURSE_WITH_NO_RESTRICTION_ROWS_IS_OPEN);
        continue;
      }

      // มีแถวจำกัดสิทธิ์อยู่ -> ต้องมีแถวของ user คนนี้ที่ org_user_status ตรงกับค่าที่อนุญาต
      const allowed = courseRows.some(
        (row) =>
          row.user_id === userId &&
          row.org_user_status === ENROLLMENT_ALLOWED_STATUS,
      );

      result.set(courseId, allowed);
    }

    return result;
  }

  private async getLessonOrThrow(
    courseId: number,
    lessonId: number,
  ): Promise<LessonRef> {
    const lesson = (await this.prisma.tbl_lesson.findFirst({
      where: { id: lessonId, course_id: courseId, active: 'y' },
    })) as LessonRef | null;

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  // ============================================================
  // POST /course/:id/lessons/:lessonId/files/:fileId/complete
  // ============================================================

  /**
   * [ADD] บันทึกว่าผู้ใช้ดูวิดีโอ (tbl_file) จบแล้ว
   *
   * ⚠ ต้องตรวจก่อนใช้: tbl_learn / tbl_learn_file
   * ที่ใช้ในโค้ดข้างล่างมีแค่ field ที่พบในโค้ดเดิม ถ้าตารางมี column ที่ NOT NULL
   * และไม่มี default (เช่น วันที่สร้าง, course_id, ip ฯลฯ) ต้องเพิ่มใน `data` ของ create
   * (ใส่ `as any` ไว้เพื่อให้คอมไพล์ผ่านก่อน ควรเอาออกเมื่อแก้ field ครบ)
   */
  async markFileCompleted(
    userId: number,
    courseId: number,
    lessonId: number,
    fileId: number,
  ) {
    await this.assertCourseAccess(courseId, userId); // [ADD]

    const lesson = await this.prisma.tbl_lesson.findFirst({
      where: { id: lessonId, course_id: courseId, active: 'y' },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const file = await this.prisma.tbl_file.findFirst({
      where: { id: fileId, lesson_id: lessonId, active: 'y' },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    const genMap = await this.getGenMap([courseId]);
    const genId = genMap.get(courseId) ?? 0;

    // ห้ามบันทึกการเรียนของบทที่ยังไม่ปลดล็อก
    const before = await this.loadLessonContext(userId, [lesson], genMap);

    if (!this.canLearn(lesson, before)) {
      throw new ForbiddenException('Lesson is locked');
    }

    // หา หรือสร้าง tbl_learn ของบทนี้
    let learn = await this.prisma.tbl_learn.findFirst({
      where: {
        user_id: userId,
        lesson_id: lessonId,
        lesson_active: 'y',
        gen_id: genId,
      },
      orderBy: { learn_id: 'asc' },
    });

    if (!learn) {
      // [FIX] ยืนยันจาก schema.prisma แล้วว่า learn_date เป็น DateTime ที่ไม่มี default
      // และมี course_id แยกต่างหาก โค้ดรอบก่อนไม่ได้ใส่ทั้งสองค่านี้ -> insert จะ error เสมอ
      learn = await this.prisma.tbl_learn.create({
        data: {
          user_id: userId,
          lesson_id: lessonId,
          course_id: courseId,
          lesson_active: 'y',
          gen_id: genId,
          lesson_status: 'learning',
          learn_date: new Date(),
          create_date: new Date(),
        },
      });
    }

    // บันทึก tbl_learn_file (ถ้ามีแล้วแค่อัปเดตเป็น 's' = เรียนจบ)
    const existing = await this.prisma.tbl_learn_file.findFirst({
      where: { learn_id: learn.learn_id, file_id: fileId },
    });

    if (!existing) {
      // [FIX] เช่นเดียวกัน learn_file_date เป็น DateTime ไม่มี default
      await this.prisma.tbl_learn_file.create({
        data: {
          learn_id: learn.learn_id,
          file_id: fileId,
          user_id_file: userId,
          gen_id: genId,
          learn_file_status: 's',
          learn_file_date: new Date(),
        },
      });
    } else if (existing.learn_file_status !== 's') {
      await this.prisma.tbl_learn_file.updateMany({
        where: { learn_id: learn.learn_id, file_id: fileId },
        data: { learn_file_status: 's' },
      });
    }

    // คำนวณสถานะบทใหม่ ถ้าดูครบทุกวิดีโอให้ mark tbl_learn เป็น pass
    const after = await this.loadLessonContext(userId, [lesson], genMap);
    const lessonStatus = after.statusOf(lessonId);

    if (lessonStatus === 'pass' && learn.lesson_status !== 'pass') {
      await this.prisma.tbl_learn.updateMany({
        where: { learn_id: learn.learn_id },
        data: { lesson_status: 'pass' },
      });
    }

    return {
      success: true,
      data: {
        lessonId,
        fileId,
        fileStatus: 'pass',
        lessonStatus,
      },
    };
  }

  // ============================================================
  // Public: คงไว้เพราะอาจมี service อื่นเรียกใช้
  // ============================================================

  async checkLessonPass(
    userId: number,
    lessonId: number,
    genId?: number,
  ): Promise<LessonPassStatus> {
    const lesson = await this.prisma.tbl_lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return 'notLearn';
    }

    const genMap =
      genId == null
        ? await this.getGenMap([lesson.course_id])
        : new Map<number, number>([[lesson.course_id, genId]]);

    const ctx = await this.loadLessonContext(userId, [lesson], genMap);

    return ctx.statusOf(lessonId);
  }

  // ============================================================
  // Batch loaders
  // ============================================================

  /**
   * [FIX] gen_id ของหลายคอร์สในคำสั่งเดียว (เดิม query ต่อคอร์ส/ต่อบท)
   * เพิ่ม orderBy เพื่อให้ผลแน่นอนเมื่อมีหลาย generation ที่ active
   * คอร์สที่ไม่มี generation จะไม่อยู่ใน map (ผู้เรียกใช้ ?? 0 เหมือนเดิม)
   */
  private async getGenMap(courseIds: number[]): Promise<Map<number, number>> {
    const map = new Map<number, number>();

    if (courseIds.length === 0) {
      return map;
    }

    const today = new Date();

    const generations = await this.prisma.tbl_course_generation.findMany({
      where: {
        active: 'y',
        status: '1',
        course_id: { in: courseIds },
        OR: [
          { gen_period_start: null, gen_period_end: null },
          { gen_period_start: { lte: today }, gen_period_end: { gte: today } },
        ],
      },
      orderBy: { gen_id: 'desc' },
    });

    for (const generation of generations) {
      const courseId = generation.course_id as number;

      if (!map.has(courseId)) {
        map.set(courseId, generation.gen_id);
      }
    }

    return map;
  }

  /**
   * โหลดไฟล์ + การเรียน + ไฟล์ที่เรียนแล้ว ของหลายบทพร้อมกัน
   */
  private async loadLearningData(
    userId: number,
    lessons: LessonRef[],
    genMap: Map<number, number>,
  ): Promise<LearningData> {
    const data: LearningData = {
      filesByLesson: new Map(),
      learnsByLesson: new Map(),
      learnFilesByLearn: new Map(),
    };

    if (lessons.length === 0) {
      return data;
    }

    const lessonIds = lessons.map((lesson) => lesson.id);
    const courseOfLesson = new Map(
      lessons.map((lesson) => [lesson.id, lesson.course_id]),
    );

    const [files, allLearns]: [any[], any[]] = await Promise.all([
      this.prisma.tbl_file.findMany({
        // [FIX] กรอง active: 'y' ให้ตรงกันทุกที่ (เดิม checkLessonPass ไม่กรอง)
        where: { lesson_id: { in: lessonIds }, active: 'y' },
        orderBy: [{ file_position: 'asc' }, { id: 'asc' }],
      }),
      this.prisma.tbl_learn.findMany({
        where: {
          user_id: userId,
          lesson_id: { in: lessonIds },
          lesson_active: 'y',
        },
        orderBy: { learn_id: 'asc' },
      }),
    ]);

    for (const file of files) {
      const list = data.filesByLesson.get(file.lesson_id) ?? [];
      list.push(file);
      data.filesByLesson.set(file.lesson_id, list);
    }

    // เก็บเฉพาะ learn ของ generation ที่เปิดอยู่ของคอร์สนั้น
    const learns = allLearns.filter((learn) => {
      const courseId = courseOfLesson.get(learn.lesson_id);
      const genId = courseId != null ? (genMap.get(courseId) ?? 0) : 0;

      return learn.gen_id === genId;
    });

    for (const learn of learns) {
      const list = data.learnsByLesson.get(learn.lesson_id) ?? [];
      list.push(learn);
      data.learnsByLesson.set(learn.lesson_id, list);
    }

    if (learns.length > 0) {
      const learnFiles: any[] = await this.prisma.tbl_learn_file.findMany({
        where: { learn_id: { in: learns.map((learn) => learn.learn_id) } },
      });

      for (const learnFile of learnFiles) {
        const list = data.learnFilesByLearn.get(learnFile.learn_id) ?? [];
        list.push(learnFile);
        data.learnFilesByLearn.set(learnFile.learn_id, list);
      }
    }

    return data;
  }

  /**
   * ผลสอบก่อน/หลังเรียนของหลายบทพร้อมกัน
   * key = `${lessonId}:${pre|post}`
   */
  private async loadTestStatuses(
    userId: number,
    lessons: LessonRef[],
    genMap: Map<number, number>,
  ): Promise<Map<string, TestStatus>> {
    const result = new Map<string, TestStatus>();

    if (lessons.length === 0) {
      return result;
    }

    const lessonIds = lessons.map((lesson) => lesson.id);
    const genOf = new Map(
      lessons.map((lesson) => [lesson.id, genMap.get(lesson.course_id) ?? 0]),
    );
    const genIds = [...new Set(genOf.values())];

    const manages: any[] = await this.prisma.tbl_manage.findMany({
      where: {
        id: { in: lessonIds },
        type: { in: ['pre', 'post'] },
        active: 'y',
        group_id: { not: null },
      },
    });

    const groupIds = [
      ...new Set(
        manages
          .map((manage) => manage.group_id)
          .filter((id): id is number => id != null),
      ),
    ];

    const groups: any[] =
      groupIds.length > 0
        ? await this.prisma.tbl_grouptesting.findMany({
            where: { group_id: { in: groupIds }, active: 'y' },
          })
        : [];

    const activeGroups = new Set(groups.map((group) => group.group_id));

    const scores: any[] = await this.prisma.tbl_score.findMany({
      where: {
        user_id: userId,
        active: 'y',
        lesson_id: { in: lessonIds },
        gen_id: { in: genIds },
      },
      orderBy: { score_id: 'desc' },
    });

    for (const lessonId of lessonIds) {
      for (const type of ['pre', 'post'] as TestType[]) {
        const hasTest = manages.some(
          (manage) =>
            manage.id === lessonId &&
            manage.type === type &&
            manage.group_id != null &&
            activeGroups.has(manage.group_id),
        );

        if (!hasTest) {
          result.set(`${lessonId}:${type}`, { ...NO_TEST });
          continue;
        }

        const attempts = scores.filter(
          (score) =>
            score.lesson_id === lessonId &&
            score.type === type &&
            score.gen_id === genOf.get(lessonId),
        );

        if (attempts.length === 0) {
          result.set(`${lessonId}:${type}`, { ...NO_TEST, hasTest: true });
          continue;
        }

        // [FIX] attempts เรียง score_id desc อยู่แล้ว
        // แสดงครั้งที่ "ผ่านล่าสุด" ถ้ามี ไม่งั้นแสดงครั้งล่าสุด
        // และ passed = เคยผ่านสักครั้ง (เดิมดูแค่ครั้งล่าสุด สอบซ้ำแล้วตกจะถูกล็อกกลับ)
        const passedAttempt = attempts.find(
          (score) => score.score_past === 'y',
        );
        const shown = passedAttempt ?? attempts[0];

        const scoreNumber = shown.score_number ?? 0;
        const scoreTotal = shown.score_total ?? 0;

        result.set(`${lessonId}:${type}`, {
          hasTest: true,
          completed: true,
          passed: !!passedAttempt,
          score: scoreNumber,
          total: scoreTotal,
          percent:
            scoreTotal > 0 ? Math.round((scoreNumber / scoreTotal) * 100) : 0,
        });
      }
    }

    return result;
  }

  /**
   * รวมทุกอย่างที่ต้องใช้คำนวณสถานะของบท
   * รวมบท "ก่อนหน้า" (sequence_id) ที่ไม่ได้อยู่ในรายการ (เช่น type ไม่ใช่ vdo) ด้วย
   */
  private async loadLessonContext(
    userId: number,
    lessons: LessonRef[],
    genMap: Map<number, number>,
  ): Promise<LessonContext> {
    const known = new Set(lessons.map((lesson) => lesson.id));

    const extraIds = [
      ...new Set(
        lessons
          .map((lesson) => lesson.sequence_id)
          .filter((id): id is number => !!id && !known.has(id)),
      ),
    ];

    const extra: LessonRef[] =
      extraIds.length > 0
        ? ((await this.prisma.tbl_lesson.findMany({
            where: { id: { in: extraIds } },
          })) as LessonRef[])
        : [];

    const all = [...lessons, ...extra];

    const [learning, tests] = await Promise.all([
      this.loadLearningData(userId, all, genMap),
      this.loadTestStatuses(userId, all, genMap),
    ]);

    return {
      learning,
      tests,
      statusOf: (lessonId) => this.computeLessonStatus(lessonId, learning),
      testOf: (lessonId, type) =>
        tests.get(`${lessonId}:${type}`) ?? { ...NO_TEST },
    };
  }

  // ============================================================
  // Pure calculations (ไม่ยิง query)
  // ============================================================

  /**
   * ตรรกะเดิมของ checkLessonPass แต่คำนวณจากข้อมูลที่โหลดไว้แล้ว
   */
  private computeLessonStatus(
    lessonId: number,
    data: LearningData,
  ): LessonPassStatus {
    const files = data.filesByLesson.get(lessonId) ?? [];
    const learns = data.learnsByLesson.get(lessonId) ?? [];

    if (learns.length > 0 && learns[0].lesson_status === 'pass') {
      return 'pass';
    }

    // ตรรกะเดิม: บทที่ไม่มีไฟล์ถือว่าผ่านอัตโนมัติ
    if (files.length === 0) {
      return 'pass';
    }

    if (learns.length === 0) {
      return 'notLearn';
    }

    const fileIds = new Set(files.map((file) => file.id));
    const doneFileIds = new Set<number>();

    for (const learn of learns) {
      for (const learnFile of data.learnFilesByLearn.get(learn.learn_id) ??
        []) {
        if (
          learnFile.learn_file_status === 's' &&
          fileIds.has(learnFile.file_id)
        ) {
          // [FIX] นับด้วย Set (distinct file) เดิม COUNT ใน SQL นับซ้ำได้เมื่อมี tbl_learn หลายแถว
          doneFileIds.add(learnFile.file_id);
        }
      }
    }

    return doneFileIds.size >= fileIds.size ? 'pass' : 'learning';
  }

  /**
   * [FIX] บทนี้เรียนได้ไหม
   * - ไม่มี sequence_id = เรียนได้
   * - บทก่อนหน้าต้องผ่าน (pass หรือ passtest) ด้วยตรรกะเดียวกับ checkLessonPass
   * - post-test ของบทก่อนหน้าต้องผ่าน (ถ้ามี)
   * - [REMOVE] ไม่บังคับ pre-test ของบทก่อนหน้าแล้ว ตามที่หน้า course-result บอกว่า
   *   "pre-test ไม่ส่งผลต่อการปลดล็อกบทถัดไป"
   *   ถ้า business rule จริงต้องผ่าน pre-test ให้เพิ่มเงื่อนไข ctx.testOf(prevId, 'pre') กลับมา
   */
  private canLearn(lesson: LessonRef, ctx: LessonContext): boolean {
    const previousId = lesson.sequence_id;

    if (!previousId) {
      return true;
    }

    const previousLearns = ctx.learning.learnsByLesson.get(previousId) ?? [];

    const previousPassed =
      ctx.statusOf(previousId) === 'pass' ||
      previousLearns[0]?.lesson_status === 'passtest';

    if (!previousPassed) {
      return false;
    }

    const previousPost = ctx.testOf(previousId, 'post');

    if (previousPost.hasTest && !previousPost.passed) {
      return false;
    }

    return true;
  }

  private buildLessonDetail(lesson: LessonRef, ctx: LessonContext) {
    const status = ctx.statusOf(lesson.id);
    const canLearn = this.canLearn(lesson, ctx);

    const preTest = ctx.testOf(lesson.id, 'pre');

    // [ADD] canTake: ดูวิดีโอครบแล้ว และบทถูกปลดล็อก
    const postTest: TestStatus = {
      ...ctx.testOf(lesson.id, 'post'),
      canTake: canLearn && status === 'pass',
    };

    const files = ctx.learning.filesByLesson.get(lesson.id) ?? [];
    const learn = (ctx.learning.learnsByLesson.get(lesson.id) ?? [])[0];
    const learnFiles = learn
      ? (ctx.learning.learnFilesByLearn.get(learn.learn_id) ?? [])
      : [];

    const videos = files.map((file) => {
      const row = learnFiles.find((item) => item.file_id === file.id);

      const fileStatus: 'notLearn' | 'learning' | 'pass' = row
        ? row.learn_file_status === 's'
          ? 'pass'
          : 'learning'
        : 'notLearn';

      return {
        id: file.id,
        name: file.file_name ?? file.filename,
        filename: file.filename,
        position: file.file_position ?? 0,
        status: fileStatus,
        // [ADD] url สำหรับเล่นวิดีโอ
        url: this.getVideoUrl(lesson.id, file.filename),
      };
    });

    return {
      id: lesson.id,
      lessonNo: lesson.lesson_no ?? null,
      title: lesson.title,
      description: lesson.description ?? null,
      image: lesson.image
        ? this.getMediaUrl(`lesson/${lesson.id}/original/${lesson.image}`)
        : null,
      status,
      canLearn,
      preTest,
      videos,
      postTest,
    };
  }

  /**
   * [ADD] นิยาม "เรียนจบ" ที่เดียว ใช้ทั้งหน้า list และ detail
   * - passedLessons  = จำนวนบทที่ดูวิดีโอครบ
   * - doneLessons    = ดูวิดีโอครบ และผ่าน post-test (ถ้ามี) -> ใช้คิด percent
   * - completed      = ทุกบทดูครบ + ผ่าน post-test ทุกบท
   */
  private summarizeCourse(lessons: LessonRef[], ctx: LessonContext) {
    const totalLessons = lessons.length;

    let passedLessons = 0;
    let doneLessons = 0;
    let started = false;

    for (const lesson of lessons) {
      const videoPass = ctx.statusOf(lesson.id) === 'pass';
      const post = ctx.testOf(lesson.id, 'post');
      const examOk = !post.hasTest || post.passed;

      if (videoPass) {
        passedLessons += 1;
      }

      if (videoPass && examOk) {
        doneLessons += 1;
      }

      // เริ่มเรียนแล้ว = มี tbl_learn จริง (ไม่นับบทที่ "ผ่านอัตโนมัติ" เพราะไม่มีไฟล์)
      if ((ctx.learning.learnsByLesson.get(lesson.id) ?? []).length > 0) {
        started = true;
      }
    }

    const passedAllExams = lessons.every((lesson) => {
      const post = ctx.testOf(lesson.id, 'post');

      return !post.hasTest || post.passed;
    });

    return {
      totalLessons,
      passedLessons,
      started,
      passedAllExams,
      percent:
        totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0,
      completed:
        totalLessons > 0 &&
        passedLessons === totalLessons &&
        passedAllExams,
    };
  }

  private courseStatus(summary: {
    totalLessons: number;
    started: boolean;
    completed: boolean;
  }): 'register' | 'learning' | 'completed' {
    if (summary.totalLessons === 0) {
      return 'register';
    }

    if (summary.completed) {
      return 'completed';
    }

    return summary.started ? 'learning' : 'register';
  }

  /**
   * [FIX] สรุปหลายคอร์สแบบ batch
   * เดิม buildCourseData ต่อคอร์ส -> checkLessonPass ต่อบท (แต่ละครั้งหลาย query)
   */
  private async buildCourseSummaries(
    userId: number,
    courses: any[],
    langId: number,
  ) {
    if (courses.length === 0) {
      return [];
    }

    const courseIds = courses.map((course) => course.course_id as number);

    const [lessons, genMap, teacherMap] = await Promise.all([
      this.prisma.tbl_lesson.findMany({
        where: {
          course_id: { in: courseIds },
          type: 'vdo',
          active: 'y',
          lang_id: langId,
        },
        orderBy: [{ lesson_no: 'asc' }, { id: 'asc' }],
      }),
      this.getGenMap(courseIds),
      // [ADD] โหลดชื่อผู้สอน/ผู้ช่วยสอนของทุกคอร์สเป็น batch เดียว (ไม่ query ทีละคอร์ส)
      this.getCourseTeachersBatch(courses),
    ]);

    const ctx = await this.loadLessonContext(userId, lessons, genMap);

    return courses.map((course) => {
      const courseLessons = lessons.filter(
        (lesson) => lesson.course_id === course.course_id,
      );

      const summary = this.summarizeCourse(courseLessons, ctx);

      return {
        id: course.course_id,
        courseNumber: course.course_number ?? null,
        title: course.course_title ?? null,
        shortTitle: course.course_short_title ?? null,
        detail: course.course_detail ?? null,
        image: course.course_picture
          ? this.getMediaUrl(
              `courseonline/${course.course_id}/original/${course.course_picture}`,
            )
          : null,
        categoryId: course.cate_id ?? null,

        // [ADD] เดิมไม่ส่ง -> หน้า category แสดง "Course Period" และระยะเวลา "-" ตลอด
        courseDateStart: course.course_date_start ?? null,
        courseDateEnd: course.course_date_end ?? null,
        courseDayLearn: course.course_day_learn ?? null,

        // [FIX] ดึงชื่อจริงแล้ว (ดูหมายเหตุ getCourseTeachersBatch)
        teacher: teacherMap.get(course.course_id)?.teacher ?? null,
        assistant: teacherMap.get(course.course_id)?.assistant ?? null,

        lessonCount: summary.totalLessons,
        learned: summary.started,
        passed: summary.completed,
        status: this.courseStatus(summary),
        progress: summary.percent,
        passedLessons: summary.passedLessons,
      };
    });
  }
}

/**
 * ============================================================
 * ANALYSIS NOTES — สมมติฐานที่ใช้ในไฟล์นี้ 
 * ============================================================
 * ยืนยันแล้วจากผู้ใช้:
 * - tbl_passcourse_number มีข้อมูลจริง -> ใช้เป็นแหล่งความจริงของ "จบคอร์สหรือยัง"
 *   และเป็นเลขที่ใบประกาศ (code_number) ส่วน tbl_coursepasscours ไม่มีข้อมูล -> ไม่ใช้
 * - tbl_evaluate / tbl_eval_ans มีข้อมูลจริง -> ใช้เป็นระบบแบบประเมิน ส่วนชุด q_* ไม่มีข้อมูล -> ไม่ใช้
 * - tbl_teacher ทั้งระบบมีแค่ 1 แถว -> ส่วนใหญ่ teacher/assistant จะแสดง "-" (ไม่ใช่บั๊ก)
 * - tbl_lesson.cate_amount = จำนวนข้อสอบที่ใช้ในการทดสอบของบทนั้น เลือกแบบ deterministic
 *   (เรียง ques_id, เอา N ข้อแรก) ไม่ใช่สุ่ม เพราะไม่มีตารางเก็บว่าตอนแสดงผลแจกข้อไหนไปบ้าง
 *   ถ้าสุ่มทุกครั้งจะทำให้ตอนตรวจ (POST) ได้ชุดคำถามไม่ตรงกับตอนแสดงผล (GET)
 *   -> TODO ถ้าอยากได้สุ่มจริง ต้องเพิ่มตาราง exam_attempt เก็บชุดคำถามที่แจกไปต่อการสอบ 1 ครั้ง
 * - tbl_grouptesting.step_id = ลำดับชุดข้อสอบหลักของบทนั้น เลือกอันที่ step_id น้อยที่สุดที่ active
 *   (ตีความว่าเป็น "ชุดหลัก" ไม่ใช่ "ชุดสำหรับสอบซ้ำ" เพราะไม่มีหลักฐานสนับสนุนการตีความหลัง
 *   และการตีความผิดจะทำให้ระบบสลับชุดข้อสอบโดยไม่ตั้งใจ)
 *   -> TODO ยืนยันกับทีมที่ดูแลระบบเดิมว่า step_id ใช้ทำอะไรจริงๆ
 * - tbl_choice.choice_answer === 1 คือคำตอบที่ถูก (default คือ 2 = ผิด) อิงจากแพทเทิร์น y/n
 *   ที่เห็นในตารางอื่นๆ ของระบบ (active: y/n) -> TODO สุ่มตรวจข้อสอบสัก 2-3 บทที่รู้เฉลยอยู่แล้ว
 *   เทียบกับที่ backend เพิ่งตรวจให้ ว่าตรงกันจริงก่อนใช้งานจริงจัง
 *
 * ข้อจำกัดที่ยังแก้ไม่ได้ในรอบนี้ (ต้องแก้ schema หรือคุยกับทีมที่ดูแลระบบเดิมเพิ่ม):
 * - คอมเมนต์ข้อความอิสระในแบบประเมินยังไม่ถูกบันทึกถาวร (tbl_eval_ans ไม่มีคอลัมน์รองรับ)
 * - การนับเลขที่ใบประกาศ (code_number) ทำแบบ count+1 ธรรมดา อาจเกิดเลขซ้ำได้ถ้ามี 2 คำขอ
 *   พร้อมกันเป๊ะๆ (race condition) ควรตรวจ constraint ของตารางจริงก่อนใช้งานจริงจัง
 */
