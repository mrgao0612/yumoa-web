<template>
  <div ref="editor" class="editor">
    <div class="editor-tools">
      <el-popover placement="top-start" trigger="click" v-model="emojiVisible" class="emoji-popover">
        <span slot="reference" @click="getFocus">
          <svg class="editor-emoji" aria-hidden="true">
            <use :xlink:href="emojiHref" />
          </svg>
        </span>
        <Emoji @select-emoji="onSelectEmoji" />
      </el-popover>
      <el-upload action :http-request="insertFile" :show-file-list="false" class="file-upload" style="padding-left: 10px">
        <i class="el-icon-folder-remove"></i>
      </el-upload>
    </div>
    <div
      ref="editorContent"
      class="editor-content"
      contenteditable="true"
      @focus="onFocus"
      @blur="onBlur"
      @keyup.shift.50.exact="onMention"
      @keydown.prevent.enter.exact="onEnter"
      @keydown.enter.ctrl.exact="lineBreak"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
      @input="onInput"
    ></div>
    <el-button size="small" class="send-btn" @click="sendMsg">发送</el-button>
    <ul v-show="memberListVisible" ref="memberList" class="member-list">
      <li
        class="member-list-item"
        v-for="member in matchedMembers"
        :class="member.selected ? 'selected' : ''"
        :key="member.id"
        @click="insertMention(member.name, member.id)"
      >
        {{ member.name }}
      </li>
    </ul>
  </div>
</template>

<script>
import Emoji from './Emoji'
import twemoji from 'twemoji'

