<template>
  <div class="chat-answer">
    <div class="flex chat-answer-status">
      <template
        v-if="answerStatus === ANSWER_STATUS.WAITTING || answerStatus === ANSWER_STATUS.OUTPUT"
      >
        <i class="iconfont icon-zhengzaitiaoyongicon fw400"></i><span>正在调用智能体</span>
        <img
          class="searching-img drag-none"
          src="https://cdn.bigmodel.cn/static/platform/images/trialcenter/searching.gif"
          alt="ZHIPU·AI"
        />
      </template>
      <template v-else-if="answerStatus === ANSWER_STATUS.COMPLETE">
        <i class="iconfont icon-tiaoyongchenggongicon fw400"></i
        ><span>{{ $t('agent_trial.agent_completed') }}</span>
      </template>
      <template v-else-if="answerStatus === ANSWER_STATUS.FAIL">
        <i class="iconfont icon-tiaoyongshibaiicon fw400"></i
        ><span>{{ $t('agent_trial.agent_failed') }}</span>
      </template>
      <template v-else-if="answerStatus === ANSWER_STATUS.STOP">
        <i class="iconfont icon-tiaoyongshibaiicon fw400"></i
        ><span>{{ $t('agent_trial.agent_paused') }}</span>
      </template>
    </div>
    <PPTAnswerItem ref="PPTAnswerItemRef" :answerStatus="answerStatus" />
    <div v-if="answerStatus === ANSWER_STATUS.FAIL"></div>
    <slot name="footer"></slot>
  </div>
</template>

<script>
import {
  ANSWER_STATUS // 回答结果状态
} from '@/enums/modules/trialCenter'
import PPTAnswerItem from './PPTAnswerItem.vue'

export default {
  name: 'ChatAnswer',
  components: {
    PPTAnswerItem
  },
  props: {
    isLastChat: {
      type: Boolean,
      default: false
    },
    choices: {
      type: Array,
      default: () => []
    },
    answerStatus: {
      type: String,
      default: ''
    },
    agentId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      ANSWER_STATUS // 回答结果状态
    }
  },
  methods: {
    setPPTAnswerItemValue(val) {
      this.$refs.PPTAnswerItemRef && this.$refs.PPTAnswerItemRef.parsingData(val)
    }
  }
}
</script>

<style lang="less" scoped>
.chat-answer {
  &-status {
    display: inline-flex;
    padding: 14px 20px 14px 12px;
    gap: 8px;
    margin-bottom: 12px;
    border-radius: 12px;
    background: #f6f7f9;
    .iconfont {
      font-size: 20px;
      color: #4f5866;
      line-height: inherit;
    }
    .searching-img {
      width: 47px;
      height: auto;
      align-self: flex-end;
    }
  }
}
</style>
