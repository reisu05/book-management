<script>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const message = ref('');
    const router = useRouter();
    const store = useStore();

    const login = async () => {
      try {
        const response = await axios.post('http://localhost:5000/login', {
          email: email.value,
          password: password.value,
        });
        if (response.status === 200) {
          store.dispatch('login', response.data.token);
          router.push('/');
        }
      } catch (error) {
        message.value = error.response.data;
      }
    };

    return {
      email,
      password,
      message,
      login,
    };
  },
};
</script>

<template>
  <div class="container">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="message">{{ message }}</p>
    <a href="/register">会員登録がまだの方はお願いします。</a>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.form-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
}
input {
  display: block;
  width: 30%;
  padding: 10px;
  margin-top: 5px;
  box-sizing: border-box;
}
button {
  width: 30%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
a {
  display: block;
  margin-top: 15px;
  text-align: center;
  color: #007bff;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
</style>
