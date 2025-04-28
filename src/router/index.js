import { createRouter, createWebHistory, RouterView } from "vue-router";
import BrowserView from "@/views/BrowserView.vue";
import EmbedView from "@/views/EmbedView.vue";
import PageNotFoundView from "@/views/PageNotFoundView.vue";

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
          path: "embed",
          name: "embed",
          component: EmbedView,
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "page-not-found",
      component: PageNotFoundView,
    },
  ],
});

export default router;
