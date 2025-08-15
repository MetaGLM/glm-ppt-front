<template>
  <div class="ppt-previewer flex flex-dir-col" :class="{ 'ppt-previewer__mobile': isMobile }">
    <div class="ppt-previewer__header flex w-full flex-between gap-16 overflow-hidden">
      <div class="ppt-previewer__header-left flex flex-ai-center gap-8 flex1 overflow-hidden">
        <i class="iconfont icon-huandengpian-01"></i>
        <AutoTooltip
          :content="curPPTName || pptName || ''"
          placement="top"
          :visibleArrow="false"
        ></AutoTooltip>
      </div>
      <div class="ppt-previewer__header-right flex flex-between gap-16 flex-none">
        <template v-if="pptRawList.length">
          <el-dropdown trigger="hover" @command="clickMenu" :disabled="!canTrigger">
            <el-button class="share" type="primary">
              <i class="el-icon-share"></i>{{ $t('base.share') }}</el-button
            >
            <el-dropdown-menu
              slot="dropdown"
              class="popper-class-custom-dropdownmenu popper-dropdownmenu-ppt-previewer"
            >
              <el-dropdown-item
                v-for="item in shareActions"
                :key="item.value"
                :command="item.value"
              >
                <div class="item flex flex-ai-center gap-8">
                  <svg-icon :iconClass="item.icon" />{{ item.label }}
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <!-- <AutoTooltip
          :content="'Play'"
          :isAuto="false"
          placement="top"
          effect="dark"
          :visibleArrow="true"
          :inline="true"
        >
          <div class="play-slider-box pointer flex flex-center">
            <i class="iconfont icon-huandengpianbofang-01"></i>
          </div>
        </AutoTooltip> -->
          <div class="separator"></div>
        </template>
        <button
          type="button"
          @click="$emit('closePane')"
          class="close-btn pointer flex flex-center"
        >
          <i class="el-dialog__close el-icon el-icon-close"></i>
        </button>
      </div>
    </div>
    <section class="ppt-previewer__main flex1 scroll-display-none">
      <div
        v-if="initLoading && !pptRawList.length"
        class="flex flex-dir-col flex-ai-center flex-jc-center h-full w-full"
      >
        <img src="~@/assets/images/svg/spinner.svg" alt="Loading" />
      </div>
      <div
        v-else-if="!pptRawList.length"
        class="empty flex flex-dir-col flex-ai-center flex-jc-center h-full w-full"
      >
        <svg-icon className="icon" iconClass="face_smile" />
        <div>{{ $t('common.no_data') }}</div>
      </div>
      <PPTListRender
        v-else
        :pptRawList="pptRawList"
        :editingIndex="editingIndex"
        :showEdit="!isMobile"
        :editable="editable"
        :filter="editing"
        :agentId="agentId"
        :conversationId="conversationId"
      />
    </section>
    <ExportPDF
      v-model="openExportPdf"
      v-if="openExportPdf"
      :apiKey="apiKey"
      :pptRawList="pptRawList"
      :agentId="agentId"
      :conversationId="conversationId"
      :pptName="curPPTName || pptName"
      :canTrigger="canTrigger"
    />
  </div>
