const express = require('express');
const { get, all, run } = require('../db');
const router = express.Router();

router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { userId, plan, amount, currency = 'usd', status = 'pending', billingPeriod, seats } = req.body;
    const result = await run(
      'INSERT INTO orders (user_id, plan, amount, currency, status, billing_period, seats) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, plan, amount, currency, status, billingPeriod, seats]
    );
    res.status(201).json({ message: 'Order created', orderId: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

module.exports = router;
