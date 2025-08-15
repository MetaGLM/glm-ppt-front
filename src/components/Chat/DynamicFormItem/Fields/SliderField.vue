<template>
  <div class="slider-warp">
    <el-input-number
      class="slider-value"
      v-model="innerValue"
      :size="'small'"
      :step="step"
      controls-position="right"
      @change="handleChagne"
      :min="min"
      :max="max"
    ></el-input-number>
    <el-slider
      ref="sliderRef"
      class="custom-slider-line-class slider-input-top"
      :disabled="disabled"
      :show-input="false"
      :show-input-controls="false"
      v-model="innerValue"
      :min="min"
      :max="max"
      :step="step"
      :show-tooltip="false"
      @change="handleChagne"
    ></el-slider>
  </div>
</template>

<script>
import baseMixin from './baseMixin'

export default {
  name: 'SliderField',
  mixins: [baseMixin],
  props: {
    value: {
      type: Number,
      default: 0
    },
    step: {
      type: Number,
      default: 1
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    precision: {
      type: Number,
      default: 0
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val !== this.innerValue) {
          this.innerValue = val
        }
      },
      immediate: true
    }
  },
  methods: {
    handleChagne(value) {
      let val = parseFloat((value || 0).toFixed(this.precision))
      val = Math.min(val, this.max)
      this.innerValue = val
      this.update(val)
    }
  }
}
</script>

<style lang="less" scoped>
.slider-warp {
  position: relative;
  .slider-value {
    text-align: center;
    position: absolute;
    top: -30px;
    right: 0;
  }
}

/* 默认隐藏箭头 */
::v-deep .el-input-number__decrease,
::v-deep .el-input-number__increase {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  width: 14px; /* 固定箭头宽度，避免布局抖动 */
  line-height: 10px !important;
  height: 10px !important;
}

/* 显示箭头的条件 */
::v-deep .el-input-number:focus-within .el-input-number__decrease,
::v-deep .el-input-number:focus-within .el-input-number__increase,
::v-deep .el-input-number:hover .el-input-number__decrease,
::v-deep .el-input-number:hover .el-input-number__increase,
::v-deep .el-input-number .el-input-number__decrease:active ~ .el-input-number__increase,
::v-deep .el-input-number .el-input-number__increase:active ~ .el-input-number__decrease,
::v-deep .el-input-number .el-input-number__decrease:active,
::v-deep .el-input-number .el-input-number__increase:active {
  opacity: 1;
  line-height: 10px;
  height: 10px;
  pointer-events: auto;
}

::v-deep .el-input-number--small {
  width: 75px !important;
}

/* 按钮悬停样式 */
::v-deep .el-input-number .el-input-number__decrease:hover,
::v-deep .el-input-number .el-input-number__increase:hover {
  background-color: #f5f7fa;
  line-height: 10px;
  height: 10px;
}

::v-deep .el-icon-arrow-up:before {
  position: relative;
  top: -3px;
}

::v-deep .el-icon-arrow-down:before {
  position: relative;
  top: -1px;
}

/* 基础输入框样式 - 默认居中对齐 */
::v-deep .el-input__inner {
  text-align: center;
  transition: text-align 0.2s ease, padding-right 0.2s ease;
  height: 22px !important;
  padding: 0 8px !important;
}

/* 有箭头显示时 - 右对齐并增加右侧内边距 */
::v-deep .el-input-number:focus-within .el-input__inner,
::v-deep .el-input-number:hover .el-input__inner,
::v-deep .el-input-number .el-input-number__decrease:active ~ .el-input .el-input__inner,
::v-deep .el-input-number .el-input-number__increase:active ~ .el-input .el-input__inner {
  text-align: left;
  padding-right: 23px !important; /* 为箭头留出空间 */
}

/* 确保输入框容器不会因为箭头显示/隐藏而变化宽度 */
::v-deep .el-input-number {
  display: inline-flex;
  align-items: center;
}

::v-deep .el-input-number .el-input {
  flex: 1;
  height: 22px; /* 输入框高度 */
  line-height: 22px; /* 确保文本垂直居中 */
}
</style>
