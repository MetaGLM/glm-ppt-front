<template>
  <div class="empty-data">
    <slot name="icon">
      <i class="iconfont" :class="iconClass" :style="{ fontSize: size + 'px' }"></i>
    </slot>
    <slot name="content">
      <p v-if="content && content.length > 0">{{ content }}</p>
    </slot>
  </div>
</template>

<script>
export default {
  name: 'EmptyData',
  props: {
    iconClass: {
      type: String,
      default: 'icon-wdvoid'
    },
    content: String,
    size: {
      type: Number,
      default: 24
    }
  }
}
</script>

<style lang="less" scoped>
.empty-data {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 100px 40px;
  color: var(--colorTextDisabled);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  border-radius: 8px;
  border: 1px solid var(--boxBorderColor-1);
  background: #ffffff;
  .iconfont {
    margin-bottom: 12px;
    color: rgba(224, 224, 224, 0.6);
    line-height: 1;
  }
}
</style>
