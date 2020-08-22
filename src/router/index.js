import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const routers = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/login')
  },
  {
    path: '/index',
    name: 'index',
    component: () => import('@/views/home/index'),
    children: [
      {
        path: '/index/home',
        name: 'home',
        component: () => import('@/views/home/home')
      },
      {
        path: '/index/userList',
        name: 'userList',
        component: () => import('@/views/user/userList')
      },
      {
        path: '/index/menuList',
        name: 'menuList',
        component: () => import('@/views/menu/menuList')
      },
      {
        path: '/index/flowList',
        name: 'workflow',
        component: () => import('@/views/workflow/index')
      },
      {
        path: '/index/applyList',
        name: 'applyList',
        component: () => import('@/views/leave/applyList')
      },
      {
        path: '/index/processCenter',
        name: 'approveList',
        component: () => import('@/views/leave/approveList')
      }
    ]
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
    let userInfo = localStorage.getItem('UserInfo')
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
