import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { Quasar } from "quasar";
import { Neo4jApi } from "@/plugins/Neo4jApi";
import { LlmApi } from "@/plugins/LlmApi";

import "@quasar/extras/roboto-font/roboto-font.css";
import "@quasar/extras/material-icons/material-icons.css";

import "quasar/dist/quasar.css";

const app = createApp(App);

app.use(router);
app.use(Quasar, {
  plugins: {},
});
app.use(Neo4jApi);
app.use(LlmApi);

app.mount("#app");
