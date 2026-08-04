const express = require('express');
const { get, all } = require('../db');
const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = (await get('SELECT COUNT(*) as count FROM users')).count;
    const totalCourses = (await get('SELECT COUNT(*) as count FROM courses')).count;
    const totalEnrollments = (await get('SELECT COUNT(*) as count FROM enrollments')).count;
    const completedEnrollments = (await get('SELECT COUNT(*) as count FROM enrollments WHERE status = ?', ['completed'])).count;
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
    const recentUsers = (await get('SELECT COUNT(*) as count FROM users WHERE created_at >= date("now", "-7 days")')).count;
    
    res.json({
      stats: { totalUsers, totalCourses, totalEnrollments, completedEnrollments, completionRate, recentUsers }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.get('/activity', async (req, res) => {
  try {
    const logs = await all('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50');
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

module.exports = router;
