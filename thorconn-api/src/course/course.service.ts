import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type LessonPassStatus = 'pass' | 'learning' | 'notLearn';

type LessonStatus =
  | 'notLearn'
  | 'learning'
  | 'pass';

type TestStatus = {
  hasTest: boolean;
  completed: boolean;
  passed: boolean;
  score: number | null;
  total: number | null;
  percent: number;
};

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}
  private getMediaUrl(path: string | null): string | null {
    if (!path) {
      return null;
    }

    if (
      path.startsWith('http://') ||
      path.startsWith('https://')
    ) {
      return path;
    }

    return `${process.env.MEDIA_URL}/${path.replace(/^\//, '')}`;
  }

  private getAdminMediaUrl(path: string | null): string | null {
    if (!path) {
      return null;
    }

    if (
      path.startsWith('http://') ||
      path.startsWith('https://')
    ) {
      return path;
    }

    return `${process.env.ADMIN_MEDIA_URL}/${path.replace(/^\//, '')}`;
  }
  async getCourseData(
    userId: number,
    langId: number = 1,
  ) {
    const user = await this.prisma.tbl_users.findUnique({
      where: {
        id: userId,
      },
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

    const courses = await this.getAvailableCourses(
      userId,
      langId,
    );

    const myCourses = await this.getMyCourses(
      userId,
      langId,
    );

    const completedCourses = await this.getCompletedCourses(
      userId,
      langId,
    );

    const categories = await this.prisma.tbl_category.findMany({
      where: {
        cate_show: 1,
        active: 'y',
        lang_id: langId,
      },
      orderBy: {
        cate_id: 'asc',
      },
    });

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

  private async getAvailableCourses(
    userId: number,
    langId: number,
  ) {
    const courses =
      await this.prisma.tbl_course_online.findMany({
        where: {
          active: 'y',
          status: '1',
          course_status: 1,
          lang_id: langId,

          tbl_category: {
            cate_show: 1,
            active: 'y',
            lang_id: langId,
          },
        },
        include: {
          tbl_category: true,
        },
      });

    return Promise.all(
      courses.map((course) =>
        this.buildCourseData(
          userId,
          course,
          langId,
        ),
      ),
    );
  }

  private async getMyCourses(
    userId: number,
    langId: number,
  ) {
    return [];
  }

  private async getCompletedCourses(
    userId: number,
    langId: number,
  ) {
    return [];
  }

  private async getCategories(
    courses: any[],
    myCourses: any[],
    completedCourses: any[],
  ) {
    const categoryIds = [
      ...courses,
      ...myCourses,
      ...completedCourses,
    ]
      .map((course) => course.categoryId)
      .filter(
        (id): id is number =>
          id !== null &&
          id !== undefined,
      );

    const uniqueCategoryIds = [
      ...new Set(categoryIds),
    ];

    if (uniqueCategoryIds.length === 0) {
      return [];
    }

    return this.prisma.tbl_category.findMany({
      where: {
        cate_id: {
          in: uniqueCategoryIds,
        },
      },
    });
  }

  private async buildCourseData(
    userId: number,
    course: any,
    langId: number,
  ) {
    const lessons =
      await this.prisma.tbl_lesson.findMany({
        where: {
          course_id: course.course_id,
          type: 'vdo',
          active: 'y',
          lang_id: langId,
        },
        orderBy: [
          {
            lesson_no: 'asc',
          },
          {
            id: 'asc',
          },
        ],
      });

    const lessonStatuses =
      await Promise.all(
        lessons.map(async (lesson) => {
          const status =
            await this.checkLessonPass(
              userId,
              lesson.id,
            );

          return {
            lessonId: lesson.id,
            status,
          };
        }),
      );

    const totalLessons = lessons.length;

    const passedLessons =
      lessonStatuses.filter(
        (item) => item.status === 'pass',
      ).length;

    const progress =
      totalLessons > 0
        ? Math.round(
            (passedLessons / totalLessons) * 100,
          )
        : 0;

    let status:
      | 'register'
      | 'learning'
      | 'completed';

    if (totalLessons === 0) {
      status = 'register';
    } else if (
      passedLessons === totalLessons
    ) {
      status = 'completed';
    } else if (
      passedLessons > 0
    ) {
      status = 'learning';
    } else {
      status = 'register';
    }

    return {
      id: course.course_id,
      courseNumber:
        course.course_number ?? null,
      title:
        course.course_title ?? null,
      shortTitle:
        course.course_short_title ?? null,
      detail:
        course.course_detail ?? null,
      image: course.course_picture
      ? this.getMediaUrl(
          `courseonline/${course.course_id}/original/${course.course_picture}`,
        )
      : null,
      categoryId:
        course.cate_id ?? null,
      lessonCount:
        totalLessons,
      learned:
        passedLessons > 0,
      passed:
        status === 'completed',
      status,
      progress,
      passedLessons,
    };
  }
async getCoursesByCategory(
  categoryId: number,
  userId: number,
  langId: number = 1,
) {
  const category =
    await this.prisma.tbl_category.findFirst({
      where: {
        cate_id: categoryId,
        cate_show: 1,
        active: 'y',
        lang_id: langId,
      },
    });

  if (!category) {
    return {
      success: true,
      data: {
        category: null,
        courses: [],
      },
    };
  }

  const courses =
    await this.prisma.tbl_course_online.findMany({
      where: {
        cate_id: categoryId,
        active: 'y',
        status: '1',
        course_status: 1,
        lang_id: langId,
      },
      orderBy: [
        {
          sortOrder: 'asc',
        },
        {
          course_id: 'asc',
        },
      ],
    });

  const courseData =
    await Promise.all(
      courses.map((course) =>
        this.buildCourseData(
          userId,
          course,
          langId,
        ),
      ),
    );

  return {
    success: true,
    data: {
      category: {
        id: category.cate_id,
        title: category.cate_title,
        shortDetail:
          category.cate_short_detail,
        detail: category.cate_detail,
        image: category.cate_image
          ? this.getMediaUrl(
              `category/${category.cate_id}/original/${category.cate_image}`,
            )
          : null,
      },
      courses: courseData,
    },
  };
}
  private async getGenId(
    courseId: number,
  ): Promise<number> {
    const today = new Date();

    const generation =
      await this.prisma.tbl_course_generation.findFirst({
        where: {
          active: 'y',
          status: '1',
          course_id: courseId,

          OR: [
            {
              gen_period_start: null,
              gen_period_end: null,
            },
            {
              gen_period_start: {
                lte: today,
              },
              gen_period_end: {
                gte: today,
              },
            },
          ],
        },
      });

    if (!generation) {
      return 0;
    }

    return generation.gen_id;
  }

  async checkLessonPass(
    userId: number,
    lessonId: number,
    genId?: number,
  ): Promise<LessonPassStatus> {
    const lesson =
      await this.prisma.tbl_lesson.findUnique({
        where: {
          id: lessonId,
        },
      });

    if (!lesson) {
      return 'notLearn';
    }

    if (genId == null) {
      genId = await this.getGenId(
        lesson.course_id,
      );
    }

    const learnLesson =
      await this.prisma.tbl_learn.findMany({
        where: {
          user_id: userId,
          lesson_id: lessonId,
          lesson_active: 'y',
          gen_id: genId,
        },
        orderBy: {
          learn_id: 'asc',
        },
      });

    const countFile =
      await this.prisma.tbl_file.count({
        where: {
          lesson_id: lessonId,
        },
      });

    let countLearnCompareTrueVdos = 0;

    if (lesson.type === 'vdo') {
      const result =
        await this.prisma.$queryRaw<
          Array<{ total: bigint }>
        >`
          SELECT COUNT(tbl_lesson.id) AS total
          FROM tbl_learn AS t

          INNER JOIN tbl_lesson
            ON tbl_lesson.id = t.lesson_id

          INNER JOIN tbl_file
            ON tbl_file.lesson_id = tbl_lesson.id

          INNER JOIN tbl_learn_file
            ON tbl_file.id = tbl_learn_file.file_id
            AND t.learn_id = tbl_learn_file.learn_id

          WHERE t.user_id = ${userId}
            AND t.lesson_id = ${lessonId}
            AND tbl_learn_file.learn_file_status = 's'
            AND t.lesson_active = 'y'
            AND t.gen_id = ${genId}
        `;

      countLearnCompareTrueVdos =
        Number(result[0]?.total ?? 0);
    }

    if (
      learnLesson.length > 0 &&
      learnLesson[0].lesson_status === 'pass'
    ) {
      return 'pass';
    }

    if (countFile === 0) {
      return 'pass';
    }

    if (
      countFile !== 0 &&
      learnLesson.length > 0
    ) {
      if (
        countLearnCompareTrueVdos !==
        countFile
      ) {
        return 'learning';
      }

      return 'pass';
    }

    return 'notLearn';
  }
  private async getLessonFiles(
  lessonId: number,
  userId: number,
  genId: number,
) {
  const files =
    await this.prisma.tbl_file.findMany({
      where: {
        lesson_id: lessonId,
        active: 'y',
      },
      orderBy: {
        file_position: 'asc',
      },
    });

  if (!files.length) {
    return [];
  }

  const learn =
    await this.prisma.tbl_learn.findFirst({
      where: {
        lesson_id: lessonId,
        user_id: userId,
        lesson_active: 'y',
        gen_id: genId,
      },
      orderBy: {
        learn_id: 'asc',
      },
    });

  return Promise.all(
    files.map(async (file) => {
      let status:
        | 'notLearn'
        | 'learning'
        | 'pass' = 'notLearn';

      if (learn) {
        const learnFile =
          await this.prisma.tbl_learn_file.findFirst({
            where: {
              file_id: file.id,
              learn_id: learn.learn_id,
              user_id_file: userId,
              gen_id: genId,
            },
          });

        if (learnFile) {
          status =
            learnFile.learn_file_status === 's'
              ? 'pass'
              : 'learning';
        }
      }

      return {
        id: file.id,
        file_name: file.file_name,
        filename: file.filename,
        file_position:
          file.file_position ?? 0,
        status,
      };
    }),
  );
}
private async buildLessonDetail(
  lesson: any,
  userId: number,
  genId: number,
) {
  const status =
    await this.checkLessonPass(
      userId,
      lesson.id,
      genId,
    );

  const canLearn =
    await this.canLearnLesson(
      lesson,
      userId,
      genId,
    );

  const preTest =
    await this.getLessonTestStatus(
      lesson.id,
      userId,
      genId,
      'pre',
    );

  const postTest =
    await this.getLessonTestStatus(
      lesson.id,
      userId,
      genId,
      'post',
    );

  const files =
    await this.getLessonFiles(
      lesson.id,
      userId,
      genId,
    );

  const videos = files.map((file) => ({
    id: file.id,
    name: file.file_name ?? file.filename,
    filename: file.filename,
    position: file.file_position ?? 0,
    status: file.status,
  }));

  return {
    id: lesson.id,
    lessonNo: lesson.lesson_no ?? null,
    title: lesson.title,
    description: lesson.description ?? null,
    image: lesson.image
      ? this.getMediaUrl(
          `lesson/${lesson.id}/original/${lesson.image}`,
        )
      : null,

    status,
    canLearn,

    preTest,

    videos,

    postTest,
  };
}
private async hasLessonTest(
  lessonId: number,
  type: 'pre' | 'post',
): Promise<boolean> {
  const manage =
    await this.prisma.tbl_manage.findFirst({
      where: {
        id: lessonId,
        type,
        active: 'y',
        group_id: {
          not: null,
        },
      },
    });

  if (!manage?.group_id) {
    return false;
  }

  const group =
    await this.prisma.tbl_grouptesting.findFirst({
      where: {
        group_id: manage.group_id,
        active: 'y',
      },
    });

  return !!group;
}
private async getLessonTestStatus(
  lessonId: number,
  userId: number,
  genId: number,
  type: 'pre' | 'post',
): Promise<TestStatus> {
  const hasTest =
    await this.hasLessonTest(
      lessonId,
      type,
    );

  if (!hasTest) {
    return {
      hasTest: false,
      completed: false,
      passed: false,
      score: null,
      total: null,
      percent: 0,
    };
  }

  const score =
    await this.prisma.tbl_score.findFirst({
      where: {
        lesson_id: lessonId,
        user_id: userId,
        gen_id: genId,
        active: 'y',
        ...(type === 'post'
          ? { type: 'post' }
          : { type: 'pre' }),
      },
      orderBy: {
        score_id: 'desc',
      },
    });

  if (!score) {
    return {
      hasTest: true,
      completed: false,
      passed: false,
      score: null,
      total: null,
      percent: 0,
    };
  }

  const scoreNumber =
    score.score_number ?? 0;

  const scoreTotal =
    score.score_total ?? 0;

  const percent =
    scoreTotal > 0
      ? Math.round(
          (scoreNumber / scoreTotal) * 100,
        )
      : 0;

  return {
    hasTest: true,
    completed: true,
    passed:
      score.score_past === 'y',
    score: scoreNumber,
    total: scoreTotal,
    percent,
  };
}
private async canLearnLesson(
  lesson: any,
  userId: number,
  genId: number,
): Promise<boolean> {
  // ไม่มี sequence = เข้าเรียนได้
  if (!lesson.sequence_id) {
    return true;
  }

  const previous =
    await this.prisma.tbl_learn.findFirst({
      where: {
        lesson_id: lesson.sequence_id,
        user_id: userId,
        lesson_active: 'y',
        gen_id: genId,
      },
      orderBy: {
        learn_id: 'asc',
      },
    });

  // ยังไม่เคยเรียนบทก่อนหน้า
  if (!previous) {
    return false;
  }

  // บทก่อนหน้าต้อง pass หรือ passtest
  if (
    previous.lesson_status !== 'pass' &&
    previous.lesson_status !== 'passtest'
  ) {
    return false;
  }

  // Pre-test ของบทก่อนหน้า
  const preTest =
    await this.getLessonTestStatus(
      lesson.sequence_id,
      userId,
      genId,
      'pre',
    );

  if (
    preTest.hasTest &&
    !preTest.passed
  ) {
    return false;
  }

  // Post-test ของบทก่อนหน้า
  const postTest =
    await this.getLessonTestStatus(
      lesson.sequence_id,
      userId,
      genId,
      'post',
    );

  if (
    postTest.hasTest &&
    !postTest.passed
  ) {
    return false;
  }

  return true;
}
  async getCourseDetail(
  courseId: number,
  userId: number,
  langId: number = 1,
) {
  const course =
    await this.prisma.tbl_course_online.findFirst({
      where: {
        course_id: courseId,
        active: 'y',
        status: '1',
        course_status: 1,
        lang_id: langId,
      },
      include: {
        tbl_category: true,
      },
    });

  if (!course) {
    return {
      success: false,
      message: 'Course not found',
      data: null,
    };
  }

  const genId = await this.getGenId(courseId);

  const lessons =
    await this.prisma.tbl_lesson.findMany({
      where: {
        course_id: courseId,
        active: 'y',
        lang_id: langId,
        type: 'vdo',
      },
      orderBy: [
        {
          lesson_no: 'asc',
        },
        {
          id: 'asc',
        },
      ],
    });

  const lessonData = await Promise.all(
    lessons.map((lesson) =>
      this.buildLessonDetail(
        lesson,
        userId,
        genId,
      ),
    ),
  );

  const passedLessons = lessonData.filter(
    (lesson) => lesson.status === 'pass',
  ).length;

  const totalLessons = lessonData.length;

  const progress =
    totalLessons > 0
      ? Math.round(
          (passedLessons / totalLessons) * 100,
        )
      : 0;

  

  return {
    success: true,

    data: {
      course: {
        id: course.course_id,
        courseNumber: course.course_number ?? null,
        title: course.course_title ?? null,
        shortTitle:
          course.course_short_title ?? null,
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
              title:
                course.tbl_category.cate_title,
            }
          : null,

        courseDateStart:
          course.course_date_start ?? null,

        courseDateEnd:
          course.course_date_end ?? null,

        courseDayLearn:
          course.course_day_learn ?? null,
      },


      lessons: lessonData,

      progress: {
        totalLessons,
        passedLessons,
        percent: progress,
      },
    },
  };
}
}