export default {
  name: 'Editor',
  props: {
    memberList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      emojiVisible: false,
      emojiHref: '#el-ali-icon-face',
      memberListVisible: false,
      matchText: '',
      needResponse: true,
      // 记录从‘@’符号至选择完@人员后的光标范围
      mentionTextRange: {
        start: 0,
        end: 0
      }
    }
  },
  computed: {
    matchedMembers () {
      const matchList = this.memberList.filter(item => item.name.includes(this.matchText))
      if (matchList.length) {
        matchList.forEach(item => {
          item.selected = false
        })
        matchList[0].selected = true
      }
      return matchList
    }
  },
  watch: {
    memberListVisible (visible) {
      if (visible) {
        const el = this.$refs.memberList
        this.matchedMembers[0] && (this.matchedMembers[0].selected = true)
        this.$nextTick(() => {
          el.scrollTop = 0
        })
        window.addEventListener('keydown', this.arrowSelect)
      } else {
        this.mentionTextRange.start = 0
        this.mentionTextRange.end = 0
        this.matchText = ''
        this.memberList.forEach(item => {
          item.selected = false
        })
        window.removeEventListener('keydown', this.arrowSelect)
      }
    }
  },
  mounted () {
    this.getFocus()
  },
  methods: {
    // 发送文件
    insertFile (data) {
      const { file } = data
      const { type } = file
      if (type.includes('image')) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = e => {
          const { result } = e.target
          const img = document.createElement('img')
          img.width = 180
          img.src = result
          // 使输入框获取焦点，否则在Firefox上将获得预期外的 sel 和 range
          this.$refs.editorContent.focus()
          const sel = document.getSelection()
          const range = sel.getRangeAt(0)
          range.insertNode(img)
          range.collapse()
        }
      } else {
        this.$emit('send-file', file)
      }
    },
    onCompositionStart () {
      this.needResponse = false
    },
    onCompositionEnd () {
      this.needResponse = true
      this.onInput()
    },
    // 选中 ‘@人员’ 插入到输入框中
    insertMention (name, id) {
      const sel = document.getSelection()
      const range = sel.getRangeAt(0)
      // 删除‘@’后的字符
      this.deleteMentionChar(range)
      const el = this.$refs.editorContent
      const { fontSize, fontFamily, color } = getComputedStyle(el)
      const canvas = document.createElement('canvas')
      const width = parseInt(fontSize, 10) * (name.length + 1) + 6
      const height = parseInt(fontSize, 10) + 6
      canvas.width = width
      canvas.height = height
      this.getHighRes(canvas)
      const ctx = canvas.getContext('2d')
      ctx.textBaseline = 'top'
      ctx.font = `${fontSize} ${fontFamily}`
      ctx.fillStyle = color
      ctx.fillText(`@${name}`, 3, 3)
      ctx.save()
      const dataURL = canvas.toDataURL()
      const img = document.createElement('img')
      img.src = dataURL
      img.setAttribute('data-name', `@${name}`)
      img.setAttribute('data-id', id)
      img.style.verticalAlign = 'middle'
      img.width = width
      img.height = height
      sel.removeAllRanges()
      range.insertNode(img)
      range.collapse()
      sel.addRange(range)
      this.memberListVisible = false
    },
    getFocus () {
      const el = this.$refs.editorContent
      el.focus()
    },
    // 输入@字符获取光标相对父元素的位置
    onMention () {
      console.log('@输入')
      const el = this.$refs.editor
      const sel = document.getSelection()
      const range = sel.getRangeAt(0)
      const [rect] = range.getClientRects()
      const [content] = el.getClientRects()
      const left = rect.x - content.x
      const top = rect.y - content.y
      const memberListEle = this.$refs.memberList
      memberListEle.style.left = `${left}px`
      memberListEle.style.top = `${top + 19}px`
      this.memberListVisible = true
    },
    // 输入@字符后继续输入时获取匹配字符串
    onInput () {
      if (this.memberListVisible && this.needResponse) {
        const sel = document.getSelection()
        const range = sel.getRangeAt(0)
        const { endOffset } = range
        const { textContent } = range.endContainer
        const index = textContent.lastIndexOf('@', endOffset)
        if (index !== -1) {
          this.matchText = textContent.slice(index + 1, endOffset)
          this.mentionTextRange.start = index
          this.mentionTextRange.end = endOffset
          console.log(this.range)
        } else {
          this.memberListVisible = false
        }
      }
    },
    // 插入@之后删除@符号之后的文字
    deleteMentionChar (range) {
      const { start, end } = this.mentionTextRange
      if (end) {
        const { endContainer } = range
        range.setStart(endContainer, start)
        range.setEnd(endContainer, end)
      }
      document.execCommand('delete')
    },
    // 上下箭头切换@人员
    arrowSelect (e) {
      console.log('keydown')
      const LI_HEIGHT = 30 // 一个li的高度
      const UL_HEIGHT = 150 // ul 高度
      const el = this.$refs.memberList
      if (e.keyCode === 38) {
        // 方向键上
        e.preventDefault()
        if (!this.matchedMembers[0].selected) {
          const member = this.matchedMembers.find(item => item.selected)
          const index = this.matchedMembers.findIndex(item => item.selected)
          member.selected = false
          this.matchedMembers[index - 1].selected = true
          if (el.scrollTop > LI_HEIGHT * (index - 1)) {
            el.scrollTop = (index - 1) * LI_HEIGHT
          }
        }
      }
      if (e.keyCode === 40) {
        // 方向键下
        e.preventDefault()
        const { length } = this.matchedMembers
        if (!this.matchedMembers[length - 1].selected) {
          const member = this.matchedMembers.find(item => item.selected)
          const index = this.matchedMembers.findIndex(item => item.selected)
          member.selected = false
          this.matchedMembers[index + 1].selected = true
          if (LI_HEIGHT * (index + 1) > UL_HEIGHT - LI_HEIGHT) {
            console.log(el.scrollTop)
            el.scrollTop = (index - 3) * LI_HEIGHT
          }
        }
      }
    },
    // 监听enter事件
    onEnter (e) {
      const el = this.$refs.editorContent
      if (this.memberListVisible) {
        e.preventDefault()
        const selectedMember = this.matchedMembers.find(item => item.selected)
        console.log(selectedMember)
        this.insertMention(selectedMember.name, selectedMember.id)
        this.memberListVisible = false
        selectedMember.selected = false
      } else if (el.innerHTML) {
        this.sendMsg()
      }
    },
    // 选择 emoji
    onSelectEmoji (code) {
      const el = this.$refs.editorContent
      el.focus()
      const sel = getSelection()
      const range = sel.getRangeAt(0)
      const emojiDiv = document.createElement('div')
      emojiDiv.innerHTML = twemoji.parse(code)
      const emojiImg = emojiDiv.childNodes[0]
      emojiImg.setAttribute('width', '18px')
      emojiImg.setAttribute('height', '18px')
      emojiImg.setAttribute('style', 'padding-right: 2px; padding-left: 2px;')
      range.insertNode(emojiImg)
      sel.removeAllRanges()
      range.collapse()
      sel.addRange(range)
      this.emojiVisible = false
    },
    onFocus () {
      document.addEventListener('mousedown', this.preventDefault)
    },
    onBlur () {
      document.removeEventListener('mousedown', this.preventDefault)
    },
    preventDefault (e) {
      const toolBar = document.querySelector('.editor-tools')
      const memberList = document.querySelector('.member-list')
      const { path } = e
      if (path.includes(toolBar) || path.includes(memberList)) {
        e.preventDefault()
      }
    },
    // ctrl + enter 换行
    lineBreak () {
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      const br = document.createElement('br')
      const textNode = document.createTextNode('\u00a0')
      range.insertNode(br)
      range.collapse(false)
      range.insertNode(textNode)
      range.selectNodeContents(textNode)
      selection.removeAllRanges()
      selection.addRange(range)
      document.execCommand('delete')
    },
    sendMsg () {
      const el = this.$refs.editorContent
      const childNodes = [...el.childNodes]
      this.$emit('send-message', childNodes, el.innerHTML)
      el.innerHTML = ''
    },
    // 高清屏canvas缩放
    getHighRes (canvas) {
      const ctx = canvas.getContext('2d')
      const dpr = window.devicePixelRatio || window.mozDevicePixelRatio || 1
      const oldWidth = canvas.width
      const oldHeight = canvas.height
      canvas.width = Math.round(oldWidth * dpr)
      canvas.height = Math.round(oldHeight * dpr)
      canvas.style.width = oldWidth + 'px'
      canvas.style.height = oldHeight + 'px'
      ctx.scale(dpr, dpr)
      return ctx
    }
  },
  components: {
    Emoji
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
  * {
    box-sizing: border-box;
  }

  .editor {
    position: relative;
    width: 100%;
    padding-top: 30px;
    text-align: left;
    border-top: 1px solid #ffffff;
    box-sizing: border-box;
    &-tools {
      position: absolute;
      display: flex;
      top: 0;
      left: 0;
      width: 100%;
      height: 30px;
      padding: 3px 5px;
      font-size: 20px;
      .emoji-popover {
        padding-left: 10px;
        .editor-emoji {
          width: 1em;
          height: 1em;
          vertical-align: -0.15em;
          fill: currentColor;
          overflow: hidden;
          opacity: 0.75;
        }
        :hover {
          opacity: 1;
        }
      }
      .file-upload {
        padding-left: 10px;
        i {
          opacity: 0.75;
        }
        :hover {
          opacity: 1;
        }
      }
    }
    &-content {
      width: 100%;
      min-width: 430px;
      height: 100%;
      min-height: 120px;
      padding: 3px 5px 0 15px;
      outline: none;
    }
    .send-btn {
      position: absolute;
      bottom: 5px;
      right: 15px;
    }
    .member-list {
      position: absolute;
      max-height: 150px;
      background: #fff;
      border: 1px solid #ececec;
      list-style: none;
      box-shadow: 0 0 10px #ccc;
      overflow: auto;
      padding: 0;
      margin: 0;
      &-item {
        display: flex;
        align-items: center;
        padding: 5px 12px;
        height: 30px;
        cursor: pointer;
        text-align: center;

        &:hover {
          background: #ececec;
        }
      }
      .selected {
        background: #ececec;
      }
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
</style>
