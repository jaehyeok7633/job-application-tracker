const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 등록
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 프론트엔드 정적 파일 서빙 (index.html, style.css, app.js)
app.use(express.static(path.join(__dirname)));

/**
 * 1. GET /api/applications
 * 전체 지원 내역 조회 (지원일 내림차순 정렬)
 */
app.get('/api/applications', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, company, position, job_url, applied_date, status, memo, created_at FROM job_applications ORDER BY applied_date DESC, id DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('GET /api/applications 에러:', error);
    res.status(500).json({ error: '지원 내역 목록을 조회하지 못했습니다.' });
  }
});

/**
 * 2. POST /api/applications
 * 신규 지원 내역 등록
 */
app.post('/api/applications', async (req, res) => {
  try {
    const { company, position, job_url, applied_date, status, memo } = req.body;

    if (!company || !position || !applied_date) {
      return res.status(400).json({ error: '회사명, 직무, 지원일은 필수 입력 항목입니다.' });
    }

    const [result] = await pool.query(
      'INSERT INTO job_applications (company, position, job_url, applied_date, status, memo) VALUES (?, ?, ?, ?, ?, ?)',
      [company, position, job_url || null, applied_date, status || '지원완료', memo || null]
    );

    const [newRow] = await pool.query(
      'SELECT id, company, position, job_url, applied_date, status, memo, created_at FROM job_applications WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newRow[0]);
  } catch (error) {
    console.error('POST /api/applications 에러:', error);
    res.status(500).json({ error: '지원 내역 등록에 실패했습니다.' });
  }
});

/**
 * 3. PUT /api/applications/:id
 * 지원 내역 수정
 */
app.put('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company, position, job_url, applied_date, status, memo } = req.body;

    if (!company || !position || !applied_date) {
      return res.status(400).json({ error: '회사명, 직무, 지원일은 필수 입력 항목입니다.' });
    }

    const [result] = await pool.query(
      'UPDATE job_applications SET company = ?, position = ?, job_url = ?, applied_date = ?, status = ?, memo = ? WHERE id = ?',
      [company, position, job_url || null, applied_date, status || '지원완료', memo || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '수정할 지원 내역을 찾을 수 없습니다.' });
    }

    const [updatedRow] = await pool.query(
      'SELECT id, company, position, job_url, applied_date, status, memo, created_at FROM job_applications WHERE id = ?',
      [id]
    );

    res.json(updatedRow[0]);
  } catch (error) {
    console.error(`PUT /api/applications/${req.params.id} 에러:`, error);
    res.status(500).json({ error: '지원 내역 수정에 실패했습니다.' });
  }
});

/**
 * 4. DELETE /api/applications/:id
 * 지원 내역 삭제
 */
app.delete('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM job_applications WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '삭제할 지원 내역을 찾을 수 없습니다.' });
    }

    res.json({ message: '성공적으로 삭제되었습니다.', id: Number(id) });
  } catch (error) {
    console.error(`DELETE /api/applications/${req.params.id} 에러:`, error);
    res.status(500).json({ error: '지원 내역 삭제에 실패했습니다.' });
  }
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`Job Application Tracker 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
