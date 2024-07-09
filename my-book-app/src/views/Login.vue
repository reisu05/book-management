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
  <div>
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<style scoped>
/* スタイルは必要に応じて追加 */
</style>
