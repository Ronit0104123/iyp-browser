import { createRouter, createWebHistory } from "vue-router";
import BrowserView from "../views/BrowserView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: BrowserView,
    },
  ],
});

export default router;
