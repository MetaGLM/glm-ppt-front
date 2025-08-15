<template>
  <div class="markdown-it-vue" :class="theme">
    <MarkdownIt
      ref="markdowRef"
      class="markdown-it-vue-body"
      :content="displayContent"
      :options="markdownItOptions"
    />
    <div v-if="showCursor" class="cursor" :style="cursorStyle"></div>
  </div>
</template>

<script>
import katex from 'katex'
import tm from './plugins/textMath.js'
import * as hljs from 'highlight.js/lib/core'
import MarkdownIt from 'markdown-it-vue'
import 'markdown-it-vue/dist/markdown-it-vue.css'
import 'katex/dist/katex.min.css'
import './plugins/textMath.css'
import './dark.less'
import './light.less'
import event from '@/utils/event'
import { lineNumbersBlock } from '@/utils/lines'

const DEFAULT_CURSOR_POS = `translate3d(0,0,0)`
export default {
  name: 'MarkdownItVue',
  components: {
    MarkdownIt
  },
  props: {
    isShowCopy: {
      type: Boolean,
      default: false
    },
    theme: {
      type: String,
      default: 'dark'
    },
    content: {
      type: String,
      default: ''
    },
    options: {
      type: Object,
      default() {
        return {}
      }
    },
    isType: {
      type: Boolean,
      default: true
    },
    showCursor: {
      type: Boolean,
      default: true
    },
    startDelay: {
      type: Number,
      required: false,
      default: 0
    },
    typeSpeed: {
      type: Number,
      required: false,
      default: 40
    },
    enableHtml: {
      type: Boolean,
      default: false
    },
    showLineNumbers: {
      type: Boolean,
      default: true
    },
    rightCurrentLength: Function,
    eventPrefix: {
      type: String,
      default: ''
    },
    // onStartWrite\onEndWrite
    autoBindEvent: {
      type: Boolean,
      default: true
    }
  },
  emits: ['onBegin', 'onComplete'],
  data() {
    const copyText = this.$t('common.copy_code')
    return {
      displayContent: '',
      typingComplete: true,
      currentLength: 0,
      cursorTimer: null,
      copyCodeHeader: `<div class="copy flex flex-ai-center flex-between">
      <label class="language"></label>
      <button class="flex flex-ai-center"><i class="iconfont icon-wdapp_copy"></i>${copyText}</button>
    </div>`,
      cursorStyle: {
        transform: DEFAULT_CURSOR_POS
      }
    }
  },
  mounted() {
    // use katex plugin
    this.$refs.markdowRef.use(tm, {
      engine: katex,
      delimiters: ['brackets', 'dollars'],
      katexOptions: { macros: { '\\RR': '\\mathbb{R}' }},
      throwOnError: false
    })
    this.begin(this.content)
    this.$refs.markdowRef.md.disable(['lheading', 'sub'])
    if (this.autoBindEvent) {
      // 控制推流情况下开始与结束需要处理的事情，光标开始与结束等
      event.$on(`${this.eventPrefix}onStartWrite`, () => {
        this.startWrite()
      })

      // 控制推流情况下开始与结束需要处理的事情，光标开始与结束等
      event.$on(`${this.eventPrefix}onEndWrite`, () => {
        this.endWrite()
      })
    }
    this.$emit('mounted')
  },
  beforeDestroy() {
    this.clearTimer()
    this.clearCursorTimer()
    event.$off(`${this.eventPrefix}onStartWrite`)
    event.$off(`${this.eventPrefix}onEndWrite`)
  },
  watch: {
    showCursor(val) {
      // 光标结束后重置初始位置
      if (!val) {
        this.cursorStyle = {
          transform: DEFAULT_CURSOR_POS
        }
      }
    },
    content(value) {
      this.clearTimer()
      this.begin(value)
      if (this.showCursor && !this.cursorTimer) {
        this.updateCursor()
        this.startWrite()
      }
    }
  },
  computed: {
    markdownItOptions() {
      const { markdownIt, ...rest } = this.options
      return Object.assign(
        {
          markdownIt: {
            html: this.enableHtml,
            lineNumbers: this.showLineNumbers,
            highlight: function(str, lang) {
              return ''
            },
            ...(markdownIt || {})
          }
        },
        rest
      )
    }
  },
  methods: {
    addCopyHeader() {
      // 给每段代码块增加头部复制模块
      const $hljs = $('pre.hljs')
      let $hljsHeader = []
      $hljs &&
        $hljs.each((i, e) => {
          $hljsHeader = $(e).find('.copy')
          if ($hljsHeader.length === 0) {
            $hljs.attr('style', 'padding-top: 52px').append(this.copyCodeHeader)
            $('.copy button').on('click', this.copyCode)
          }
        })
      // 从推流中获取语言类型
      const languages = this.displayContent.match(/```.+\n/g)
      let language = ''
      languages &&
        languages.forEach(item => {
          language = item.replace(/```/, '').replace(/\n/, '') || 'python'
          $('.language').text(language)
        })
    },
    copyCode(event) {
      const codeElement = event.target.closest('pre.hljs').querySelector('code')
      if (codeElement) {
        let copyTxt = codeElement.innerText
        // 去除多余的空白行
        copyTxt = copyTxt
          .split('\n')
          .filter(line => line.trim() !== '')
          .join('\n')
        this.copy(copyTxt)
      }
    },
    begin(data) {
      if (this.isType && data && data.length > 0) {
        this.$nextTick(() => {
          this.$emit('onBegin')
          this.updateCursor()
          this.typingComplete = false
          this.startTimeout = setTimeout(() => {
            this.typewrite(data, this.currentLength)
            clearTimeout(this.startTimeout)
          }, this.startDelay)
        })
      } else {
        this.typingComplete = true
        this.displayContent = data
      }
    },
    clearCursorTimer() {
      if (this.cursorTimer) {
        clearInterval(this.cursorTimer)
        this.cursorTimer = null
      }
    },
    startWrite() {
      this.clearCursorTimer()
      this.cursorTimer = setInterval(() => {
        this.updateCursor()
      }, this.typeSpeed)
    },
    endWrite() {
      if (this.isShowCopy) {
        this.addCopyHeader()
      }
      this.addLineNumbers()
      clearInterval(this.cursorTimer)
    },
    typewrite(curString, curStrPos) {
      const humanize = this.humanizer(this.typeSpeed)
      let currentLength = curStrPos + 1
      if (typeof this.rightCurrentLength === 'function') {
        currentLength = this.rightCurrentLength(curString, curStrPos)
      }

      this.displayContent = curString.substr(0, currentLength)
      this.updateCursor()
      if (currentLength > curString.length - 1) {
        if (this.typeWritingTimer) {
          clearTimeout(this.typeWritingTimer)
        }

        this.typingComplete = true
        this.$emit('onComplete')
        if (this.isShowCopy) {
          this.addCopyHeader()
        }
        return
      }
      this.typeWritingTimer = setTimeout(() => {
        this.typewrite(curString, currentLength)
      }, humanize)
    },
    /**
     * Speed in MS to type
     * @param {number} speed
     * @private
     */
    humanizer(speed) {
      return speed
    },
    addLineNumbers() {
      const dom = this.$refs.markdowRef && this.$refs.markdowRef.$el
      if (!dom) return

      const blocks = dom.querySelectorAll('pre code')
      blocks.forEach(block => {
        if (block.getAttribute('highlighted') === 'true') {
          return
        }
        // 防止已经高亮处理过的block再次被处理
        block.setAttribute('highlighted', 'true')
        // 高亮
        hljs.highlightElement(block)
        // 添加行号
        lineNumbersBlock(block)
      })
    },
    getLastTextNode(element) {
      // 如果元素本身是文本节点，则直接返回
      /**
       * \S 元字符用于查找非空白字符
       * 空白字符可以是:
       * 空格符 (space character)
       * 制表符 (tab character)
       * 回车符 (carriage return character)
       * 换行符 (new line character)
       * 垂直换行符 (vertical tab character)
       * 换页符 (form feed character)
       */
      if (element.nodeType === Node.TEXT_NODE && /\S/.test(element.nodeValue)) {
        // 对空白字符进行替换
        element.nodeValue = element.nodeValue.replace(/s+$/, '')
        return element
      }
      // 否则，遍历其子节点，查找最后一个文本节点
      const children = element.childNodes
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i]
        if (child.nodeType === Node.TEXT_NODE && /\S/.test(child.nodeValue)) {
          child.nodeValue = child.nodeValue.replace(/s+$/, '')
          return child
        } else {
          const lastTextNode = this.getLastTextNode(child)
          if (lastTextNode) {
            return lastTextNode
          }
        }
      }
      return null
    },
    updateCursor() {
      const contentDom = this.$refs.markdowRef && this.$refs.markdowRef.$el
      if (!contentDom) return
      const lastText = this.getLastTextNode(contentDom)
      const textNode = document.createTextNode('\u200b') // \u200b 为零宽字符
      // 存在文本节点就追加到文本节点后面
      if (lastText) {
        lastText.parentElement.appendChild(textNode)
      } else {
        // 不存在文本节点就当前元素追加节点
        contentDom.appendChild(textNode)
      }
      const domRect = contentDom.getBoundingClientRect()
      /**
       * 文本节点是没有getBoundingClientRect()方法
       * 得到最后一个文本节点后，将其内容设置为Range对象的选中内容，并使用Range对象的getBoundingClientRect()方法获取其位置信息
       */
      const range = document.createRange()
      // 方式一：
      range.selectNodeContents(textNode)
      // 方式二：
      // range.setStart(textNode, 0)
      // range.setEnd(textNode, 0)
      const rect = range.getBoundingClientRect()
      // 此处的10是光标本身的宽度
      const posx = `${rect.left - domRect.left}px`
      const posy = `${rect.top - domRect.top}px`
      this.cursorStyle = {
        transform: `translate3d(${posx},${posy},0)`
      }
      textNode.remove()
    },
    clearTimer() {
      if (this.startTimeout) {
        clearTimeout(this.startTimeout)
        this.startTimeout = null
      }
      if (this.typeWritingTimer) {
        clearTimeout(this.typeWritingTimer)
        this.typeWritingTimer = null
      }
    }
  }
}
</script>

