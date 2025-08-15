<template>
  <el-radio-group
    class="base-radio-group"
    :disabled="disabled"
    v-model="innerValue"
    @input="update"
  >
    <el-radio v-for="item in options" :key="item.value" :label="item.value">
      <AutoTooltip :content="item.label"></AutoTooltip>
    </el-radio>
  </el-radio-group>
</template>

<script>
import baseMixin from './baseMixin'
import AutoTooltip from '@/components/AutoTooltip.vue'

export default {
  name: 'SwitchField',
  components: {
    AutoTooltip
  },
  mixins: [baseMixin],
  props: {
    options: {
      type: Array,
      default: () => []
    },
    value: [Number, String]
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
