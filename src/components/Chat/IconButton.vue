<template>
  <AutoTooltip
    :disabled="!showTooltip"
    :content="tooltip"
    :isAuto="false"
    placement="top"
    effect="dark"
    :visibleArrow="true"
    :inline="true"
  >
    <i
      class="iconfont action-icon"
      :class="{
        [iconClass]: iconClass,
        'common-icon': hasUI,
        'is-border': border,
        'is-disabled': disabled,
        'active-icon': active,
        ['action-icon--' + size]: size
      }"
      :data-sensors-click="!!sensorsName"
      :name="sensorsName"
      @click="handleClick"
    ></i>
  </AutoTooltip>
</template>
<script>
import AutoTooltip from '@/components/AutoTooltip'

export default {
  name: 'IconButton',
  components: {
    AutoTooltip
  },
  props: {
    border: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'large',
      validator: function(value) {
        return ['large', 'mideum', 'small', 'mini', 'default'].indexOf(value) !== -1
      }
    },
    showTooltip: {
      type: Boolean,
      default: true
    },
    tooltip: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    iconClass: {
      type: String,
      default: '',
      isRequired: true
    },
    active: {
      type: Boolean,
      default: false
    },
    sensorsName: {
      type: String,
      default: ''
    },
    stopPropagation: {
      type: Boolean,
      default: false
    },
    hasUI: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleClick(event) {
      if (this.stopPropagation) {
        event.stopPropagation()
      }
      this.$emit('click', event)
    }
  }
}
</script>
<style lang="less" scoped>
.action-icon {
  font-size: 20px;
  color: #5e5e66;
  &--large {
    width: 30px;
    height: 30px;
  }
  &--mideum {
    width: 28px;
    height: 28px;
  }
  &--small {
    width: 24px;
    height: 24px;
    font-size: 16px;
  }
  &--mini {
    width: 24px;
    height: 24px;
    font-size: 20px;
  }
  &.is-border {
    box-sizing: border-box;
    font-size: 20px;
    line-height: 1;
    color: #777e8b;
    background: #fff;
    border: 1px solid var(--boxBorderColor-1);
    transition: 0.1s;
    &:hover,
    &:focus,
    &:active {
      border-color: #ececec;
      background: #f3f3f3;
    }
    &.is-disabled {
      color: #b0b1b8;
      border-color: var(--boxBorderColor-1);
      background-color: #f7f8fa;
    }
  }
  &.is-disabled {
    color: #b0b1b8;
    cursor: not-allowed;
  }
  &.active-icon {
    background: #f3f3f3;
  }
}
</style>
