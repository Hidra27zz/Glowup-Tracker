const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DB_PATH = path.join(__dirname, '..', 'prisma', 'dev.db');
const BACKUPS_DIR = path.join(__dirname, '..', 'backups');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function listBackups() {
  if (!fs.existsSync(BACKUPS_DIR)) {
    console.error('Thư mục backups không tồn tại.');
    return [];
  }
  const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.db')).sort((a, b) => b.localeCompare(a));
  return files;
}

function restoreDatabase() {
  const backups = listBackups();
  if (backups.length === 0) {
    console.log('️ Không tìm thấy bản backup nào trong thư mục backups/.');
    process.exit(0);
  }

  console.log('\nDanh sách các bản Backup có sẵn:');
  backups.forEach((b, index) => {
    const stats = fs.statSync(path.join(BACKUPS_DIR, b));
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  [${index + 1}] ${b} (${sizeMB} MB)`);
  });

  rl.question('\nNhập số thứ tự bản backup bạn muốn phục hồi (hoặc nhấn Enter để thoát): ', (answer) => {
    const choice = parseInt(answer.trim());
    if (isNaN(choice) || choice < 1 || choice > backups.length) {
      console.log('Đã hủy phục hồi.');
      process.exit(0);
    }

    const selectedFile = backups[choice - 1];
    const sourcePath = path.join(BACKUPS_DIR, selectedFile);

    try {
      // Backup current DB just in case before overwriting
      if (fs.existsSync(DB_PATH)) {
        const tempBackup = DB_PATH + '.bak';
        fs.copyFileSync(DB_PATH, tempBackup);
        console.log(`(Đã tạo bản sao an toàn của DB hiện tại: dev.db.bak)`);
      }

      fs.copyFileSync(sourcePath, DB_PATH);
      console.log(`Phục hồi thành công từ file: ${selectedFile}`);
      console.log(`Vui lòng khởi động lại server (nếu đang chạy) để cập nhật dữ liệu mới.`);
    } catch (error) {
      console.error('Lỗi khi phục hồi database:', error);
    } finally {
      process.exit(0);
    }
  });
}

restoreDatabase();
