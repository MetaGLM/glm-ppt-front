<template>
  <div class="flex flex-between chat-header">
    <div class="chat-header-left flex flex-y-center flex1 w0">
      <ModelIcon :modelType="data.modelType" :url="data.headerUrl" :width="24" :height="24" />
      <AutoTooltip placement="top" :content="data.agentName" class="model-name" />
      <IconButton
        :disabled="disabled"
        :tooltip="$t('agent_trial.agent_switch')"
        iconClass="icon-switch"
        @click="switchModel"
      />
    </div>
    <div class="flex-none flex chat-header-right">
      <slot name="right-extra"></slot>
    </div>
  </div>
</template>
<script>
import ModelIcon from '@/components/ModelIcon.vue'
import AutoTooltip from '@/components/AutoTooltip.vue'
import IconButton from '@/components/Chat/IconButton.vue'

export default {
  name: 'ChatHeader',
  components: {
    ModelIcon,
    AutoTooltip,
    IconButton
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {}
  },
  methods: {
    switchModel() {
      if (this.disabled) {
        return
      }
      this.$emit('switchModel')
    }
  }
}
</script>

<style lang="less">
.agent-info-popover {
  min-width: 200px;
  width: auto !important;
  padding: 18px 20px;
  color: #131212;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.12);
  .info-item {
    & + .info-item {
      margin-top: 12px;
    }
    &-label {
      flex: none;
    }
    .tag-list {
      gap: 8px 4px;
      flex-wrap: wrap;
      align-items: flex-start;
      margin-top: 2px;
    }
    .tag-item {
      padding: 2px 8px;
      color: #42464e;
      font-size: 10.7px;
      font-style: normal;
      font-weight: 400;
      line-height: 15px;
      border-radius: 4px;
      background: linear-gradient(92deg, rgba(83, 22, 255, 0.04) 0%, rgba(0, 117, 255, 0.06) 100%),
        #fff;
    }
  }
  .view-more-btn {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-top: 22px;
    padding: 0;
    font-size: 12px;
    font-weight: 500;
    line-height: 22px;
    &:after {
      font-size: 16px;
      line-height: 1;
    }
  }
}
</style>

<style lang="less" scoped>
.chat-header {
  padding: 0 0 16px;
  &-left {
    flex: 1;
    .model-name {
      min-width: 0;
      font-weight: 500;
      margin: 0 8px 0 4px;
    }
    img {
      -webkit-user-drag: none;
      user-drag: none;
    }
  }
  &-right {
    gap: 12px;
    margin-left: 24px;
  }
  .info-icon {
    margin-right: 6px;
    color: #5e5e66;
  }
}
</style>
