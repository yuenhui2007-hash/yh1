const express = require('express');
const { get, all, run } = require('../db');
const router = express.Router();

const ADMIN_KEY = process.env.ADMIN_KEY || 'jaslearn-admin-2024';

function adminAuth(req, res, next) {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.use(adminAuth);

router.get('/stats', async (req, res) => {
  try {
    const users = await get('SELECT COUNT(*) as c FROM users');
    const orders = await get('SELECT COUNT(*) as c FROM orders');
    const revenue = await get('SELECT COALESCE(SUM(amount),0) as c FROM payments WHERE status="succeeded"');
    const pending = await get('SELECT COUNT(*) as c FROM orders WHERE status="pending"');
    res.json({ users: users.c, orders: orders.c, revenue: revenue.c, pending: pending.c });
  } catch (err) {
    res.status(500).json({ error: 'Stats failed' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await all('SELECT id, email, first_name, last_name, company, role, created_at FROM users ORDER BY id DESC');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await all('SELECT * FROM orders ORDER BY id DESC');
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

router.get('/payments', async (req, res) => {
  try {
    const payments = await all('SELECT * FROM payments ORDER BY id DESC');
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const logs = await all('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 200');
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;
