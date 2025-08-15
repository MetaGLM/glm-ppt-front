<template>
  <el-switch
    class="switch-24"
    :disabled="disabled"
    v-model="innerValue"
    v-bind="$attrs"
    @change="update"
  ></el-switch>
</template>

<script>
import baseMixin from './baseMixin'

export default {
  name: 'SwitchField',
  mixins: [baseMixin],
  props: {
    options: {
      type: Array,
      default: () => []
    },
    value: [Number, String, Boolean]
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
  }
}
</script>
