<template>
  <el-select
    v-model="innerValue"
    :disabled="disabled"
    :placeholder="placeholder || $t('base.select_placeholder')"
    :multiple="multiple"
    :filterable="true"
    size="small"
    class="common-select"
    popper-class="custom-popper-class select-field-popper"
    @change="handleChange"
  >
    <template slot="empty">
      <slot name="empty"></slot>
    </template>
    <el-option
      v-for="item in options"
      :key="item[valueKey]"
      :label="(isInnerLabel && isNeedColon ? label + '：' : '') + item[labelKey]"
      :value="item[valueKey]"
    >
      {{ item[labelKey] }}
    </el-option>
  </el-select>
</template>

<script>
import baseMixin from './baseMixin'

export default {
  name: 'SelectField',
  mixins: [baseMixin],
  props: {
    options: {
      type: Array,
      default: () => []
    },
    value: [Number, String, Array],
    labelKey: {
      type: String,
      default: 'label'
    },
    valueKey: {
      type: String,
      default: 'value'
    },
    placeholder: {
      type: String,
      default: ''
    },
    multiple: {
      type: Boolean,
      default: false
    },
    isInnerLabel: {
      type: Boolean,
      default: false
    },
    isNeedColon: {
      type: Boolean,
      default: true
    },
    label: {
      type: [String, Number],
      default: ''
    },
    format: {
      type: String,
      default: '' // json ,''
    },
    required: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    value: {
      handler(val) {
        if (this.format === 'json') {
          try {
            this.innerValue = JSON.parse(val)
          } catch (error) {
            this.innerValue = this.multiple ? [] : undefined
          }
        } else {
          if (val !== this.innerValue) {
            this.innerValue = val
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    handleChange(val) {
      if (this.required && (!val || val?.length < 1)) {
        const firstVal = this.options[0][this.valueKey]
        val = this.multiple ? [firstVal] : firstVal
        this.innerValue = val
      }

      if (this.format === 'json') {
        if (this.multiple) {
          this.update(JSON.stringify(val))
        } else {
          this.update(val)
        }
      } else {
        this.update(val)
      }
    }
  }
}
</script>

<style lang="less">
.select-field-popper {
  .el-select-dropdown__item {
    font-size: 14px;
  }
  .empty-data-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 24px 0;
    font-size: 14px;
    color: #b0b1b8;
    p {
      margin-top: 10px;
    }
    a {
      margin-left: 4px;
    }
    i {
      font-size: 32px;
    }
  }
}
</style>

<style lang="less" scoped>
.el-select {
  ::v-deep .el-input {
    &.is-focus {
      .el-input__inner {
        &::placeholder {
          font-size: 14px;
          color: var(--mainTextColor);
        }
      }
    }
  }
}
</style>
