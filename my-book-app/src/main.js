import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

const app = createApp(App);

app.use(router);
app.use(store);

// アプリケーションのロード時にトークンの有効期限をチェックここでの挙動の違いを把握する
//store.dispatch('checkToken');

app.mount('#app');