</template>
<script>
import event from '@/utils/event'
import { EVENT_BUS, PPT_STATUS, PPT_SHARE } from '@/views/TrialCenter/AgentTrial/config/constants'
import AutoTooltip from '@/components/AutoTooltip.vue'
import PPTListRender from './PPTListRender.vue'
import ExportPDF from './ExportPDF.vue'
export default {
  name: 'PPTPreviewer',
  components: {
    AutoTooltip,
    PPTListRender,
    ExportPDF
  },
  props: {
    pptName: {
      // pptname不确定从哪个会话工具中传过来，故采用两种方式获取
      type: String,
      default: ''
    },
    agentId: {
      type: String,
      default: ''
    },
    conversationId: {
      type: String,
      default: ''
    },
    isMobile: {
      type: Boolean,
      default: false
    },
    apiKey: {
      type: String,
      default: ''
    }
  },
  provide() {
    return {
      onEdit: (idx, type) => {
        if (type === 'open') {
          this.editing = true
          this.editingIndex = idx
        } else {
          this.editing = false
          this.editingIndex = -1
        }
      }
    }
  },
  data() {
    return {
      shareActions: [
        {
          label: this.$t('model_trial.ppt.export_pdf'),
          value: PPT_SHARE.EXPORT_PDF,
          component: ExportPDF,
          icon: 'PDF'
        }
      ],
      editing: false,
      editingIndex: -1,
      curPPTName: '',
      initLoading: true,
      pptPaneDone: false,
      pptRawList: [],
      openExportPdf: false // PDF下载的Dialog
    }
  },
  computed: {
    canTrigger() {
      return !this.editing && this.pptPaneDone
    },
    editable() {
      return !this.isMobile && this.pptPaneDone
    }
  },
  created() {
    event.$on(EVENT_BUS.PPT_UPDATE_LIST, this.handlerPPTUpdateList)
    event.$on(EVENT_BUS.PPT_UPDATE, this.handlerUpdateSinglePPT)
    event.$on(EVENT_BUS.PPT_DONE, this.pptDoneFn)
  },
  methods: {
    clickMenu(command) {
      switch (command) {
        case PPT_SHARE.EXPORT_PDF:
          this.openExportPdf = true
          break

        default:
          break
      }
    },
    handlerPPTUpdateList({ conversationId, pptRawList, pptName }) {
      // 接收来自会话的PPT列表数据
      this.initLoading = false
      this.curPPTName = pptName
      this.pptRawList = pptRawList
    },
    handlerUpdateSinglePPT({ html, idx }) {
      // 此处是针对某一页的PPT编辑后更新最新的数据
      this.initLoading = false
      this.pptRawList.splice(idx, 1, { status: PPT_STATUS.DONE, textContent: html })
    },
    pptDoneFn(bool) {
      try {
        const allDone = this.pptRawList.every(item => item.status === PPT_STATUS.DONE)
        this.initLoading = false
        this.pptPaneDone = bool && allDone
        // 如果获取的ppt name都没有的话则从iframe的title获取
        if (!this.curPPTName && !this.pptName) {
          const data = this.pptRawList.find(item => !!this.getTitleFromHead(item.textContent)) || {}
          this.curPPTName = this.getTitleFromHead(data.textContent)
        }
      } catch (e) {
        console.log('🚀 & pptDoneFn & e:', e)
      }
    },
    // 从HTML字符串中提取<head>内<title>标签的文本内容
    getTitleFromHead(html) {
      if (typeof html !== 'string') return null
      // 正则说明：
      // 1. 匹配<head>标签（忽略大小写和中间空格）
      // 2. 匹配<title>标签（忽略大小写和中间空格）
      // 3. 捕获title标签内的文本（非贪婪匹配）
      const regex =
        /<head\b[^>]*>[\s\S]*?<title\b[^>]*>([\s\S]*?)<\/title\b[^>]*>[\s\S]*?<\/head\b[^>]*>/i
      const match = html.match(regex)
      return match ? match[1].trim() : null
    }
  },
  beforeDestroy() {
    event.$off(EVENT_BUS.PPT_UPDATE_LIST, this.handlerPPTUpdateList)
    event.$off(EVENT_BUS.PPT_UPDATE, this.handlerUpdateSinglePPT)
    event.$off(EVENT_BUS.PPT_DONE, this.pptDoneFn)
  }
}
</script>
<style lang="less" scoped>
* {
  box-sizing: border-box;
}
.ppt-previewer {
  height: 100%;
  padding: 16px 20px;
  background: #fff;
  &__header {
    padding-bottom: 16px;
    border-bottom: 1px solid #d9d9d9;
    &-left {
      color: #131212;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
      i {
        font-size: 20px;
      }
    }
    &-right {
      .play-slider-box {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        i {
          font-size: 20px;
        }
        &:hover {
          background-color: rgba(19, 18, 18, 0.05);
        }
      }
      .share {
        &[disabled='disabled'] {
          background-color: #f5f5f5;
          border-color: #f5f5f5;
          color: #c3c4cc;
          cursor: not-allowed;
        }
      }
      .separator {
        width: 1px;
        height: 24px;
        background-color: #d9d9d9;
      }
      .close-btn {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background: none;
        i {
          font-size: 20px;
        }
        &:hover {
          background-color: rgba(19, 18, 18, 0.05);
        }
      }
    }
  }
  &__main {
    padding-top: 20px;
    padding-bottom: 4px;
    overflow-x: hidden;
    overflow-y: auto;
    .empty {
      color: #c3c4cc;
      font-size: 14px;
      line-height: 20px;
      svg {
        width: 64px;
        height: 64px;
      }
    }
  }
  &__mobile {
    position: fixed;
    z-index: 10;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>

<style lang="less">
.popper-dropdownmenu-ppt-previewer {
  .el-dropdown-menu__item {
    .svg-icon {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
