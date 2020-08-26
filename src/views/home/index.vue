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
          <el-menu :default-active="onRoute" router class="el-menu-demo tab-page" mode="horizontal"
                   @select="handleSelect" active-text-color="#409EFF">
            <el-menu-item index="/index/processCenter">处理中心</el-menu-item>
            <el-submenu index="/workbench">
              <template slot="title">我的工作台</template>
              <el-menu-item index="/index/applyList">我的申请</el-menu-item>
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
            <div class="chat-box">
              <div class="msg-box" ref="msg-box">
                <div class="msg" v-for="(i,index) in list" :key="index"
                     :style="i.senderId === userId?'flex-direction:row-reverse':''">
                  <div class="user-head">
                    <div
                      class="head"
                      :style="`background: hsl(${getUserHead(i.senderId,'bck')}, 88%, 62%); clip-path:polygon(${getUserHead(i.senderId,'polygon')}% 0,100% 100%,0% 100%); transform: rotate(${getUserHead(i.senderId,'rotate')}deg)`"
                    ></div>
                  </div>
                  <div class="user-msg">
                    <span :style="i.senderId === userId?' float: right;':''"
                          :class="i.senderId === userId?'right':'left'">{{i.message}}</span>
                  </div>
                </div>
              </div>
              <div class="input-box">
                <el-input ref="sendMsg" v-model="contentText" @keyup.enter="sendMessage()"></el-input>
                <el-button class="btn" type="primary" @click="sendMessage()">发送</el-button>
              </div>
            </div>
          </template>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import protoRoot from '@/proto/proto.js'
