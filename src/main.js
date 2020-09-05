// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import store from './store'
import './styles/index.scss'
import WebSocket from 'vue-native-websocket'
import twemoji from 'twemoji'

Vue.use(ElementUI)
Vue.use(WebSocket, 'ws://localhost:8989/ws', {
  reconnection: true, // (Boolean)是否自动重连，默认false
  reconnectionAttempts: 5, // 重连次数
  reconnectionDelay: 3000 // 再次重连等待时常
})

Vue.config.productionTip = false
Vue.prototype.$axios = axios
Vue.directive('emoji', {
  inserted (el) {
    el.innerHTML = twemoji.parse(el.innerHTML)
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  store
})

axios.interceptors.request.use(config => {
  if (config.url !== '/api/login') {
    let userInfo = localStorage.getItem('UserInfo')
    if (userInfo) {
      config.headers.Authorization = JSON.parse(userInfo)['token']
    }
  }
  return config
}, err => {
  return Promise.reject(err)
})

axios.interceptors.response.use(res => {
  return res
}, err => {
  if (err.response) {
    switch (err.response.status) {
      case 401:
        localStorage.removeItem('UserInfo')
        this.$router.push('/login')
    }
  }
})
