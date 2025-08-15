<template>
  <el-dialog
    v-if="value"
    :visible="value"
    :title="canDownload ? $t('model_trial.ppt.export_success') : $t('model_trial.ppt.export_pdf')"
    class="custom-class-dialog-style ppt-export-pdf-dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :append-to-body="true"
    @close="closeDialog"
  >
    <div class="tips tl">
      <div class="export-success" v-if="canDownload">
        <!-- <div class="export-success__tip">{{ $t('model_trial.ppt.export_success_text') }}</div> -->
        <div class="export-success__content flex gap-4 flex-ai-center">
          <svg-icon iconClass="PDF" class="flex-none" /><AutoTooltip
            :content="`${pptName}.pdf`"
            placement="top"
            :visibleArrow="false"
          ></AutoTooltip>
        </div>
      </div>
      <template v-else>
        {{ $t('model_trial.ppt.export_ask') }}
      </template>
    </div>
    <div slot="footer" class="flex flex-x-end flex-y-center">
      <el-button size="small" @click="closeDialog">
        {{ $t('common.cancel') }}
      </el-button>
      <el-button type="primary" size="small" v-if="canDownload" @click="download">
        {{ $t('base.download') }}
      </el-button>
      <el-button :loading="exporting" type="primary" size="small" v-else @click="exportDialog">
        {{ exporting ? $t('model_trial.ppt.exporting') : $t('model_trial.ppt.export') }}
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import AutoTooltip from '@/components/AutoTooltip.vue'
import { downloadFile, noop } from '@/utils/tools'
import { fetchAgentPPTUrlApi } from '@/api/trialCenter/agent'
export default {
  name: 'ExportPDF',
  components: {
    AutoTooltip
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    pptRawList: {
      type: Array,
      default: () => []
    },
    agentId: {
      type: String,
      default: ''
    },
    conversationId: {
      type: String,
      default: ''
    },
    pptName: {
      type: String,
      default: ''
    },
    canTrigger: {
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
      exporting: false,
      controller: null, // 用于中止计算iframe尺寸的任务
      cancelToken: null, // 用于取消请求
      canDownload: false, // 是否可下载
      fileUrl: '' // pdf文件地址
    }
  },
  methods: {
    async calculatePageDimensions(htmlContent, signal, index) {
      const position = index + 1
      return new Promise((resolve, reject) => {
        // 创建临时iframe来测量页面尺寸
        const tempIframe = document.createElement('iframe')
        tempIframe.style.position = 'absolute'
        tempIframe.style.left = '-9999px'
        tempIframe.style.top = '-9999px'
        tempIframe.style.width = '1280px'
        tempIframe.style.height = 'auto' // 关键改动：允许高度自适应
        tempIframe.style.border = 'none'

        tempIframe && document.body.appendChild(tempIframe)

        tempIframe.onload = () => {
          try {
            const iframeDoc = tempIframe.contentDocument
            const iframeBody = iframeDoc?.body

            if (iframeBody) {
              const styleEl = iframeDoc.createElement('style')
              styleEl.textContent = `
              html, body {
                margin: 0;
                padding: 0;
                overflow: visible; /* 改为visible，允许内容完全展示 */
                height: auto; /* 允许高度自适应 */
                min-height: 720px; /* 设置最小高度 */
              }
              body > * {
                transform-origin: top left;
              }
              /* 确保flex容器能够正常展开 */
              .slide {
                min-height: auto !important;
                height: auto !important;
              }
            `
              iframeDoc.head.appendChild(styleEl)

              // 等待字体和图片加载的函数
              const waitForResources = () => {
                // 检查字体是否加载完成
                if (iframeDoc.fonts && iframeDoc.fonts.ready) {
                  iframeDoc.fonts.ready
                    .then(() => {
                      // 再等待一小段时间确保布局稳定
                      setTimeout(measureDimensions, 500)
                    })
                    .catch(() => {
                      // 字体加载失败，直接测量
                      setTimeout(measureDimensions, 2000)
                    })
                } else {
                  // 不支持fonts.ready，使用固定等待时间
                  setTimeout(measureDimensions, 2500)
                }
              }
              // 等待样式生效后测量

              const measureDimensions = () => {
                let width, height

                if (iframeBody.childElementCount === 1) {
                  const firstChild = iframeBody.firstElementChild // 获取的是.slide的元素

                  // 使用多种测量方法取最大值，确保获得完整高度
                  const offsetHeight = firstChild.offsetHeight || 0
                  const scrollHeight = firstChild.scrollHeight || 0
                  const boundingHeight = Math.ceil(firstChild.getBoundingClientRect().height) || 0
                  const computedHeight = parseInt(window.getComputedStyle(firstChild).height) || 0

                  // 取所有测量方法中的最大值
                  const heightMethods = [
                    offsetHeight,
                    scrollHeight,
                    boundingHeight,
                    computedHeight
                  ].filter(h => h > 0)
                  height = heightMethods.length > 0 ? Math.max(...heightMethods) : 720
                  width = firstChild.offsetWidth || 1280

                  console.log(`position: ${position} - Export: 测量结果对比:`, {
                    offsetHeight,
                    scrollHeight,
                    boundingHeight,
                    computedHeight,
                    finalHeight: height
                  })
                } else {
                  // 多个子元素：使用body的滚动尺寸
                  width = iframeBody.scrollWidth || 1280
                  height = Math.max(iframeBody.scrollHeight, iframeBody.offsetHeight) || 720
                  console.log(`position: ${position} - Export: Using body dimensions:`, {
                    width,
                    height
                  })
                }

                // 确保最小尺寸
                width = Math.max(width, 1280)
                height = Math.max(height, 720)

                // 转换像素到厘米 (96 DPI: 1英寸 = 96像素 = 2.54厘米)
                // 为了避免内容被裁切，向上取整
                const widthCm = Math.ceil((width / 96) * 2.54 * 100) / 100
                const heightCm = Math.ceil((height / 96) * 2.54 * 100) / 100

                console.log(
                  `position: ${position} - 优化后页面尺寸: ${width}px x ${height}px -> ${widthCm}cm x ${heightCm}cm`
                )

                if (tempIframe && document.body.contains(tempIframe)) {
                  document.body.removeChild(tempIframe)
                }
                // 横版纸张，交换宽高
                resolve({ width: heightCm, height: widthCm, position })
                // resolve({ width, height, position })
              }
              // 开始等待资源加载
              waitForResources()
            } else {
              if (tempIframe && document.body.contains(tempIframe)) {
                document.body.removeChild(tempIframe)
              }
              // 使用精确的默认尺寸（1280x720px 的精确转换）
              resolve({ width: 33.87, height: 19.05, position })
              // resolve({ width: 1280, height: 720, position })
            }
          } catch (error) {
            console.warn(`position：${position} - Failed to measure page dimensions:`, error)
            if (tempIframe && document.body.contains(tempIframe)) {
              document.body.removeChild(tempIframe)
            }
            // 使用精确的默认尺寸（1280x720px 的精确转换）
            resolve({ width: 33.87, height: 19.05, position })
            // resolve({ width: 1280, height: 720, position })
          }
        }
        // 取消信号触发时停止
        signal.addEventListener('abort', () => {
          if (tempIframe && document.body.contains(tempIframe)) {
            document.body.removeChild(tempIframe)
          }
          reject(new DOMException('Operation aborted by user', 'AbortError'))
        })
        tempIframe.srcdoc = htmlContent
      })
    },
    async exportDialog() {
      if (!this.canTrigger) return
      if (!this.pptRawList || this.pptRawList.length === 0) {
        this.$message.error(this.$t('model_trial.ppt.not_found'))
        return
      }
      if (this.exporting) {
        this.$message.warning(this.$t('model_trial.ppt.exporting'))
        return
      }

      try {
        await this.exportToPDF(success => {
          if (success) {
            this.canDownload = true
          } else {
            this.$message.error(this.$t('model_trial.ppt.export_error'))
          }
        })
      } catch (e) {}
    },
    async exportToPDF(callback = noop) {
      if (!this.apiKey) {
        this.$message.error('请输入API Key')
        return
      }
      this.exporting = true
      try {
        // 创建新的 AbortController
        this.controller = new AbortController()
        const signal = this.controller.signal // 获取信号句柄
        const pageMetadata = await Promise.all(
          this.pptRawList.map(async(page, index) => {
            try {
              const dimensions = await this.calculatePageDimensions(page.textContent, signal, index)
              console.log('🚀 & exportToPDF & dimensions:', dimensions, index + 1)
              return {
                width: dimensions.width,
                height: dimensions.height,
                position: dimensions.position
              }
            } catch (error) {
              console.warn(`Failed to calculate dimensions for page ${index + 1}:`, error)
              // 使用精确的默认尺寸（1280x720px 的精确转换）
              return {
                width: 33.87,
                height: 19.05,
                position: index + 1
              }
            }
          })
        )
        // 如果信号被中止，阻止 pageMetadata 的输出
        if (signal.aborted) {
          console.log('🚀 Export process was aborted early.')
          return // 终止后续逻辑
        }
        console.log('pageMetadata', pageMetadata)
        const [err, data] = await this.awaitTo(
          fetchAgentPPTUrlApi(
            {
              agent_id: this.agentId,
              conversation_id: this.conversationId,
              custom_variables: {
                pages: pageMetadata,
                // filename: `${this.pptName}.pdf`,
                include_pdf: true,
                include_ppt: false, // 一期不做
                include_image: false // 一期不做
              }
            },
            new this.$axios.CancelToken(c => {
              this.cancelToken = c
            }),
            {
              Authorization: this.apiKey
            }
          )
        )
        const fileUrl = data && data.choices && data.choices[0]?.messages[0]?.content?.file_url
        if (!err && data.agent_id && fileUrl) {
          this.fileUrl = fileUrl
          // 如果没有name的情况下取下载地址中的name
          if (!this.pptName) {
            const parts = fileUrl.split('/') || []
            const name = parts[parts.length - 1]
            this.pptName = name
          }
          callback(true)
        } else {
          if (!this.$axios.isCancel(err)) {
            callback(false)
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Export process was canceled by user.')
        } else {
          console.error('Export failed:', error)
        }
        callback(false)
      } finally {
        this.controller = null
        this.cancelToken = null
        this.exporting = false
      }
    },
    cancelExport() {
      if (this.controller) {
        this.controller.abort()
        console.log('🚀 Export process aborted.')
      }
      if (typeof this.cancelToken === 'function') {
        this.cancelToken()
        console.log('🚀 Export request canceled.')
      }
      if (this.controller || this.cancelToken) {
        this.$message.info(this.$t('model_trial.ppt.export_cancel'))
      }
      this.controller = null
      this.cancelToken = null
      this.exporting = false
    },
    closeDialog() {
      this.cancelExport()
      this.$emit('input', false)
    },
    download() {
      downloadFile(this.fileUrl, `${this.pptName || 'download'}.pdf`, () => {
        this.$message.success(this.$t('common.download.success'))
        this.closeDialog()
      })
    }
  },
  beforeDestroy() {
    this.cancelExport()
  }
}
</script>
<style lang="less">
.ppt-export-pdf-dialog {
  .el-dialog {
    max-width: 480px;
  }
  .export-success {
    &__tip {
      text-align: center;
      margin-bottom: 18px;
    }
    &__content {
      box-sizing: border-box;
      padding: 16px;
      border-radius: 6px;
      background-color: #e2e2e2;
      .svg-icon {
        width: 32px;
        height: 32px;
      }
    }
  }
}
</style>