const userInfo = JSON.parse(localStorage.getItem('UserInfo'))
export default {
  name: 'index',
  data () {
    return {
      defaultActive: '',
      username: '',
      isCollapsed: false,
      navList: '',
      list: [], // 聊天记录的数组
      contentText: '', // input输入的值
      userId: userInfo['id']
    }
  },
  computed: {
    onRoute () {
      return this.$route.path
    }
  },
  created () {
    this.initWebSocket()
    this.websocketOnopen()
  },
  destroyed () {
    // 页面销毁时关闭长连接
    this.websocketClose()
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
    },
    // 初始化websocket
    initWebSocket () {
      let _this = this
      _this.$socket.onopen = this.websocketOnopen // 连接成功方法
      _this.$socket.onerror = this.websocketOnerror // 报错方法
      _this.$socket.onmessage = this.websocketOnmessage // 接收端返回或推送信息的方法
      _this.$socket.onclose = this.websocketClose // 关闭
    },
    // 连接成功
    // 链接ws服务器，e.target.readyState = 0/1/2/3   0 CONNECTING ,1 OPEN, 2 CLOSING, 3 CLOSED
    websocketOnopen () {
      console.log('WebSocket连接成功')
      let _this = this
      let data = {
        cmd: 3,
        requestId: '' + userInfo['id'] + '',
        content: '连接成功'
      }
      _this.requestMessageEncoder({
        data: data,
        success: function (message) {
          _this.$socket.send(message)
        }
      })
    },
    // 接收后端返回的数据，可以根据需要进行处理
    websocketOnmessage (e) {
      let _this = this
      if (!e.data) { return }
      this.responseMessageDecoder({
        data: e.data,
        success: function (message) {
          _this.list.push(JSON.parse(message['content']))
        }
      })
    },
    websocketOnerror (e) {
      console.log('连接失败的信息：', e)
    },
    // 关闭连接
    websocketClose () {
      console.log('断开连接')
    },
    sendMessage () {
      let _this = this
      _this.$refs['sendMsg'].focus()
      let content = {
        senderId: '' + userInfo['id'] + '',
        receiverId: 2,
        message: _this.contentText
      }
      let data = {
        cmd: 0,
        requestId: '' + userInfo['id'] + '',
        content: JSON.stringify(content)
      }
      this.requestMessageEncoder({
        data: data,
        success: function (message) {
          _this.$socket.send(message)
          _this.contentText = ''
          setTimeout(() => {
            _this.scrollBottom()
          }, 300)
        }
      })
    },
    // 滚动条到底部
    scrollBottom () {
      let el = this.$refs['msg-box']
      el.scrollTop = el.scrollHeight
    },
    getUserHead (id, type) {
      let ID = String(id)
      if (type === 'bck') {
        return Number(ID.substring(ID.length - 3))
      }
      if (type === 'polygon') {
        return Number(ID.substring(ID.length - 2))
      }
      if (type === 'rotate') {
        return Number(ID.substring(ID.length - 3))
      }
    },
    requestMessageEncoder (obj) {
      let data = obj.data
      let success = obj.success // 成功的回调
      let complete = obj.complete // 成功或者失败都会回调
      let Message = protoRoot.lookupType('Message')
      // Exemplary payload
      let payload = data
      // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
      let errMsg = Message.verify(payload)
      if (errMsg) {
        if (typeof complete === 'function') {
          complete()
        }
        return
      }
      // Create a new message
      let message = Message.create(payload) // or use .fromObject if conversion is necessary
      // Encode a message to an Uint8Array (browser) or Buffer (node)
      let buffer = Message.encode(message).finish()
      if (typeof success === 'function') {
        success(buffer)
      }
      if (typeof complete === 'function') {
        complete()
      }
    },
    responseMessageDecoder (obj) {
      let data = obj.data
      let success = obj.success // 成功的回调
      let complete = obj.complete // 成功或者失败都会回调
      // Obtain a message type
      let Message = protoRoot.lookupType('Message')
      let reader = new FileReader()
      reader.readAsArrayBuffer(data)
      reader.onload = function (e) {
        let buf = new Uint8Array(reader.result)
        let responseUser = Message.decode(buf)
        if (typeof success === 'function') {
          success(responseUser)
        }
        if (typeof complete === 'function') {
          complete()
        }
      }
    }
  },
  mounted: function () {
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

<style lang="scss" scoped>
  .chat-box {
    margin: 0 auto;
    background: #fafafa;
    position: absolute;
    height: 70%;
    width: 100%;
    max-width: 700px;
    .msg-box {
      position: absolute;
      height: calc(100% - 6.5rem);
      width: 100%;
      margin-top: 3rem;
      overflow-y: scroll;
      .msg {
        width: 95%;
        min-height: 2.5rem;
        margin: 1rem 0.5rem;
        position: relative;
        display: flex;
        justify-content: flex-start !important;
        .user-head {
          min-width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: #f1f1f1;
          display: flex;
          justify-content: center;
          align-items: center;
          .head {
            width: 1.2rem;
            height: 1.2rem;
          }
          // position: absolute;
        }
        .user-msg {
          width: 80%;
          // position: absolute;
          word-break: break-all;
          position: relative;
          z-index: 5;
          span {
            display: inline-block;
            padding: 0.5rem 0.7rem;
            border-radius: 0.5rem;
            margin-top: 0.2rem;
            font-size: 0.88rem;
          }
          .left {
            background: white;
            animation: toLeft 0.5s ease both 1;
          }
          .right {
            background: #53a8ff;
            color: white;
            animation: toright 0.5s ease both 1;
          }
          @keyframes toLeft {
            0% {
              opacity: 0;
              transform: translateX(-10px);
            }
            100% {
              opacity: 1;
              transform: translateX(0px);
            }
          }
          @keyframes toright {
            0% {
              opacity: 0;
              transform: translateX(10px);
            }
            100% {
              opacity: 1;
              transform: translateX(0px);
            }
          }
        }
      }
    }
    .input-box {
      padding: 0 0.5rem;
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 3.5rem;
      background: #fafafa;
      box-shadow: 0 0 5px #ccc;
      display: flex;
      justify-content: space-between;
      align-items: center;
      input {
        height: 2.3rem;
        display: inline-block;
        width: 100%;
        padding: 0.5rem;
        border: none;
        border-radius: 0.2rem;
        font-size: 0.88rem;
      }
      .btn {
        height: 2.3rem;
        min-width: 4rem;
        background: #e0e0e0;
        padding: 0.5rem;
        font-size: 0.88rem;
        color: white;
        text-align: center;
        border-radius: 0.2rem;
        margin-left: 0.5rem;
        transition: 0.5s;
      }
      .btn-active {
        background: #409eff;
      }
    }
  }
</style>
