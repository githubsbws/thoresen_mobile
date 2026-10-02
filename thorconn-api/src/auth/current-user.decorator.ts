import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

/**
 * [FIX] แก้ตามไฟล์ guard จริงที่ได้รับมา (jwt-auth.guard.ts ของโปรเจกต์)
 * เดิมผมเดาไว้ว่า request.user หน้าตาเป็น { id: number } แต่ guard จริงตั้งค่าเป็น
 * payload ดิบของ JWT ตรงๆ (จาก auth.service.ts: payload = { sub: user.id, username, email })
 * คือ request.user = { sub, username, email } — "sub" ไม่ใช่ "id"
 *
 * ถ้าไม่แก้จุดนี้ CurrentUser จะคืนค่า undefined เสมอ (เพราะ req.user.id ไม่มีจริง)
 * แล้วทุก endpoint ที่ใช้ @CurrentUser() จะพังเงียบๆ (userId เป็น NaN)
 *
 * ใช้แทนที่ทุกจุดที่เคยเป็น:
 *   @Query('userId', PositiveIntPipe) userId: number
 *   @Body('userId', PositiveIntPipe) userId: number
 * ด้วย:
 *   @CurrentUser() userId: number
 *
 * ต้องใช้คู่กับ @UseGuards(JwtAuthGuard) เสมอ (ของจริงที่ import จาก '../auth/jwt-auth.guard')
 */

interface RequestWithJwtPayload {
  user?: {
    sub: number;
    username?: string;
    email?: string;
  };
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const req = ctx
      .switchToHttp()
      .getRequest<RequestWithJwtPayload>();

    const rawId = req.user?.sub;

    if (rawId == null) {
      // เกิดจากลืมใส่ @UseGuards(JwtAuthGuard) ที่ controller/endpoint นี้
      // (หรือ guard เปลี่ยน field ของ payload ไปจากที่ไฟล์นี้คาดไว้)
      throw new InternalServerErrorException(
        'CurrentUser used without JwtAuthGuard — req.user.sub is missing',
      );
    }

    return Number(rawId);
  },
);
