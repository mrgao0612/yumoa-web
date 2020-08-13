import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/login/login'
import Home from '@/views/home/home'

Vue.use(Router)

const routers = [
  {
    path: '/login',
    name: 'login',
    component: Login
  }, {
    path: '/home',
    name: 'home',
    component: Home
  }
]

const router = new Router({
  routes: routers,
  mode: 'history'
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    next()
  } else {
    let userInfo = localStorage.getItem('Authorization')
    if (userInfo === 'undefined' || userInfo === '' || userInfo === null) {
      next({
        path: '/login',
        query: {redirect: to.fullPath}
      })
    } else {
      next()
    }
  }
})

export default router
