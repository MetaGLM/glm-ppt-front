<template>
  <div
    class="ppt-render-container w-full max-w-full pr"
    ref="containerRef"
    :id="`ppt-render-${idx}`"
  >
    <div
      class="tab-container absolute flex justify-between items-center hidden"
      :class="{ 'tab-container__end': editing }"
    >
      <div v-if="!editing" class="operator__tabs">
        <el-radio-group v-model="showType" @change="changeStyle">
          <!-- :disabled="processing" -->
          <el-radio-button label="preview">{{ $t('base.preivew') }}</el-radio-button>
          <el-radio-button label="html">HTML</el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="showType === PPT_SHOW_TYPE.PREVIEW" class="flex items-center">
        <template v-if="!editing">
          <!-- <el-button
            v-if="showEdit"
            class="common-btn flex gap-8"
            icon="iconfont icon-auth-modify"
            type="primary"
            size="small"
            :disabled="!editable"
            @click="handlerEdit"
            >{{ $t('base.edit') }}</el-button
          > -->
          <div class="current-page flex flex-center">{{ idx + 1 }}/{{ total }}</div>
        </template>
        <template v-else-if="showEdit">
          <el-button
            class="common-btn flex gap-8"
            type="primary"
            size="small"
            @click="handlerCancel"
            >{{ $t('common.cancel') }}</el-button
          >
          <el-button
            class="common-btn flex gap-8"
            type="primary"
            size="small"
            :disabled="loadingUpdate"
            @click="handlerSave"
            >{{ $t('common.save') }}</el-button
          >
        </template>
      </div>
      <el-button
        v-if="showType === PPT_SHOW_TYPE.HTML"
        class="common-btn flex gap-8"
        icon="iconfont icon-copy"
        size="small"
        :disabled="processing"
        @click="copy(pptRaw.textContent)"
        >{{ $t('base.copy') }}</el-button
      >
    </div>
    <div v-if="!pptRaw.textContent.length" class="skeleton w-full flex aspect-16-9">
      <el-skeleton :loading="true" animated />
    </div>
    <template v-else>
      <div
        class="w-full aspect-16-9 overflow-auto"
        :class="[showType === PPT_SHOW_TYPE.HTML ? 'flex' : 'hidden']"
      >
        <CodeView
          ref="codeViewRef"
          :code="pptRaw.textContent"
          :copyContent="JSON.stringify(pptRaw.textContent)"
          :modeIsShow="false"
          :styleType="2"
          codeLanguage="html"
          :codeClass="'language-html'"
          :showLineNumbers="true"
          :isWrap="true"
          copyBtn="never"
          class="w-full"
        />
      </div>
      <div
        v-if="processing"
        class="skeleton w-full flex justify-center aspect-16-9 p-2"
        :class="[showType === PPT_SHOW_TYPE.PREVIEW ? 'block' : 'hidden']"
      >
        <el-skeleton :loading="true" animated />
      </div>
      <div
        v-else
        class="iframe-container w-full overflow-hidden relative"
        :class="[
          showType === PPT_SHOW_TYPE.PREVIEW ? 'block' : 'hidden',
          loaded ? '' : 'aspect-16-9'
        ]"
      >
        <div
          class="spinner absolute top-0 left-0 w-full h-full flex items-center justify-center"
          :class="{ hidden: loaded }"
        >
          <img src="~@/assets/images/svg/spinner.svg" alt="Loading" />
        </div>
        <div
          class="mask absolute top-0 left-0 w-full h-full flex items-center justify-center gap-2"
          :class="{ hidden: !filter }"
        ></div>
        <!--不加此条件也行 v-if="pptRaw.status === PPT_STATUS.DONE" -->
        <iframe
          ref="iframeRef"
          title="PPT"
          :srcdoc="
            editing ? artifactsEditor.codeSerialized : proxyIframeResources(pptRaw.textContent)
          "
          frameborder="0"
          allowfullscreen
          src="about:blank"
          class="iframe-render"
          :class="{ 'w-full h-full': loaded }"
          @error="errorIframe"
          @load="handleIframeLoad"
        ></iframe>
      </div>
    </template>
  </div>
</template>
<script>
import event from '@/utils/event'
import { throttle } from 'lodash-es'
import { sleep } from '@/utils/tools'
import AutoScrollClass from '@/utils/autoScrollClass'
import {
  EVENT_BUS,
  PPT_STATUS,
  PPT_SHOW_TYPE
} from '@/views/TrialCenter/AgentTrial/config/constants'
import { proxyIframeResources } from '@/utils/artifacts/artifactsHelper'
import ArtifactsEditor from '@/utils/artifacts/artifactsEditor'
import CodeView from '@/components/CodeView.vue'

