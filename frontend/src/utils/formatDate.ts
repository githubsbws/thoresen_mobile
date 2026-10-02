/**
 * [ADD] ตัวช่วยจัดรูปแบบวันที่ที่ใช้ร่วมกัน
 * เดิมมี formatDate คนละเวอร์ชันอยู่ใน courses.tsx (toLocaleDateString('th-TH') -> ปี พ.ศ.
 * และบางเครื่อง Android/Hermes ไม่รองรับ locale นี้) กับ course-category/[id].tsx (ปี ค.ศ.)
 *
 * รูปแบบ: dd/mm/yyyy (ปี ค.ศ.) ถ้าอยากได้ปี พ.ศ. ให้ส่ง { buddhist: true }
 */
export function formatDate(
  value?: string | Date | null,
  options: { buddhist?: boolean } = {},
): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear() + (options.buddhist ? 543 : 0);

  return `${day}/${month}/${year}`;
}
