const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 بدء إعداد منصة الدراسة للصف الحادي عشر...\n');

// إنشاء مجلد الرفع إذا لم يكن موجوداً
const uploadsDir = path.join(__dirname, 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ تم إنشاء مجلد الرفع');
}

// إنشاء ملف .env إذا لم يكن موجوداً
const envPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=grade11_study_platform
JWT_SECRET=your_jwt_secret_key_here_make_it_strong_${Date.now()}
UPLOAD_PATH=./uploads`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ تم إنشاء ملف .env');
}

// إنشاء ملف .env للعميل
const clientEnvPath = path.join(__dirname, 'client', '.env');
if (!fs.existsSync(clientEnvPath)) {
  const clientEnvContent = `REACT_APP_API_URL=http://localhost:5000/api`;
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log('✅ تم إنشاء ملف .env للعميل');
}

// إنشاء ملف gitignore
const gitignorePath = path.join(__dirname, '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  const gitignoreContent = `# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Uploads
server/uploads/*
!server/uploads/.gitkeep

# Build directories
build/
dist/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~`;
  
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log('✅ تم إنشاء ملف .gitignore');
}

// إنشاء ملف .gitkeep في مجلد uploads
const gitkeepPath = path.join(uploadsDir, '.gitkeep');
if (!fs.existsSync(gitkeepPath)) {
  fs.writeFileSync(gitkeepPath, '');
  console.log('✅ تم إنشاء ملف .gitkeep في مجلد الرفع');
}

console.log('\n📋 ملاحظات مهمة:');
console.log('1. تأكد من تثبيت MySQL وإنشاء قاعدة البيانات');
console.log('2. قم بتحديث معلومات قاعدة البيانات في ملف server/.env');
console.log('3. استخدم الأوامر التالية لتشغيل المشروع:');
console.log('   - npm run install-all  (لتثبيت جميع التبعيات)');
console.log('   - npm run dev          (لتشغيل المشروع)');
console.log('\n🎯 الحسابات الافتراضية:');
console.log('   المدير: admin / admin123');
console.log('   الطالب: student / student123');
console.log('\n✨ تم الإعداد بنجاح! يمكنك الآن تشغيل المشروع.');

// إنشاء ملف SQL لإنشاء قاعدة البيانات
const sqlPath = path.join(__dirname, 'database.sql');
const sqlContent = `-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS grade11_study_platform 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE grade11_study_platform;

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') DEFAULT 'student',
  full_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- جدول المواد الدراسية
CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#007bff',
  icon VARCHAR(50) DEFAULT 'book',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- جدول الملفات
CREATE TABLE IF NOT EXISTS files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  subject_id INT NOT NULL,
  uploaded_by INT NOT NULL,
  download_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- إدراج المواد الافتراضية
INSERT IGNORE INTO subjects (name, name_ar, description, color, icon) VALUES
('mathematics', 'الرياضيات', 'مادة الرياضيات للصف الحادي عشر', '#ff6b6b', 'calculator'),
('physics', 'الفيزياء', 'مادة الفيزياء للصف الحادي عشر', '#4ecdc4', 'atom'),
('chemistry', 'الكيمياء', 'مادة الكيمياء للصف الحادي عشر', '#45b7d1', 'flask'),
('english', 'اللغة الإنجليزية', 'مادة اللغة الإنجليزية للصف الحادي عشر', '#96ceb4', 'language'),
('arabic', 'اللغة العربية', 'مادة اللغة العربية للصف الحادي عشر', '#feca57', 'book-open'),
('biology', 'الأحياء', 'مادة الأحياء للصف الحادي عشر', '#ff9ff3', 'leaf');

-- إدراج المستخدمين الافتراضيين (كلمات المرور مشفرة)
-- admin123 -> $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- student123 -> $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT IGNORE INTO users (username, email, password, role, full_name) VALUES
('admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'مدير النظام'),
('student', 'student@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'طالب تجريبي');`;

fs.writeFileSync(sqlPath, sqlContent);
console.log('✅ تم إنشاء ملف database.sql');
console.log('\n📄 يمكنك استخدام ملف database.sql لإنشاء قاعدة البيانات والجداول');
console.log('   mysql -u root -p < database.sql');