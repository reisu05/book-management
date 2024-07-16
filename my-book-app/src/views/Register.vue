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
import { useStore } from 'vuex';
import { ref } from 'vue';
export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const message = ref('');
    const router = useRouter();
    const store = useStore();
    const register = async () => {
      try {
        const response = await axios.post('http://localhost:5000/register', {
          email: email.value,
          password: password.value,
        });
        if (response.status === 201) {
          const token = response.data.token;
          store.dispatch('login', token);
          router.push('/');
        }
      } catch (error) {
        message.value = error.response.data;
      }
    };
    return { register, email, password, message };
  },
};
</script>

<style scoped>
/* スタイルは必要に応じて追加 */
</style>
