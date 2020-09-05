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
            <a @click="showMessageDialog = true" style="cursor:pointer;">
              <i class="el-icon-bell" style="font-size: 23px;margin-right: 20px;"></i>
              <div class="showNum">
                <span>99+</span>
              </div>
            </a>
            <el-dropdown trigger="hover" :hide-on-click="false">
              <span class="el-dropdown-link">
                {{ username }}
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
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
    <el-dialog :visible.sync="showMessageDialog" width="41%" top="13vh" :close-on-click-modal="false">
      <div class="message">
        <div class="column left">
          <a style="cursor:pointer;">
            <img src="@/assets/avatar.jpg" style="width: 36px;height: 36px;border-radius: 10%" alt=""/>
          </a>
          <div style="margin-top: 25px;">
            <a id="a-sms" style="cursor:pointer;" @click="openSms" @mouseover="smsChange" @mouseleave="smsRestore">
              <svg id="svg-sms" class="icon-sms" aria-hidden="true" style="font-size: 36px">
                <use :xlink:href="smsHref" />
              </svg>
            </a>
          </div>
          <div style="margin-top: 25px">
            <a style="cursor:pointer;" @click="openBook" @mouseover="bookChange" @mouseleave="bookRestore">
              <svg id="svg-book" class="icon-book" aria-hidden="true" style="font-size: 36px">
                <use :xlink:href="bookHref" />
              </svg>
            </a>
          </div>
        </div>
        <div class="column middle">
          <el-row style="display: block;margin-top: 7px;">
            <el-col :span="20">
              <el-input prefix-icon="el-icon-search" size="mini" placeholder="搜索" v-model="keyword" @keydown.enter.native="initDialogueList"></el-input>
            </el-col>
            <el-col :span="2" style="margin-left: 10px;">
              <el-button size="mini" type="info" plain>
                <i class="el-icon-plus" style="font-size: 11px;"></i>
              </el-button>
            </el-col>
          </el-row>
          <el-row v-for="(dialogue, index) in dialogueList" :key="index" style="display: block;margin-top: 12px;">
            <el-col :span="24" :id="'msgCol' + index" class="dialogue-col" style="padding: 10px 3px 8px 3px;"
                    v-on:click.native="openChatRight(dialogue, index)">
              <div style="display: inline-block;">
                <el-avatar shape="square" :src="dialogue.avatar"></el-avatar>
              </div>
              <div style="display: inline-block;width: 167px;max-width: 167px; padding-left: 5px">
                  <el-col style="color: #000000;font-size: 14px;">
                    <span>{{ dialogue.name }}</span>
                    <span style="color: #999;font-size: 11px;float: right;display: inline-block">{{ dialogue.msgDate }}</span>
                  </el-col>
                  <el-col style="color: #999;font-size: 11px;padding-top: 5px">{{ dialogue.content }}</el-col>
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="column right" v-show="chatRightShow">
          <div class="wxchatBorderRightTop">
            <div class="wxchatName">{{ chatTitle }}</div>
            <div class="wxchatMore">
              <i class="el-icon-more"></i>
            </div>
          </div>
          <div class="wxchatBorderRightMid" ref="msg-box">
            <div v-for="(message, index) in messageList" :key="index">
              <div v-show="message.receiverId === userId" style="margin-left: 20px;margin-top: 15px;">
                <el-row>
                  <el-col :span="2">
                    <el-avatar shape="square" :src="receiverAvatar" style="width: 35px;height: 35px;"></el-avatar>
                  </el-col>
                  <el-col :span="12">
                    <div class="chatPop1">
                      <span style="line-height: 23px;" :id="'receiverRef' + index"></span>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div v-show="message.senderId === userId" style="margin-left: 20px;margin-top: 15px;">
                <el-row>
                  <el-col :span="21">
                    <div class="chatPop2">
                      <span style="line-height: 23px;" :id="'senderRef' + index"></span>
                    </div>
                  </el-col>
                  <el-col :span="2">
                    <el-avatar shape="square" :src="senderAvatar" style="width: 35px;height: 35px;"></el-avatar>
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
          <div class="wxchatBorderRightBottom">
            <Editor :memberList="memberList" @send-file="sendFile" @send-message="sendMessage"/>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import protoRoot from '@/proto/proto.js'
