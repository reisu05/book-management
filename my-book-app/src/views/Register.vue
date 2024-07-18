<template>
  <div class="container">
    <h1>Register</h1>
    <form @submit.prevent="register">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div class="form-group">
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
.container {
  background-color: white;
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
.input {
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
</style>
