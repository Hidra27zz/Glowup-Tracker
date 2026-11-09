import zlib from 'zlib';

export interface SheetData {
  name: string;
  headers: string[];
  rows: (string | number)[][];
}

// ============================================================================
// 1. DEFAULT 7-SHEET TEMPLATE DEFINITION FOR GLOWUP OS
// ============================================================================
export function getGlowUpTemplateSheets(): SheetData[] {
  return [
    {
      name: '1_Muc_Tieu_SMART',
      headers: [
        'Tiêu đề mục tiêu',
        'Specific (Cụ thể)',
        'Measurable (Đo lường)',
        'Achievable (Khả thi)',
        'Relevant (Liên quan)',
        'Time-bound (Thời hạn)',
        'Chỉ số hiện tại',
        'Chỉ số mục tiêu',
        'Đơn vị',
        'Hạn chót (YYYY-MM-DD HH:mm)',
      ],
      rows: [
        [
          'Đạt IELTS 7.5 & Giao tiếp phản xạ',
          'Luyện 4 kỹ năng nghe nói đọc viết mỗi ngày 60 phút',
          'Làm 20 đề Cambridge và đạt trung bình 7.5+',
          'Chia nhỏ mỗi tuần 2 đề, học từ vựng qua Flashcard',
          'Mở rộng cơ hội nghề nghiệp tại công ty đa quốc gia',
          'Hoàn thành trong 3 tháng tới',
          6.0,
          7.5,
          'band',
          '2026-12-31 23:59',
        ],
        [
          'Giảm mỡ tăng cơ săn chắc',
          'Tập kháng lực 4 buổi/tuần và ăn đủ 140g Protein/ngày',
          'Giảm cân nặng từ 68kg xuống 63kg',
          'Ăn Eat Clean tự nấu từ nguyên liệu tủ lạnh',
          'Tăng năng lượng làm việc và cải thiện ngoại hình',
          'Trong vòng 8 tuần',
          68,
          63,
          'kg',
          '2026-12-15 20:00',
        ],
      ],
    },
    {
      name: '2_Lich_Trinh_Task',
      headers: [
        'Tiêu đề công việc / lịch',
        'Phân loại (TIMETABLE/WORK_SCHEDULE/APPOINTMENT/GENERAL)',
        'Giờ bắt đầu (YYYY-MM-DD HH:mm)',
        'Hạn kết thúc (YYYY-MM-DD HH:mm)',
        'Địa điểm / Phòng',
        'Mức năng lượng (HIGH/MEDIUM/LOW)',
        'Trạng thái (TODO/DONE)',
      ],
      rows: [
        [
          'Lớp Học Chuyên Ngành / Ngoại Ngữ',
          'TIMETABLE',
          '2026-11-10 08:00',
          '2026-11-10 10:30',
          'Phòng A204',
          'HIGH',
          'TODO',
        ],
        [
          'Ca làm việc / Deep Work Dự Án Chính',
          'WORK_SCHEDULE',
          '2026-11-10 13:30',
          '2026-11-10 17:30',
          'Văn phòng / Tầng 5',
          'HIGH',
          'TODO',
        ],
        [
          'Họp nhóm Review Sprint tuần',
          'APPOINTMENT',
          '2026-11-10 19:00',
          '2026-11-10 20:00',
          'Google Meet',
          'MEDIUM',
          'TODO',
        ],
        [
          'Hoàn thành báo cáo tổng kết tuần',
          'GENERAL',
          '2026-11-11 09:00',
          '2026-11-11 11:30',
          'Tại nhà',
          'HIGH',
          'TODO',
        ],
      ],
    },
    {
      name: '3_Tu_Lanh_Dinh_Duong',
      headers: [
        'Loại (PANTRY/MEAL)',
        'Tên nguyên liệu hoặc Món ăn',
        'Danh mục (Đạm/Rau củ/Tinh bột/Trái cây/Sữa)',
        'Số lượng',
        'Hạn sử dụng (YYYY-MM-DD)',
        'Calo (kcal)',
        'Protein (g)',
        'Carbs (g)',
        'Fat (g)',
      ],
      rows: [
        ['PANTRY', 'Ức gà phi lê', 'Đạm', '1 kg', '2026-11-16', 0, 0, 0, 0],
        ['PANTRY', 'Trứng gà ta', 'Đạm', '10 quả', '2026-11-22', 0, 0, 0, 0],
        ['PANTRY', 'Bông cải xanh', 'Rau củ', '500g', '2026-11-14', 0, 0, 0, 0],
        ['PANTRY', 'Sữa chua Hy Lạp', 'Sữa & Đồ uống', '4 hộp', '2026-11-20', 0, 0, 0, 0],
        ['MEAL', 'Ức gà áp chảo + Cơm gạo lứt', 'Bữa trưa', '1 phần', '', 520, 48, 55, 11],
      ],
    },
    {
      name: '4_Tai_Chinh',
      headers: [
        'Loại (expense/income)',
        'Số tiền (VND)',
        'Danh mục (Ăn uống/Di chuyển/Học tập/Lương/Mua sắm)',
        'Ghi chú chi tiết',
      ],
      rows: [
        ['expense', 350000, 'Đi chợ / Thực phẩm', 'Mua ức gà, trứng, rau củ cho cả tuần'],
        ['expense', 45000, 'Ăn uống', 'Phở bò buổi sáng'],
        ['income', 15000000, 'Lương / Thu nhập', 'Thu nhập tháng này'],
      ],
    },
    {
      name: '5_Suc_Khoe_Tap_Luyen',
      headers: [
        'Loại (BODY/WORKOUT)',
        'Cân nặng (kg)',
        'Mỡ cơ thể (%)',
        'Vòng ngực (cm)',
        'Vòng eo (cm)',
        'Vòng hông (cm)',
        'Tên bài tập',
        'Nhóm bài tập (Gym/Cardio/Calisthenics)',
        'Thời lượng (phút)',
        'Ghi chú',
      ],
      rows: [
        ['BODY', 65.5, 16.5, 96, 76, 94, '', '', 0, 'Đo buổi sáng khi bụng rỗng'],
        ['WORKOUT', 0, 0, 0, 0, 0, 'Upper Body & Core Strength', 'Gym', 50, 'Tăng mức tạ Bench Press'],
      ],
    },
    {
      name: '6_Hoc_Tap_Su_Nghiep',
      headers: [
        'Loại (SKILL/FLASHCARD/JOB)',
        'Tên kỹ năng / Tên bộ thẻ / Tên công ty',
        'Danh mục / Mặt trước thẻ (Câu hỏi) / Vị trí ứng tuyển',
        'Cấp độ / Mặt sau thẻ (Đáp án) / Trạng thái (CV_SENT/INTERVIEW/OFFER)',
        'Ghi chú thêm',
      ],
      rows: [
        ['SKILL', 'Phân tích dữ liệu & Tư duy hệ thống', 'Core Skill', 2, 'Rèn luyện hàng tuần'],
        ['FLASHCARD', 'Từ vựng & Kiến thức trọng tâm', 'SMART Goal là gì?', 'Specific, Measurable, Achievable, Relevant, Time-bound', 'Ôn tập Spaced Repetition'],
        ['JOB', 'Tập đoàn Công nghệ / Đa quốc gia', 'Chuyên viên Phát triển Sản phẩm', 'INTERVIEW', 'Phỏng vấn vòng 2 tuần tới'],
      ],
    },
    {
      name: '7_CRM_Moi_Quan_He',
      headers: [
        'Họ và tên',
        'Nhóm mối quan hệ (Mentor/Đồng nghiệp/Khách hàng/Bạn bè/Gia đình)',
        'Tần suất giữ liên lạc (số ngày)',
        'Ghi chú & Chủ đề trò chuyện',
      ],
      rows: [
        ['Anh Minh (Senior Mentor)', 'Mentor', 14, 'Hỏi thăm về định hướng nghề nghiệp & review mục tiêu quý'],
        ['Chị Lan (Đối tác dự án)', 'Đồng nghiệp', 7, 'Cập nhật tiến độ dự án chung'],
      ],
    },
  ];
}

