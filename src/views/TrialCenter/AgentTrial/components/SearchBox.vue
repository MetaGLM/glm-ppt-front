<template>
  <div class="search-box-wrapper">
    <slot name="top"></slot>
    <div
      class="search-box"
      :class="{
        focus: isFocus,
        disabled: innerDisableInput,
        limit: inputLength > maxLength,
        'is-empty': inputLength < 1
      }"
      ref="searchBoxRef"
      @click="focus"
    >
      <FileList
        v-if="fileContentList && fileContentList.length > 0"
        :fileList="fileContentList"
        @change="updateFileList"
        @reUpload="reUploadFile"
      />
      <template v-else>
        <div v-if="isRecording" class="recording-status flex flex-y-center">
          <img
            src="https://cdn.bigmodel.cn/static/platform/images/trialcenter/user-speaking.gif"
            alt=""
            draggable="false"
          /><span>{{ recordTimeText }}</span>
        </div>
      </template>
      <div class="flex flex-between search-box-container">
        <div v-if="showRecordVoice" class="flex-none search-box-left">
          <RecordVoice
            ref="recordVoiceRef"
            :disabled="disabledRecording"
            :speakingable="false"
            :maxRecordDuration="maxRecordDuration"
            @onRecording="handleVoiceRecording"
            @onStop="handleVoiceStop"
            @speakingChange="handleSpeakingChange"
            @onProgress="handleVoiceProgress"
          />
        </div>
        <div
          class="flex1 flex flex-between search-box-content"
          :class="{
            'column-layout': isRowFull
          }"
          ref="searchBoxContent"
        >
          <div class="flex1 search-box-input">
            <el-input
              :autosize="{ minRows: 1 }"
              resize="none"
              enterkeyhint="send"
              type="textarea"
              ref="textbox"
              class="scroll-display-none"
              :class="{ 'row-full': isRowFull }"
              :placeholder="innerPlaceholder"
              :disabled="innerDisableInput"
              @keydown.enter.native="eventListen"
              v-model="inputValue"
            />
            <pre ref="shadow" class="textbox-shadow">{{ inputValue }}</pre>
          </div>
          <div class="flex-none flex search-box-right">
            <div
              v-if="isRowFull"
              class="flex-none input-length"
              :class="{ 'over-limit': inputLength > maxLength }"
            >
              <span class="input-length-text">{{ inputLength }}</span
              >/<span>{{ maxLength }}</span>
            </div>
            <div class="flex flex-x-end flex-y-center">
              <AutoTooltip
                :isAuto="false"
                placement="top"
                effect="dark"
                :visibleArrow="true"
                :inline="true"
                :content="$t('model_trial.search_box.enter')"
              >
                <span
                  class="common-icon action-btn submit-btn"
                  :class="{
                    disabled: sendDisabled,
                    active: !sendDisabled
                  }"
                  data-sensors-click
                  name="提交"
                  @click="send"
                >
                  <i class="iconfont icon-send1"></i>
                </span>
              </AutoTooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { isObject } from 'lodash-es'
import AutoTooltip from '@/components/AutoTooltip.vue'
import FileList from '@/components/Chat/FileList/Index.vue'
import { SELECTION_TYPE } from '@/utils/agent/constant'

