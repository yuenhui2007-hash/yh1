const express = require('express');
const { get, all, run } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await all('SELECT id, email, first_name, last_name, company, plan, role, status, created_at FROM users');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await get('SELECT id, email, first_name, last_name, company, plan, role, status, created_at FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { firstName, lastName, company, plan } = req.body;
    await run('UPDATE users SET first_name = ?, last_name = ?, company = ?, plan = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [firstName, lastName, company, plan, req.params.id]);
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
