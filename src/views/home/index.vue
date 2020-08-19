<template>
  <div class="index">
    <el-container>
      <el-aside class="index-side index-side-left" :class="isCollapsed ? 'index-side-collapsed' : 'index-side-expanded'">
        <div class="index-side-logo">
          <img src="@/assets/logo.png" :width="isCollapsed ? '60' : '60'" height="60" alt="logo"/>
        </div>
        <div>
          <el-menu :default-active="defaultActive" router class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" :collapse="isCollapsed">
            <el-menu-item index="/index/home">
              <i class="el-icon-info"></i>
              <span slot="title">首页</span>
            </el-menu-item>
            <el-submenu v-for="navItem in navList" :index="navItem.path" v-bind:key="navItem.id" v-bind:disabled="navItem.disabled">
              <template slot="title">
                <i v-bind:class="navItem.icon"></i>
                <span slot="title">{{ navItem.menuName }}</span>
              </template>
              <el-menu-item v-for="childNav in navItem.childNavList" :index="childNav.path" v-bind:key="childNav.id" v-bind:disabled="navItem.disabled">
                {{ childNav.menuName }}
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </div>
      </el-aside>
      <el-container>
        <el-header class="index-header">
          <div style="width: 60px; cursor: pointer;" @click.prevent="toggleSideBar">
            <i v-show="!isCollapsed" class="el-icon-d-arrow-left"></i>
            <i v-show="isCollapsed" class="el-icon-d-arrow-right"></i>
          </div>
          <el-menu class="el-menu-demo tab-page" mode="horizontal"
                   @select="handleSelect" active-text-color="#409EFF">
            <el-menu-item index="1">处理中心</el-menu-item>
            <el-submenu index="2">
              <template slot="title">我的工作台</template>
              <el-menu-item index="2-1">选项1</el-menu-item>
              <el-menu-item index="2-2">选项2</el-menu-item>
              <el-menu-item index="2-3">选项3</el-menu-item>
            </el-submenu>
          </el-menu>
          <div class="index-header-userinfo">
            <el-dropdown trigger="hover" :hide-on-click="false">
              <span class="el-dropdown-link">
                {{ username }}
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>我的消息</el-dropdown-item>
                <el-dropdown-item>我的主页</el-dropdown-item>
                <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="index-body">
          <template>
            <router-view />
          </template>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'index',
  data () {
    return {
      defaultActive: '/index/home',
      username: '',
      isCollapsed: false,
      navList: ''
    }
  },
  methods: {
    toggleSideBar () {
      this.isCollapsed = !this.isCollapsed
    },
    logout () {
      this.$confirm('确认退出？', '提示', {}).then(() => {
        localStorage.removeItem('UserInfo')
        this.$message.info('退出成功')
        this.$router.push('/login')
      }).catch(() => {})
    },
    handleOpen (key, keyPath) {
    },
    handleClose (key, keyPath) {
    },
    handleSelect (key, keyPath) {
    }
  },
  mounted: function () {
    let userInfo = JSON.parse(localStorage.getItem('UserInfo'))
    if (userInfo) {
      this.username = userInfo['username']
    }
    this.$axios({
      method: 'GET',
      url: '/api/menu/findNavList',
      data: '',
      headers: {
        'Authorization': userInfo['token']
      }
    }).then(res => {
      let data = res.data
      if (data && data['code'] === 200) {
        this.navList = data['data']
      }
    }).catch(() => {})
    this.defaultActive = this.$route.path
  }
}
</script>

<style scoped>

</style>
