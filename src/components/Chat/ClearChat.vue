<template>
  <div class="flex-none">
    <IconButton
      :tooltip="$t('model_trial.clear_chat.text')"
      iconClass="icon-clear1"
      :border="true"
      :disabled="disabled"
      sensorsName="清除对话"
      @click="showDialog"
    />
    <el-dialog
      class="custom-class-dialog-style clear-chat-dialog tl"
      :visible.sync="visible"
      :before-close="handleClose"
      :show-close="false"
      :append-to-body="true"
    >
      <div class="flex w-full">
        <i class="iconfont icon-error1 flex-none alert-icon"></i>
        <div class="flex1 clear-chat-content">
          <p class="clear-chat-content-title">
            {{ $t('model_trial.clear_chat.title') }}
          </p>
          <div class="clear-chat-content-desc">
            {{ $t('model_trial.clear_chat.desc') }}
          </div>
          <div class="flex flex-between clear-chat-content-footer">
            <el-checkbox
              v-model="noAlert"
              data-sensors-click
              name="清除对话不再提醒"
              @change="handleAlert"
            >
              {{ $t('common.next_time_no_alert') }}
            </el-checkbox>
            <el-button size="small" data-sensors-click name="清除对话取消" @click="handleClose">
              {{ $t('base.no') }}
            </el-button>
            <el-button
              type="primary"
              size="small"
              data-sensors-click
              name="清除对话确认"
              @click="confirmClear"
            >
              {{ $t('cb_base.confirm') }}
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import IconButton from './IconButton.vue'
const CACHE_KEY = '_clear_chat__'

export default {
  name: 'ClearChat',
  components: { IconButton },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    cacheKey: {
      type: String,
      default: CACHE_KEY
    }
  },
  data() {
    return {
      visible: false,
      noAlert: false
    }
  },
  methods: {
    showDialog() {
      if (this.disabled) {
        return
      }
      const cacheValue = localStorage.getItem(CACHE_KEY)
      if (cacheValue === '1') {
        this.$emit('clear-chat')
      } else {
        this.visible = true
      }
    },
    handleClose() {
      this.visible = false
    },
    handleAlert(val) {
      localStorage.setItem(CACHE_KEY, val ? '1' : '0')
    },
    confirmClear() {
      this.$emit('clear-chat')
      this.handleClose()
    }
  }
}
</script>

<style lang="less">
.clear-chat-dialog {
  .el-dialog {
    max-width: 480px;
    width: 90vw;
    .el-dialog__header {
      display: none;
    }
    .el-dialog__body {
      padding: 24px;
      .alert-icon {
        margin-right: 12px;
        color: #faad14;
        font-size: 22px;
        line-height: 1;
      }
      .clear-chat-content {
        gap: 8px;
        &-title {
          font-weight: 600;
          font-size: 16px;
          color: var(--mainTextColor);
          line-height: 24px;
        }
        &-desc {
          margin-top: 8px;
          margin-bottom: 24px;
          font-size: 14px;
          line-height: 22px;
          color: var(--mainTextColor);
          font-weight: 400;
        }
        .el-checkbox {
          margin-right: auto;
          .el-checkbox__label {
            padding-left: 8px;
            color: #26244ce0;
          }
        }
        &-footer {
          gap: 8px;
          .el-button {
            margin: 0;
            font-weight: 400;
            padding: 8px 15px;
            font-size: 14px;
            line-height: 1;
            border-radius: 6px;
          }
        }
      }
    }
  }
}
</style>
