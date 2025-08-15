<template>
  <div class="flex chat-wrap">
    <slot name="header"></slot>
    <div class="flex1 overauto scroll-display-none chat-content" ref="contentBox">
      <template v-if="talkDataList && talkDataList.length > 0">
        <div
          v-for="(item, index) in talkDataList"
          :key="clientId + '__' + index"
          class="chat-item"
          :data-index="index"
        >
          <div v-if="item.type === ANSWER_TYPE.TIPS" class="new-meeting-tips">
            <span>{{ $t('model_trial.new_session_tip') }}</span>
          </div>
          <template v-else>
            <ChatPrompt
              v-if="item.type === ANSWER_TYPE.ORDINARY"
              :question="item.question"
              :fileContentList="item.fileContentList"
            />
            <div
              class="flex flex-y-start chat-item-answer"
              :class="{
                answer__prologue: item.type === ANSWER_TYPE.PROLOGUE
              }"
              :data-answer="'CHAT_ANSWER__' + index"
            >
              <ChatAvatar
                :type="ROLE_TYPE.ASSISTANT"
                :src="getIsLastItem(index) ? robotAvatarGif : robotAvatar"
                errorSrc="https://cdn.bigmodel.cn/static/platform/images/trialcenter/robot_default.png"
              />
              <div class="flex1 w0">
                <ChatAnswer
                  ref="chatAnswerRef"
                  :choices="item.choices"
                  :answerStatus="item.answerStatus"
                  :agentId="currentAgent.agentId"
                  :isLastChat="getIsLastItem(index)"
                >
                  <template
                    slot="footer"
                    v-if="
                      showCost &&
                      (item.answerStatus === ANSWER_STATUS.COMPLETE ||
                        item.answerStatus === ANSWER_STATUS.FAIL)
                    "
                  >
                    <ChatCompleteFooter
                      :usage="item.usage"
                      :errorInfo="item.errorInfo"
                      :timeConsuming="item.timeConsuming"
                      :isLastItem="getIsLastItem(index)"
                      :answerStatus="item.answerStatus"
                      @copy="copy(item.answer)"
                      @reGenerate="reGenerate"
                    />
                  </template>
                </ChatAnswer>
              </div>
            </div>
          </template>
        </div>
      </template>
      <template v-else>
        <ChatGuide
          v-if="showEmpty"
          :disabled="guideDisabled"
          :guide="currentAgent.guide"
          @chooseExample="value => $emit('chooseExample', value)"
        >
        </ChatGuide>
      </template>
    </div>
    <div v-if="showChatFooter" class="flex-none flex flex-center chat-footer">
      <el-button
        v-if="isSending"
        class="regenerate-stop-btn"
        size="samll"
        :name="$t('model_trial.search_box.stop', 'zh')"
        @click.stop="stopGenerate"
      >
        <i class="iconfont icon-stop1"></i>
        <span>{{ $t('model_trial.search_box.stop') }}</span>
      </el-button>
      <el-button
        v-if="!hideRegenBtn && lastTalkData && lastTalkData.answerStatus === ANSWER_STATUS.STOP"
        class="regenerate-stop-btn"
        size="samll"
        :name="$t('model_trial.search_box.again', 'zh')"
        @click.stop="reGenerate"
      >
        <i class="iconfont icon-retry"></i>
        <span>{{ $t('model_trial.search_box.again') }}</span>
      </el-button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { cloneDeep, isObject } from 'lodash-es'
import { fetchAgentRequestApi, fetchAgentAsyncResultApi } from '@/api/trialCenter/agent'
import {
  MODEL_SCENE_TYPE, // 模型类型
  TOOLS_TYPE, // 工具类型
  ANSWER_TYPE, // 回答结果区域类型
  ANSWER_STATUS, // 回答结果状态
  ROLE_TYPE, // 角色类型
  EXECUTION_STATUS
} from '@/enums/modules/trialCenter'
import useSSETimeoutHandler from '@/utils/useSSETimeoutHandler'
import FetchEventSourceClass from '@/utils/fetchEventSource'
import { calculationEndTime } from '@/utils/date'
import AutoScrollClass from '@/utils/autoScrollClass'

