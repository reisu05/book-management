<template>
  <div>
    <h1>Book Management</h1>
    <form @submit.prevent="addBook" class="form">
      <div class="form-group">
        <label for="title">Title:</label>
        <input type="text" v-model="title" required />
      </div>
      <div class="form-group">
        <label for="startDate">Start Date:</label>
        <input type="date" v-model="startDate" required />
      </div>
      <div class="form-group">
        <label for="endDate">End Date:</label>
        <input type="date" v-model="endDate" required />
      </div>
      <div class="form-group">
        <label for="rating">Rating:</label>
        <input type="number" v-model="rating" min="1" max="5" required />
      </div>
      <div class="form-group">
        <label for="thoughts">Thoughts:</label>
        <textarea v-model="thoughts" required></textarea>
      </div>
      <button type="submit">Add Book</button>
    </form>
    <p v-if="message">{{ message }}</p>
    <table class="book-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Rating</th>
          <th>Thoughts</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(book, index) in books" :key="index">
          <td>{{ book.title }}</td>
          <td>{{ book.startDate }}</td>
          <td>{{ book.endDate }}</td>
          <td>{{ book.rating }}</td>
          <td>{{ book.thoughts }}</td>
          <td>
            <button @click="deleteBook(index)" class="delete-button">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  data() {
    return {
      title: '',
      startDate: '',
      endDate: '',
      rating: '',
      thoughts: '',
      books: [],
      message: '',
    };
  },
  setup() {
    const router = useRouter();

    // ログイン状態を確認する
    if (!localStorage.getItem('token')) {
      router.push('/login');
    }
  },

  async created() {
    await this.fetchBooks();
  },
  methods: {
    async addBook() {
      // 入力された日付をDateオブジェクトに変換
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      if (start <= end) {
        const book = {
          title: this.title,
          startDate: this.startDate,
          endDate: this.endDate,
          rating: this.rating,
          thoughts: this.thoughts,
        };
        try {
          const token = localStorage.getItem('token');
          const response = await axios.post(
            'http://localhost:5000/books',
            {
              book,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          this.message = response.data;
          this.books.push(book);
        } catch (error) {
          this.message = error.response.data;
        }
        this.title = '';
        this.startDate = '';
        this.endDate = '';
        this.rating = '';
        this.thoughts = '';
      } else {
        this.message =
          'End Dateに無効な値が入力されています。Start Dateより過去の日付を入力してください';
      }
    },
    async deleteBook(index) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete('http://localhost:5000/books', {
          data: {
            bookIndex: index,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.message = response.data;
        this.books.splice(index, 1);
      } catch (error) {
        this.message = error.response.data;
      }
    },
    async fetchBooks() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/books', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.books = response.data;
      } catch (error) {
        this.message = error.response.data;
      }
    },
  },
};
</script>

<style scoped>
/* 全体の背景色 */
body {
  background-color: #f0f4f8;
  font-family: 'Arial', sans-serif;
}

/* コンテナスタイル */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* タイトルスタイル */
h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

/* フォームスタイル */
.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group textarea {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
}

/* ボタンスタイル */
button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}

button:hover {
  background-color: #0056b3;
}

/* テーブルスタイル */
.book-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 20px auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
}

.book-table th,
.book-table td {
  border-bottom: 1px solid #ddd;
  padding: 12px 15px;
  text-align: left;
}

.book-table th {
  background-color: #e2e6ea;
  font-weight: bold;
  color: #333;
}

.book-table tbody tr {
  transition: background-color 0.2s;
}

.book-table tbody tr:hover {
  background-color: #f1f1f1;
}

.book-table .delete-button {
  padding: 5px 10px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.book-table .delete-button:hover {
  background-color: #c82333;
}
</style>
