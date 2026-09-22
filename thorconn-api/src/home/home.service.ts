import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export interface HomeCourse {
        id: number;
        title: string | null;
        shortTitle: string | null;
        detail: string | null;
        picture: string | null;
        courseDateStart: Date | null;
        courseDateEnd: Date | null;
        courseDayLearn: number | null;
        genId: number | null;
        courseOpen: boolean;
        started: boolean;
        userCourseExpired: boolean;
        status: string;
        action: string;
        url: string;
    }
@Injectable()
export class HomeService {
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
  async getHome(userId?: number, langId = 1) {
    const [
      banners,
      courses,
      news,
      videos,
    ] = await Promise.all([
      this.getBanners(langId),
      this.getCourses(userId, langId),
      this.getNews(langId),
      this.getVideos(langId),
    ]);

    return {
      banners,
      courses,
      news,
      videos,
    };
  }

  // =========================================================
  // Banner
  // =========================================================

  private async getBanners(langId: number) {
    const banners =
      await this.prisma.tbl_imgslide.findMany({
        where: {
          active: 'y',
          lang_id: langId,
        },
        orderBy: {
          imgslide_id: 'desc',
        },
      });

    return banners.map((banner) => ({
      id: banner.imgslide_id,
      title: banner.imgslide_title,
      image: banner.imgslide_picture
        ? this.getMediaUrl(
            `imgslide/${banner.imgslide_id}/original/${banner.imgslide_picture}`,
          )
        : null,
      link: banner.imgslide_link,
      gallery_type_id:
        banner.gallery_type_id !== null
          ? String(banner.gallery_type_id)
          : null,
    }));
  }

  // =========================================================
  // News
  // =========================================================

  private async getNews(langId: number) {
    const news = await this.prisma.tbl_news.findMany({
      where: {
        active: 'y',
        lang_id: langId,
      },
      orderBy: {
        sortOrder: 'asc',
      },
      take: 6,
    });

    return news.map((item) => {
      let link: string | null = null;
      let newTab = false;

      if (
        item.cms_type_display === 'url' &&
        item.cms_link
      ) {
        try {
          const arr = JSON.parse(item.cms_link);

          link = arr?.[0] ?? null;
          newTab = arr?.[1] !== '0';
        } catch {
          link = item.cms_link;
        }
      } else {
        const newsId =
          langId !== 1
            ? item.parent_id
            : item.cms_id;

        link = `/news/detail/${newsId}`;
      }

      return {
        id: item.cms_id,
        title: item.cms_title,
        shortTitle: item.cms_short_title,
        picture: item.cms_picture
        ? this.getMediaUrl(
            `news/${item.cms_id}/original/${item.cms_picture}`,
            )
        : null,
        link,
        newTab,
        sortOrder: item.sortOrder,
        createDate: item.create_date,
        updateDate: item.update_date,
      };
    });
  }

  // =========================================================
  // Video
  // =========================================================

  private async getVideos(langId: number) {
    const video =
      await this.prisma.tbl_vdo.findFirst({
        where: {
          active: 'y',
          lang_id: langId,
        },
        orderBy: {
          sortOrder: 'desc',
        },
      });

    if (!video) {
      return null;
    }

    let embedUrl: string | null = null;

    if (
      video.vdo_type === 'link' &&
      video.vdo_path
    ) {
      embedUrl = video.vdo_path.replace(
        'watch?v=',
        'embed/',
      );
    }

    return {
      id: video.vdo_id,
      title: video.vdo_title,
      path: this.getAdminMediaUrl(video.vdo_path),
      type: video.vdo_type,
      thumbnail: this.getAdminMediaUrl(video.vdo_thumbnail),
      embedUrl,
      credit: video.vdo_credit,
    };
  }

  // =========================================================
  // Course
  // =========================================================

