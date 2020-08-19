import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    UserInfo: localStorage.getItem('UserInfo') ? JSON.parse(localStorage.getItem('UserInfo')) : ''
  },
  mutations: {
    setUserInfo (state, user) {
      state.UserInfo = user[0].UserInfo
      localStorage.setItem('UserInfo', JSON.stringify(user[0].UserInfo))
    }
  }
})
