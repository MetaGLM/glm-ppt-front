<template>
  <div class="flex flex-between answer-info">
    <div v-if="errorInfo" class="flex error-info">
      <i class="iconfont icon-info1"></i>
      {{ errorInfo.message || '服务异常，请稍后再试' }}
    </div>
    <div class="flex1 flex flex-y-center answer-info-left">
      <i18n
        v-if="timeConsuming"
        path="model_trial.chat.cost_time_text"
        tag="p"
        class="answer-info-left-item"
      >
        <span class="answer-info-value">{{ timeConsuming }}</span>
      </i18n>
      <template v-if="usage && usage.total_tokens">
        <i18n path="model_trial.chat.cost_tokens_text" tag="p" class="answer-info-left-item">
          <span class="answer-info-value">{{ usage.total_tokens }}</span>
        </i18n>
      </template>
      <template v-if="usage && usage.total_calls">
        <i18n path="model_trial.chat.search_cost_text" tag="p" class="answer-info-left-item">
          <span class="answer-info-value">{{ usage.total_calls }}</span>
        </i18n>
      </template>
    </div>
    <!-- <div class="flex flex-y-center answer-info-right">
      <IconButton
        :tooltip="$t('base.copy')"
        iconClass="icon-copy"
        sensorsName="输出复制"
        @click="$emit('copy')"
      />
      <IconButton
        v-if="isLastItem"
        :tooltip="$t('model_trial.search_box.again')"
        iconClass="icon-retry re-generate-icon"
        sensorsName="模型重新生成"
        @click="$emit('reGenerate')"
      />
    </div> -->
  </div>
</template>

<script>
// import IconButton from '@/components/Chat/IconButton.vue'

export default {
  name: 'ChatCompleteFooter',
  components: {
    // IconButton
  },
  props: {
    isLastItem: {
      type: Boolean,
      default: false
    },
    showCost: {
      type: Boolean,
      default: true
    },
    usage: {
      type: Object,
      default: null
    },
    timeConsuming: {
      type: Number,
      default: 0
    },
    errorInfo: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    copyAnswer() {
      this.copy(this.answer)
    }
  }
}
</script>

<style lang="less" scoped>
.answer-info {
  margin-top: 12px;
  flex-wrap: wrap;
  .error-info {
    color: #2c3037;
    font-size: 16px;
    line-height: 28px;
    .iconfont {
      font-size: 20px;
      margin-right: 4px;
    }
  }
  &-left {
    color: #8d8e99;
    font-size: 12px;
    line-height: 18px;
    flex-wrap: wrap;
    &-item {
      display: inline-flex;
      justify-content: flex-start;
      align-items: center;
      flex-wrap: none;
      & + .answer-info-left-item:not(.search-engine) {
        &::before {
          content: '|';
          padding: 0 8px;
          font-size: 10px;
          line-height: 1;
          opacity: 0.5;
        }
      }
    }
  }
  &-value {
    margin: 0 2px;
    color: #5e5e66;
    font-weight: 600;
  }
  &-right {
    gap: 12px;
    ::v-deep .re-generate-icon {
      font-size: 16px;
    }
  }
}
</style>
