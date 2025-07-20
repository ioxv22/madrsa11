-- إنشاء قاعدة البيانات
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
('student', 'student@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'طالب تجريبي');