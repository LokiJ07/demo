require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Demo users table: id, first_name, last_name, email, password, role

// Register demo users (optional)
app.post('/register', async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from('users').insert([{ first_name, last_name, email, password: hashed, role }]);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'User registered', data });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  const { data: user, error } = await supabase.from('users').select('*').eq('email', email).eq('role', role).single();
  if (error || !user) return res.status(400).json({ error: 'User not found' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Wrong password' });
  res.json({ message: 'Login successful', user });
});

// Get all users (admin)
app.get('/users', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.listen(3000, () => console.log('Server running on port 3000'));
