import { createApp } from 'vue';
import { createVfm } from 'vue-final-modal';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './styles/global.scss';
import 'vue-final-modal/style.css';

const app = createApp(App);
const vfm = createVfm();
const pinia = createPinia();

app.use(router);
app.use(vfm);
app.use(pinia);

app.mount('#app');