// ============================================================================
// 2. PURE NODE.JS MULTI-SHEET .XLSX GENERATOR (OPENXML ZIP WORKBOOK)
// ============================================================================
function escapeXml(val: string): string {
  return val
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function colIndexToLetter(colIdx: number): string {
  let letter = '';
  let temp = colIdx + 1;
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter;
}

function buildWorksheetXml(sheet: SheetData): string {
  const allRows: (string | number)[][] = [sheet.headers, ...sheet.rows];
  let rowsXml = '';

  for (let r = 0; r < allRows.length; r++) {
    const row = allRows[r];
    const rowNum = r + 1;
    const isHeader = r === 0;
    let cellsXml = '';

    for (let c = 0; c < row.length; c++) {
      const cellRef = `${colIndexToLetter(c)}${rowNum}`;
      const val = row[c] ?? '';
      const styleAttr = isHeader ? ' s="1"' : ' s="0"';

      if (typeof val === 'number' && !isNaN(val)) {
        cellsXml += `<c r="${cellRef}"${styleAttr}><v>${val}</v></c>`;
      } else {
        cellsXml += `<c r="${cellRef}" t="inlineStr"${styleAttr}><is><t>${escapeXml(String(val))}</t></is></c>`;
      }
    }

    const rowHeightAttr = isHeader ? ' ht="26" customHeight="1"' : ' ht="20" customHeight="1"';
    rowsXml += `<row r="${rowNum}"${rowHeightAttr}>${cellsXml}</row>`;
  }

  const colsXml = sheet.headers
    .map((_, i) => `<col min="${i + 1}" max="${i + 1}" width="26" customWidth="1"/>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>${colsXml}</cols>
  <sheetData>${rowsXml}</sheetData>
</worksheet>`;
}

// CRC32 Table for PKZIP
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZipBuffer(files: { name: string; data: Buffer }[]): Buffer {
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf8');
    const dataBuf = file.data;
    const crc = crc32(dataBuf);
    const size = dataBuf.length;

    // Local file header (30 bytes + filename)
    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4); // version needed
    localHeader.writeUInt16LE(0, 6); // flags
    localHeader.writeUInt16LE(0, 8); // compression method: 0 (store)
    localHeader.writeUInt16LE(0, 10); // mod time
    localHeader.writeUInt16LE(0, 12); // mod date
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(size, 18); // compressed size
    localHeader.writeUInt32LE(size, 22); // uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28); // extra field length
    nameBuf.copy(localHeader, 30);

    localHeaders.push(localHeader, dataBuf);

    // Central directory header (46 bytes + filename)
    const centralHeader = Buffer.alloc(46 + nameBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4); // version made by
    centralHeader.writeUInt16LE(20, 6); // version needed
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10); // compression: 0
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(size, 20);
    centralHeader.writeUInt32LE(size, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    nameBuf.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);
    offset += localHeader.length + dataBuf.length;
  }

  const centralDirBuf = Buffer.concat(centralHeaders);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDirBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localHeaders, centralDirBuf, eocd]);
}

