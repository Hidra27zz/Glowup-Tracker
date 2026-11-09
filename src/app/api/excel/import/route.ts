import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import {
  getGlowUpTemplateSheets,
  parseXlsxOrCsvBuffer,
  SheetData,
} from '@/lib/utils/excelWorkbook';

export const dynamic = 'force-dynamic';

function parseFlexibleDate(raw: string | number | undefined, fallbackOffsetHours = 0): Date {
  if (raw === undefined || raw === null || raw === '') {
    return new Date(Date.now() + fallbackOffsetHours * 3600 * 1000);
  }
  // Handle Excel serial date number (e.g. 46336.5)
  const num = Number(raw);
  if (!isNaN(num) && num > 25569 && num < 80000) {
    return new Date(Math.round((num - 25569) * 86400 * 1000));
  }
  const str = String(raw).trim();
  const normalized = str.includes(' ') && !str.includes('T') ? str.replace(' ', 'T') : str;
  const parsed = new Date(normalized);
  if (!isNaN(parsed.getTime())) return parsed;
  return new Date(Date.now() + fallbackOffsetHours * 3600 * 1000);
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let sheets: SheetData[] = [];

    if (contentType.includes('application/json')) {
      const body = await req.json();
      if (body.useTemplateSample) {
        sheets = getGlowUpTemplateSheets();
      }
    } else {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'Vui lòng chọn file Excel (.xlsx) hoặc CSV để tải lên.' }, { status: 400 });
      }
      const arrayBuf = await file.arrayBuffer();
      const buf = Buffer.from(arrayBuf);
      sheets = parseXlsxOrCsvBuffer(buf, file.name);
    }

    if (sheets.length === 0) {
      return NextResponse.json(
        { error: 'Không đọc được dữ liệu từ file. Hãy tải file mẫu chuẩn (.xlsx) và điền vào các Sheet.' },
        { status: 400 }
      );
    }

    const stats: Record<string, number> = {
      smartGoals: 0,
      tasks: 0,
      pantryItems: 0,
      meals: 0,
      transactions: 0,
      healthLogs: 0,
      careerItems: 0,
      crmContacts: 0,
    };

    for (const sheet of sheets) {
      const sName = sheet.name.toLowerCase();

      // SHEET 1: MỤC TIÊU SMART
      if (sName.includes('smart') || sName.includes('muc_tieu') || sName.includes('1_')) {
        for (const row of sheet.rows) {
          const title = String(row[0] ?? '').trim();
          if (!title) continue;
          const specific = String(row[1] ?? 'Mục tiêu cụ thể').trim();
          const measurable = String(row[2] ?? 'Đo lường tiến độ').trim();
          const achievable = String(row[3] ?? 'Kế hoạch khả thi').trim();
          const relevant = String(row[4] ?? 'Phù hợp định hướng').trim();
          const category = String(row[5] ?? 'Personal').trim() || 'Personal';
          const currentValue = parseFloat(String(row[6] ?? '0')) || 0;
          const targetValue = parseFloat(String(row[7] ?? '100')) || 100;
          const unit = String(row[8] ?? '%').trim() || '%';
          const deadline = parseFlexibleDate(row[9], 24 * 30);

          await prisma.smartGoal.create({
            data: {
              title,
              category,
              specific,
              measurable,
              achievable,
              relevant,
              currentValue,
              targetValue,
              unit,
              deadline,
              status: 'IN_PROGRESS',
            },
          });
          stats.smartGoals++;
        }
      }

      // SHEET 2: LỊCH TRÌNH & CÔNG VIỆC
      else if (sName.includes('lich') || sName.includes('task') || sName.includes('2_')) {
        for (const row of sheet.rows) {
          const title = String(row[0] ?? '').trim();
          if (!title) continue;
          const rawCat = String(row[1] ?? 'GENERAL').trim().toUpperCase();
          const category = ['TIMETABLE', 'WORK_SCHEDULE', 'APPOINTMENT', 'GENERAL'].includes(rawCat)
            ? rawCat
            : 'GENERAL';
          const startTime = parseFlexibleDate(row[2], 1);
          const deadline = parseFlexibleDate(row[3], 3);
          const location = String(row[4] ?? '').trim() || null;
          const rawEnergy = String(row[5] ?? 'MEDIUM').trim().toUpperCase();
          const energyLevel = ['HIGH', 'MEDIUM', 'LOW'].includes(rawEnergy) ? rawEnergy : 'MEDIUM';
          const rawStatus = String(row[6] ?? 'TODO').trim().toUpperCase();
          const status = rawStatus === 'DONE' ? 'DONE' : 'TODO';

          await prisma.task.create({
            data: {
              title,
              category,
              startTime,
              deadline,
              location,
              energyLevel,
              status,
            },
          });
          stats.tasks++;
        }
      }

      // SHEET 3: TỦ LẠNH & DINH DƯỠNG
      else if (sName.includes('tu_lanh') || sName.includes('dinh_duong') || sName.includes('3_')) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const row of sheet.rows) {
          const type = String(row[0] ?? 'PANTRY').trim().toUpperCase();
          const name = String(row[1] ?? '').trim();
          if (!name) continue;

          if (type === 'MEAL') {
            const calories = parseInt(String(row[5] ?? '0'), 10) || 400;
            const protein = parseFloat(String(row[6] ?? '0')) || 20;
            const carbs = parseFloat(String(row[7] ?? '0')) || 45;
            const fat = parseFloat(String(row[8] ?? '0')) || 12;

            const existing = await prisma.nutritionLog.findFirst({
              where: { date: { gte: today } },
            });
            if (existing) {
              await prisma.nutritionLog.update({
                where: { id: existing.id },
                data: {
                  calories: { increment: calories },
                  protein: { increment: protein },
                  carbs: { increment: carbs },
                  fat: { increment: fat },
                },
              });
            } else {
              await prisma.nutritionLog.create({
                data: { date: today, calories, protein, carbs, fat },
              });
            }
            stats.meals++;
          } else {
            const category = String(row[2] ?? 'Khác').trim();
            const quantity = String(row[3] ?? '1 phần').trim();
            const expiresAt = row[4] ? parseFlexibleDate(row[4], 24 * 7) : null;

            await prisma.pantryItem.create({
              data: {
                name,
                category,
                quantity,
                expiresAt,
              },
            });
            stats.pantryItems++;
          }
        }
      }

      // SHEET 4: TÀI CHÍNH
      else if (sName.includes('tai_chinh') || sName.includes('finance') || sName.includes('4_')) {
        for (const row of sheet.rows) {
          const rawType = String(row[0] ?? 'expense').trim().toLowerCase();
          const type = rawType === 'income' || rawType === 'thu' ? 'income' : 'expense';
          const amount = parseFloat(String(row[1] ?? '0').replace(/,/g, ''));
          if (isNaN(amount) || amount <= 0) continue;
          const category = String(row[2] ?? 'Chi tiêu chung').trim();
          const notes = String(row[3] ?? '').trim();

          await prisma.financialTransaction.create({
            data: {
              type,
              amount,
              category,
              notes,
            },
          });
          stats.transactions++;
        }
      }

      // SHEET 5: SỨC KHỎE & TẬP LUYỆN
      else if (sName.includes('suc_khoe') || sName.includes('health') || sName.includes('5_')) {
        for (const row of sheet.rows) {
          const rowType = String(row[0] ?? 'BODY').trim().toUpperCase();
          if (rowType === 'WORKOUT') {
            const title = String(row[6] ?? '').trim();
            if (!title) continue;
            const workoutType = String(row[7] ?? 'Gym').trim();
            const duration = parseInt(String(row[8] ?? '30'), 10) || 30;
            const notes = String(row[9] ?? '').trim();

            await prisma.workout.create({
              data: {
                title,
                type: workoutType,
                duration,
                notes,
              },
            });
            stats.healthLogs++;
          } else {
            const weight = parseFloat(String(row[1] ?? '0')) || null;
            const bodyFat = parseFloat(String(row[2] ?? '0')) || null;
            const chest = parseFloat(String(row[3] ?? '0')) || null;
            const waist = parseFloat(String(row[4] ?? '0')) || null;
            const hips = parseFloat(String(row[5] ?? '0')) || null;
            if (!weight && !bodyFat && !waist) continue;

            await prisma.bodyMetric.create({
              data: {
                weight,
                bodyFat,
                chest,
                waist,
                hips,
              },
            });
            stats.healthLogs++;
          }
        }
      }

      // SHEET 6: HỌC TẬP & SỰ NGHIỆP
      else if (sName.includes('hoc_tap') || sName.includes('career') || sName.includes('6_')) {
        for (const row of sheet.rows) {
          const itemType = String(row[0] ?? 'SKILL').trim().toUpperCase();
          const col1 = String(row[1] ?? '').trim();
          const col2 = String(row[2] ?? '').trim();
          const col3 = String(row[3] ?? '').trim();
          const col4 = String(row[4] ?? '').trim();
          if (!col1) continue;

          if (itemType === 'JOB') {
            await prisma.jobApplication.create({
              data: {
                company: col1,
                position: col2 || 'Vị trí ứng tuyển',
                status: ['CV_SENT', 'HR_CALL', 'INTERVIEW', 'OFFER', 'REJECTED'].includes(col3.toUpperCase())
                  ? col3.toUpperCase()
                  : 'CV_SENT',
                notes: col4 || null,
              },
            });
            stats.careerItems++;
          } else if (itemType === 'FLASHCARD') {
            let deck = await prisma.flashcardDeck.findFirst({
              where: { name: col1 },
            });
            if (!deck) {
              deck = await prisma.flashcardDeck.create({
                data: {
                  name: col1,
                  category: 'Excel Import',
                  description: col4 || 'Nhập từ Excel',
                },
              });
            }
            if (col2 && col3) {
              await prisma.flashcard.create({
                data: {
                  deckId: deck.id,
                  front: col2,
                  back: col3,
                },
              });
              stats.careerItems++;
            }
          } else {
            const level = parseInt(col3, 10) || 1;
            await prisma.skill.create({
              data: {
                name: col1,
                category: col2 || 'Kỹ năng chuyên môn',
                level,
                exp: 20,
              },
            });
            stats.careerItems++;
          }
        }
      }

      // SHEET 7: CRM & MỐI QUAN HỆ
      else if (sName.includes('crm') || sName.includes('quan_he') || sName.includes('7_')) {
        for (const row of sheet.rows) {
          const name = String(row[0] ?? '').trim();
          if (!name) continue;
          const category = String(row[1] ?? 'Bạn bè').trim();
          const valueExchange = parseInt(String(row[2] ?? '10'), 10) || 10;
          const notes = String(row[3] ?? '').trim() || null;

          await prisma.contact.create({
            data: {
              name,
              category,
              valueExchange,
              notes,
            },
          });
          stats.crmContacts++;
        }
      }
    }

    revalidatePath('/');
    revalidatePath('/tasks');
    revalidatePath('/nutrition');
    revalidatePath('/health');
    revalidatePath('/finance');
    revalidatePath('/career');
    revalidatePath('/crm');

    return NextResponse.json({
      success: true,
      sheetsProcessed: sheets.map((s) => s.name),
      stats,
    });
  } catch (err: any) {
    console.error('[Excel Import Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Đã xảy ra lỗi khi xử lý file Excel.' },
      { status: 500 }
    );
  }
}
