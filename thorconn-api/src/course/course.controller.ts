import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CourseService } from './course.service';
import { PositiveIntPipe } from './positive-int.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

// [ADD] type ของ 'pre' | 'post' ให้ตรงกับ TestType ฝั่ง service
type ExamType = 'pre' | 'post';

function parseExamType(value: unknown): ExamType {
  if (value === 'pre' || value === 'post') {
    return value;
  }

  throw new BadRequestException("type must be 'pre' or 'post'");
}

/**
 * ============================================================
 * [FIX] ใส่ guard แล้ว — ใช้ JwtAuthGuard ตัวจริงของโปรเจกต์แล้ว (ไม่ใช่ของเดาอีกต่อไป)
 * ============================================================
 * เดิมทุก endpoint รับ userId จาก query/body ตรงๆ ใครก็เปลี่ยนเลขดูของคนอื่นได้ (IDOR)
 * ตอนนี้:
 *   1) ทั้ง controller ใส่ @UseGuards(JwtAuthGuard) แล้ว (import จาก '../auth/jwt-auth.guard'
 *      ตัวจริงของโปรเจกต์) ต้องแนบ Authorization: Bearer <token> มาทุก request ไม่งั้นโดน 401
 *   2) userId ไม่รับจาก client อีกต่อไป อ่านจาก @CurrentUser() ซึ่งดึงจาก req.user.sub
 *      (payload ของ JWT ที่ guard ตัวจริงตั้งไว้ใน auth.service.ts: { sub, username, email })
 *
 * ⚠ ต้องให้ CourseModule import AuthModule ด้วย (ดู course.module.ts + auth.module.ts ที่แก้คู่กัน)
 * ไม่งั้น Nest จะ resolve JwtService ให้ guard ไม่ได้ตอน bootstrap
 *
 * [FIX] frontend (course.ts + ทุกหน้าที่เรียกใช้) ก็แก้ไม่ส่ง userId มาด้วยแล้ว
 * (ดู field ที่หายไปจากทุก endpoint ด้านล่าง เทียบกับไฟล์เดิม)
 */
