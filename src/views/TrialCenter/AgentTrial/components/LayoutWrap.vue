<template>
  <div v-loading="loading" class="page-layout-right-container page-layout-wrap">
    <section class="page-layout-right-container-content flex page-layout-main">
      <SplitPane
        :class="{ 'split-pane-container': displayRightPane }"
        :minPercent="minPercent"
        :defaultPercent="defaultPercent"
        :showResizerLine="displayRightPane"
      >
        <template slot="paneL">
          <slot name="left"></slot>
          <div v-if="showAiTip" class="flex-none tc ai-tip-text">
            {{ $t('model_trial.ai_mark_text') }}
          </div>
        </template>
        <template v-if="displayRightPane" slot="paneR">
          <slot name="paneRight"></slot>
        </template>
      </SplitPane>
      <slot name="right"></slot>
    </section>
  </div>
</template>
<script>
import SplitPane from '@/components/SplitPane/index.vue'

export default {
  name: 'LayoutWrap',
  components: {
    SplitPane
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    showAiTip: {
      type: Boolean,
      default: true
    },
    defaultPercent: {
      type: Number,
      default: 100
    },
    minPercent: {
      type: Number,
      default: 0
    },
    displayRightPane: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="less">
// 水印样式
#wm_div_id {
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
<style lang="less" scoped>
.page-layout-wrap {
  overflow: hidden;
  background: #fff;
  .page-layout-main {
    height: 100%;
  }
  .ai-tip-text {
    padding-bottom: 0;
  }
  &.drag-active {
    overflow: hidden;
    border-radius: 8px;
  }
  .page-layout-main {
    height: calc(100%);
    padding: 0;
    &-left {
      width: 0;
      flex-direction: column;
      transition: all 0.3s;
    }
  }
  .ai-tip-text {
    padding: 7px 0;
    color: #c3c4cc;
    font-size: 10px;
    line-height: 18px;
  }
}
::v-deep .vue-splitter-container {
  flex: 1;
  height: 100%;
  &.split-pane-container {
    flex: none;
    width: 100%;
    .splitter-pane-resizer {
      display: block;
    }
  }
  .vue-splitter-flex-box {
    .splitter-paneL {
      display: flex;
      flex-direction: column;
    }
  }
  .splitter-pane-resizer {
    display: none;
  }
}
</style>
