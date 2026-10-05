import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

/**
 * [ADD] Pipe ใหม่ สำหรับ validate ตัวเลขจำนวนเต็มบวก (userId, langId, courseId ...)
 * แทนโค้ด `Number(x)` + `Number.isNaN(x) || x <= 0` ที่เขียนซ้ำอยู่ในทุก controller
 *
 * ใช้: @Query('userId', PositiveIntPipe) userId: number
 */
@Injectable()
export class PositiveIntPipe implements PipeTransform<unknown, number> {
  transform(value: unknown, metadata: ArgumentMetadata): number {
    const parsed = Number(value);

    if (
      value === undefined ||
      value === null ||
      value === '' ||
      !Number.isInteger(parsed) ||
      parsed <= 0
    ) {
      // [FIX] ข้อความ error บอกชื่อ field จริง (เดิม /course/:id ก็ขึ้นว่า "courseId is required")
      throw new BadRequestException(
        `${metadata.data ?? 'value'} must be a positive integer`,
      );
    }

    return parsed;
  }
}
