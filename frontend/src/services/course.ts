import { api } from './api';

/**
 * สรุปการแก้ไฟล์นี้
 * [FIX] type ให้ตรงกับข้อมูลที่ backend ส่งจริง / ที่หน้าจอใช้จริง
 *       - Course: เพิ่ม teacher, assistant, duration, courseName
 *       - LessonTest: เพิ่ม canTake
 *       - LessonVideo: เพิ่ม url, time
 *       - CourseDetail: เอา preTest ที่ backend ไม่เคยส่งออก, เพิ่ม progress.completed / passedAllExams, evaluation
 *       - CourseCategoryResponse: เพิ่ม categories สำหรับ chip
 * [FIX] getCourses ใส่ generic type (เดิมคืน any)
 * [REMOVE] console.log ใน getCourses (log ทั้ง response ซึ่งมีข้อมูลผู้ใช้)
 * [ADD] markFileCompleted -> POST บันทึกว่าดูวิดีโอจบ
 */

export type CourseStatus =
  | 'register'
  | 'learning'
  | 'expired'
  | 'completed';

export interface Course {
  id: number;
  courseNumber?: string | null;
  title?: string | null;
  shortTitle?: string | null;
  detail?: string | null;
  image?: string | null;

  categoryId?: number | null;

  category?: {
    id: number;
    title?: string | null;
  } | null;

  lessonCount: number;

  courseDateStart?: string | null;
  courseDateEnd?: string | null;
  courseDayLearn?: number | null;

  startDate?: string | null;
  endDate?: string | null;

  learned?: boolean;
  expired?: boolean;
  passed?: boolean;

  status: CourseStatus;

  genId?: number;

  progress: number;
  passedLessons?: number;

  // [ADD] field ที่หน้า course/[id].tsx ใช้อยู่แล้ว แต่เดิมไม่มีใน type
  courseName?: string | null;
  duration?: string | null;
  teacher?: string | null;
  assistant?: string | null;
}

export interface CourseCategory {
  id: number;
  title?: string | null;
  shortDetail?: string | null;
  detail?: string | null;
  image?: string | null;
}

export interface CourseData {
  categories: CourseCategory[];
  courses: Course[];
  myCourses: Course[];
  completedCourses: Course[];
}

export interface CourseResponse {
  success: boolean;
  message?: string;
  data: CourseData;
}

export interface CourseCategoryResponse {
  success: boolean;
  message?: string;
  data: {
    category: CourseCategory;
    // [ADD] รายชื่อหมวดทั้งหมด ใช้ทำ chip แทนรายชื่อที่ hard-code
    categories: { id: number; title?: string | null }[];
    courses: Course[];
  };
}

export interface LessonTest {
  hasTest: boolean;
  completed: boolean;
  passed: boolean;
  score: number | null;
  total: number | null;
  percent: number;
  // [ADD] ใช้กับ postTest: ดูวิดีโอครบและบทปลดล็อกแล้ว
  canTake?: boolean;
}

export type LearnStatus = 'notLearn' | 'learning' | 'pass';

export interface LessonVideo {
  id: number;
  name?: string | null;
  filename: string;
  position: number;
  status: LearnStatus;
  // [ADD]
  url?: string | null;
  time?: string | null;
}

export interface CourseLesson {
  id: number;
  lessonNo?: number | null;
  title: string;
  description?: string | null;
  image?: string | null;

  status: LearnStatus;

  canLearn: boolean;

  preTest: LessonTest;

  videos: LessonVideo[];

  postTest: LessonTest;
}

export interface CourseDetail {
  course: Course;

  lessons: CourseLesson[];

  progress: {
    totalLessons: number;
    passedLessons: number;
    percent: number;
    // [ADD] backend เป็นคนตัดสินว่าเรียนจบ (ให้ตรงกับหน้า list)
    passedAllExams: boolean;
    completed: boolean;
  };

  // [ADD] สถานะแบบประเมิน (backend ยังเป็น TODO)
  evaluation?: {
    required: boolean;
    completed: boolean;
  };
}

export interface CourseDetailResponse {
  success: boolean;
  message?: string;

  data: CourseDetail | null;
}

export interface CompleteFileResponse {
  success: boolean;
  data: {
    lessonId: number;
    fileId: number;
    fileStatus: 'pass';
    lessonStatus: LearnStatus;
  };
}

// ============================================================
// [ADD] ระบบสอบ / แบบประเมิน / ใบประกาศ (ต่อกับ backend จริง)
// ============================================================

export type ExamType = 'pre' | 'post';

export interface ExamChoice {
  id: number;
  text: string | null;
}

export interface ExamQuestion {
  id: number;
  title: string | null;
  choices: ExamChoice[];
}

export interface ExamResponse {
  success: boolean;
  message?: string;
  data: {
    lessonId: number;
    type: ExamType;
    courseTitle?: string | null;
    lessonTitle: string;
    timeLimitMinutes: number;
    passPercent: number;
    questions: ExamQuestion[];
  };
}

export interface ExamResultDetail {
  id: number;
  question: string | null;
  selectedText: string;
  correctText: string | null;
  correct: boolean;
}

export interface ExamSubmitResponse {
  success: boolean;
  message?: string;
  data: {
    lessonId: number;
    type: ExamType;
    score: number;
    total: number;
    passed: boolean;
    passPercent: number;
    details: ExamResultDetail[];
  };
}

export interface EvaluationItem {
  id: number;
  title: string | null;
  answered: boolean;
}

export interface EvaluationStatusResponse {
  success: boolean;
  data: {
    required: boolean;
    completed: boolean;
    items: EvaluationItem[];
  };
}

