<template>
  <div
    class="flex flex-y-center list-item"
    :class="{
      'only-display': onlyDisplay,
      'single-item': !onlyDisplay
    }"
  >
    <div v-if="$slots.logo" class="flex flex-center list-item-logo">
      <slot name="logo"></slot>
    </div>
    <slot name="content">
      <div class="flex1 overhidden" :class="center ? 'tc' : 'tl'">
        <slot>
          <AutoTooltip :content="item[labelField]" :openDelay="150" />
          <AutoTooltip
            v-if="showDescription"
            :content="item[descriptionField]"
            :openDelay="150"
            :line="descriptionLine"
          >
            <span class="label-desc">
              {{ item[descriptionField] }}
            </span>
          </AutoTooltip>
          <slot name="extra-content"></slot>
        </slot>
      </div>
    </slot>
    <slot name="extra-setting"></slot>
    <el-tooltip v-if="showDelete" :content="$t('common.tooltip.del')" placement="top">
      <i
        class="iconfont icon-wdnew_remove flex-none common-icon action-item cursor-pointer"
        @click="handleDelete"
      ></i>
    </el-tooltip>
  </div>
</template>

<script>
import AutoTooltip from '@/components/AutoTooltip.vue'

export default {
  name: 'ListItem',
  components: {
    AutoTooltip
  },
  props: {
    item: {
      type: Object,
      default: () => ({}),
      required: true
    },
    labelField: {
      type: String,
      default: 'name'
    },
    descriptionField: {
      type: String,
      default: 'description'
    },
    showDescription: {
      type: Boolean,
      default: false
    },
    showDelete: {
      type: Boolean,
      default: false
    },
    // 设置true 时，仅用于内容展示罗列，由外部容器控制选中，禁用等样式控制
    // false 时，可作为单独使用
    // 具体以实际情况为准
    onlyDisplay: {
      type: Boolean,
      default: false
    },
    // 描述内容显示几行，省略展示
    descriptionLine: {
      type: Number,
      default: 1
    },
    center: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleDelete() {
      this.$emit('deleteItem', this.item)
    }
  }
}
</script>

<style lang="less" scoped>
.list-item {
  width: 100%;
  font-size: 14px;
  line-height: 22px;
  &-logo {
    flex: none;
    margin-right: 8px;
    line-height: 1;
  }
}

.single-item {
  box-sizing: border-box;
  margin-top: 8px;
  padding: 12px 20px 12px 12px;
  border-radius: 8px;
  background: #f7f8fa;
}

.action-item {
  margin-left: 20px;
}
</style>
