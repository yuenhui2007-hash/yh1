const express = require('express');
const { get, all, run } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    let sql = 'SELECT * FROM courses WHERE status = ?';
    let params = ['active'];
    
    if (category) { sql += ' AND category = ?'; params.push(category); }
    if (difficulty) { sql += ' AND difficulty = ?'; params.push(difficulty); }
    
    const courses = await all(sql, params);
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await get('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ course });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

router.post('/:id/enroll', async (req, res) => {
  try {
    const { userId } = req.body;
    const existing = await get('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, req.params.id]);
    if (existing) return res.status(409).json({ error: 'Already enrolled' });
    
    const result = await run('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)', [userId, req.params.id]);
    res.status(201).json({ message: 'Enrolled successfully', enrollmentId: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Enrollment failed' });
  }
});

router.patch('/:id/progress', async (req, res) => {
  try {
    const { userId, progress } = req.body;
    const completedAt = progress >= 100 ? new Date().toISOString() : null;
    
    await run('UPDATE enrollments SET progress = ?, status = ?, completed_at = ? WHERE user_id = ? AND course_id = ?',
      [progress, progress >= 100 ? 'completed' : 'in_progress', completedAt, userId, req.params.id]);
    
    res.json({ message: 'Progress updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

module.exports = router;