export interface EvaluationSubmitResponse {
  success: boolean;
  data: {
    required: boolean;
    completed: boolean;
    items: EvaluationItem[];
    // [ADD] backend ยังไม่มีที่เก็บคอมเมนต์ถาวร (ดู comment ใน course.service.ts ฝั่ง backend)
    commentSaved: boolean;
  };
}

export interface CertificateResponse {
  success: boolean;
  data: {
    eligible: boolean;
    certificateNumber?: string | null;
    completionDate?: string | null;
    studentName?: string | null;
    courseName?: string | null;
  };
}

/**
 * GET /course/:id/lessons/:lessonId/exam?type=&userId=
 */
export const getLessonExam = async (
  courseId: number,
  lessonId: number,
  type: ExamType,
  userId: number,
) => {
  const response = await api.get<ExamResponse>(
    `/course/${courseId}/lessons/${lessonId}/exam`,
    { params: { type, userId } },
  );

  return response.data;
};

/**
 * POST /course/:id/lessons/:lessonId/exam
 * answers: { [questionId]: choiceId }
 */
export const submitLessonExam = async (
  courseId: number,
  lessonId: number,
  type: ExamType,
  userId: number,
  answers: Record<number, number>,
) => {
  const response = await api.post<ExamSubmitResponse>(
    `/course/${courseId}/lessons/${lessonId}/exam`,
    { userId, type, answers },
  );

  return response.data;
};

/**
 * GET /course/:id/evaluation?userId=
 */
export const getCourseEvaluation = async (
  courseId: number,
  userId: number,
) => {
  const response = await api.get<EvaluationStatusResponse>(
    `/course/${courseId}/evaluation`,
    { params: { userId } },
  );

  return response.data;
};

/**
 * POST /course/:id/evaluation
 * ⚠ comment ยังไม่ถูกบันทึกถาวรฝั่ง backend (ดูหมายเหตุใน service ฝั่ง backend)
 */
export const submitCourseEvaluation = async (
  courseId: number,
  userId: number,
  answers: { evaId: number; score: number }[],
  comment?: string,
) => {
  const response = await api.post<EvaluationSubmitResponse>(
    `/course/${courseId}/evaluation`,
    { userId, answers, comment },
  );

  return response.data;
};

/**
 * GET /course/:id/certificate?userId=
 */
export const getCertificate = async (courseId: number, userId: number) => {
  const response = await api.get<CertificateResponse>(
    `/course/${courseId}/certificate`,
    { params: { userId } },
  );

  return response.data;
};

// ============================================================
// [ADD] โน้ตของผู้เรียน + เอกสารประกอบบทเรียน
// ============================================================

export interface LessonNote {
  id: number;
  text: string | null;
  createdAt: string | null;
}

export interface LessonNotesResponse {
  success: boolean;
  data: LessonNote[];
}

export interface AddLessonNoteResponse {
  success: boolean;
  data: LessonNote;
}

export interface LessonDocument {
  id: string;
  name: string | null;
  url: string | null;
}

export interface LessonDocumentsResponse {
  success: boolean;
  data: { documents: LessonDocument[] };
}

/**
 * GET /course/:id/lessons/:lessonId/notes?userId=
 */
export const getLessonNotes = async (
  courseId: number,
  lessonId: number,
  userId: number,
) => {
  const response = await api.get<LessonNotesResponse>(
    `/course/${courseId}/lessons/${lessonId}/notes`,
    { params: { userId } },
  );

  return response.data;
};

/**
 * POST /course/:id/lessons/:lessonId/notes
 */
export const addLessonNote = async (
  courseId: number,
  lessonId: number,
  userId: number,
  text: string,
) => {
  const response = await api.post<AddLessonNoteResponse>(
    `/course/${courseId}/lessons/${lessonId}/notes`,
    { userId, text },
  );

  return response.data;
};

/**
 * GET /course/:id/lessons/:lessonId/documents
 */
export const getLessonDocuments = async (
  courseId: number,
  lessonId: number,
) => {
  const response = await api.get<LessonDocumentsResponse>(
    `/course/${courseId}/lessons/${lessonId}/documents`,
  );

  return response.data;
};

/**
 * GET /course
 */
export const getCourses = async (
  userId: number,
  langId: number = 1,
) => {
  // [FIX] ใส่ generic type และเอา console.log ออก (ถ้าอยาก debug ให้ครอบด้วย __DEV__)
  const response = await api.get<CourseResponse>('/course', {
    params: { userId, langId },
  });

  return response.data;
};

/**
 * GET /course-category/:id
 */
export const getCoursesByCategory = async (
  categoryId: number,
  userId: number,
  langId: number = 1,
) => {
  const response = await api.get<CourseCategoryResponse>(
    `/course-category/${categoryId}`,
    { params: { userId, langId } },
  );

  return response.data;
};

/**
 * GET /course/:id
 */
export const getCourseDetail = async (
  courseId: number,
  userId: number,
  langId: number = 1,
) => {
  const response = await api.get<CourseDetailResponse>(
    `/course/${courseId}`,
    { params: { userId, langId } },
  );

  return response.data;
};

/**
 * [ADD] POST /course/:id/lessons/:lessonId/files/:fileId/complete
 * เรียกเมื่อดูวิดีโอจบ
 */
export const markFileCompleted = async (
  courseId: number,
  lessonId: number,
  fileId: number,
  userId: number,
) => {
  const response = await api.post<CompleteFileResponse>(
    `/course/${courseId}/lessons/${lessonId}/files/${fileId}/complete`,
    { userId },
  );

  return response.data;
};