<style lang="less">
.markdown-it-vue {
  position: relative;
  min-height: 18px;
  .copy {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #595b63;
    color: #e0e0e0;
    height: 32px;
    line-height: 32px;
    font-size: 12px;
    box-sizing: border-box;
    padding: 0 12px;
    button {
      background-color: transparent;
      cursor: pointer;
      color: #e0e0e0;
      i {
        vertical-align: bottom;
        margin-right: 4px;
      }
      &:hover {
        color: #ffffff;
      }
    }
  }
  span {
    line-height: 23px;
  }
  h1 {
    font-size: 22px;
  }
  h2 {
    font-size: 20px;
  }
  h3 {
    font-size: 18px;
  }
  h4 {
    font-size: 16px;
  }
  h5 {
    font-size: 14px;
  }
  h6 {
    font-size: 12px;
  }
  table {
    margin: 0;
  }
  ol {
    list-style: decimal;
  }
  ul {
    list-style: disc;
  }
  ol ul,
  ul ul {
    list-style: circle;
  }

  ol ul ul,
  ul ul ul {
    list-style: square;
  }
  ul,
  ol {
    padding-left: 1.5em;
    li {
      margin: 12px 0;
      p {
        margin: 0;
      }
    }
  }
  .cursor {
    content: '';
    position: absolute;
    width: 8px;
    height: 18px;
    top: 1px;
    left: 0;
    background: #000000;
    opacity: 0;
    animation: toggle 0.6s infinite;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes toggle {
  30% {
    opacity: 1;
  }
}

.hljs-ln-numbers {
  text-align: center;
  color: #ccc;
  border-right: 1px solid #ccc;
  vertical-align: top;
  padding-right: 5px !important;
  text-align: right;
  /* your custom style here */
}

/* 修改代码列样式 */
.hljs-ln-code {
  padding-left: 5px !important;
}
</style>