import ChatAvatar from './ChatAvatar.vue'
import ChatPrompt from './ChatPrompt.vue'
import ChatAnswer from './ChatAnswer/Index.vue'
import ChatGuide from './ChatGuide/Index.vue'
import ChatCompleteFooter from './ChatCompleteFooter.vue'
import { PPT_AGENT_ID } from '@/views/TrialCenter/AgentTrial/config/constants'

const MAX_HISTORY_NUM = 10 // 多轮对话， 历史记录最大条数

const SYNC_AGENT_STATUS = {
  SUCCESS: 'success',
  PENDING: 'pending',
  FAILED: 'failed'
}

export default {
  name: 'Chat',
  components: {
    ChatAvatar,
    ChatPrompt,
    ChatAnswer,
    ChatGuide,
    ChatCompleteFooter
  },
  props: {
    currentAgent: {
      type: Object,
      default: () => ({})
    },
    params: {
      type: Object,
      default: () => ({})
    },
    clientId: {
      type: String,
      default: ''
    },
    multiwheel: {
      type: Boolean,
      default: false
    },
    showEmpty: {
      type: Boolean,
      default: true
    },
    guideDisabled: {
      type: Boolean,
      default: false
    },
    showCost: {
      type: Boolean,
      default: true
    },
    stream: {
      type: Boolean,
      default: false
    },
    apiKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      talkDataList: [],
      ANSWER_TYPE, // 回答结果区域类型
      ROLE_TYPE, // 角色类型
      MODEL_SCENE_TYPE, // 模型类型
      ANSWER_STATUS,
      robotAvatar: 'https://cdn.bigmodel.cn/static/platform/images/trialcenter/robot.png',
      robotAvatarGif: 'https://cdn.bigmodel.cn/static/platform/images/trialcenter/robot.gif',
      cancelToken: null,
      sendParams: {},
      isSending: false,
      requestTimer: null,
      startTime: 0, // 记录请求开始时间
      initVideoListPromise: null,
      beginState: false,
      conversationId: ''
    }
  },
  computed: {
    lastTalkData: {
      get: function() {
        return this.talkDataList.length > 0 ? this.talkDataList[this.talkDataList.length - 1] : null
      },
      set: function(newValue) {
        if (this.talkDataList.length > 0) {
          // 如果数组不为空，则更新最后一条数据
          this.talkDataList[this.talkDataList.length - 1] = newValue
        } else {
          // 如果数组为空，则添加新数据
          this.talkDataList.push(newValue)
        }
      }
    },
    showChatFooter() {
      return (
        this.isSending ||
        (this.lastTalkData && this.lastTalkData.answerStatus === ANSWER_STATUS.STOP)
      )
    },
    hiddenExample() {
      return false
    },
    hideRegenBtn() {
      return [PPT_AGENT_ID].includes(this.currentAgent.agentId)
    }
  },
  created() {
    this.$clearSseTimer = null
    this.$resetSseTimer = null
    this.$cancelToken = null
    this.$calculationTime = calculationEndTime()
    this.EXECUTION_STATUS = EXECUTION_STATUS
  },
  mounted() {
    // window.addEventListener('message', this.onMessageHandler)
    this.initFetchEventSource()
    // 自动滚动实例
    this.$autoScrollInstance = new AutoScrollClass(this.$refs.contentBox)
    this.sendParams = this.getBasePrams()
  },
  destroyed() {
    if (typeof this.fetchEventSource?.destroy === 'function') {
      this.fetchEventSource.destroy()
      this.fetchEventSource = null
    }

    this.autoScrollReset()
    this.$autoScrollInstance = null
  },
  methods: {
    getIsLastItem(index) {
      return this.talkDataList.length - 1 === index
    },
    creatCancelToken() {
      return new this.$axios.CancelToken(c => {
        this.$cancelToken = c
      })
    },
    closeCancelToken() {
      if (typeof this.$cancelToken === 'function') {
        this.$cancelToken(this.$t('model_trial.request_info.cancel'))
      }
      this.$cancelToken = null
    },
    // 窗口置底
    setScrollBottom() {
      this.$nextTick(() => {
        this.$autoScrollInstance.scrollBottom(false)
      })
    },
    recordRequestStartTime(type = 'reset') {
      if (type === 'end') {
        const timeConsuming = this.$calculationTime.end()
        this.lastTalkData.timeConsuming = timeConsuming
      } else if (type === 'start') {
        this.$calculationTime.start()
      } else {
        this.$calculationTime.reset()
      }
    },
    handleOpenEventSource() {
      if (this.lastTalkData.showCursor) {
        // 模型输出时，执行；如果优先执行 搜索、思考，则不执行
        // this.startWrite()
      }
      this.$autoScrollInstance.start({
        autoScroll: true,
        mobile: false,
        distance: 2
      })
    },
    autoScrollReset() {
      if (typeof this.$autoScrollInstance?.reset === 'function') {
        this.$autoScrollInstance.reset({
          mobile: false,
          distance: 2
        })
      }
    },
    // 结束状态处理
    endStatusHandler(status = ANSWER_STATUS.FAIL) {
      this.closeCancelToken()
      if (typeof this.fetchEventSource?.close === 'function') {
        this.fetchEventSource.close()
      }

      setTimeout(() => {
        this.autoScrollReset()
      }, 1000)

      this.$clearSseTimer && this.$clearSseTimer()
      this.lastTalkData.showCursor = false
      this.isSending = false
      this.lastTalkData.answerStatus = status

      this.$emit('updateStatus', {
        isPending: false
      })

      this.$emit('chatEnd', this.talkDataList)
    },
    // 结果消息处理
    massageHandler(res) {
      if (res?.data === '[DONE]') {
        return
      }
      this.lastTalkData.answerStatus = ANSWER_STATUS.OUTPUT
      let data
      try {
        data = JSON.parse(res?.data || '')
      } catch (error) {
        data = res
      }
      try {
        const status = data?.status
        let oldChoices = this.lastTalkData.choices
        const oldLength = oldChoices?.length || 0
        let oldLastChoice = oldLength > 0 ? oldChoices[oldLength - 1] : {}

        if (data.agent_id === PPT_AGENT_ID) {
          this.conversationId = data?.conversation_id
        }

        if (data.choices?.length > 0) {
          for (let index = 0; index < data.choices.length; index++) {
            const { messages, finish_reason: finishReason } = data.choices[index]
            if (messages?.length > 0) {
              for (let mIndex = 0; mIndex < messages.length; mIndex++) {
                const { content } = messages[mIndex]
                if (this.stream) {
                  // 处理ppt模型数据
                  if (data.agent_id === PPT_AGENT_ID) {
                    // if (content?.type === 'text') {
                    //   if (oldLastChoice.type === content.type) {
                    //       oldLastChoice.type = content.type || ''
                    //       oldLastChoice.text = content.text || ''
                    //       oldLastChoice.phase = phase || ''
                    //       oldLastChoice.mcp_tools_type = content?.mcp_tools_type || ''
                    //     oldChoices.splice(oldLength - 1, 1, oldLastChoice)
                    //   } else {
                    //     oldChoices.push({
                    //       type: content.type || '',
                    //       text: content.text || '',
                    //       phase: phase || '',
                    //       mcp_tools_type: content?.mcp_tools_type || ''
                    //     })
                    //   }
                    // }
                    if (this.$refs.chatAnswerRef && this.$refs.chatAnswerRef.length > 0) {
                      this.$refs.chatAnswerRef[
                        this.$refs.chatAnswerRef.length - 1
                      ].setPPTAnswerItemValue({
                        finishReason,
                        message: messages[mIndex],
                        conversationId: this.conversationId
                      })
                    }
                  } else {
                    // 处理其他模型数据
                    if (content?.type === 'text') {
                      if (oldLastChoice.type === content.type) {
                        oldLastChoice.text += content.text || ''
                        oldChoices.splice(oldLength - 1, 1, oldLastChoice)
                      } else {
                        oldChoices.push(content)
                      }
                    }
                    if (typeof content === 'string') {
                      if (!oldLastChoice?.text) {
                        oldLastChoice = { type: 'text', text: '' }
                      }
                      oldLastChoice.text += content || ''
                    }
                  }
                } else {
                  if (Array.isArray(content)) {
                    const isAllImg = content.every(i => i.type === 'image_url')
                    let newContent = []
                    if (isAllImg) {
                      newContent = [
                        {
                          type: 'image_url',
                          image_url: content.map(i => i.image_url)
                        }
                      ]
                    } else {
                      newContent = content.map(i => {
                        if (i.type === 'text') {
                          if (isObject(i.text)) {
                            i.text = `\`\`\`json \n ${JSON.stringify(i.text, null, 2)} \n \`\`\``
                          }
                        }
                        return i
                      })
                    }
                    oldChoices = oldChoices.concat(newContent)
                  } else if (isObject(content)) {
                    oldChoices.push(content)
                  } else {
                    oldChoices.push({
                      type: 'text',
                      text: content || ''
                    })
                  }
                }
              }
            }

            if (!status && this.stream) {
              // 'stop’表示自然结束或触发stop词
              if (finishReason === 'stop') {
                this.handleFinishEvent(data?.usage)
                this.endStatusHandler(ANSWER_STATUS.COMPLETE)
                break
              }

              // 'tool_calls’表示模型命中函数
              if (finishReason === 'tool_calls') {
                console.log('工具调用-暂不支持')
                //   break
              }
              // 'sensitive’表示内容被安全审核接口拦截（用户应判断并决定是否撤回公开内容）
              if (finishReason === 'sensitive') {
                this.errorMultHandler(res)
                this.lastTalkData.isInterrupted = true // 敏感词问答组标识符
                break
              }

              // 'network_error’表示模型推理异常
              if (finishReason === 'network_error' || finishReason === 'error') {
                this.errorMultHandler(res)
                break
              }

              if (finishReason === 'length') {
                this.errorMultHandler(res)
                break
              }
            }
          }
          this.lastTalkData.choices = oldChoices
        }
        if (status === SYNC_AGENT_STATUS.SUCCESS) {
          this.handleFinishEvent(data?.usage)
        }
        if (status === SYNC_AGENT_STATUS.FAILED) {
          this.errorMultHandler(data.error)
          this.endStatusHandler(ANSWER_STATUS.FAIL)
        }
      } catch (error) {
        if (res?.event === 'interrupted') {
          this.lastTalkData.answer = res?.data || ''
        } else {
          this.endStatusHandler(ANSWER_STATUS.FAIL)
        }
      }
    },
    handleFinishEvent(usage) {
      try {
        this.recordRequestStartTime('end')
        this.lastTalkData.usage = usage
      } catch (error) {}
    },
    // 异常综合处理
    errorMultHandler(res) {
      let errorInfo = {}
      try {
        if (typeof res === 'string') {
          errorInfo = {
            code: '',
            message: '服务异常，请稍后重试'
          }
        } else {
          if (res.message) {
            errorInfo = res
          }
        }
      } catch (error) {}

      this.lastTalkData.choices = []
      this.lastTalkData.errorInfo = errorInfo
      this.endStatusHandler(ANSWER_STATUS.FAIL)
    },
    initFetchEventSource() {
      this.fetchEventSource = new FetchEventSourceClass({
        onopen: () => {
          this.handleOpenEventSource()
          this.$emit('chatStart', this.talkDataList)
        },
        onmessage: res => {
          this.massageHandler(res)
          this.$clearSseTimer && this.$clearSseTimer()
        },
        oninterrupted: res => {
          // 敏感词
          this.errorMultHandler(res)
          this.lastTalkData.isInterrupted = true // 敏感词问答组标识符
        },
        onerrorhandle: res => {
          this.errorMultHandler(res)
        },
        onerror: res => {
          // 错误异常
          this.errorMultHandler(res)
        },
        onclose: () => {}
      })
    },
    getTalkList() {
      return this.talkDataList
    },
    setTalkList(talkDataList) {
      this.talkDataList = [].concat(talkDataList)
      // 重置对话参数
      if (this.talkDataList?.length > 0) {
        const { question: text, fileContentList } = this.talkDataList[this.talkDataList.length - 1]
        const { sendParams } = this.getParams({
          text,
          fileContentList: [].concat(fileContentList),
          end: -1
        })
        this.sendParams = sendParams
      } else {
        this.sendParams = this.getBasePrams()
      }

      if (this.currentAgent.agentId === PPT_AGENT_ID) {
        this.conversationId = ''
      }

      let timer = setTimeout(() => {
        this.setScrollBottom()
        clearTimeout(timer)
        timer = null
      }, 50)
    },
    /**
     * @desc:获取历史记录
     * @param {start} 开始索引
     * @param {end} 结束索引
     * @returns {Array} 返回指定历史记录
     */
    getHistory({ start = 0, end }) {
      if (this.talkDataList?.length < 1) {
        return []
      }

      const hisArr = this.talkDataList
        .slice(start, end)
        .filter(item => item.type === ANSWER_TYPE.ORDINARY || item.type === ANSWER_TYPE.TIPS)

      const historyLength = hisArr.length || 0
      if (historyLength < 1) {
        return []
      }

      const result = []

      const tipsLastIndex = hisArr.findLastIndex(item => item.type === ANSWER_TYPE.TIPS)
      let startIndex = tipsLastIndex + 1
      if (historyLength - MAX_HISTORY_NUM > tipsLastIndex) {
        startIndex = historyLength - MAX_HISTORY_NUM
      }

      for (let i = startIndex; i < historyLength; i++) {
        const e = hisArr[i]
        if (e.type === ANSWER_TYPE.ORDINARY) {
          // 过滤掉消息中没返回值的情况，组装成后端需要的历史记录格式，返回
          if (!e.isInterrupted && e.answer) {
            const inputAudio = []
            result.push({
              role: ROLE_TYPE.USER,
              content: e.question,
              imageUrl: e.imageUrl,
              inputAudio: inputAudio,
              videoUrlList: e.videoUrlList || [],
              fileContentList: e.isFileType ? e.fileContentList : []
            })
            if (e.currentTool?.type === TOOLS_TYPE.FUNCTION_CALL && e.functionCall) {
              // 组合函数调用历史记录
              result.push({
                role: ROLE_TYPE.ASSISTANT,
                toolCalls: e.functionCall.toolCalls
              })
              result.push({
                role: ROLE_TYPE.TOOL,
                content: e.functionCall.appendValue
              })
            } else {
              // 通用历史记录
              result.push({
                role: ROLE_TYPE.ASSISTANT,
                content: e.answer
              })
            }
          }
        }
      }
      return result
    },
    // 获取当前配置组合参数
    getCurrentParams(isCode = true) {
      if (!isCode) {
        return this.sendParams
      }

      const baseParams = this.getBasePrams()
      const { messages, ...reset } = this.sendParams
      const params = {
        ...reset,
        ...baseParams,
        messages
      }

      if (typeof this.currentAgent?.transformParams === 'function') {
        this.currentAgent.transformParams(params)
      }
      return params
    },
    // 获取基础通用型参数，对所有模型都适用
    getBasePrams() {
      const cloneParams = cloneDeep(this.params)

      const sendParams = {
        agent_id: this.currentAgent.agentId,
        custom_variables: {
          ...cloneParams
        },
        messages: []
      }

      if (this.stream) {
        sendParams.stream = this.stream
      }

      if (this.currentAgent.agentId === PPT_AGENT_ID) {
        sendParams.conversation_id = this.conversationId
      }

      return sendParams
    },
    getParams(data) {
      const { text, fileContentList, start = 0, end } = data
      const sendParams = this.getBasePrams()
      if (isObject(sendParams) && this.multiwheel) {
        sendParams.messages = this.getHistory({ start, end })
      }

      const extraTalkData = {
        isFileType: false, // 标识是否为fileContentList
        imageUrl: '',
        videoUrlList: [],
        fileContentList: [].concat(fileContentList || [])
      }

      const messagesContents = []
      if (text) {
        messagesContents.push({
          type: 'text',
          text: text
        })
      }

      if (fileContentList?.length > 0) {
        fileContentList.forEach(item => {
          const file_id = item.id || item.fileId
          if (item.status === 'success' && file_id) {
            if (item.customType === 'image' && item?.type.startsWith('image/')) {
              messagesContents.push({
                type: 'image_url',
                image_url: file_id
              })
            } else {
              messagesContents.push({
                type: 'file_id',
                file_id: file_id
              })
            }
          }
        })
      }

      /** ******************组装发送参数*********************/
      const userPrompt = {
        role: ROLE_TYPE.USER,
        content: messagesContents
      }

      // 将当前用户提问内容，push到prompt用来提交
      sendParams.messages.push(userPrompt)
      // 组装面板通用参数
      return { sendParams, extraTalkData }
    },
    getNewChat(data) {
      const { ...reset } = data
      const showCursor = true

      return {
        choices: [],
        type: ANSWER_TYPE.ORDINARY,
        answerStatus: ANSWER_STATUS.WAITTING,
        question: '',
        answer: '',
        reasoningContent: '', // 沉思内容
        timeConsuming: 0,
        usage: null, // 调用模型消耗
        audio: [], // 语音
        webSearch: [], // websearch 搜索结果数据
        showCursor,
        funcHitName: '',
        errorInfo: null,
        isSync: false, // 是否为同步数据
        ...reset
      }
    },
    async sendMessage(data, isReSendMsg = false) {
      if (!this.apiKey) {
        this.$message.error('请输入API Key')
        return
      }
      this.isSending = true
      const { sendParams, extraTalkData } = this.getParams(data)
      this.sendParams = sendParams

      // 创建新一轮对话
      const newChatItem = this.getNewChat({
        ...extraTalkData,
        question: data.text
      })

      // 重新生成先删除上一次的
      if (isReSendMsg) {
        this.talkDataList.splice(-1, 1, newChatItem)
      } else {
        this.talkDataList.push(newChatItem)
      }

      this.setScrollBottom() // 滚动置底
      this.sendRequest()
      this.$emit('updateStatus', {
        isPending: true,
        hasChat: true
      })
    },
    // 重新生成
    reGenerate() {
      const { question: text, fileContentList } = this.lastTalkData
      this.sendMessage(
        {
          text,
          fileContentList: [].concat(fileContentList),
          end: -1
        },
        true
      )
    },
    // 停止生成
    stopGenerate() {
      this.endStatusHandler(ANSWER_STATUS.STOP)
    },
    async pollTaskResult(params, delay = 1000) {
      while (true) {
        const [resultError, resultData] = await this.awaitTo(
          fetchAgentAsyncResultApi(params, this.creatCancelToken(), {
            Authorization: this.apiKey
          })
        )
        if (!resultError) {
          if (
            resultData.status === SYNC_AGENT_STATUS.SUCCESS ||
            resultData.status === SYNC_AGENT_STATUS.FAILED
          ) {
            return [null, resultData]
          }
        } else {
          return [resultError, null]
        }
        await new Promise(resolve => {
          if (this.lastTalkData.answerStatus !== ANSWER_STATUS.STOP) {
            setTimeout(resolve, delay)
          }
        })
      }
    },
    handleSyncRequestResponse(response) {
      const [error, data] = response
      if (!error) {
        if (data.status === SYNC_AGENT_STATUS.SUCCESS) {
          this.massageHandler(data)
          this.endStatusHandler(ANSWER_STATUS.COMPLETE)
        }
        if (data.status === SYNC_AGENT_STATUS.FAILED) {
          this.errorMultHandler(data.error)
        }
      } else {
        // 接口请求错误
        // if (error?.code !== CANCEL_REQUEST_CODE) {
        // }
        if (!axios.isCancel(error)) {
          this.endStatusHandler(ANSWER_STATUS.FAIL)
        }
      }
    },
    // 发送同步请求
    async handleSyncRequest(params) {
      this.handleOpenEventSource()
      this.recordRequestStartTime('start')
      const [error, data] = await this.awaitTo(
        fetchAgentRequestApi(params, this.creatCancelToken(), {
          Authorization: this.apiKey
        })
      )

      if (!error && data.status === SYNC_AGENT_STATUS.PENDING) {
        if (data.async_id) {
          const resultData = await this.awaitTo(
            this.pollTaskResult({
              agent_id: data.agent_id,
              conversation_id: data.conversation_id,
              async_id: data.async_id
            })
          )
          this.handleSyncRequestResponse(resultData?.[1])
        }
      } else {
        if (!axios.isCancel(error)) {
          this.handleSyncRequestResponse([error, data])
        }
      }
    },
    // 发送流式请求
    handleSseRequest(params) {
      const { clearTimer, resetTimeout } = useSSETimeoutHandler(this.endStatusHandler, 300000)
      this.$clearSseTimer = clearTimer
      this.$resetSseTimer = resetTimeout
      this.$resetSseTimer()
      this.recordRequestStartTime('start')

      this.fetchEventSource.fetch({
        url: `${process.env.VUE_APP_API_PATH}/v1/agents`,
        // url: `http://10.253.215.48:9203/v1/agents`,
        data: params,
        headers: {
          Authorization: this.apiKey
        }
      })
    },
    // 发送请求
    sendRequest() {
      const params = cloneDeep(this.sendParams)
      if (typeof this.currentAgent?.transformParams === 'function') {
        this.currentAgent.transformParams(params)
      }
      if (this.stream) {
        // 发送流式请求
        this.handleSseRequest(params)
      } else {
        // 直接结束，不支持该请求方式
        this.handleSyncRequest(params)
      }
    }
    // onMessageHandler(event) {
    //   const { origin, data } = event
    //   if (event.origin !== window.origin) return
    //   if (event.data.type === 'input:prompt') {
    //   }

    //   if (event.data.type === 'action:submit') {
    //   }

    //   if (event.data.type === 'input:prompt:submit') {
    //     console.log('event.data.text', event.data)
    //   }
    // }
  }
  // beforeDestroy() {
  //   window.removeEventListener('message', this.onMessageHandler)
  // }
}
</script>

