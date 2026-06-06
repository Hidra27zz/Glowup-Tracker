const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'prisma', 'dev.db');
const BACKUPS_DIR = path.join(__dirname, '..', 'backups');

function backupDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    console.error('Không tìm thấy database tại', DB_PATH);
    process.exit(1);
  }

  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }

  const now = new Date();
  const timestamp = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
  
  const backupFileName = `dev_backup_${timestamp}.db`;
  const backupPath = path.join(BACKUPS_DIR, backupFileName);

  try {
    fs.copyFileSync(DB_PATH, backupPath);
    console.log(`Backup thành công!`);
    console.log(`File lưu tại: ${backupPath}`);
  } catch (error) {
    console.error('Lỗi khi backup database:', error);
    process.exit(1);
  }
}

backupDatabase();
