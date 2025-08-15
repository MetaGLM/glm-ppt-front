import Vue from 'vue'
import VueRouter from 'vue-router'
import AgentTrial from '@/views/TrialCenter/AgentTrial/Index.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'Home',
      component: AgentTrial
    }
  ]
})

export default router
