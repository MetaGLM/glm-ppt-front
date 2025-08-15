<template>
  <LayoutWrap
    :loading="loading"
    :isMobile="isMobile"
    :data-disabled="dragDisabled"
    :data-is-custom="isCustomDragFile"
    v-drag-file="dragFileOptions"
    :defaultPercent="defaultPercent"
    :minPercent="minPercent"
    :displayRightPane="displayRightPane"
  >
    <template slot="left">
      <div class="flex1 model-chat-main single-mode">
        <div class="flex scrollbar-style model-chat-content">
          <Chat
            :apiKey="apiKey"
            :key="currentAgent.clientId"
            ref="agentChatRef"
            class="model-chat-content-item"
            :currentAgent="currentAgent.data"
            :clientId="currentAgent.clientId"
            :params="chatParams"
            :showEmpty="currentAgent.states.showEmpty"
            :multiwheel="currentAgent.data.multiChat"
            :stream="currentAgent.data.stream"
            v-bind="chatBoxProps"
            @updateStatus="handleUpdateStatus"
            @chooseExample="chooseExample"
            @start-dialog="startDialog"
          >
            <template slot="header">
              <ChatHeader
                :data="currentAgent.data"
                :disabled="isPending"
                @switchModel="openModelModal"
              >
                <template slot="right-extra">
                  <el-input
                    placeholder="请输入API Key"
                    size="small"
                    style="width: 300px"
                    maxlength="200"
                    v-model="apiKey"
                    clearable
                    :disabled="isPending"
                  />
                  <ClearChat
                    cacheKey="clear_agent__"
                    :disabled="!hasChat || isPending"
                    @clear-chat="handleClearChat"
                  />
                </template>
              </ChatHeader>
            </template>
          </Chat>
        </div>
      </div>
      <SearchBox
        class="flex-none"
        ref="searchBoxRef"
        :disabled="sendBoxDisabled"
        :disableInput="disableInput"
        :isSending="isPending"
        :isRecording="isRecording"
        :isMobile="isMobile"
        v-bind="searchBoxProps"
        @on-send="triggerSendMsg"
      >
        <template>
          <SearchBoxTop
            slot="top"
            :parameterConfig="currentAgent.topParameterConfig"
            :value="currentAgent.topConfigValue"
            :agentId="currentAgent.data.agentId"
            @change="handleTopConfigChange"
          />
        </template>
      </SearchBox>
      <SelectAgent
        ref="selectModelRef"
        :dataSource="agentDatasource"
        :max="1"
        :addedModel="addModel"
        :fullscreen="isMobile"
        @close="handleCloseSelectModel"
      />
    </template>
    <template slot="paneRight">
      <PPTPreviewer
        v-show="controlsPane === 'ppt'"
        @closePane="initRightPane"
        :apiKey="apiKey"
        :pptName="pptName"
        :agentId="currentAgent.data.agentId"
        :conversationId="conversationId"
        :isMobile="isMobile"
      />
      <SearchResult
        v-show="controlsPane === 'search'"
        @closePane="initRightPane"
        :isMobile="isMobile"
      />
    </template>
  </LayoutWrap>
</template>

<script>
import event from '@/utils/event'
import { getUuid } from '@/utils/tools'
import { handleParamValues } from '@/utils/model'
import ClearChat from '@/components/Chat/ClearChat.vue'
import SelectAgent from './components/SelectAgent.vue'
import LayoutWrap from './components/LayoutWrap.vue'
import SearchBox from './components/SearchBox.vue'
import SearchBoxTop from './components/SearchBoxTop.vue'
import ChatHeader from './components/Chat/ChatHeader.vue'
import Chat from './components/Chat/Index.vue'
import PPTPreviewer from './components/PPT/PPTPreviewer.vue'
import SearchResult from './components/Search/SearchResult.vue'
import { getAgentCategoryList } from './config'
import { DEFAULT_STATUS, EVENT_BUS } from './config/constants'
import { AGENT_LIST } from '@/utils/agent/index'
import { mapActions } from 'vuex'

