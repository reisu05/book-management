import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

const app = createApp(App);

app.use(router);
app.use(store);

// アプリケーションのロード時にトークンの有効期限をチェック
//store.dispatch('checkToken');

app.mount('#app');
