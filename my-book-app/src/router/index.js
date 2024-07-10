import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Register from '../views/Register.vue';
import Login from '../views/Login.vue';
import store from '../store'; // Vuexストアのインポート

const routes = [
  { path: '/', component: Home },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ナビゲーションガードの設定
router.beforeEach((to, from, next) => {
  const isLoggedIn = store.getters.isLoggedIn; // Vuexのゲッターを使用してログイン状態を取得

  if (to.path !== '/login' && to.path !== '/register' && !isLoggedIn) {
    next('/login'); // ログインしていない場合、ログインページにリダイレクト
    alert('不正アクセスですログインしてください');
  } else {
    next(); // それ以外の場合は次のルートへ
  }
});

export default router;
