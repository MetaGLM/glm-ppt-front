export default {
  props: {
    required: {
      type: Boolean,
      default: false
    },
    rules: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      innerValue: undefined
    }
  },
  methods: {
    update(val) {
      this.$emit('update:value', val)
      this.$emit('change', val)
    }
  }
}
