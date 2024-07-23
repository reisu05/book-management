const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg'); // PostgreSQL用にpgパッケージを使用
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 5000;

// JWT秘密鍵
const JWT_SECRET = process.env.JWT_SECRET;

app.use(bodyParser.json());
app.use(cors());

// PostgreSQLデータベース接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the PostgreSQL database.');
});

// ユーザー登録
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const sql = 'INSERT INTO users (email, password) VALUES ($1, $2)';
  try {
    await pool.query(sql, [email, password]);
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '60s' });
    res.status(201).json({ token });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).send('User already exists');
    }
    console.error('Error registering user:', err);
    res.status(500).send('Server error');
  }
});

// ログイン
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = $1 AND password = $2';
  try {
    const results = await pool.query(sql, [email, password]);
    if (results.rows.length > 0) {
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '60s' });
      res.status(200).json({ token });
    } else {
      res.status(400).send('Invalid email or password');
    }
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).send('Server error');
  }
});

// JWT認証ミドルウェア
const authenticateJWT = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// 書籍登録
app.post('/books', authenticateJWT, async (req, res) => {
  const { book } = req.body;
  const email = req.user.email;
  const sqlGetUserId = 'SELECT id FROM users WHERE email = $1';
  try {
    const userResult = await pool.query(sqlGetUserId, [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).send('User not found');
    }
    const userId = userResult.rows[0].id;
    const sqlInsertBook = `
      INSERT INTO books (user_id, id, title, start_date, end_date, rating, thoughts, genre)
      VALUES ($1, (SELECT COALESCE(MAX(id), 0) + 1 FROM books WHERE user_id = $1), $2, $3, $4, $5, $6, $7)
    `;
    await pool.query(sqlInsertBook, [
      userId,
      book.title,
      book.start_date,
      book.end_date,
      book.rating,
      book.thoughts,
      book.genre,
    ]);
    res.status(201).send('Book added');
  } catch (err) {
    console.error('Error adding book:', err);
    res.status(500).send('Server error');
  }
});

// 書籍取得
app.get('/books', authenticateJWT, async (req, res) => {
  const email = req.user.email;
  const sqlGetUserId = 'SELECT id FROM users WHERE email = $1';
  try {
    const userResult = await pool.query(sqlGetUserId, [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).send('User not found');
    }
    const userId = userResult.rows[0].id;
    const sqlGetBooks = 'SELECT * FROM books WHERE user_id = $1';
    const bookResults = await pool.query(sqlGetBooks, [userId]);
    res.status(200).json(bookResults.rows);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).send('Server error');
  }
});

// 書籍削除
app.delete('/books', authenticateJWT, async (req, res) => {
  const { bookIndex } = req.body;
  const email = req.user.email;
  const sqlGetUserId = 'SELECT id FROM users WHERE email = $1';
  try {
    const userResult = await pool.query(sqlGetUserId, [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).send('User not found');
    }
    const userId = userResult.rows[0].id;
    const sqlGetBooks = 'SELECT * FROM books WHERE user_id = $1';
    const bookResults = await pool.query(sqlGetBooks, [userId]);
    if (bookResults.rows.length <= bookIndex) {
      return res.status(400).send('Invalid book index');
    }
    const bookId = bookResults.rows[bookIndex].id;
    const sqlDeleteBook = 'DELETE FROM books WHERE user_id = $1 AND id = $2';
    await pool.query(sqlDeleteBook, [userId, bookId]);
    res.status(200).send('Book deleted');
  } catch (err) {
    console.error('Error deleting book:', err);
    res.status(500).send('Server error');
  }
});

// ジャンル別データ取得
app.get('/books/genre-stats', authenticateJWT, async (req, res) => {
  const email = req.user.email;
  const sqlGetUserId = 'SELECT id FROM users WHERE email = $1';
  try {
    const userResult = await pool.query(sqlGetUserId, [email]);
    const userId = userResult.rows[0].id;
    const sqlGenreStats = `
      SELECT genre, COUNT(*) as count 
      FROM books 
      WHERE user_id = $1 
      GROUP BY genre
    `;
    const genreStatsResult = await pool.query(sqlGenreStats, [userId]);
    res.status(200).json(genreStatsResult.rows);
  } catch (err) {
    console.error('Error fetching genre stats:', err);
    res.status(500).send('Server error');
  }
});

// 月別データ取得
app.get('/books/month-stats', authenticateJWT, async (req, res) => {
  const email = req.user.email;
  const sqlGetUserId = 'SELECT id FROM users WHERE email = $1';
  try {
    const userResult = await pool.query(sqlGetUserId, [email]);
    const userId = userResult.rows[0].id;
    const sqlMonthStats = `
      SELECT TO_CHAR(start_date, 'YYYY-MM') as month, COUNT(*) as count 
      FROM books 
      WHERE user_id = $1 
      GROUP BY month
      ORDER BY month
    `;
    const monthStatsResult = await pool.query(sqlMonthStats, [userId]);
    res.status(200).json(monthStatsResult.rows);
  } catch (err) {
    console.error('Error fetching month stats:', err);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
