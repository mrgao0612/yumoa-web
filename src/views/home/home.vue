<template>
  <div class="home">
    <el-container>
      <el-aside class="home-side home-side-left" :class="isCollapsed ? 'home-side-collapsed' : 'home-side-expanded'">
        <div class="home-side-logo">
          <img src="@/assets/logo.png" :width="isCollapsed ? '60' : '60'" height="60" alt="logo"/>
        </div>
        <div>
          <el-menu default-active="1-4-1" class="el-menu-vertical-demo" @open="handleOpen" :collapse="isCollapsed">
            <el-submenu index="1">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span slot="title">导航一</span>
              </template>
              <el-menu-item-group>
                <span slot="title">分组一</span>
                <el-menu-item index="1-1">选项一</el-menu-item>
                <el-menu-item index="1-2">选项二</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <span slot="title">分组二</span>
                <el-menu-item index="1-3">选项三</el-menu-item>
              </el-menu-item-group>
              <el-submenu index="1-4">
                <span slot="title">选项4</span>
                <el-menu-item index="1-4-1">选项一</el-menu-item>
              </el-submenu>
            </el-submenu>
            <el-menu-item index="2">
              <i class="el-icon-menu"></i>
              <span slot="title">导航二</span>
            </el-menu-item>
            <el-menu-item index="3" disabled>
              <i class="el-icon-document"></i>
              <span slot="title">导航三</span>
            </el-menu-item>
            <el-menu-item index="4">
              <i class="el-icon-setting"></i>
              <span slot="title">导航四</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-aside>
      <el-container>
        <el-header class="home-header">
          <div style="width: 60px; cursor: pointer;" @click.prevent="toggleSideBar">
            <i v-show="!isCollapsed" class="el-icon-d-arrow-left"></i>
            <i v-show="isCollapsed" class="el-icon-d-arrow-right"></i>
          </div>
          <el-menu default-active="1" class="el-menu-demo tab-page" mode="horizontal"
                   @select="handleSelect" active-text-color="#409EFF">
            <el-menu-item index="1">处理中心</el-menu-item>
            <el-submenu index="2">
              <template slot="title">我的工作台</template>
              <el-menu-item index="2-1">选项1</el-menu-item>
              <el-menu-item index="2-2">选项2</el-menu-item>
              <el-menu-item index="2-3">选项3</el-menu-item>
              <el-submenu index="2-4">
                <template slot="title">选项4</template>
                <el-menu-item index="2-4-1">选项1</el-menu-item>
                <el-menu-item index="2-4-2">选项2</el-menu-item>
                <el-menu-item index="2-4-3">选项3</el-menu-item>
              </el-submenu>
            </el-submenu>
            <el-menu-item index="3" disabled>消息中心</el-menu-item>
          </el-menu>
          <div class="home-header-userinfo">
            <el-dropdown trigger="hover" :hide-on-click="false">
              <span class="el-dropdown-link">
                {{ username }}
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>我的消息</el-dropdown-item>
                <el-dropdown-item>设置</el-dropdown-item>
                <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="home-body">
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
  name: 'Home',
  data () {
    return {
      username: '',
      isCollapsed: false
    }
  },
  methods: {
    toggleSideBar () {
      this.isCollapsed = !this.isCollapsed
    },
    logout: () => {
      this.$confirm('确认退出？', '提示', {}).then(() => {
        sessionStorage.removeItem('Authorization')
        sessionStorage.removeItem('UserInfo')
        this.$router.push('/login')
      }).catch(() => {})
    },
    handleOpen (key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose (key, keyPath) {
      console.log(key, keyPath)
    },
    handleSelect (key, keyPath) {
      console.log(key, keyPath)
    }
  },
  mounted: function () {
    let userInfo = sessionStorage.getItem('Authorization')
    console.log(userInfo)
    if (userInfo) {
      this.username = userInfo['username']
    }
  }
}
</script>

<style scoped>

</style>
