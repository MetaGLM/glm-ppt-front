<template>
  <el-tooltip
    :placement="placement"
    :effect="effect"
    :popper-class="customPopperClass"
    :visible-arrow="visibleArrow"
    :disabled="isAuto ? disabledToolTip : disabled"
    :enterable="enterable"
    :openDelay="openDelay"
  >
    <template slot="content">
      <slot name="content">{{ content }}</slot>
    </template>
    <div
      :class="[isAuto && line > 0 ? `dot-${line}` : '', inline && 'inline-block']"
      @mouseenter="handleMouse($event)"
    >
      <slot>
        {{ content }}
      </slot>
    </div>
  </el-tooltip>
</template>

<script>
import { isBeyond } from '@/utils/tools'

export default {
  name: 'AutoTooltip',
  props: {
    placement: {
      type: String,
      default: 'top-start'
    },
    effect: {
      type: String,
      default: 'light'
    },
    visibleArrow: {
      type: Boolean,
      default: false
    },
    enterable: {
      type: Boolean,
      default: true
    },
    content: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    line: {
      type: [Number, String],
      default: 1
    },
    isAuto: {
      // 是否开启自动显示隐藏
      type: Boolean,
      default: true
    },
    inline: {
      // 是否开启行内模式
      type: Boolean,
      default: false
    },
    openDelay: {
      type: Number,
      default: 0
    },
    popperClass: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      disabledToolTip: false
    }
  },
  computed: {
    customPopperClass() {
      return `popper-class-text-tip ${this.popperClass}`
    }
  },
  methods: {
    handleMouse(e) {
      if (!this.isAuto) {
        return
      }

      if (this.line > 1) {
        const el = e.target
        const computedStyle = window.getComputedStyle(el)
        const textOverflow = computedStyle.getPropertyValue('text-overflow')
        // const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize)
        // const height = parseFloat(computedStyle.height)
        const actualHeight = el.clientHeight
        const contentHeight = el.scrollHeight
        if (
          (textOverflow === 'ellipsis' || textOverflow === 'clip') &&
          contentHeight > actualHeight
        ) {
          this.disabledToolTip = false
        } else {
          this.disabledToolTip = true
        }
        return
      }
      this.disabledToolTip = this.disabled || isBeyond(e)
    }
  }
}
</script>

<style lang="less" scoped>
.inline-block {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}
</style>