import $ from 'jquery'
import Editor from '@/components/Editor.vue'
const userInfo = JSON.parse(localStorage.getItem('UserInfo'))
export default {
  name: 'index',
  data () {
    return {
      defaultActive: '',
      username: '',
      isCollapsed: false,
      navList: '',
      messageList: [], // 聊天记录的数组
      messageListLength: 0,
      userId: '' + userInfo['id'],
      showMessageDialog: false,
      smsHref: '#el-ali-icon-sms_blue',
      bookHref: '#el-ali-icon-addressbook',
      emojiHref: '#el-ali-icon-face',
      keyword: '',
      dialogueList: [
        {
          name: '张三',
          avatar: require('@/assets/zhangsan.jpeg'),
          content: '国庆有安排吗',
          msgDate: '2020/09/02'
        },
        {
          name: '无异烦',
          avatar: require('@/assets/skr.jpeg'),
          content: '最近加拿大不好混呀',
          msgDate: '2020/09/01'
        }
      ],
      chatTitle: '',
      chatRightShow: false,
      receiverAvatar: '',
      senderAvatar: '',
      showEmojiDialog: false,
      memberList: [
        { name: '张三', id: 'zhangsan', selected: false },
        { name: '李四', id: 'lisi', selected: false },
        { name: '王五', id: 'wangwu', selected: false },
        { name: '赵六', id: 'zhaoliu', selected: false },
        { name: '张三四', id: 'zhangsansi', selected: false },
        { name: '李四五', id: 'lisiwu', selected: false },
        { name: '王五六', id: 'wangwuliu', selected: false }
      ]
    }
  },
  computed: {
    onRoute () {
      return this.$route.path
    }
  },
  components: {
    Editor
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
        cmd: 2,
        senderId: '' + userInfo['id'],
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
          if (message['cmd'] === 0 && message['receiverId'] === this.userId) { _this.messageList.push(message) }
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
    sendMessage (childNodes, innerHTML) {
      console.log(childNodes)
      let _this = this
      let data = {
        cmd: 0,
        senderId: '' + userInfo['id'],
        receiverId: '2',
        content: innerHTML
      }
      this.requestMessageEncoder({
        data: data,
        success: function (message) {
          // _this.$socket.send(message)
          _this.messageList.push(data)
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
    },
    openSms () {
      this.smsHref = '#el-ali-icon-sms_blue'
      this.bookHref = '#el-ali-icon-addressbook'
    },
    openBook () {
      this.smsHref = '#el-ali-icon-sms'
      $('#svg-sms').css({opacity: 0.75})
      this.bookHref = '#el-ali-icon-addressbook_blue'
    },
    smsChange () {
      $('#svg-sms').css({opacity: 1})
    },
    smsRestore () {
      if (this.smsHref === '#el-ali-icon-sms') {
        $('#svg-sms').css({opacity: 0.75})
      }
    },
    bookChange () {
      $('#svg-book').css({opacity: 1})
    },
    bookRestore () {
      if (this.bookHref === '#el-ali-icon-addressbook') {
        $('#svg-book').css({opacity: 0.75})
      }
    },
    sendFile (file) {
      console.log(file)
    },
    initDialogueList () {
    },
    openChatRight (dialogue, index) {
      $('.dialogue-col').each((index, element) => {
        $('#' + element.getAttribute('id')).css({background: '#eeeeee'})
      })
      $('#' + 'msgCol' + index).css({background: '#D8D8D8'})
      this.chatRightShow = true
      this.chatTitle = dialogue.name
      this.messageList = []
      this.messageListLength = 0
      this.receiverAvatar = dialogue.avatar
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
  },
  updated () {
    this.$nextTick(() => {
      if (this.messageList.length > 0 && this.messageListLength !== this.messageList.length) {
        let el
        const message = this.messageList[this.messageList.length - 1]
        if (message.receiverId !== this.userId) {
          el = $('#' + 'senderRef' + (this.messageList.length - 1))
        } else {
          el = $('#' + 'receiverRef' + (this.messageList.length - 1))
        }
        el.append(message.content)
        this.messageListLength = this.messageList.length
      }
    })
  }
}
</script>

<style lang="scss" scoped>
  .showNum {
    position: absolute;
    color: white;
    font-size: 10px;
    background-color: red;
    width: 20px;
    height: 20px;
    line-height: 23px;
    left: 10%;
    top: 18%;
    text-align: center;
    -webkit-border-radius: 24px;
    border-radius: 24px;
  }
  .message {
    height: 48vh;
    width: 850px;
    max-width: 850px;
    white-space: normal;
    display: inline-block;
    .column {
      float: left;
    }
    .column.left {
      width: 38px;
      height: 100%;
      max-width: 38px;
      background: #303133;
      padding: 11px;
      .icon-sms {
        width: 1em; height: 1em;
        vertical-align: -0.15em;
        fill: currentColor;
        overflow: hidden;
        opacity: 1;
      }
      .icon-book {
        width: 1em; height: 1em;
        vertical-align: -0.15em;
        fill: currentColor;
        overflow: hidden;
        opacity: 0.75
      }
    }
    .column.middle {
      width: 228px;
      height: 100%;
      max-width: 228px;
      background: #eeeeee;
      user-select: none;
      padding: 11px;
      .el-button--mini {
        width: 28px;
        padding: 7px 7px;
        border-radius: 5px;
      }
      .dialogue-col {
        :hover {
          background: #E6E6E6
        }
      }
    }
    .column.right {
      width: 430px;
      height: 100%;
      max-width: 430px;
      display: inline-block;
      .wxchatBorderRightTop {
        width: 430px;
        height: 45px;
        border-bottom: 1px solid #e7e7e7;
        display: block;
        background: whitesmoke;
        .wxchatName {
          color: #000000;
          font-size: 20px;
          float: left;
          padding-left: 20px;
          padding-top: 13px;
        }
        .wxchatMore {
          color: #999;
          font-size: 12px;
          float: right;
          margin-right: 15px;
          padding-top: 20px;
          cursor:pointer;
        }
      }
      .wxchatBorderRightMid {
        width: 430px;
        height: 290px;
        border: 2px;
        background: whitesmoke;
        display: block;
        overflow-y: auto;
        .chatPop1 :hover {
          background-color: #FAFAFA;
        }
        .chatPop1 span {
          background-color: #fff;
          padding: 5px 8px;
          display: inline-block;
          border-radius: 2px;
          margin: 0 0 10px 10px;
          position: relative;
          border: 1px solid #fff;
          max-width: 290px;
          color: black;
          letter-spacing: 1px;
        }
        .chatPop1 span::after {
          content: '';
          border: 8px solid #ffffff00;
          border-right: 8px solid #fff;
          position: absolute;
          top: 8px;
          left: -16px;
        }
        .chatPop2 :hover {
          background-color: #01DF3A;
        }
        .chatPop2 span {
          background-color: #2BD54D;
          padding: 5px 8px;
          display: inline-block;
          border-radius: 2px;
          margin: 0 10px 10px 10px;
          position: relative;
          border: 1px solid #2BD54D;
          max-width: 290px;
          float: right;
          color: black;;
          letter-spacing: 1px;
        }
        .chatPop2 span::after {
          content: '';
          border: 8px solid #ffffff00;
          border-right: 8px solid #2BD54D;
          position: absolute;
          top: 8px;
          right: -16px;
          transform: rotateY(180deg);
        }
      }
      .wxchatBorderRightMid::-webkit-scrollbar {
        width: 6px;
      }
      .wxchatBorderRightMid::-webkit-scrollbar-thumb {
        border-radius: 10px;
        -webkit-box-shadow: inset 0 0 5px whitesmoke;
        background: #BDBDBD;
      }
      .wxchatBorderRightMid::-webkit-scrollbar-track {
        -webkit-box-shadow: inset 0 0 5px whitesmoke;
        border-radius: 0;
        background: whitesmoke;
      }
      .wxchatBorderRightBottom {
        width: 430px;
        height: 152px;
        background-color: #fff;
        border-top: 1px solid #eee;
        display: block;
      }
    }
  }
</style>
