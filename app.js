require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const users = []; 
const schedules = []; 

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post('/users/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = { name: req.body.name, password: hashedPassword };
    users.push(user);
    res.status(201).send('User created');
  } catch {
    res.status(500).send();
  }
});

app.post('/users/login', async (req, res) => {
  const user = users.find(user => user.name === req.body.name);
  if (user == null) {
    return res.status(400).send('Cannot find user');
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      res.json({ accessToken: accessToken });
    } else {
      res.send('Not Allowed');
    }
  } catch {
    res.status(500).send();
  }
});

app.get('/schedules', authenticateToken, (req, res) => {
  res.json(schedules);
});

app.post('/schedules', authenticateToken, (req, res) => {
  const schedule = { user: req.user.name, description: req.body.description };
  schedules.push(schedule);
  res.status(201).send('Schedule created');
});

app.post('/notifications', authenticateToken, (req, res) => {
  console.log(`Notification for user ${req.user.name}: ${req.body.message}`);
  res.status(200).send('Notification sent');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});