@UseGuards(JwtAuthGuard)
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  // GET /course?langId=1  (userId มาจาก token แล้ว)
  @Get()
  index(
    @CurrentUser() userId: number,
    @Query('langId', new DefaultValuePipe(1), PositiveIntPipe) langId: number,
  ) {
    return this.courseService.getCourseData(userId, langId);
  }

  // GET /course/:id?langId=1
  @Get(':id')
  detail(
    @Param('id', PositiveIntPipe) courseId: number,
    @CurrentUser() userId: number,
    @Query('langId', new DefaultValuePipe(1), PositiveIntPipe) langId: number,
  ) {
    return this.courseService.getCourseDetail(courseId, userId, langId);
  }

  /**
   * POST /course/:id/lessons/:lessonId/files/:fileId/complete
   * (ไม่ต้องส่ง body อะไรแล้ว userId มาจาก token)
   *
   * หน้า lesson/[id].tsx เรียกเมื่อผู้ใช้ดูวิดีโอจบ เพื่อบันทึกลง
   * tbl_learn / tbl_learn_file (เดิมไม่มี endpoint เขียนข้อมูล ทำให้ progress ไม่เคยขยับ)
   * ⚠ ดูหมายเหตุเรื่อง schema ใน course.service.ts > markFileCompleted
   */
  @Post(':id/lessons/:lessonId/files/:fileId/complete')
  completeFile(
    @Param('id', PositiveIntPipe) courseId: number,
    @Param('lessonId', PositiveIntPipe) lessonId: number,
    @Param('fileId', PositiveIntPipe) fileId: number,
    @CurrentUser() userId: number,
  ) {
    return this.courseService.markFileCompleted(
      userId,
      courseId,
      lessonId,
      fileId,
    );
  }

  /**
   * GET /course/:id/lessons/:lessonId/exam?type=pre|post
   * ดึงข้อสอบจริงจาก DB (แทน examBank ที่ hard-code ในแอปเดิม)
   */
  @Get(':id/lessons/:lessonId/exam')
  getLessonExam(
    @Param('id', PositiveIntPipe) courseId: number,
    @Param('lessonId', PositiveIntPipe) lessonId: number,
    @Query('type') type: string,
    @CurrentUser() userId: number,
  ) {
    return this.courseService.getLessonExam(
      courseId,
      lessonId,
      parseExamType(type),
      userId,
    );
  }

  /**
   * POST /course/:id/lessons/:lessonId/exam
   * body: { "type": "pre" | "post", "answers": { "<questionId>": <choiceId> } }
   */
  @Post(':id/lessons/:lessonId/exam')
  submitLessonExam(
    @Param('id', PositiveIntPipe) courseId: number,
    @Param('lessonId', PositiveIntPipe) lessonId: number,
    @CurrentUser() userId: number,
    @Body('type') type: string,
    @Body('answers') answers: Record<string, number>,
  ) {
    const normalizedAnswers: Record<number, number> = {};

    for (const [key, value] of Object.entries(answers ?? {})) {
      normalizedAnswers[Number(key)] = Number(value);
    }

    return this.courseService.submitLessonExam(
      courseId,
      lessonId,
      parseExamType(type),
      userId,
      normalizedAnswers,
    );
  }

  /**
   * GET /course/:id/evaluation
   */
  @Get(':id/evaluation')
  getEvaluation(
    @Param('id', PositiveIntPipe) courseId: number,
    @CurrentUser() userId: number,
  ) {
    return this.courseService.getCourseEvaluation(courseId, userId);
  }

  /**
   * POST /course/:id/evaluation
   * body: { "answers": [{ "evaId": 1, "score": 5 }, ...], "comment"?: "..." }
   * ⚠ comment ยังไม่ถูกบันทึกถาวร (ดูหมายเหตุใน course.service.ts > submitCourseEvaluation)
   */
  @Post(':id/evaluation')
  submitEvaluation(
    @Param('id', PositiveIntPipe) courseId: number,
    @CurrentUser() userId: number,
    @Body('answers') answers: { evaId: number; score: number }[],
    @Body('comment') comment?: string,
  ) {
    return this.courseService.submitCourseEvaluation(
      courseId,
      userId,
      answers ?? [],
      comment,
    );
  }

  /**
   * GET /course/:id/certificate
   */
  @Get(':id/certificate')
  getCertificate(
    @Param('id', PositiveIntPipe) courseId: number,
    @CurrentUser() userId: number,
  ) {
    return this.courseService.getCertificate(courseId, userId);
  }

  /**
   * GET /course/:id/lessons/:lessonId/notes
   * โน้ตของผู้เรียนคนนี้ในบทนี้ (แทน AsyncStorage เดิม)
   */
  @Get(':id/lessons/:lessonId/notes')
  getLessonNotes(
    @Param('id', PositiveIntPipe) courseId: number,
    @Param('lessonId', PositiveIntPipe) lessonId: number,
    @CurrentUser() userId: number,
  ) {
    return this.courseService.getLessonNotes(courseId, lessonId, userId);
  }

  /**
   * POST /course/:id/lessons/:lessonId/notes
   * body: { "text": "..." }
   */
  @Post(':id/lessons/:lessonId/notes')
  addLessonNote(
    @Param('id', PositiveIntPipe) courseId: number,
    @Param('lessonId', PositiveIntPipe) lessonId: number,
    @CurrentUser() userId: number,
    @Body('text') text: string,
  ) {
    if (!text || !text.trim()) {
      throw new BadRequestException('text is required');
    }

    return this.courseService.addLessonNote(
      courseId,
      lessonId,
      userId,
      text.trim(),
    );
  }

  /**
   * GET /course/:id/lessons/:lessonId/documents
   * เอกสารประกอบของบทเรียน (ปุ่ม "เอกสารประกอบ")
   * [FIX] เพิ่ม userId (จาก token) เพื่อเช็คสิทธิ์คอร์สด้วย (เดิม endpoint นี้ไม่เช็คอะไรเลย)
   */
  @Get(':id/lessons/:lessonId/documents')
  getLessonDocuments(
    @Param('id', PositiveIntPipe) courseId: number,
    @Param('lessonId', PositiveIntPipe) lessonId: number,
    @CurrentUser() userId: number,
  ) {
    return this.courseService.getLessonDocuments(courseId, lessonId, userId);
  }
}
