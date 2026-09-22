import {api} from './api';

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

  status:
    | 'register'
    | 'learning'
    | 'expired'
    | 'completed'
    | string;

  genId?: number;

  progress: number;
  passedLessons?: number;
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
}

export interface LessonVideo {
  id: number;
  name?: string | null;
  filename: string;
  position: number;
  status:
    | 'notLearn'
    | 'learning'
    | 'pass';
}

export interface CourseLesson {
  id: number;
  lessonNo?: number | null;
  title: string;
  description?: string | null;
  image?: string | null;

  status:
    | 'notLearn'
    | 'learning'
    | 'pass';

  canLearn: boolean;

  preTest: LessonTest;

  videos: LessonVideo[];

  postTest: LessonTest;
}

export interface CourseDetail {
  course: Course;
  preTest: LessonTest;

  lessons: CourseLesson[];

  progress: {
    totalLessons: number;
    passedLessons: number;
    percent: number;
  };
}

export interface CourseDetailResponse {
  success: boolean;
  message?: string;

  data: CourseDetail | null;
}

/**
 * GET /course
 */
export const getCourses = async (
  userId: number,
  langId: number = 1,
) => {
  console.log('GET COURSE API');
  console.log('userId:', userId);
  console.log('langId:', langId);

  try {
    const response = await api.get('/course', {
      params: {
        userId: userId,
        langId: langId,
      },
    });

    console.log('COURSE API RESPONSE:', response.data);

    return response.data;
  } catch (error: any) {
    console.log('COURSE API ERROR STATUS:', error.response?.status);
    console.log('COURSE API ERROR DATA:', error.response?.data);
    console.log('COURSE API ERROR URL:', error.config?.url);
    console.log('COURSE API ERROR PARAMS:', error.config?.params);

    throw error;
  }
  
};
export const getCoursesByCategory = async (
  categoryId: number,
  userId: number,
  langId: number = 1,
) => {
  const response = await api.get<CourseCategoryResponse>(
    `/course-category/${categoryId}`,
    {
      params: {
        userId,
        langId,
      },
    },
  );

  return response.data;
};
export const getCourseDetail = async (
  courseId: number,
  userId: number,
  langId: number = 1,
) => {
  const response =
    await api.get<CourseDetailResponse>(
      `/course/${courseId}`,
      {
        params: {
          userId,
          langId,
        },
      },
    );

  return response.data;
};