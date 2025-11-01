import { createApp } from "vue";
import "./assets/stylesheets/tailwind.css";
import "./assets/stylesheets/style.scss";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(router);

app.mount("#app");