export default {
  name: 'SearchBox',
  components: {
    RecordVoice: () => import('@/components/RecordVoice.vue'),
    AutoTooltip,
    FileList
  },
  props: {
    disabled: {
      // 禁止发送
      type: Boolean,
      default: false
    },
    disableInput: {
      type: Boolean,
      default: false
    },
    // 是否发送中
    isSending: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    // 输入框最大长度
    maxLength: {
      type: Number,
      default: 200000
    },
    showRecordVoice: {
      type: Boolean,
      default: false
    },
    isRecording: {
      // 是否正在录音
      type: Boolean,
      default: false
    },
    fileUploadOptions: {
      type: Object,
      default: () => ({})
    },
    imgUploadOptions: {
      type: Object,
      default: () => ({})
    },
    transformFileData: {
      type: Function,
      default: function(data) {
        return data
      }
    },
    maxRecordDuration: {
      type: Number,
      default: 600
    },
    selectionType: {
      type: String,
      default: SELECTION_TYPE.ANY_OF,
      validator: function(value) {
        return Object.values(SELECTION_TYPE).includes(value)
      }
    }
  },
  data() {
    return {
      isRowFull: false,
      inputValue: '',
      fileContentList: [],
      isSpeaking: false,
      recordTimeText: '00:00',
      isFocus: false,
      successFileList: [],
      resizeObserver: null,
      imgList: [],
      fileList: []
    }
  },
  inject: ['updateParentData'],
  computed: {
    inputLength() {
      return this.inputValue ? this.inputValue.trim().length : 0
    },
    sendDisabled() {
      if (this.disabled || this.sending) {
        return true
      }
      if (this.allowInputEmpty) {
        return false
      }

      if (this.inputLength < 1 || this.inputLength > this.maxLength) {
        return true
      }

      if (this.selectionType === SELECTION_TYPE.BOTH && this.fileContentList?.length < 1) {
        return true
      }

      return false
    },
    innerDisableInput() {
      if (this.selectionType === SELECTION_TYPE.ONE_OF && this.fileContentList?.length > 0) {
        return true
      }
      return this.disableInput
    },
    disabledFileUpload() {
      if (this.selectionType === SELECTION_TYPE.ONE_OF && this.inputLength > 0) {
        return true
      }
      const { limit } = this.innerFileUploadOptions
      return this.disabled || this.handlerLimit(this.fileList, limit) || this.isRecording
    },
    disabledImgUpload() {
      if (this.selectionType === SELECTION_TYPE.ONE_OF && this.inputLength > 0) {
        return true
      }
      const { limit } = this.innerImgUploadOptions
      return this.disabled || this.handlerLimit(this.imgList, limit) || this.isRecording
    },
    disabledRecording() {
      return this.fileContentList.length > 0 || this.disabled
    },
    innerPlaceholder() {
      // 请上传视频并发出指令，我可以理解视频内容，并回答相关问题
      if (this.placeholder) {
        return this.placeholder
      }
      return this.$t('model_trial.search_box.ideas')
    },
    innerFileUploadOptions() {
      const {
        limitTooltip,
        limit = 1,
        tooltip = '上传文件',
        show = false,
        ...reset
      } = this.fileUploadOptions || {}
      return {
        show,
        tooltip: this.handlerLimit(this.fileList, limit) ? limitTooltip : tooltip,
        limit,
        data: {
          purpose: 'agent'
        },
        ...reset
      }
    },
    innerImgUploadOptions() {
      const {
        limit = 1,
        tooltip = '上传图片',
        limitTooltip,
        show = false,
        ...reset
      } = this.imgUploadOptions || {}
      return {
        show,
        tooltip: this.handlerLimit(this.imgList, limit) ? limitTooltip : tooltip,
        limit,
        data: {
          purpose: 'agent'
        },
        ...reset
      }
    },
    allowInputEmpty() {
      if (this.innerDisableInput || this.selectionType === SELECTION_TYPE.ANY_OF) {
        if (this.successFileList?.length > 0) {
          return true
        }
      }
      return false
    }
  },
  watch: {
    isSending(val) {
      this.$nextTick(() => {
        if (val) {
          this.blur()
        } else {
          this.focus()
        }
      })
    },
    inputValue() {
      this.$nextTick(() => {
        this.computedRowFull()
      })
    },
    fileContentList: {
      handler(val) {
        if (val?.length < 1) {
          this.successFileList = []
          this.imgList = []
          this.fileList = []
        } else {
          const successFileList = []
          const imgList = []
          const fileList = []
          val.forEach(item => {
            if (this.imgUploadOptions.show && item.raw.type.indexOf('image/') > -1) {
              item.customType = 'image'
              imgList.push(item)
            } else {
              fileList.push(item)
            }
            if (item.status === 'success') {
              successFileList.push(item)
            }
          })
          this.successFileList = successFileList
          this.imgList = imgList
          this.fileList = fileList
        }
      },
      deep: true
    },
    disabledRecording(val) {
      this.updateParentData('guideDisabled', val)
    }
  },
  mounted() {
    window.addEventListener('click', this.clickOutSide, false)
    // 创建ResizeObserver实例
    if (ResizeObserver) {
      this.resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          // 展开时，更新内容是否溢出
          if (entry.target === this.$refs.searchBoxRef) {
            const inputValue = this.inputValue
            this.inputValue = ''
            this.$nextTick(() => {
              this.inputValue = inputValue
              this.computedRowFull()
            })
          }
        }
      })
      this.resizeObserver.observe(this.$refs.searchBoxRef)
    } else {
      window.addEventListener('resize', this.computedRowFull, false)
    }
  },
  beforeDestroy() {
    window.addEventListener('click', this.clickOutSide, false)
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(this.$refs.searchBoxRef)
    } else {
      window.removeEventListener('resize', this.computedRowFull, false)
    }
  },
  methods: {
    setInputValue(val) {
      this.inputValue = val
    },
    reUploadFile(index) {
      this.fileContentList[index].status = 'ready'
      this.fileUpload()
    },
    // 重置提问框状态和相关值
    resetSearchBox() {
      this.inputValue = ''
      // this.focus()
      // 清空上传文件列表
      this.fileContentList = []
      this.computedRowFull()
    },
    focus() {
      if (this.innerDisableInput && this.disabled) {
        return
      }
      this.isFocus = true
      if (typeof this.$refs.textbox?.focus === 'function') {
        this.$refs.textbox.focus()
      }
    },
    blur() {
      this.isFocus = false
      if (typeof this.$refs.textbox?.blur === 'function') {
        this.$refs.textbox.blur()
      }
    },
    clickOutSide(e) {
      if (this.$refs.searchBoxRef) {
        const isInner = this.$refs.searchBoxRef.contains(e.target)
        if (!isInner) {
          this.blur()
        }
      } else {
        this.blur()
      }
    },
    // 动态计算是否展示全行宽
    computedRowFull() {
      const shadow_w = this.$refs.shadow.clientWidth
      const realWidth = this.$refs.searchBoxContent.offsetWidth
      if (shadow_w > realWidth) {
        this.isRowFull = true
      } else {
        this.isRowFull = false
      }
    },
    // 向组件外抛出发送的信息
    send() {
      if (this.sendDisabled) {
        return
      }
      if (this.fileContentList?.length > 0) {
        const hasUploading = this.fileContentList.some(
          item => item.status === 'ready' || item.status === 'uploading'
        )
        if (hasUploading) {
          this.$message.error(this.$t('model_trial.search_box.file_uploading_tip'))
          return
        }
      }

      if (this.isRecording) {
        this.stopDialog()
        this.waitingRecordStop = true
        return
      }

      const fileContentList = this.fileContentList.reduce((arr, item) => {
        if (item.status === 'success') {
          const newItem = {
            fileId: item.fileId,
            name: item.name,
            size: item.size,
            status: item.status,
            url: item.raw ? URL.createObjectURL(item.raw) : '', // 重新组装file 数据，对url重新获取
            type: item.raw?.type,
            customType: item.customType
          }

          if (!newItem.url) {
            // 图片资源
            if (item?.raw?.type && item.raw.type.indexOf('image') > -1) {
              newItem.raw = item.raw
            }
          }
          arr.push(newItem)
        }
        return arr
      }, [])

      this.$emit('on-send', {
        text: this.inputLength > 0 ? this.inputValue : '',
        fileContentList
      })
    },
    // 处理回车动作
    eventListen(event) {
      if (event.keyCode === 13) {
        if (event.shiftKey) {
          return false
        } else {
          event.preventDefault() // ☆阻止元素发生默认行为.阻止enter键回车换行.☆☆最重要一步
          event.stopPropagation() // 阻止事件冒泡
          this.send()
        }
      }
    },
    fileUpload() {
      const uploadRef = this.$refs.fileUploadRef || this.$refs.imgUploadRef
      if (uploadRef) {
        uploadRef.submit()
      }
    },
    addOriginFiles(files) {
      const uploadRef = this.$refs.fileUploadRef || this.$refs.imgUploadRef
      if (uploadRef) {
        uploadRef.addOriginFiles(files)
      }
    },
    handlerLimit(list, limit) {
      const arr = list.filter(item => item.status === 'success')
      return arr.length >= limit
    },
    async updateFileList({ fileList: values }) {
      if (values?.length < 1) {
        this.fileContentList = []
        return
      }
      const results = []
      for (const item of values) {
        let { response, status, raw, ...reset } = item
        let fileId = ''
        if (this.imgUploadOptions.autoUpload === false) {
          if (status !== 'success' && typeof this.transformFileData === 'function') {
            const customItem = this.transformFileData({ fileData: item })
            if (customItem && customItem.then) {
              try {
                const fileData = await customItem
                results.push(fileData)
              } catch (error) {
                // no do anything
              }
            } else if (isObject(customItem)) {
              results.push(customItem)
            }
          } else {
            results.push({
              ...reset,
              raw,
              status: 'success'
            })
          }
        } else {
          if (status === 'success') {
            fileId = item.fileId || response?.url || response?.data?.id || ''
            if (response && response?.code !== 200) {
              status = 'fail'
            }
          }
          results.push({
            ...reset,
            raw,
            status,
            fileId
          })
        }
      }
      this.fileContentList = results
      // 处理录音中，提交信息场景
      this.$nextTick(() => {
        if (this.waitingRecordStop) {
          this.send()
          this.waitingRecordStop = false
        }
      })
    },
    getChangeFileList({ fileList, file, oldFileList = [] }) {
      let results = []
      // 新增操作
      if (oldFileList.length < fileList?.length && file) {
        results = [].concat(this.fileContentList)
        results.push(file)
      } else {
        this.fileContentList.forEach(item => {
          const targetItem = fileList.find(fileItem => fileItem.uid === item.uid)
          if (targetItem) {
            results.push(targetItem)
          } else {
            const isExisted = oldFileList.some(imgItem => imgItem.uid === item.uid)
            if (!isExisted) {
              results.push(item)
            }
          }
        })
      }
      return results
    },
    handleFileList({ fileList, file }) {
      const results = this.getChangeFileList({
        fileList,
        file,
        oldFileList: this.fileList
      })
      this.updateFileList({ fileList: results, file })
    },
    handleImgList({ fileList, file }) {
      const results = this.getChangeFileList({
        fileList,
        file,
        oldFileList: this.imgList
      })
      this.updateFileList({ fileList: results, file })
    },
    startDialog() {
      if (this.$refs.recordVoiceRef) {
        this.$refs.recordVoiceRef.startRecording()
      }
    },
    stopDialog() {
      if (this.isRecording) {
        if (this.$refs.recordVoiceRef) {
          this.$refs.recordVoiceRef.stopRecording()
        }
      }
    },
    handleVoiceRecording() {
      this.updateParentData('isRecording', true)
    },
    handleVoiceStop({ blob, url }) {
      this.updateParentData('isRecording', false)
      const uid = 'audio_' + Date.now()
      this.updateFileList([
        {
          customType: 'audio',
          status: 'ready',
          raw: blob,
          url: url,
          uid: uid,
          name: uid + '.wav',
          size: blob.size,
          percentage: 100
        }
      ])
    },
    handleSpeakingChange(val) {
      this.isSpeaking = val
    },
    handleVoiceProgress({ text }) {
      this.recordTimeText = text
    }
  }
}
</script>