  private async getCourses(
    userId?: number,
    langId = 1,
  ) {
    const now = new Date();

    const courses =
      await this.prisma.tbl_course_online.findMany({
        where: {
          active: 'y',
          status: '1',
          lang_id: 1,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      });

    if (!courses.length) {
      return [];
    }

    /*
     * -------------------------------------------------------
     * เตรียม course id
     * -------------------------------------------------------
     */

    const courseIds = courses.map((course) => {
      if (
        course.lang_id !== 1 &&
        course.parent_id
      ) {
        return course.parent_id;
      }

      return course.course_id;
    });

    const uniqueCourseIds = [
      ...new Set(courseIds),
    ];

    /*
     * -------------------------------------------------------
     * ดึง Course generation ทั้งหมดครั้งเดียว
     * -------------------------------------------------------
     *
     * แทนการเรียก getGenId() ทีละ course
     */

    const generations =
      await this.prisma.tbl_course_generation.findMany({
        where: {
          course_id: {
            in: uniqueCourseIds,
          },
          active: 'y',
          status: '1',
          OR: [
            {
              gen_period_start: null,
              gen_period_end: null,
            },
            {
              gen_period_start: {
                lte: now,
              },
              gen_period_end: {
                gte: now,
              },
            },
          ],
        },
        orderBy: {
          gen_id: 'desc',
        },
      });

    /*
     * เก็บ generation ตัวล่าสุดของแต่ละ course
     */

    const generationMap = new Map<
      number,
      number
    >();

    for (const generation of generations) {
      if (
        generation.course_id &&
        !generationMap.has(
          generation.course_id,
        )
      ) {
        generationMap.set(
          generation.course_id,
          generation.gen_id,
        );
      }
    }

    /*
     * -------------------------------------------------------
     * ดึง course ภาษาอื่น
     * -------------------------------------------------------
     */

    let translatedCourses: typeof courses = [];

    if (langId !== 1) {
      translatedCourses =
        await this.prisma.tbl_course_online.findMany({
          where: {
            lang_id: langId,
            parent_id: {
              in: uniqueCourseIds,
            },
          },
          orderBy: {
            course_id: 'asc',
          },
        });
    }

    const translatedMap = new Map<
      number,
      typeof courses[number]
    >();

    for (const course of translatedCourses) {
      if (
        course.parent_id &&
        !translatedMap.has(course.parent_id)
      ) {
        translatedMap.set(
          course.parent_id,
          course,
        );
      }
    }

    /*
     * -------------------------------------------------------
     * ถ้ามี user
     * ดึงข้อมูล user course ทั้งหมดครั้งเดียว
     * -------------------------------------------------------
     */

    let logs: any[] = [];
    let learns: any[] = [];
    let passCourses: any[] = [];

    if (userId) {
      const [
        logResult,
        learnResult,
        passResult,
      ] = await Promise.all([
        this.prisma.tbl_log_startcourse.findMany({
          where: {
            user_id: userId,
            active: 'y',
            course_id: {
              in: uniqueCourseIds,
            },
          },
        }),

        this.prisma.tbl_learn.findMany({
          where: {
            user_id: userId,
            course_id: {
              in: uniqueCourseIds,
            },
            lesson_active: 'y',
          },
        }),

        this.prisma.tbl_coursepasscours.findMany({
          where: {
            passcours_user: userId,
            passcours_cours: {
              in: uniqueCourseIds,
            },
          },
        }),
      ]);

      logs = logResult;
      learns = learnResult;
      passCourses = passResult;
    }

    /*
     * -------------------------------------------------------
     * สร้าง Map เพื่อไม่ต้อง query DB ใน loop
     * -------------------------------------------------------
     */

    const logMap = new Map<string, any>();

    for (const log of logs) {
      const key = `${log.course_id}_${log.gen_id}`;

      if (!logMap.has(key)) {
        logMap.set(key, log);
      }
    }

    const learnSet = new Set<string>();

    for (const learn of learns) {
      const key =
        `${learn.course_id}_${learn.gen_id}`;

      learnSet.add(key);
    }

    const passSet = new Set<number>();

    for (const pass of passCourses) {
      if (pass.passcours_cours) {
        passSet.add(pass.passcours_cours);
      }
    }

    /*
     * -------------------------------------------------------
     * สร้าง result
     * -------------------------------------------------------
     */

    const result: HomeCourse[] = [];

    for (const course of courses) {
      let courseId = course.course_id;

      if (
        course.lang_id !== 1 &&
        course.parent_id
      ) {
        courseId = course.parent_id;
      }

      /*
       * Course ที่ใช้แสดงผล
       */

      const translated =
        translatedMap.get(courseId);

      const displayCourse =
        translated ?? course;

      /*
       * -----------------------------------------------------
       * checkCourseExpire()
       * -----------------------------------------------------
       *
       * PHP:
       *
       * current >= start
       * &&
       * current <= end
       *
       * ถ้าไม่มี start/end ให้ถือว่าเปิด
       */

      let courseOpen = true;

      if (
        course.course_date_start &&
        course.course_date_end
      ) {
        courseOpen =
          now >= course.course_date_start &&
          now <= course.course_date_end;
      }

      /*
       * -----------------------------------------------------
       * Generation
       * -----------------------------------------------------
       */

      const genId =
        generationMap.get(courseId) ?? null;

      /*
       * -----------------------------------------------------
       * User course
       * -----------------------------------------------------
       */

      let started = false;
      let userCourseExpired = false;

      if (
        userId &&
        genId
      ) {
        const logKey =
          `${courseId}_${genId}`;

        const log =
          logMap.get(logKey);

        /*
         * getLearn()
         */

        started = !!log;

        /*
         * checkUserCourseExpire()
         */

        if (log) {
          if (
            log.start_date &&
            log.end_date
          ) {
            userCourseExpired =
              now < log.start_date ||
              now > log.end_date;
          }
        }
      }

      /*
       * -----------------------------------------------------
       * StatusCourseGen()
       * -----------------------------------------------------
       */

      let courseStatus = 'notLearn';

      if (
        userId &&
        genId
      ) {
        /*
         * PHP:
         *
         * Passcours
         */

        if (passSet.has(courseId)) {
          courseStatus = 'pass';
        } else {
          const learnKey =
            `${courseId}_${genId}`;

          if (
            learnSet.has(learnKey)
          ) {
            courseStatus = 'learning';
          }
        }
      }

      /*
       * -----------------------------------------------------
       * URL
       * -----------------------------------------------------
       */

      let url = `/course/detail/${courseId}`;

      /*
       * PHP logic:
       *
       * ถ้ายังไม่เปิด
       * หรือหมดอายุ
       * จะไม่ให้เข้า course
       */

      let action =
        'detail';

      if (!courseOpen) {
        action = 'courseNotOpen';
        url = '#';
      } else if (
        userId &&
        started &&
        userCourseExpired
      ) {
        action = 'userCourseExpired';
        url = '#';
      } else if (
        userId &&
        !started
      ) {
        action = 'startCourse';
        url = `#modal-startcourse${courseId}`;
      }

      result.push({
        id: courseId,

        title:
          displayCourse.course_title,

        shortTitle:
          displayCourse.course_short_title,

        detail:
          displayCourse.course_detail,

       picture: displayCourse.course_picture
          ? this.getMediaUrl(
              `courseonline/${courseId}/original/${displayCourse.course_picture}`,
            )
          : null,

        courseDateStart:
          course.course_date_start,

        courseDateEnd:
          course.course_date_end,

        courseDayLearn:
          course.course_day_learn,

        genId,

        courseOpen,

        started,

        userCourseExpired,

        status: courseStatus,

        action,

        url,
      });
    }

    return result;
  }
}