<template>
  <div>
    <h1>Register</h1>
    <form @submit.prevent="register">
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Register</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  data() {
    return {
      email: '',
      password: '',
      message: '',
    };
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    async register() {
      try {
        const response = await axios.post('http://localhost:5000/register', {
          email: this.email,
          password: this.password,
        });
        if (response.status === 201) {
          const token = response.data.token;
          localStorage.setItem('token', token);
          this.router.push('/');
        }
      } catch (error) {
        this.message = error.response.data;
      }
    },
  },
};
</script>

<style scoped>
/* スタイルは必要に応じて追加 */
</style>