export default {
  name: 'PPTRender',
  components: {
    CodeView
  },
  props: {
    pptRaw: {
      type: Object,
      default: () => ({})
    },
    total: {
      type: Number,
      default: 0
    },
    idx: {
      type: Number,
      default: 0
    },
    showEdit: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Boolean,
      default: false
    },
    agentId: {
      type: String,
      default: ''
    },
    conversationId: {
      type: String,
      default: ''
    }
  },
  inject: ['onEdit'], // (idx: number, type: 'open' | 'submit' | 'close')
  data() {
    return {
      PPT_STATUS,
      PPT_SHOW_TYPE,
      containerRef: null,
      iframeRef: null,
      originalWidth: 0,
      originalHeight: 0,
      resizeObserver: null,
      scale: 1,
      prevDoneState: undefined,
      showType: PPT_SHOW_TYPE.PREVIEW,
      userChangedShowType: false,
      processing: false,
      editing: false,
      loaded: false,
      copied: false,
      loadingUpdate: false,
      artifactsEditor: null,
      status: ''
    }
  },
  mounted() {
    event.$on(EVENT_BUS.RESIZE_EVENT, this.resizeEvent)
    event.$on(EVENT_BUS.PPT_SELECTED, this.pptSelected)
    event.$on(EVENT_BUS.PPT_WORK_COMPLETE, this.pptWorkComplate)
    event.$on(EVENT_BUS.PPT_WORK_PROCESSING, this.pptWorkProcessing)
    event.$on(EVENT_BUS.PPT_SHOW_TYPE, this.pptShowType)
  },
  methods: {
    proxyIframeResources,
    resizeEvent() {
      if (this.loaded) {
        this.resizeIframe()
      } else {
        console.warn(`PPTRender ${this.idx} is not loaded yet`)
      }
    },
    async pptSelected(position) {
      // console.log('🚀 & pptSelected & pptSelected:', `position: ${position}, current: ${this.idx}`)
      if (position === this.idx) {
        // await sleep(1000) // 此处只是预估值，和iframe加载有关系
        await this.$nextTick()
        // this.$refs.containerRef.scrollIntoView({
        //   behavior: 'smooth',
        //   block: 'nearest',
        //   inline: 'center'
        // })
        const el = document.getElementById('ppt-list-render')
        el.scrollTo({
          top: this.$refs.containerRef.offsetTop,
          behavior: 'smooth'
        })
      }
    },
    pptWorkComplate(position) {
      // console.log(
      //   '🚀 & pptWorkComplate & pptWorkComplate:',
      //   `position: ${position}, current: ${this.idx}`
      // )
      if (position === this.idx) {
        this.$autoScrollInstance &&
          this.$autoScrollInstance.reset({
            mobile: false,
            distance: 2
          })
        this.$autoScrollInstance = null
        this.status = PPT_STATUS.DONE
        this.showType = PPT_SHOW_TYPE.PREVIEW
        this.userChangedShowType = true
        this.processing = false
      }
    },
    pptWorkProcessing(position) {
      // console.log(
      //   '🚀 & pptWorkProcessing & pptWorkProcessing:',
      //   `position: ${position}, current: ${this.idx}`
      // )
      if (position === this.idx) {
        this.showType = PPT_SHOW_TYPE.HTML
        this.userChangedShowType = true
        this.processing = true
        if (!this.$autoScrollInstance) {
          const codeViewElement = this.$refs.codeViewRef.$el
          const preElement = codeViewElement.querySelector('pre')
          if (preElement) {
            this.$autoScrollInstance = new AutoScrollClass(preElement)
            this.$autoScrollInstance &&
              this.$autoScrollInstance.start({
                autoScroll: true,
                mobile: false,
                distance: 2
              })
          }
        }
      }
    },
    pptShowType(value) {
      if (value === PPT_SHOW_TYPE.HTML || value === PPT_SHOW_TYPE.PREVIEW) {
        this.showType = value
        this.userChangedShowType = true
      }
    },
    changeStyle() {
      this.userChangedShowType = true
    },
    autoSwitch(done) {
      if (this.userChangedShowType) return
      if (!done) {
        // this.showType = PPT_SHOW_TYPE.HTML;
      } else if (done) {
        this.showType = PPT_SHOW_TYPE.PREVIEW
      }
    },
    resizeIframe: throttle(function() {
      const iframeRef = this.$refs.iframeRef
      if (!iframeRef || !this.loaded) {
        console.warn(`resizeIframe skipped for PPTRender ${this.idx}: iframe not ready`)
        return
      }

      try {
        const iframeDoc = iframeRef.contentDocument || iframeRef.contentWindow.document
        // const iframeBody = iframeDoc?.body
        // if (iframeBody && iframeRef?.contentWindow) {
        // 可选：取 iframeBody 和 firstChild 中宽度最接近 1280 的作为采样元素

        // 获取内容的原始尺寸
        // if (iframeBody.childElementCount === 1) {
        //   const firstChild = iframeBody.firstElementChild // 获取的是.slide的元素
        //   this.originalWidth = firstChild.offsetWidth
        //   this.originalHeight = firstChild.offsetHeight
        // } else {
        //   this.originalWidth = iframeBody.scrollWidth
        //   this.originalHeight = iframeBody.scrollHeight
        // }

        const slide = iframeDoc.querySelector('.slide') || iframeDoc.querySelector('body')
        // console.log(
        //   `iframeDoc.querySelector('.slide')`,
        //   iframeDoc.querySelector('.slide').offsetWidth,
        //   iframeDoc.querySelector('.slide').offsetHeight
        // )
        // console.log(
        //   `iframeDoc.querySelector('body')`,
        //   iframeDoc.querySelector('body').offsetWidth,
        //   iframeDoc.querySelector('body').offsetHeight
        // )

        this.originalWidth = slide.offsetWidth
        // console.log('🚀 & slide.offsetWidth:', slide.offsetWidth)
        this.originalHeight = slide.offsetHeight
        // console.log('🚀 & slide.offsetHeight:', slide.offsetHeight)

        // 对文档尺寸的有限兜底，不太过分的基本可以支持
        if (this.originalWidth < 1280) {
          this.originalWidth = 1280
        }

        if (this.originalWidth && this.originalHeight && this.$refs.containerRef) {
          const containerWidth = this.$refs.containerRef.offsetWidth
          this.scale = containerWidth / this.originalWidth

          this.artifactsEditor && this.artifactsEditor.scaleInput(1 / this.scale)

          this.$refs.iframeRef.style.width = `${this.originalWidth}px`
          this.$refs.iframeRef.style.height = `${this.originalHeight}px`
          this.$refs.iframeRef.style.transform = `scale(${this.scale})`
          this.$refs.iframeRef.style.transformOrigin = 'top left'

          const scaledHeight = this.originalHeight * this.scale
          const parentDiv = this.$refs.iframeRef.parentElement
          if (parentDiv) {
            parentDiv.style.height = `${scaledHeight}px`
          }
          // }
        }
      } catch (e) {
        console.error('🚀 & resizeIframe-e:', e)
      }
    }),
    async handleIframeLoad() {
      if (!this.$refs.iframeRef?.contentWindow || !this.$refs.iframeRef?.contentDocument) return
      const iframeDoc = this.$refs.iframeRef.contentDocument
      const iframeBody = iframeDoc.body
      this.loaded = true
      console.warn(`PPTRender ${this.idx} has loaded`)
      // 注入样式
      const styleEl = iframeDoc.createElement('style')
      styleEl.textContent = `
			html, body {
				margin: 0;
				padding: 0;
				overflow: hidden; /* 防止出现滚动条影响尺寸计算 */
			}
			body > * {
				transform-origin: top left;
			}
		`
      iframeDoc.head.appendChild(styleEl)

      // 确保样式生效后再获取尺寸
      await this.$nextTick()

      // 采用统一在父组件中进行监听大小变化，目的是为了节约性能开销
      // if (this.resizeObserver) {
      //   this.resizeObserver.disconnect()
      // }

      // this.resizeObserver = new ResizeObserver(() => {
      //   this.resizeIframe()
      // })

      // if (this.$refs.containerRef) {
      //   this.resizeObserver.observe(this.$refs.containerRef)
      // }
      await sleep(100) // 由于输出的文档可能没有一个有效的尺寸呢，被流式布局后的高度由于宽高的兜底导致下方有空白区，此时再resize一下即可
      this.resizeIframe()
      if (this.editing) {
        this.artifactsEditor.invokeEditorCode(this.$refs.iframeRef)
        this.artifactsEditor.initMessageHandler((type, data) => {
          if (type === 'editElement') {
            this.editing = false
            this.onEdit(this.idx, 'submit')
            const { line, code, text } = data
            if (line && code && text) {
              window.postMessage(
                {
                  type: 'input:prompt:submit',
                  text,
                  vibeInfo: {
                    vibeMode: 'ppt',
                    vibeReference: {
                      line,
                      code,
                      filename: 'index.html',
                      pptIndex: this.idx + 1
                    }
                  }
                },
                window.origin
              )
            }
          }
        })
        this.artifactsEditor.scaleInput(1 / this.scale)
      }
    },
    async handlerEdit() {
      this.onEdit(this.idx, 'open')
      this.artifactsEditor = new ArtifactsEditor(this.pptRaw.textContent, this.$refs.iframeRef)
      this.artifactsEditor.walkAST()
      this.artifactsEditor.serializeAST(proxyIframeResources)
      await this.$nextTick()
      this.editing = true
    },
    handlerCancel() {
      this.editing = false
      this.onEdit(this.idx, 'close')
    },
    handlerSave() {
      if (!this.artifactsEditor.operated) {
        this.onEdit(this.idx, 'close')
        this.editing = false
        return
      }
      const afterEditHtml = this.artifactsEditor.getSerializeCode()
      try {
        this.loadingUpdate = true
        // await updatePPT({
        // 	chatId: $chatId,
        // 	html: afterEditHtml,
        // 	index: this.idx + 1
        // });
        event.$emit(EVENT_BUS.PPT_UPDATE, {
          html: afterEditHtml,
          idx: this.idx
        })
        this.editing = false
        this.onEdit(this.idx, 'submit')
      } catch (error) {
        console.log('🚀 & handlerSave & error:', error)
      } finally {
        this.loadingUpdate = false
      }
    },
    errorIframe(e) {
      console.error('🚀 & errorIframe & e:', e)
    }
  },
  beforeDestroy() {
    event.$off(EVENT_BUS.RESIZE_EVENT, this.resizeEvent)
    event.$off(EVENT_BUS.PPT_SELECTED, this.pptSelected)
    event.$off(EVENT_BUS.PPT_WORK_COMPLETE, this.pptWorkComplate)
    event.$off(EVENT_BUS.PPT_WORK_PROCESSING, this.pptWorkProcessing)
    event.$off(EVENT_BUS.PPT_SHOW_TYPE, this.pptShowType)
    if (this.$autoScrollInstance) {
      this.$autoScrollInstance.reset(this.media.canTouch, 2)
      this.$autoScrollInstance = null
    }
    // if (this.resizeObserver) {
    //   this.resizeObserver.disconnect()
    // }
  }
}
</script>
<style lang="less" scoped>
* {
  box-sizing: border-box;
}
.aspect-16-9 {
  aspect-ratio: 16 / 9;
}
.overflow-auto {
  overflow: auto;
}
.ppt-render {
  &-container {
    border-radius: 12px;
    border: 1px solid #e0e0e0;
    &:hover {
      .tab-container {
        display: flex;
      }
    }
    .tab-container {
      z-index: 10;
      left: 12px;
      right: 12px;
      top: 12px;
      height: 36px;
      &__end {
        justify-content: flex-end;
      }
      .operator__tabs {
        height: 100%;
        ::v-deep .el-radio-group {
          border-radius: 35px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: #fff;
          padding: 3px;
          .el-radio-button {
            &.is-active {
              .el-radio-button__inner {
                color: #fff;
                font-weight: 600;
                background: var(--primaryColor);
                &:hover {
                  background: var(--primaryColor);
                }
              }
            }
            &.is-disabled {
              .el-radio-button__inner {
                color: #b0b1b8;
              }
            }
            .el-radio-button__inner {
              background: #fff;
              border: none;
              padding: 5px 12px;
              border-radius: 17px;
              overflow: hidden;
              font-size: 14px;
              line-height: 18px;
              color: var(--mainTextColor);
              font-weight: 400;
              box-shadow: none;
              transition: none;
              &:hover {
                background: #f0f0f0;
              }
            }
          }
        }
      }
      .common-btn {
        height: 36px;
        border-radius: 35px;
        color: var(--mainTextColor);
        border: 1px solid rgba(0, 0, 0, 0.1);
        background: #fff;
        &:hover {
          background: #f0f0f0;
        }
      }
      .current-page {
        height: 36px;
        padding: 0px 14px;
        border-radius: 35px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        background: #fff;
        color: #131212;
        font-size: 14px;
      }
    }
    .skeleton {
      padding: 12px;
    }
    .spinner {
      z-index: 10;
      background-color: #fff;
    }
    .mask {
      z-index: 10;
      background-color: rgba(0, 0, 0, 0.1);
    }
    .iframe-container {
      border-radius: 12px;
    }
    .iframe-render {
      position: absolute;
      top: 0;
      left: 0;
      width: 1280px;
      height: 720px;
      border: none;
      overflow: hidden;
    }
  }
}
</style>
