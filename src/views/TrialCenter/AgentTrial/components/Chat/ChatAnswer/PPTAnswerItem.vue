<template>
  <div class="chat-answer-item">
    <div v-for="(item, index) in talkDataList" :key="index" :class="[`answer-item-${item.phase}`]">
      <div v-if="item.phase === PPT_PHASE.TOOL" class="tool flex flex-x-start flex-y-center">
        <i v-if="iconMenu[item.tool_name]" :class="[`iconfont ${iconMenu[item.tool_name]}`]"></i>
        <i v-else class="iconfont icon-huandengpianbofang-01"></i>
        <h5 class="no-wrap">{{ langInfo.isEn ? item.tag_en : item.tag_cn }}</h5>
        <div v-if="item.toolLoading" class="flex1">
          <div class="loading ml10"></div>
        </div>
        <template v-else>
          <AutoTooltip class="tool-title flex1" popperClass="wrap" placement="top">
            <template v-if="item.tool_name === PPT_TOOLS_NAME.VISIT_PAGE">
              <a class="dot title" target="_blank" :href="getUrlLink(item)">
                {{ getLinkLabel(item) }}
              </a>
              <template slot="content">{{ getLinkLabel(item) }}</template>
            </template>
            <template v-else>
              <p class="dot title">{{ getTitle(item) }}</p>
              <template slot="content">{{ getTitle(item) }}</template>
            </template>
          </AutoTooltip>
        </template>
        <button
          class="no-wrap"
          v-if="
            (item.tool_name === PPT_TOOLS_NAME.ADD_SLIDE ||
              item.tool_name === PPT_TOOLS_NAME.UPDATE_SLIDE) &&
            !item.hiddenViewButton
          "
          @click="viewContent(item)"
        >
          {{ $t('base.view') }}
        </button>
      </div>
      <div v-if="item.phase === PPT_PHASE.THINKING" class="thinking">
        <div class="flex flex-x-start flex-y-center">
          <div v-if="!item.thinkingLoading" class="solid-dot"></div>
          <p v-if="!item.isShowMore" class="dot title">{{ item.text }}</p>
          <template v-else>
            <div v-if="item.thinkingLoading" class="flex flex-x-start flex-y-center flex1">
              <div class="loading"></div>
              <h5>{{ $t('agent_trial.thinking') }}</h5>
            </div>
            <h5 v-else class="flex1">{{ $t('agent_trial.thought_process') }}</h5>
          </template>
          <i
            class="el-icon--right pointer"
            :class="{ 'el-icon-arrow-up': item.isShowMore, 'el-icon-arrow-down': !item.isShowMore }"
            @click="item.isShowMore = !item.isShowMore"
          ></i>
        </div>
        <div class="more" :id="item.id" v-if="item.isShowMore">
          <MarkdownItVue
            :content="item.text"
            :showCursor="false"
            :isType="false"
            :autoBindEvent="false"
          />
        </div>
      </div>
      <MarkdownItVue
        v-if="item.phase === PPT_PHASE.ANSWER"
        class="answer"
        :content="item.text"
        :showCursor="false"
        :isType="false"
        :autoBindEvent="false"
      />
    </div>
  </div>
</template>

<script>
import {
  ANSWER_STATUS // 回答结果状态
} from '@/enums/modules/trialCenter'
import event from '@/utils/event'
import {
  PPT_TOOLS_NAME,
  PPT_PHASE,
  EVENT_BUS,
  PPT_STATUS
} from '@/views/TrialCenter/AgentTrial/config/constants'
import AutoTooltip from '@/components/AutoTooltip.vue'
import { getUuid } from '@/utils/tools'
import { mapState, mapMutations } from 'vuex'
import AutoScrollClass from '@/utils/autoScrollClass'

