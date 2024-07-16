<template>
  <div>
    <h1>Book Management</h1>
    <form @submit.prevent="addBook" class="form">
      <div class="form-group">
        <label for="title">Title:</label>
        <input type="text" v-model="title" required />
      </div>
      <div class="form-group">
        <label for="genre">Genre:</label>
        <select v-model="genre" required>
          <option disabled value="">Please select one</option>
          <option
            v-for="genreOption in genreOptions"
            :key="genreOption"
            :value="genreOption"
          >
            {{ genreOption }}
          </option>
        </select>
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
          <th>Genre</th>
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
          <td>{{ book.genre }}</td>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
  setup() {
    const title = ref('');
    const startDate = ref('');
    const endDate = ref('');
    const rating = ref('');
    const thoughts = ref('');
    const books = ref([]);
    const message = ref('');
    const genre = ref('');
    const genreOptions = ref([
      '文学、評論',
      'ノンフィクション',
      'ビジネス、経済',
      '歴史、地理',
      '政治、社会',
      '芸能、エンターテイメント',
      'アート、建築、デザイン',
      '人文、思想、宗教',
      '暮らし、健康、料理',
      'サイエンス、テクノロジー',
      '趣味、実用',
      'スポーツ、アウトドア',
      'コミックス',
    ]);

    const router = useRouter();
    const store = useStore();

    const checkTokenAndRedirect = () => {
      store.dispatch('checkToken');
      if (!store.getters.isLoggedIn) {
        router.push('/login');
      }
    };

    onMounted(async () => {
      checkTokenAndRedirect();
      await fetchBooks();
    });

    const addBook = async () => {
      checkTokenAndRedirect();
      if (!store.getters.isLoggedIn) return;

      const start = new Date(startDate.value);
      const end = new Date(endDate.value);
      if (start <= end) {
        const book = {
          title: title.value,
          startDate: startDate.value,
          endDate: endDate.value,
          rating: rating.value,
          thoughts: thoughts.value,
          genre: genre.value,
        };
        try {
          const token = localStorage.getItem('token');
          const response = await axios.post(
            'http://localhost:5000/books',
            { book },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          message.value = response.data;
          books.value.push(book);
        } catch (error) {
          message.value = error.response.data;
        }
        title.value = '';
        startDate.value = '';
        endDate.value = '';
        rating.value = '';
        thoughts.value = '';
        genre.value = '';
      } else {
        message.value =
          'End Dateに無効な値が入力されています。Start Dateより過去の日付を入力してください';
      }
    };

    const deleteBook = async (index) => {
      checkTokenAndRedirect();
      if (!store.getters.isLoggedIn) return;

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
        message.value = response.data;
        books.value.splice(index, 1);
      } catch (error) {
        message.value = error.response.data;
      }
    };

    const fetchBooks = async () => {
      checkTokenAndRedirect();
      if (!store.getters.isLoggedIn) return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/books', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        books.value = response.data.map((book) => ({
          ...book,
          startDate: book.start_date
            ? new Date(book.start_date).toLocaleDateString()
            : '',
          endDate: book.end_date
            ? new Date(book.end_date).toLocaleDateString()
            : '',
        }));
      } catch (error) {
        message.value = error.response.data;
      }
    };

    return {
      title,
      startDate,
      endDate,
      rating,
      thoughts,
      books,
      message,
      genre,
      genreOptions,
      addBook,
      deleteBook,
      fetchBooks,
    };
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
.form-group textarea,
.form-group select {
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
