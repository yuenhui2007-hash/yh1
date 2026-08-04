const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const { get, all, run } = require('../db');
const router = express.Router();

router.post('/create-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', plan } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      metadata: { plan }
    });
    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment intent creation failed' });
  }
});

router.post('/record', async (req, res) => {
  try {
    const { userId, paymentIntentId, amount, currency, plan, status } = req.body;
    const result = await run(
      'INSERT INTO payments (user_id, stripe_payment_intent_id, amount, currency, plan, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, paymentIntentId, amount, currency, plan, status]
    );
    res.status(201).json({ message: 'Payment recorded', paymentId: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const payments = await all('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

module.exports = router;