export default {
  name: 'ModelTrialContent',
  components: {
    LayoutWrap,
    SearchBox,
    SearchBoxTop,
    SelectAgent,
    ChatHeader,
    Chat,
    ClearChat,
    PPTPreviewer,
    SearchResult
  },
  data() {
    return {
      apiKey: '', // APIKEY
      isMobile: false,
      loading: false,
      agentList: [],
      sceneId: '', // 场景id
      switchClientId: '',
      isRecording: false,
      cacheModelParams: new Map(),
      sessionId: '',
      isInserting: false, // 插入记录状态
      currentAgent: {
        data: {},
        states: {}
      }, // 当前体验智能体
      watchTopConfigMap: new Map(),
      watchRightConfigMap: new Map(),
      defaultPercent: 100, // 分割面板默认百分比
      minPercent: 0, // 面板最小百分比
      displayRightPane: false, // 是否显示右侧面板
      controlsPane: '', // 显示的面板：PPT、Search
      conversationId: '', // 当前会话ID
      pptName: '', // 生成PPT的名字
      pptPaneLoading: '' // PPT预览面板loading
    }
  },
  provide() {
    return {
      /**
       * 通用更新数据方法，用于更新父组件的值
       * 优先基础类型，更新引用类型时，需要深拷贝
       * 仅用于SearchBox与此组件数据交互
       */
      updateParentData: (key, value) => {
        if (Object.prototype.hasOwnProperty.call(this, key)) {
          this[key] = value
        }
      }
    }
  },
  computed: {
    agentDatasource() {
      return getAgentCategoryList(AGENT_LIST)
    },
    hasChat() {
      return this.currentAgent.states.hasChat
    },
    isPending() {
      return this.currentAgent.states.isPending
    },
    // 中断体验
    isInterrupting() {
      return this.currentAgent.states.isInterrupting
    },
    sendBoxDisabled() {
      return this.isPending || this.isInterrupting
    },
    // 禁用输入
    disableInput() {
      if (this.searchBoxProps?.disableInput) {
        return true
      }
      return this.isPending || this.isInterrupting
    },
    searchBoxProps() {
      if (!this.currentAgent?.data) {
        return {}
      }
      const { setting = {}} = this.currentAgent.data
      return {
        ...setting.textProps,
        selectionType: setting.selectionType || 'anyOf',
        imgUploadOptions: setting.imageProps,
        fileUploadOptions: setting.fileProps
      }
    },
    chatBoxProps() {
      return {
        showCost: true
      }
    },
    dragDisabled() {
      if (this.isPending || this.isInterrupting) {
        return 'true'
      }
      if (
        this.searchBoxProps?.fileUploadOptions?.show ||
        this.searchBoxProps?.imgUploadOptions?.show
      ) {
        return 'false'
      }
      return 'true'
    },
    dragFileOptions() {
      return {
        getDragFile: this.getDragFile
      }
    },
    // 是否自定义处理拖放文件逻辑
    isCustomDragFile() {
      if (this.searchBoxProps?.fileUploadOptions?.show) {
        return 'true'
      }
      return 'false'
    },
    chatParams() {
      return {
        ...this.currentAgent.configValue,
        ...this.currentAgent.topConfigValue
      }
    }
  },
  watch: {
    isMobile(val) {
      if (val) {
        this.initRightPane()
      }
    }
  },
  mounted() {
    this.init()
    // 监听PPT面板开启
    event.$on(EVENT_BUS.PPT_PANE_OPEN, this.openPPTPane)
  },
  beforeDestroy() {
    this.watchTopConfigMap.clear()
    this.watchRightConfigMap.clear()
    event.$off(EVENT_BUS.PPT_PANE_OPEN, this.openPPTPane)
  },
  methods: {
    ...mapActions('AgentTrial', ['resetData']),
    initRightPane() {
      this.minPercent = 0
      this.defaultPercent = 100
      this.displayRightPane = false
    },
    async openPPTPane({ controlsPane, pptName, conversationId }) {
      // 如果右侧面板已打开就不再触发打开操作
      if (this.displayRightPane) return
      this.controlsPane = controlsPane
      this.pptName = pptName
      this.conversationId = conversationId
      // await this.$nextTick()
      this.displayRightPane = true
      if (!this.isMobile) {
        this.defaultPercent = 50
        this.minPercent = 20
      }
    },
    async init() {
      try {
        // 地址栏带了场景id的情况
        this.loading = true
        const { agentId } = this.$route.query || {}

        const agentList = AGENT_LIST
        this.agentList = agentList

        let targetModel
        if (agentId) {
          targetModel = agentList.find(item => item.agentId === agentId)
        }

        if (!targetModel) {
          targetModel = agentList[0]
          this.$router.replace(`/home?agentId=${targetModel.agentId}`)
        }

        if (targetModel) {
          this.currentAgent = await this.getClientModel({ agentData: targetModel })
          this.handleConfigChange(this.currentAgent.configValue)
          this.handleTopConfigChange(this.currentAgent.topConfigValue)
        }

        this.loading = false
      } catch (error) {
        console.log(error)
      }
    },
    // 创建客户端模型数据
    createClientModel({ agentData, states = {}, parameterConfig = [] }) {
      const clientId = getUuid()

      const mergeParameterConfig = parameterConfig || []
      const { result = [], valueData } = handleParamValues(mergeParameterConfig, {
        hasDeleteKey: false
      })

      const rightParameterConfig = []
      const topParameterConfig = []
      this.watchTopConfigMap.clear()
      this.watchRightConfigMap.clear()

      const topConfigValue = {}
      if (result?.length > 0) {
        result.forEach(item => {
          let watchItem = null
          if (item.watch?.length > 0) {
            watchItem = {
              config: item,
              watch: item.watch
            }
          }
          if (item.layout === 'top') {
            topParameterConfig.push(item)
            topConfigValue[item.paramCode] = valueData[item.paramCode]
            if (watchItem) {
              this.watchTopConfigMap.set(item.paramCode, watchItem)
            }
          } else {
            rightParameterConfig.push(item)
            if (watchItem) {
              this.watchRightConfigMap.set(item.paramCode, watchItem)
            }
          }
        })
      }

      return {
        clientId,
        data: { ...agentData },
        parameterConfig: rightParameterConfig,
        configValue: {
          ...valueData
        },
        topParameterConfig,
        topConfigValue,
        states: {
          ...DEFAULT_STATUS,
          ...states
        }
      }
    },
    async getClientModel({ agentData, states }) {
      if (!agentData) {
        return null
      }
      const { paramsList, ...reset } = agentData

      return this.createClientModel({
        agentData: reset,
        parameterConfig: paramsList || [],
        states
      })
    },
    openModelModal() {
      if (typeof this.$refs.selectModelRef?.open === 'function') {
        this.$refs.selectModelRef.open([this.currentAgent.data.agentId])
      }
    },
    addModel(value) {
      if (value?.agentId === this.currentAgent.data.agentId) {
        this.handleCloseSelectModel()
        return
      }
      return this.getClientModel({ agentData: value }).then(res => {
        this.currentAgent = res
        this.handleCloseSelectModel()
        this.resetSearchBox()
        this.handleConfigChange(res.configValue)
        this.handleTopConfigChange(res.topConfigValue)
        this.$router.push(`/home?agentId=${res.data.agentId}`)
      })
    },
    handleCloseSelectModel() {
      this.switchClientId = ''
    },
    handleConfigChange(val) {
      if (this.watchRightConfigMap.size > 0) {
        for (const [key, item] of this.watchRightConfigMap) {
          if (item[key] !== val[key]) {
            item.watch.forEach(watch => {
              if (watch === 'searchBox') {
                const targetOption = item.config.options.find(option => option.value === val[key])
                this.$nextTick(() => {
                  if (targetOption && this.$refs.searchBoxRef) {
                    this.$refs.searchBoxRef.setInputValue(targetOption.prompt)
                  }
                })
              }
            })
          }
          item[key] = val[key]
        }
      }
      this.currentAgent.configValue = val
    },
    handleTopConfigChange(val) {
      if (this.watchTopConfigMap.size > 0) {
        for (const [key, item] of this.watchTopConfigMap) {
          if (item[key] !== val[key]) {
            item.watch.forEach(watch => {
              if (watch === 'searchBox') {
                const targetOption = item.config.options.find(option => option.value === val[key])
                this.$nextTick(() => {
                  if (targetOption && this.$refs.searchBoxRef) {
                    this.$refs.searchBoxRef.setInputValue(targetOption.prompt)
                  }
                })
              }
            })
          }
          item[key] = val[key]
        }
      }
      this.currentAgent.topConfigValue = val
    },
    // watch
    // 配置参数发生变化，执行相应的动作
    configExecuteAction(list, value) {},
    getExampleConfigValue(list, params) {
      const configValue = {}
      if (list?.length > 0) {
        list.forEach(item => {
          if (params && Object.prototype.hasOwnProperty.call(params, item.paramCode)) {
            configValue[item.paramCode] = params[item.paramCode]
          } else {
            configValue[item.paramCode] = item.def
          }
        })
      }

      return configValue
    },
    chooseExample(item) {
      // 发送消息
      // 检测是已有异步任务在进行

      let fileContentList = []
      if (item.images?.length > 0) {
        fileContentList = item.images
      }

      const configValue = this.getExampleConfigValue(this.currentAgent.parameterConfig, item.params)
      const topConfigValue = this.getExampleConfigValue(
        this.currentAgent.topParameterConfig,
        item.params
      )

      this.handleConfigChange(configValue)
      this.handleTopConfigChange(topConfigValue)

      this.$nextTick(() => {
        this.triggerSendMsg({
          text: item.text,
          fileContentList
        })
      })
    },
    // 发送消息
    triggerSendMsg(data) {
      this.$nextTick(() => {
        const chatRef = this.$refs.agentChatRef
        if (chatRef) {
          chatRef.sendMessage(data)
        }
        if (!this.currentAgent.data?.clearPrompt) {
          this.resetSearchBox()
        }
      })
    },
    handleFocus() {
      if (typeof this.$refs.searchBoxRef?.focus === 'function') {
        this.$refs.searchBoxRef.focus()
      }
    },
    handleBlur() {
      if (typeof this.$refs.searchBoxRef?.blur === 'function') {
        this.$refs.searchBoxRef.blur()
      }
    },
    resetSearchBox() {
      if (typeof this.$refs.searchBoxRef?.resetSearchBox === 'function') {
        this.$refs.searchBoxRef.resetSearchBox()
      }
    },
    handleUpdateStatus(data) {
      this.currentAgent.states = {
        ...this.currentAgent.states,
        ...data
      }
    },
    // 点击voice 开始对话
    startDialog() {
      this.$refs.searchBoxRef.startDialog()
    },
    // 清空对话内容
    handleClearChat() {
      const chatRef = this.$refs.agentChatRef
      if (chatRef) {
        chatRef.setTalkList([])
        this.resetData() // 清空数据
      }
      this.currentAgent.states = {
        showEmpty: true,
        hasChat: false,
        isPending: false,
        isInterrupting: false
      }
      this.initRightPane()
    },
    // 拖拽文件上传
    getDragFile(files) {
      if (this.searchBoxProps.showUploadFile) {
        this.$refs.searchBoxRef.addOriginFiles(files)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.model-chat-main {
  box-sizing: border-box;
  max-width: 848px;
  width: 90%;
  height: 0;
  margin: 0 auto;
  transition: all 0.2s;
  .model-chat-content {
    overflow: hidden;
    overflow-x: auto;
    height: 100%;
    &-item {
      padding-left: 0;
      padding-right: 0;
    }
  }
  .chat-view-code {
    width: 32px;
    height: 32px;
    font-size: 20px;
    color: #5e5e66;
    border-radius: 6px;
    border: 1px solid rgba(224, 224, 224, 0.6);
  }
}
</style>
