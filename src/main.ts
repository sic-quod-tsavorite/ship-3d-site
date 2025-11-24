// Imports
import { createApp, type Component } from "vue";
import { createPinia } from "pinia";

// Project imports
import "./assets/stylesheets/tailwind.css";
import "./assets/stylesheets/style.scss";
import App from "./App.vue";
import router from "./router";

const app = createApp(App as Component);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount("#app");