<style lang="less" scoped>
.chat-wrap {
  box-sizing: border-box;
  position: relative;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  max-height: 100%;
  min-width: 348px;
  padding: 16px 24px 0;
  .chat-content {
    position: relative;
    padding-bottom: 24px;
    scroll-behavior: smooth;
    will-change: transform;
    transform: translateZ(0);
  }
  .new-meeting-tips {
    position: relative;
    font-size: 12px;
    line-height: 17px;
    text-align: center;
    span {
      position: relative;
      padding: 0 4px;
      background: #fff;
      z-index: 1;
    }
    &:before {
      content: '';
      display: block;
      position: absolute;
      top: 8px;
      left: 0;
      z-index: 0;
      width: 100%;
      height: 1px;
      background: #e0e0e0;
    }
  }
  .chat-item {
    &-answer {
      .chat-avatar {
        margin-right: 12px;
      }
    }
    & + .chat-item {
      margin-top: 32px;
    }
  }
  .chat-footer {
    padding: 16px 0;
    .regenerate-stop-btn {
      color: var(--mainTextColor);
      padding: 4px 15px;
      line-height: 22px;
      .iconfont {
        margin-right: 4px;
        font-size: 16px;
      }
      &:hover {
        border-color: rgba(224, 224, 224, 0.6);
        background: rgba(19, 18, 18, 0.08);
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .chat-wrap {
    width: 100%;
    min-width: initial;
  }
}
</style>
