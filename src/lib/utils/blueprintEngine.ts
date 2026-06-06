export interface Blueprint {
  goalType: string; // Cut (Giảm), Bulk (Tăng), Maintain (Duy trì)
  focusArea: string; // Legs, Arms, Core, Fullbody
  nutrition: string[];
  workout: string[];
  timeline: string[];
  youtubeQuery: string;
}

export function generateBlueprint(prompt: string): Blueprint {
  const text = prompt.toLowerCase();
  
  // 1. Phân tích loại Mục tiêu (Goal Type)
  let goalType = 'Maintain';
  let isFatLoss = false;
  if (text.includes('giảm') || text.includes('ốm') || text.includes('gầy') || text.includes('mỡ')) {
    goalType = 'Cut (Giảm Mỡ / Giảm Cân)';
    isFatLoss = true;
  } else if (text.includes('tăng') || text.includes('to') || text.includes('bự') || text.includes('cơ') || text.includes('build')) {
    goalType = 'Bulk (Tăng Cơ)';
  }

  // 2. Phân tích Vùng Cơ Thể (Focus Area)
  let focusArea = 'Fullbody';
  let queryArea = 'full body';
  if (text.includes('đùi') || text.includes('chân') || text.includes('mông') || text.includes('legs') || text.includes('glute')) {
    focusArea = 'Chân & Mông (Lower Body)';
    queryArea = 'legs glutes thigh';
  } else if (text.includes('bụng') || text.includes('eo') || text.includes('core') || text.includes('abs')) {
    focusArea = 'Vùng Bụng (Core / Abs)';
    queryArea = 'abs core belly fat';
  } else if (text.includes('tay') || text.includes('ngực') || text.includes('vai') || text.includes('arms') || text.includes('chest')) {
    focusArea = 'Thân trên (Upper Body)';
    queryArea = 'upper body arms chest bicep';
  }

  // 3. Phân tích thời gian (Timeline parsing)
  let weeks = 8; // Mặc định 8 tuần
  const timeMatch = text.match(/(\d+)\s*(tháng|tuần)/);
  if (timeMatch) {
    const num = parseInt(timeMatch[1], 10);
    const unit = timeMatch[2];
    if (unit === 'tháng') weeks = num * 4;
    else weeks = num;
  }
  
  // 4. Sinh Kế Hoạch Dinh Dưỡng
  const nutrition = [];
  if (isFatLoss) {
    nutrition.push('Thâm hụt Calo: Giảm lượng nạp vào dưới mức TDEE từ 300 - 500 kcal.');
    nutrition.push('Nạp đủ Protein: Đảm bảo 1.8g - 2.2g / kg thể trọng để duy trì lượng cơ bắp.');
    nutrition.push('Chất xơ & Tinh bột chậm: Ưu tiên khoai lang, yến mạch để duy trì cảm giác no lâu.');
  } else if (goalType.includes('Bulk')) {
    nutrition.push('Thặng dư Calo: Tăng lượng nạp vào cao hơn mức TDEE từ 200 - 300 kcal.');
    nutrition.push('Protein dồi dào: Mục tiêu 2g / kg thể trọng để tối ưu hóa quá trình tổng hợp cơ.');
    nutrition.push('Năng lượng tập luyện: Bổ sung đủ Carbs trước và sau buổi tập để đảm bảo hiệu suất.');
  } else {
    nutrition.push('Duy trì năng lượng: Tiêu thụ Calo ở mức TDEE hiện tại.');
    nutrition.push('Tỉ lệ cân bằng: Áp dụng phân bổ vĩ mô 30% Protein - 40% Carbs - 30% Fat.');
  }

  if (focusArea.includes('Bụng') || isFatLoss) {
    nutrition.push('Thủy hóa: Nạp đủ 2.5L - 3.0L nước mỗi ngày để hỗ trợ trao đổi chất.');
  }

  // 5. Sinh Lịch Tập Luyện (Workout Routine)
  const workout = [];
  if (isFatLoss) {
    workout.push(`Cardio & HIIT: Phân bổ 2-3 buổi/tuần nhằm tối đa hóa lượng calo đốt cháy.`);
    workout.push(`Kháng lực: Tập trung 2 buổi/tuần vào vùng ${focusArea} để định hình và săn chắc cơ thể.`);
  } else {
    workout.push(`Hypertrophy: Tập trung các bài tập kháng lực với khối lượng tạ tăng dần vào vùng ${focusArea} (2-3 buổi/tuần).`);
    workout.push(`Progressive Overload: Đảm bảo tăng khối lượng tạ hoặc số hiệp qua từng tuần.`);
    workout.push(`Phục hồi: Dành tối thiểu 48 giờ nghỉ ngơi cho mỗi nhóm cơ trước chu kỳ tập tiếp theo.`);
  }

  // 6. Sinh Timeline Tiến Trình
  const timeline = [];
  const mid = Math.max(1, Math.floor(weeks / 2));
  timeline.push(`Tuần 1-2: Thích nghi hệ thần kinh và làm quen với khối lượng vận động mới.`);
  timeline.push(`Tuần 3-${mid}: Giai đoạn tăng tốc. ${isFatLoss ? 'Bắt đầu nhận thấy sự thay đổi về số đo và độ nét của cơ thể.' : 'Gia tăng sức mạnh rõ rệt, cơ bắp bắt đầu tích trữ glycogen và phình to.'}`);
  timeline.push(`Tuần ${mid + 1}-${weeks}: Giai đoạn bứt phá. Hình thành rõ rệt kết quả mục tiêu tại vùng ${focusArea}.`);

  // 7. Youtube Query
  const typeQuery = isFatLoss ? 'fat burning hiit' : 'muscle building dumbbell workout';
  const youtubeQuery = `${queryArea} ${typeQuery}`;

  return {
    goalType,
    focusArea,
    nutrition,
    workout,
    timeline,
    youtubeQuery
  };
}
