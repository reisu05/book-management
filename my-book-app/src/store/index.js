import { createStore } from 'vuex';
import { jwtDecode } from 'jwt-decode';

export default createStore({
  state: {
    token: localStorage.getItem('token') || null,
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    login({ commit }, token) {
      commit('setToken', token);
    },
    logout({ commit }) {
      commit('setToken', null);
    },
    checkToken({ commit }) {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decodedToken.exp < now) {
          commit('setToken', null); // トークンが期限切れの場合は削除する
        }
      }
    },
  },
});
