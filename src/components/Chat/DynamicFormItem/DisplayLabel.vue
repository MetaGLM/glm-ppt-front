<template>
  <div class="custom-display-label">
    {{ label }}
    <AutoTooltip v-if="desc" :placement="placement" :isAuto="false" :inline="true">
      <i class="iconfont icon-wdinfo help-info common-icon pointer"></i>
      <template slot="content">
        <slot name="content">
          <span v-html="desc"></span>
        </slot>
      </template>
    </AutoTooltip>
    <slot></slot>
  </div>
</template>

<script>
import AutoTooltip from '@/components/AutoTooltip.vue'

export default {
  name: 'DisplayLabel',
  components: {
    AutoTooltip
  },
  props: {
    label: {
      type: String,
      default: ''
    },
    desc: {
      type: String,
      default: ''
    },
    placement: {
      type: String,
      default: 'top'
    }
  }
}
</script>

<style lang="less" scoped>
.custom-display-label {
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
  .help-info {
    color: #5e5e66;
    font-weight: 400;
    line-height: 1;
  }
}
</style>
