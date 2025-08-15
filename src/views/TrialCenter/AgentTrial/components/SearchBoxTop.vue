<template>
  <div
    class="flex"
    :class="{
      'flex-col-start col-layout': parameterConfig && parameterConfig.length > 1,
      'flex-y-end flex-x-end row-layout reverse': parameterConfig && parameterConfig.length === 1,
      'flex-y-end flex-x-start': parameterConfig && parameterConfig.length === 0
    }"
  >
    <el-form
      v-if="parameterConfig && parameterConfig.length > 0"
      class="custom-class-form-style scrollbar-style top-setting-from"
      :model="formData"
      size="mini"
      :disabled="disabled"
      :hide-required-asterisk="true"
      label-position="left"
      :inline="true"
    >
      <template>
        <DynamicFormItem
          v-for="(item, index) in parameterConfig"
          :key="item.id || item.modelParamsId || index"
          :disabled="disabled"
          :data="item"
          :isInnerLabel="true"
          :label="item.paramName"
          :value.sync="formData[item.paramCode]"
        >
        </DynamicFormItem>
      </template>
    </el-form>
  </div>
</template>

<script>
import DynamicFormItem from '@/components/Chat/DynamicFormItem/Index.vue'

export default {
  name: 'SearchBoxTop',
  components: {
    DynamicFormItem
  },
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // 参数配置
    parameterConfig: {
      type: Array,
      default: () => []
    },
    agentId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      formData: {},
      innerSyncValue: false
    }
  },
  watch: {
    value: {
      handler(val) {
        this.formData = val
      },
      immediate: true
    },
    formData: {
      handler(val, oldval) {
        // 利用对象引用作优化处理，form表单修改时，不改变原对象
        if (val === oldval) {
          this.$emit('change', val)
        }
      },
      deep: true
    }
  }
}
</script>

<style lang="less" scoped>
.top-setting-from {
  overflow: auto;
  margin-top: 10px;
  .full-row-form-item {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  ::v-deep .el-form-item {
    margin-bottom: 12px;
    &::before,
    &::after {
      display: none;
    }
  }
}
.reverse {
  flex-direction: row-reverse;
}
.col-layout {
  p {
    margin-bottom: 0;
  }
}
.row-layout {
  p {
    margin-bottom: 18px;
  }
}
</style>
