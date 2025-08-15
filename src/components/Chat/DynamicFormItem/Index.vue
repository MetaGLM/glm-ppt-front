<template>
  <el-form-item
    v-if="data.layout === 'right' || data.layout === 'top'"
    :inline-message="true"
    :class="{
      'flex flex-between inline-row': data && data.type === 'switch'
    }"
  >
    <template v-if="!isInnerLabel" slot="label">
      <slot name="label">
        {{ label }}
      </slot>
    </template>
    <component
      v-if="displayComponent"
      :is="displayComponent"
      v-bind="mergeProps"
      :value="value"
      @change="handleChange"
    />
  </el-form-item>
</template>

<script>
import {
  SliderField,
  TextareaZoomIn,
  SwitchField,
  SelectField,
  RadioField,
  CustomList
} from './Fields'

import { COMPONENT_TYPE_MAP } from './config'

export default {
  name: 'DynamicFormItem',
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    },
    value: [String, Number, Boolean],
    // 运行时属性
    runningProps: {
      type: Object,
      default: () => ({})
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
    }
  },
  data() {
    return {
      displayComponent: null,
      propsConfig: {}
    }
  },
  computed: {
    mergeProps() {
      return {
        disabled: this.disabled,
        ...this.propsConfig,
        ...this.runningProps
      }
    }
  },
  watch: {
    data: {
      handler(val) {
        const { displayComponent, props } = this.getComponentInfo(val)
        this.displayComponent = displayComponent
        this.propsConfig = props
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    getComponentInfo(data) {
      if (data?.type === COMPONENT_TYPE_MAP.INPUT && data?.subType !== 'multiItem') {
        return {
          displayComponent: TextareaZoomIn,
          props: {
            required: data.required,
            rules: data.rules,
            maxlength: data.max,
            minlength: data.min || 0
          }
        }
      }

      if (data?.type === COMPONENT_TYPE_MAP.DOUBLE || data?.type === COMPONENT_TYPE_MAP.INT) {
        let precision = data.precisions || 0
        let step = data.step || 1
        if (data?.type === 'double') {
          precision = 2
          step = 0.01
        }

        return {
          displayComponent: SliderField,
          props: {
            required: data.required,
            min: data.min,
            max: data.max,
            step: step,
            precision: precision,
            rules: data.rules
          }
        }
      }
      if (data?.type === COMPONENT_TYPE_MAP.SELECT) {
        return {
          displayComponent: SelectField,
          props: {
            isInnerLabel: this.isInnerLabel,
            isNeedColon: this.isNeedColon,
            label: this.isInnerLabel ? this.label : '',
            required: data.required,
            rules: data.rules,
            options: data.options,
            multiple: data.multiple,
            ...data.meta
          }
        }
      }
      if (data?.type === COMPONENT_TYPE_MAP.RADIO) {
        return {
          displayComponent: RadioField,
          props: {
            required: data.required,
            rules: data.rules,
            options: data.options
          }
        }
      }

      if (data?.type === COMPONENT_TYPE_MAP.SWITCH) {
        return {
          displayComponent: SwitchField,
          props: {
            required: data.required,
            rules: data.rules,
            options: data.options
          }
        }
      }

      if (data?.type === COMPONENT_TYPE_MAP.CUSTOM_LIST) {
        return {
          displayComponent: CustomList,
          props: {
            required: data.required,
            ...data.meta
          }
        }
      }

      return {
        displayComponent: null,
        props: {}
      }
    },
    handleChange(val) {
      this.$emit('update:value', val)
      this.$emit('change', val)
    }
  }
}
</script>

<style scoped lang="less">
.inline-row {
  ::v-deep .el-form-item__label {
    padding-bottom: 0;
  }
}
</style>