export function generateXlsxBuffer(sheets: SheetData[]): Buffer {
  const files: { name: string; data: Buffer }[] = [];

  const sheetOverrides = sheets
    .map(
      (_, idx) =>
        `<Override PartName="/xl/worksheets/sheet${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )
    .join('');

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${sheetOverrides}
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbookSheetsXml = sheets
    .map(
      (s, idx) =>
        `<sheet name="${escapeXml(s.name.slice(0, 31))}" sheetId="${idx + 1}" r:id="rId${idx + 1}"/>`
    )
    .join('');

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${workbookSheetsXml}</sheets>
</workbook>`;

  const workbookRelsEntries = sheets
    .map(
      (_, idx) =>
        `<Relationship Id="rId${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${idx + 1}.xml"/>`
    )
    .join('');

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${workbookRelsEntries}
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF6D28D9"/></patternFill></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
  </cellXfs>
</styleSheet>`;

  files.push({ name: '[Content_Types].xml', data: Buffer.from(contentTypesXml, 'utf8') });
  files.push({ name: '_rels/.rels', data: Buffer.from(rootRelsXml, 'utf8') });
  files.push({ name: 'xl/workbook.xml', data: Buffer.from(workbookXml, 'utf8') });
  files.push({ name: 'xl/_rels/workbook.xml.rels', data: Buffer.from(workbookRelsXml, 'utf8') });
  files.push({ name: 'xl/styles.xml', data: Buffer.from(stylesXml, 'utf8') });

  sheets.forEach((sheet, idx) => {
    files.push({
      name: `xl/worksheets/sheet${idx + 1}.xml`,
      data: Buffer.from(buildWorksheetXml(sheet), 'utf8'),
    });
  });

  return createZipBuffer(files);
}

// ============================================================================
// 3. PURE NODE.JS .XLSX (OPENXML ZIP) & XML/CSV PARSER
// ============================================================================
function unescapeXml(str: string): string {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function readZipEntries(buf: Buffer): Record<string, string> {
  const entries: Record<string, string> = {};
  // Locate End of Central Directory (EOCD)
  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) return entries;

  const totalEntries = buf.readUInt16LE(eocdOffset + 10);
  const centralDirOffset = buf.readUInt32LE(eocdOffset + 16);

  let ptr = centralDirOffset;
  for (let i = 0; i < totalEntries; i++) {
    if (ptr + 46 > buf.length || buf.readUInt32LE(ptr) !== 0x02014b50) break;
    const compressionMethod = buf.readUInt16LE(ptr + 10);
    const compressedSize = buf.readUInt32LE(ptr + 20);
    const fileNameLen = buf.readUInt16LE(ptr + 28);
    const extraLen = buf.readUInt16LE(ptr + 30);
    const commentLen = buf.readUInt16LE(ptr + 32);
    const localHeaderOffset = buf.readUInt32LE(ptr + 42);
    const fileName = buf.subarray(ptr + 46, ptr + 46 + fileNameLen).toString('utf8');

    const localFileNameLen = buf.readUInt16LE(localHeaderOffset + 26);
    const localExtraLen = buf.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localFileNameLen + localExtraLen;
    const rawData = buf.subarray(dataStart, dataStart + compressedSize);

    if (fileName.endsWith('.xml') || fileName.endsWith('.rels')) {
      try {
        if (compressionMethod === 0) {
          entries[fileName] = rawData.toString('utf8');
        } else if (compressionMethod === 8) {
          entries[fileName] = zlib.inflateRawSync(rawData).toString('utf8');
        }
      } catch {
        // ignore corrupt entry
      }
    }

    ptr += 46 + fileNameLen + extraLen + commentLen;
  }

  return entries;
}

function letterToColIndex(letters: string): number {
  let col = 0;
  for (let i = 0; i < letters.length; i++) {
    col = col * 26 + (letters.charCodeAt(i) - 64);
  }
  return col - 1;
}

export function parseXlsxOrCsvBuffer(buf: Buffer, fileName: string = ''): SheetData[] {
  // Check PKZIP magic header (0x04034b50) for .xlsx
  if (buf.length >= 4 && buf.readUInt32LE(0) === 0x04034b50) {
    const entries = readZipEntries(buf);
    const sharedStrings: string[] = [];

    if (entries['xl/sharedStrings.xml']) {
      const ssXml = entries['xl/sharedStrings.xml'];
      const siRegex = /<si[^>]*>([\s\S]*?)<\/si>/g;
      let siMatch: RegExpExecArray | null;
      while ((siMatch = siRegex.exec(ssXml)) !== null) {
        const tMatches = Array.from(siMatch[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g));
        const text = tMatches.map((m) => unescapeXml(m[1])).join('');
        sharedStrings.push(text);
      }
    }

    // Map rId -> target path from xl/_rels/workbook.xml.rels
    const relMap: Record<string, string> = {};
    if (entries['xl/_rels/workbook.xml.rels']) {
      const relRegex = /<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/g;
      let rm: RegExpExecArray | null;
      while ((rm = relRegex.exec(entries['xl/_rels/workbook.xml.rels'])) !== null) {
        const target = rm[2].startsWith('/') ? rm[2].slice(1) : `xl/${rm[2]}`;
        relMap[rm[1]] = target;
      }
    }

    // Parse sheets in xl/workbook.xml
    const sheetMeta: { name: string; path: string }[] = [];
    if (entries['xl/workbook.xml']) {
      const sheetRegex = /<sheet[^>]+name="([^"]+)"[^>]+r:id="([^"]+)"/g;
      let sm: RegExpExecArray | null;
      let idx = 1;
      while ((sm = sheetRegex.exec(entries['xl/workbook.xml'])) !== null) {
        const name = unescapeXml(sm[1]);
        const rId = sm[2];
        const path = relMap[rId] || `xl/worksheets/sheet${idx}.xml`;
        sheetMeta.push({ name, path });
        idx++;
      }
    }

    if (sheetMeta.length === 0) {
      Object.keys(entries)
        .filter((k) => k.startsWith('xl/worksheets/sheet'))
        .sort()
        .forEach((path, i) => sheetMeta.push({ name: `Sheet${i + 1}`, path }));
    }

    const parsedSheets: SheetData[] = [];
    for (const meta of sheetMeta) {
      const wsXml = entries[meta.path];
      if (!wsXml) continue;

      const allRows: string[][] = [];
      const rowRegex = /<row[^>]*>([\s\S]*?)<\/row>/g;
      let rowMatch: RegExpExecArray | null;

      while ((rowMatch = rowRegex.exec(wsXml)) !== null) {
        const rowContent = rowMatch[1];
        const rowCells: string[] = [];
        const cellRegex = /<c\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
        let cellMatch: RegExpExecArray | null;
        let fallbackCol = 0;

        while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
          const attrs = cellMatch[1] || '';
          const inner = cellMatch[2] || '';
          const refMatch = attrs.match(/r="([A-Z]+)\d+"/);
          const typeMatch = attrs.match(/t="([^"]+)"/);
          const colIdx = refMatch ? letterToColIndex(refMatch[1]) : fallbackCol;
          fallbackCol = colIdx + 1;

          const cellType = typeMatch ? typeMatch[1] : 'n';
          let cellValue = '';

          if (cellType === 's') {
            const vMatch = inner.match(/<v>([\s\S]*?)<\/v>/);
            if (vMatch) {
              const ssIdx = parseInt(vMatch[1], 10);
              cellValue = sharedStrings[ssIdx] ?? '';
            }
          } else if (cellType === 'inlineStr' || cellType === 'str') {
            const tMatches = Array.from(inner.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g));
            if (tMatches.length > 0) {
              cellValue = tMatches.map((m) => unescapeXml(m[1])).join('');
            } else {
              const vMatch = inner.match(/<v>([\s\S]*?)<\/v>/);
              cellValue = vMatch ? unescapeXml(vMatch[1]) : '';
            }
          } else {
            const vMatch = inner.match(/<v>([\s\S]*?)<\/v>/);
            cellValue = vMatch ? unescapeXml(vMatch[1]) : '';
          }

          while (rowCells.length <= colIdx) rowCells.push('');
          rowCells[colIdx] = cellValue.trim();
        }

        if (rowCells.some((c) => c !== '')) {
          allRows.push(rowCells);
        }
      }

      if (allRows.length > 0) {
        parsedSheets.push({
          name: meta.name,
          headers: allRows[0],
          rows: allRows.slice(1),
        });
      }
    }

    return parsedSheets;
  }

  // Fallback for CSV / TSV text files
  const text = buf.toString('utf8');
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];
  const sep = lines[0].includes('\t') ? '\t' : ',';
  const allRows = lines.map((line) =>
    line.split(sep).map((cell) => cell.replace(/^"|"$/g, '').trim())
  );
  return [
    {
      name: fileName || 'CSV_Import',
      headers: allRows[0] || [],
      rows: allRows.slice(1),
    },
  ];
}
