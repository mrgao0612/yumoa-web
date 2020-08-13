import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    Authorization: localStorage.getItem('Authorization') ? localStorage.getItem('Authorization') : ''
  },
  mutations: {
    setToken (state, user) {
      state.Authorization = user[0].Authorization
      localStorage.setItem('Authorization', user[0].Authorization)
    }
  }
})
