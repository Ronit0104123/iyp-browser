import { createRouter, createWebHistory } from "vue-router";
import BrowserView from "../views/BrowserView.vue";
import OutputPanel from "../components/OutputPanel.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: BrowserView,
    },
    {
      path: "/iframe",
      name: "IframeOutputPanel",
      component: OutputPanel,
      props: route => ({
        query: route.query.q,
        queryTypeInput: route.query.type
      })
    },
    {
      path: "/share",
      name: "ShareView",
      component: OutputPanel,
      props: route => ({
        query: route.query.q,
        queryTypeInput: route.query.type
      })
    }
  ],
});

export default router;