export default {
  name: 'ChatAnswerItem',
  data() {
    return {
      langInfo: '', // 语言信息
      autoScrollInstArr: [], // 自动滚动实例数组
      currentToolName: '', // 当前工具名称
      outputPPTIndex: 0, // 当前正在输出的ppt索引
      deletePPTIndexs: [], // 当前正在删除的ppt索引
      currentPhase: '', // 当前阶段
      talkDataList: [], // 对话数据列表
      openPaneState: false, // 打开右侧面板的开关
      processSinglePPT: false, // 是否正在输出ppt内容
      timer: null,
      conversationId: '', // 会话id
      whiteList: [
        PPT_TOOLS_NAME.SEARCH, // 搜索
        PPT_TOOLS_NAME.VISIT_PAGE, // 访问页面
        PPT_TOOLS_NAME.CREATE_SLIDE, // 创建幻灯片
        PPT_TOOLS_NAME.ADD_SLIDE, // 添加幻灯片
        PPT_TOOLS_NAME.UPDATE_SLIDE, // 修改幻灯片
        PPT_TOOLS_NAME.REMOVE_SLIDES, // 删除幻灯片
        PPT_TOOLS_NAME.PAGE_UP, // 向上翻页
        PPT_TOOLS_NAME.PAGE_DOWN // 向下翻页
      ],
      iconMenu: {
        [PPT_TOOLS_NAME.SEARCH]: 'icon-a-iconxingxing1-012', // 搜索
        [PPT_TOOLS_NAME.VISIT_PAGE]: 'icon-Earth-01', // 访问页面
        [PPT_TOOLS_NAME.CREATE_SLIDE]: 'icon-huandengpian-01', // 创建幻灯片
        [PPT_TOOLS_NAME.ADD_SLIDE]: 'icon-huandengpian-01', // 添加幻灯片
        [PPT_TOOLS_NAME.UPDATE_SLIDE]: 'icon-huandengpian-01', // 修改幻灯片
        [PPT_TOOLS_NAME.REMOVE_SLIDES]: 'icon-huandengpian-01', // 删除幻灯片
        [PPT_TOOLS_NAME.FIND_ON_PAGE]: 'icon-yemianchazhao', // 页面查找
        [PPT_TOOLS_NAME.PAGE_UP]: 'icon-xiangshangfanye', // 向上翻页
        [PPT_TOOLS_NAME.PAGE_DOWN]: 'icon-xiangxiafanye', // 向下翻页
        [PPT_TOOLS_NAME.PYTHON]: 'icon-zhihangpythonjiaoben', // 执行Python脚本
        [PPT_TOOLS_NAME.FIND_NEXT]: 'icon-chazhaoxiayige' // 查找下一个
      },
      PPT_PHASE,
      PPT_TOOLS_NAME
    }
  },
  props: {
    answerStatus: {
      type: String,
      default: ''
    }
  },
  components: {
    AutoTooltip,
    MarkdownItVue: () => import('@/components/MarkdownItVue/Index.vue')
  },
  watch: {
    currentToolName(newVal, oldVal) {
      // 在适当的时机做删除操作，防止删除时出现体验不好
      if (oldVal === PPT_TOOLS_NAME.REMOVE_SLIDES && newVal !== PPT_TOOLS_NAME.REMOVE_SLIDES) {
        // 开始删除幻灯片
        this.deletePPTContent()
      }
    },
    answerStatus: {
      handler(val) {
        this.SET_PPT_OUTPUT_DONE(false)
        event.$emit(EVENT_BUS.PPT_DONE, false)
        if (
          val === ANSWER_STATUS.COMPLETE ||
          val === ANSWER_STATUS.SENSITIVE ||
          val === ANSWER_STATUS.FAIL ||
          val === ANSWER_STATUS.STOP
        ) {
          this.talkDataList.forEach((item, index) => {
            if (item.phase === PPT_PHASE.THINKING && item.thinkingLoading) {
              item.thinkingLoading = false
            }
            if (item.phase === PPT_PHASE.TOOL) {
              if (item.toolLoading) {
                item.toolLoading = false
              }
              if (item.isShowMore) {
                item.isShowMore = false
              }
            }
          })

          this.SET_PPT_OUTPUT_DONE(true)
          event.$emit(EVENT_BUS.PPT_DONE, true)
          this.unLockListenOnceAddSlide()
          this.resetAutoScrollInstArr()
        }
      },
      immediate: true
    }
  },
  computed: {
    ...mapState('AgentTrial', [
      'pptName',
      'IndexedMode',
      'IndexedModeLock',
      'pptViewDataList',
      'isPPTOutputDone'
    ])
  },
  created() {
    event.$on(EVENT_BUS.HIDDEN_OLD_VIEW_BUTTON, this.hiddenOldViewButton)

    // 标准浏览器
    if (navigator.language) {
      this.langInfo = navigator.language
    } else if (navigator.userLanguage) {
      // IE浏览器兼容
      this.langInfo = navigator.userLanguage
    }
    // 默认返回英语
    this.langInfo = 'en' // 默认返回英语
  },
  beforeDestroy() {
    event.$off(EVENT_BUS.HIDDEN_OLD_VIEW_BUTTON, this.hiddenOldViewButton)
    this.resetAutoScrollInstArr()
  },
  methods: {
    ...mapMutations('AgentTrial', [
      'SET_PPT_NAME',
      'SET_INDEXED_MODE',
      'SET_INDEXED_MODE_LOCK',
      'SET_PPT_VIEW_DATA_LIST',
      'UPDATE_PPT_VIEW_DATA_LIST',
      'DELETE_PPT_VIEW_DATA_LIST',
      'PUSH_PPT_VIEW_DATA_LIST',
      'SET_PPT_OUTPUT_DONE'
    ]),
    // 重置自动滚动实例数组
    resetAutoScrollInstArr() {
      if (this.autoScrollInstArr && this.autoScrollInstArr.length > 0) {
        this.autoScrollInstArr.forEach($item => {
          $item.reset(false, 2)
          $item = null
        })
      }
    },
    // 记录索引模式
    recordIndexedMode(data) {
      if (!this.IndexedModeLock) {
        if (data && data.position && data.position.length > 0) {
          this.SET_INDEXED_MODE(data.position[0] || 0)
          this.SET_INDEXED_MODE_LOCK(true)
        }
      }
    },
    // 创建幻灯片的时候执行一次操作
    onlyListenOnceAddSlide() {
      if (!this.listenOnceAddSlideLock) {
        this.listenOnceAddSlideLock = true
        this.SET_PPT_NAME('') // 清空ppt名称
        this.SET_PPT_VIEW_DATA_LIST([]) // 清空ppt数据
        event.$emit(EVENT_BUS.HIDDEN_OLD_VIEW_BUTTON) // 上一轮对话隐藏查看按钮(临时处理，当二期出了多版本功能后去掉这个方法)
      }
    },
    // 解锁创建幻灯片的时候执行一次操作
    unLockListenOnceAddSlide() {
      this.listenOnceAddSlideLock = false
    },
    // 上一轮对话隐藏查看按钮(临时处理，当二期出了多版本功能后去掉这个方法)
    hiddenOldViewButton(id) {
      this.talkDataList.forEach((e, i) => {
        if ((id && e.id === id) || !id) {
          e.hiddenViewButton = true
          this.talkDataList.splice(i, 1, e)
        }
      })
    },
    // 分析并组合数据
    synthesisData(message) {
      const { content, phase } = message
      let data = null
      let values = null
      if (Array.isArray(content) && content.length > 0) {
        values = content[0] || {}
      } else if (typeof content === 'object') {
        values = content
      }
      if (values && phase) {
        data = {
          ...values,
          title: values.object?.title || '',
          tool_name: values.object?.tool_name || '',
          input: values.object?.input || '',
          output: values.object?.output || '',
          position: values.object?.position || [],
          phase
        }
        delete data.object
      }
      return data
    },
    // 创建id
    createId(data) {
      if (!data) return
      if (data.tool_name === PPT_TOOLS_NAME.ADD_SLIDE) {
        return getUuid() || ''
      } else if (data.tool_name === PPT_TOOLS_NAME.UPDATE_SLIDE) {
        const targetItem = this.pptViewDataList[this.outputPPTIndex] || {}
        return targetItem.id || ''
      }
    },
    // 解析渲染数据
    parsingData({ message, finishReason, conversationId }) {
      this.conversationId = conversationId // 记录会话id
      const data = this.synthesisData(message)
      if (data) {
        const index = this.talkDataList.length - 1 || 0
        const targetObject = this.talkDataList[index] || {}

        // 处理 answer 阶段
        if (data.phase === PPT_PHASE.ANSWER) {
          if (this.currentPhase === PPT_PHASE.ANSWER) {
            targetObject.text += data.text || ''
            this.talkDataList.splice(index, 1, targetObject)
          } else {
            if (targetObject.thinkingLoading) {
              targetObject.thinkingLoading = false
              targetObject.toolLoading = false
              targetObject.isShowMore = false
              this.talkDataList.splice(index, 1, targetObject)
            }
            this.talkDataList.push({
              ...data
            })
            this.currentPhase = PPT_PHASE.ANSWER
          }
        } else if (data.phase === PPT_PHASE.TOOL) {
          if (!this.whiteList.includes(data.tool_name)) return // 过滤掉不包含在白名单的工具

          // 记录位置模式（因为模型不稳定，有时候第一页是0，有时候第一页是1）
          if (data.tool_name === PPT_TOOLS_NAME.ADD_SLIDE) {
            this.recordIndexedMode(data)
          }
          // 创建幻灯片的时候执行一次操作
          if (data.tool_name === PPT_TOOLS_NAME.CREATE_SLIDE) {
            this.onlyListenOnceAddSlide()
          }
          // 更新当前ppt位置索引
          this.refreshPPTIndex(data)

          if (finishReason === 'tool_calls') {
            // 工具调用结束
            return
          }

          // 处理 tool 阶段
          if (this.currentPhase === PPT_PHASE.TOOL) {
            if (data.tool_name === PPT_TOOLS_NAME.ADD_SLIDE) {
              this.SET_PPT_NAME(data.title) // 设置ppt名称
            } else if (data.tool_name === PPT_TOOLS_NAME.UPDATE_SLIDE) {
              // 编辑的时候，id后置处理，并且清空原有ppt内容
              if (!targetObject.id && data.position && data.position.length > 0) {
                targetObject.id = this.createId(data)
                this.clearPPTContent() // 清空原有ppt内容
              }
            }
            targetObject.input += data.input || ''
            targetObject.output += data.output || ''
            this.talkDataList.splice(index, 1, targetObject)
          } else {
            if (targetObject.thinkingLoading) {
              targetObject.thinkingLoading = false
              targetObject.isShowMore = false
              this.talkDataList.splice(index, 1, targetObject)
            }
            this.talkDataList.push({
              ...data,
              hiddenViewButton: false,
              id: data.tool_name === PPT_TOOLS_NAME.ADD_SLIDE ? this.createId(data) : '',
              toolLoading: true,
              thinkingLoading: false,
              isShowMore: false
            })
            this.currentPhase = PPT_PHASE.TOOL
          }

          const pptId = this.talkDataList[this.talkDataList.length - 1].id
          // 监听工具循环周期
          this.listenToolsCycle(data, pptId)
        } else if (data.phase === PPT_PHASE.THINKING) {
          // 处理 thinking 阶段
          if (this.currentPhase === PPT_PHASE.THINKING) {
            targetObject.text += data.text || ''
            this.talkDataList.splice(index, 1, targetObject)
          } else {
            if (targetObject.toolLoading) {
              targetObject.toolLoading = false
              this.talkDataList.splice(index, 1, targetObject)
            }
            const id = getUuid() || ''
            this.talkDataList.push({
              ...data,
              id,
              toolLoading: false,
              thinkingLoading: true,
              isShowMore: true
            })
            this.currentPhase = PPT_PHASE.THINKING
            this.$nextTick(() => {
              // 自动滚动实例
              const $autoScrollInstance = new AutoScrollClass(id)
              if ($autoScrollInstance.getElement()) {
                $autoScrollInstance.start({
                  autoScroll: true,
                  mobile: false,
                  distance: 2
                })
                this.autoScrollInstArr.push($autoScrollInstance)
              }
            })
          }
        }
        this.currentToolName = data.tool_name // 更新当前工具名称
        if (
          (this.oldToolName === PPT_TOOLS_NAME.ADD_SLIDE &&
            this.currentToolName !== PPT_TOOLS_NAME.ADD_SLIDE) ||
          (this.oldToolName === PPT_TOOLS_NAME.UPDATE_SLIDE &&
            this.currentToolName !== PPT_TOOLS_NAME.UPDATE_SLIDE)
        ) {
          this.overPPTflow() // 修改当前页ppt状态为done
        }
        this.oldToolName = data.tool_name // 更新之前工具名称
      }
    },
    // 分析获取跳转链接地址
    getUrlLink(data) {
      if (!data) return ''
      let inputValue = ''
      if (typeof data === 'object' && data !== null) {
        inputValue = data?.input ?? ''
      }
      const decodedValue = this.unescapeString(inputValue)
      const regex = /"url":"(https?:\/\/[^"]+)"/
      const match = decodedValue.match(regex)
      return match ? match[1] : ''
    },
    // 分析获取跳转链接文案
    getLinkLabel(data) {
      const output = data?.output
      const value = typeof output === 'string' ? output : ''
      const regex = /(?<=【)[^†]+/
      const match = this.unescapeString(value).match(regex)
      return match?.[0] || ''
    },
    // 分析获取标题
    getTitle(data) {
      const value = String(data?.input || '')
      let result = ''
      if (value) {
        result = this.unescapeString(value)
        if (data?.tool_name === PPT_TOOLS_NAME.SEARCH) {
          result = result
            .replace(/^\["/, '') // 移除开头的 ["
            .replace(/", "/g, '  ') // 将中间的 ", " 替换为空格
            .replace(/"\]$/, '') // 移除结尾的 "]
        }
      }
      return result
    },
    // 处理字符串中的转义字符
    unescapeString(str) {
      if (typeof str !== 'string') {
        return str // 非字符串直接返回原数据
      }
      // 处理常见转义字符：\" 转为 "，\' 转为 '，\\ 转为 \，\n 转为换行等
      return str
        .replace(/\\(["'\\])/g, '$1') // 处理 \"、\'、\\
        .replace(/\\n/g, '\n') // 处理换行符
        .replace(/\\r/g, '\r') // 处理回车符
        .replace(/\\t/g, '\t') // 处理制表符
    },
    async viewContent(data) {
      // 找到要编辑的PPT的索引
      const editPPTIndex = this.pptViewDataList.findIndex(item => item.id === data.id)

      // 查看PPT先触发PPT右侧面板打开，然后把PPT列表放过去进行渲染
      event.$emit(EVENT_BUS.PPT_PANE_OPEN, {
        controlsPane: 'ppt',
        pptName: this.pptName,
        conversationId: this.conversationId
      })
      // 右侧面板是v-if处理的，所以先打开面板后异步处理传递其他数据，防止因同步导致组件还没渲染无法接收event.$emit的数据
      clearTimeout(this.timer)
      this.timer = setTimeout(async() => {
        event.$emit(EVENT_BUS.PPT_UPDATE_LIST, {
          pptName: this.pptName,
          conversationId: this.conversationId,
          pptRawList: this.pptViewDataList
        })
        await this.$nextTick()
        const findStatus = this.pptViewDataList[editPPTIndex]?.status
        if (findStatus !== PPT_STATUS.DONE) {
          event.$emit(EVENT_BUS.PPT_WORK_PROCESSING, editPPTIndex)
        }
        // 打开面板后通过当前单个PPT页的索引进行定位
        event.$emit(EVENT_BUS.PPT_SELECTED, editPPTIndex)
        event.$emit(EVENT_BUS.PPT_DONE, this.isPPTOutputDone)
      }, 100)
    },
    // 新增ppt内容，并推流
    addPPTContent(data, pptId) {
      if (data?.output) {
        const targetObject = this.pptViewDataList[this.outputPPTIndex]
        if (targetObject) {
          targetObject.textContent += data.output.replace(/\\n/g, '\n').replace(/\\/g, '')
          this.UPDATE_PPT_VIEW_DATA_LIST({
            value: targetObject,
            index: this.outputPPTIndex
          })
        } else {
          this.PUSH_PPT_VIEW_DATA_LIST({
            id: pptId,
            textContent: data.output.replace(/\\n/g, '\n').replace(/\\/g, '')
          })
        }
        this.triggerEmit(data)
      }
    },
    // 更新ppt内容，并推流
    setPPTContent(data) {
      const targetObject = this.pptViewDataList[this.outputPPTIndex]
      if (targetObject) {
        if (data?.output) {
          targetObject.textContent += data.output.replace(/\\n/g, '\n').replace(/\\/g, '')
          this.UPDATE_PPT_VIEW_DATA_LIST({
            value: targetObject,
            index: this.outputPPTIndex
          })
          this.triggerEmit(data)
        }
      }
    },
    // 清空ppt内容
    clearPPTContent() {
      const targetObject = this.pptViewDataList[this.outputPPTIndex]
      if (targetObject) {
        targetObject.textContent = ''
      }
      this.UPDATE_PPT_VIEW_DATA_LIST({
        value: targetObject,
        index: this.outputPPTIndex
      })
    },
    // 删除指定索引ppt内容
    async deletePPTContent() {
      const deleteIndexs = this.deletePPTIndexs
      // 对 deleteIndexs 降序排序
      const sortedDeleteIndexs = [...deleteIndexs].sort((a, b) => b - a)
      // 遍历排序后的索引，依次删除
      sortedDeleteIndexs.forEach(i => {
        const index = this.IndexedMode ? i - 1 : i
        if (index < this.pptViewDataList.length) {
          if (this.pptViewDataList[index]) {
            event.$emit(EVENT_BUS.HIDDEN_OLD_VIEW_BUTTON, this.pptViewDataList[index].id) // 上一轮对话隐藏查看按钮(临时处理，当二期出了多版本功能后去掉这个方法)
          }
          this.DELETE_PPT_VIEW_DATA_LIST(index)
        }
      })
      // 删除操作后打开右侧面板
      event.$emit(EVENT_BUS.PPT_PANE_OPEN, {
        controlsPane: 'ppt',
        pptName: this.pptName,
        conversationId: this.conversationId
      })
      // 打开面板采用的v-if，需要等待下PPT组件才可监听事件触发
      await this.$nextTick()
      event.$emit(EVENT_BUS.PPT_UPDATE_LIST, {
        controlsPane: 'ppt',
        pptName: this.pptName,
        conversationId: this.conversationId,
        pptRawList: this.pptViewDataList
      })
    },
    // 结束单张ppt推流，修改状态为done
    overPPTflow() {
      const targetObject = this.pptViewDataList[this.outputPPTIndex]
      if (targetObject) {
        targetObject.status = PPT_STATUS.DONE
        this.pptViewDataList.splice(this.outputPPTIndex, 1, targetObject)
      }
      // 单张PPT结束后往PPT面板中的单个PPT组件中推送完成事件
      event.$emit(EVENT_BUS.PPT_WORK_COMPLETE, this.outputPPTIndex)
      this.processSinglePPT = false
    },
    // 更新当前ppt位置索引
    refreshPPTIndex(data) {
      if (data && data.position && data.position.length > 0) {
        if (data.tool_name === PPT_TOOLS_NAME.REMOVE_SLIDES) {
          this.deletePPTIndexs = data.position || []
        } else {
          const index = this.IndexedMode ? data.position[0] - 1 : data.position[0]
          this.outputPPTIndex = this.isInteger(index) ? index : 0
        }
        console.log(
          '--索引模式：' + this.IndexedMode + '----当前outputPPTIndex:',
          this.outputPPTIndex
        )
      }
    },
    // 监听工具循环周期
    listenToolsCycle(data, pptId) {
      if (!data) return
      switch (data.tool_name) {
        case PPT_TOOLS_NAME.SEARCH: // 搜索
          break
        case PPT_TOOLS_NAME.VISIT_PAGE: // 访问页面
          break
        case PPT_TOOLS_NAME.CREATE_SLIDE: // 创建幻灯片
          break
        case PPT_TOOLS_NAME.ADD_SLIDE: // 添加幻灯片
          this.triggerOpenPane(data)
          // 开始添加或更新幻灯片
          this.addPPTContent(data, pptId)

          break
        case PPT_TOOLS_NAME.UPDATE_SLIDE: // 修改幻灯片
          this.triggerOpenPane(data)
          // 开始更新幻灯片
          this.setPPTContent(data)
          break
        case PPT_TOOLS_NAME.REMOVE_SLIDES: // 删除幻灯片
          break
      }
    },
    triggerOpenPane(data) {
      if (!this.openPaneState) {
        // 打开预览框，采用开关模式，只触发一次
        event.$emit(EVENT_BUS.PPT_PANE_OPEN, {
          controlsPane: 'ppt',
          pptName: this.pptName,
          conversationId: this.conversationId
        })
        this.openPaneState = true
      }
    },
    async triggerEmit(data) {
      event.$emit(EVENT_BUS.PPT_UPDATE_LIST, {
        controlsPane: 'ppt',
        pptName: this.pptName,
        conversationId: this.conversationId,
        selectedIndex: this.outputPPTIndex,
        pptRawList: this.pptViewDataList
      })
      // 处理当新增或修改PPT的时候发送信息到PPTRender.vue中通过索引进行定位到当前PPT，只触发一次，当前PPT推流结束后恢复开关原始态
      if (!this.processSinglePPT) {
        this.processSinglePPT = true
        await this.$nextTick()
        event.$emit(EVENT_BUS.PPT_WORK_PROCESSING, this.outputPPTIndex)
        event.$emit(EVENT_BUS.PPT_SELECTED, this.outputPPTIndex)
      }
    },
    // 判断是否为整数
    isInteger(value) {
      if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
        return false // 非有效数字
      }
      return Math.floor(value) === value
    }
  }
}
</script>

<style scoped lang="less">
.chat-answer-item {
  .iconfont {
    font-size: 18px;
    color: #8d8e99;
  }
  .title {
    font-size: 14px;
    color: #8d8e99;
    line-height: 20px;
    margin-left: 8px;
    flex: 1;
  }
  h5 {
    color: #131212;
    font-weight: 600;
    font-size: 14px;
    margin-left: 8px;
    line-height: 20px;
  }
  .answer-item-tool + .answer-item-thinking {
    .thinking {
      border-radius: 0 0 12px 12px;
      margin-top: 0;
    }
  }
  .answer-item-tool:not(:has(+ .answer-item-thinking)),
  .answer-item-tool:last-child {
    .tool {
      border-radius: 12px;
      border: 1px solid #d9d9d9;
      margin-bottom: 12px;
    }
  }
  .answer-item-answer {
    &:last-child {
      .answer {
        margin-bottom: 50px;
      }
    }
  }
  .thinking {
    margin-bottom: 12px;
    padding: 12px 16px;
    border: 1px solid #d9d9d9;
    border-radius: 12px;
    margin-top: 6px;
    background-color: #fbfbfc;
    .solid-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: #8d8e99;
      margin: 0 5px;
    }
    .el-icon--right {
      font-weight: 600;
      color: #9298a1;
      width: 20px;
      height: 20px;
      line-height: 20px;
      display: block;
      border-radius: 6px;
      text-align: center;
      margin: 0 4px;
      &:hover {
        background-color: #eeeff0;
      }
    }
    .more {
      margin: 10px 20px 0 20px;
      max-height: 174px;
      overflow-y: auto;
      .markdown-it-vue {
        ::v-deep .markdown-body {
          font-size: 12px;
          line-height: 20px;
          color: #8d8e99;
        }
      }
    }
  }
  .tool {
    padding: 8px 16px;
    border: 1px solid #d9d9d9;
    border-radius: 12px 12px 0 0;
    border-bottom: none;
    font-size: 14px;
    margin-top: 12px;
    height: 29px;
    .tool-title {
      margin-left: 8px;
      border-left: 1px solid #d4d4da;
    }
    a.title {
      &:hover {
        text-decoration: underline;
        color: var(--primaryColor);
      }
    }
    button {
      margin-left: 8px;
      margin-right: -4px;
      padding: 4px 8px;
      background-color: transparent;
      border: none;
      border-radius: 6px;
      color: #131212;
      cursor: pointer;
      &:hover {
        background-color: #eeeff0;
      }
    }
  }
  .answer {
    color: #131212;
    font-size: 16px;
    margin: 12px 0;
  }
}
.markdown-it-vue {
  ::v-deep .markdown-body {
    line-height: 24px;
    blockquote,
    details,
    dl,
    ol,
    p,
    pre,
    table,
    ul {
      margin-bottom: 12px;
    }
  }
}
/* 加载动画容器样式 */
.loading {
  width: 10px;
  height: 10px;
  border: 2px solid #c7c5c5;
  border-top: 2px solid #5b5c5d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 定义旋转动画 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
