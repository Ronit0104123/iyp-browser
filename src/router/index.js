import { createRouter, createWebHistory, RouterView } from "vue-router";
import BrowserView from "@/views/BrowserView.vue";
import EmbedView from "@/views/EmbedView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: RouterView,
      children: [
        {
          path: "",
          name: "home",
          component: BrowserView,
        },
        {
          path: "embed/:query",
          name: "embed",
          component: EmbedView,
        },
      ],
    },
  ],
});

export default router;
