const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 5000;

// JWT秘密鍵
const JWT_SECRET = 'your_jwt_secret_key';

app.use(bodyParser.json());
app.use(cors());

// MySQLデータベース接続
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'g022c1048', // MySQLのパスワードを設定
  database: 'book_management',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

//追加
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
  db.query(sql, [email, password], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).send('User already exists');
      }
      console.error('Error registering user:', err);
      return res.status(500).send('Server error');
    }
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  });
});

//ログイン
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Error logging in:', err);
      return res.status(500).send('Server error');
    }
    if (results.length > 0) {
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ token });
    } else {
      res.status(400).send('Invalid email or password');
    }
  });
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

//書籍登録
app.post('/books', authenticateJWT, (req, res) => {
  const { book } = req.body;
  const email = req.user.email;
  const sqlGetUserId = 'SELECT id FROM users WHERE email = ?';
  db.query(sqlGetUserId, [email], (err, results) => {
    if (err) {
      console.error('Error fetching user ID:', err);
      return res.status(500).send('Server error');
    }
    if (results.length === 0) {
      return res.status(400).send('User not found');
    }
    const userId = results[0].id;
    const sqlInsertBook = `
          INSERT INTO books (user_id, id, title, start_date, end_date, rating, thoughts)
          VALUES (?,?, ?, ?, ?, ?, ?)
      `;
    db.query(
      sqlInsertBook,
      [
        userId,
        userId,
        book.title,
        book.startDate,
        book.endDate,
        book.rating,
        book.thoughts,
      ],
      (err, result) => {
        if (err) {
          console.error('Error adding book:', err);
          return res.status(500).send('Server error');
        }
        res.status(201).send('Book added');
      }
    );
  });
});

//書籍取得
app.get('/books', authenticateJWT, (req, res) => {
  const email = req.user.email;
  const sqlGetUserId = 'SELECT id FROM users WHERE email = ?';
  db.query(sqlGetUserId, [email], (err, results) => {
    if (err) {
      console.error('Error fetching user ID:', err);
      return res.status(500).send('Server error');
    }
    if (results.length === 0) {
      return res.status(400).send('User not found');
    }
    const userId = results[0].id;
    const sqlGetBooks = 'SELECT * FROM books WHERE user_id = ?';
    db.query(sqlGetBooks, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching books:', err);
        return res.status(500).send('Server error');
      }
      res.status(200).json(results);
      // console.log(results);
    });
  });
});

//データ削除

app.delete('/books', authenticateJWT, (req, res) => {
  const { bookIndex } = req.body;
  const email = req.user.email;
  console.log('メールアドレス' + req.user.email);
  const sqlGetUserId = 'SELECT id FROM users WHERE email = ?';
  db.query(sqlGetUserId, [email], (err, results) => {
    if (err) {
      console.error('Error fetching user ID:', err);
      return res.status(500).send('Server error');
    }
    if (results.length === 0) {
      return res.status(400).send('User not found');
    }
    console.log('data', results);
    const userId = results[0].id;
    console.log('ユーザーID', userId);
    const sqlGetBooks = 'SELECT * FROM books WHERE user_id = ?';
    db.query(sqlGetBooks, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching books:', err);
        return res.status(500).send('Server error');
      }
      if (results.length <= bookIndex) {
        return res.status(400).send('Invalid book index');
      }
      console.log('bookindex', bookIndex);
      const bookId = results[bookIndex].id;
      console.log('bookId', bookId);
      console.log(userId, bookId);
      const sqlDeleteBook = 'DELETE FROM books WHERE (user_id = ?) && (id = ?)';
      db.query(sqlDeleteBook, [userId, bookId], (err, result) => {
        if (err) {
          console.error('Error deleting book:', err);
          return res.status(500).send('Server error');
        }
        res.status(200).send('Book deleted');
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// app.get('/verify-token', authenticateJWT, (req, res) => {
//   res.status(200).send('Token is valid');
// });