<style lang="less" scoped>
.search-box-wrapper {
  box-sizing: border-box;
  width: 90%;
  max-width: 848px;
  margin: 16px auto 0;
}

.search-box {
  padding: 9px 15px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  background: #fff;
  &.focus {
    border-color: #134cff;
    background-color: #fff;
    cursor: initial;
  }
  &.disabled {
    background: #f7f8fa;
  }
  &.limit {
    border-color: #f01d24;
  }
  &.is-empty {
    .search-box-right {
      padding-left: 0;
    }
  }
  .action-btn {
    width: 32px;
    height: 32px;
    line-height: 32px;
    font-size: 28px;
  }

  &-container {
    align-items: flex-start;
  }

  &-content {
    &.column-layout {
      flex-direction: column;
      .search-box-input {
        width: 100%;
      }
      .search-box-right {
        justify-content: space-between;
        width: 100%;
        margin-top: 12px;
        padding-left: 0;
      }
    }
  }
  &-input {
    min-width: 0;
    .el-textarea {
      box-sizing: border-box;
      position: relative;
      z-index: 2;
      overflow: hidden;
      overflow-y: auto;
      min-height: 28px;
      max-height: 282px;
      margin-top: 2px;
      -ms-overflow-style: none; /* IE 10+ */
      scrollbar-width: none; /* Firefox */
      &::-webkit-scrollbar {
        display: none; /* Chrome Safari */
      }
      &.is-disabled {
        ::v-deep .el-textarea__inner {
          color: var(--colorTextPlaceholder);
        }
      }
      ::v-deep .el-textarea__inner {
        padding: 0;
        color: var(--mainTextColor);
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 28px;
        outline: none;
        border: none;
        background-color: #fff0;
        border-radius: 0;
        -ms-overflow-style: none; /* IE 10+ */
        scrollbar-width: none; /* Firefox */
        &::-webkit-scrollbar {
          display: none; /* Chrome Safari */
        }
        &::placeholder {
          font-size: 16px;
          font-style: normal;
          font-weight: 400;
          line-height: 28px;
          color: #b0b1b8;
        }
      }
    }
    .textbox-shadow {
      position: absolute;
      bottom: 0;
      left: -100%;
      transform: translate3d(0, 200px, 0);
      z-index: -2;
      visibility: hidden;
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      opacity: 0;
    }
  }
  &-right {
    box-sizing: border-box;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    padding-left: 14px;

    .submit-btn {
      margin-left: 8px;
      color: #fff;
      .iconfont {
        font-size: 20px;
      }
      &.active {
        background: linear-gradient(229deg, #a260ff -31.99%, #134cff 82.46%);
        &:active,
        &:hover {
          background: linear-gradient(229deg, #a260ff -31.99%, #134cff 82.46%);
        }
      }
      &.disabled {
        background: linear-gradient(229deg, #e0e1fd -31.99%, #99bdff 85.43%);
      }
    }

    .input-length {
      color: #8d8e99;
      font-size: 12px;
      line-height: 18px;
      &.over-limit {
        color: #f01d24;
        .input-length-text {
          color: #f01d24;
        }
      }
      &-text {
        color: #5e5e66;
        font-weight: 500;
      }
    }
  }
  .recording-status {
    max-width: 200px;
    height: 36px;
    margin-bottom: 20px;
    img {
      width: 100%;
      height: 100%;
      user-select: none;
      appearance: none;
      -webkit-user-drag: none;
      user-drag: none;
    }
    span {
      margin-left: 4px;
      font-size: 12px;
      line-height: 22px;
      color: var(--primaryColor);
    }
  }
  ::v-deep .record-voice {
    margin-right: 10px;
  }
}
</style>
