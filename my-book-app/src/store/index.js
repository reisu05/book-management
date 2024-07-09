import { createStore } from 'vuex';

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
  },
});
