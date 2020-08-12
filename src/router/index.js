import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/views/login/login'

Vue.use(Router)

const routers = [{
  path: '/login',
  name: 'login',
  component: Login
}]

const router = new Router({
  routes: routers,
  mode: 'history'
})

export default router
