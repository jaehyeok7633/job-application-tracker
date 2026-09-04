-- ============================================================
-- Job Application Tracker - Database & Table Schema
-- MySQL Workbench 또는 MySQL CLI에서 실행하세요.
-- ============================================================

-- 1. 데이터베이스 생성 (utf8mb4 인코딩)
CREATE DATABASE IF NOT EXISTS job_tracker
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. 데이터베이스 선택
USE job_tracker;

-- 3. 지원 내역 테이블 생성
CREATE TABLE IF NOT EXISTS job_applications (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '지원내역 고유 ID',
  company VARCHAR(100) NOT NULL COMMENT '회사명',
  position VARCHAR(100) NOT NULL COMMENT '지원 직무',
  job_url VARCHAR(500) NULL COMMENT '채용공고 URL',
  applied_date DATE NOT NULL COMMENT '지원일 (YYYY-MM-DD)',
  status VARCHAR(50) NOT NULL DEFAULT '지원완료' COMMENT '진행상태',
  memo TEXT NULL COMMENT '메모 및 특이사항',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '데이터 생성 일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 초기 테스트용 샘플 데이터 삽입 (선택 사항)
INSERT INTO job_applications (company, position, job_url, applied_date, status, memo)
VALUES 
  ('토스 (비바리퍼블리카)', '프론트엔드 개발자', 'https://toss.im/career', '2026-03-01', '서류합격', '1차 직무 인터뷰 준비 (과제 전형 합격 후 일정 확정)'),
  ('네이버', '웹 프론트엔드 엔지니어', 'https://recruit.navercorp.com', '2026-03-03', '지원완료', '포트폴리오 및 기술 블로그 링크 제출');
