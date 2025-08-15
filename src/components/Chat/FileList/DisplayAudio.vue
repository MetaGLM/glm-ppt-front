<template>
  <div class="custom-audio flex">
    <AudioBox
      :audioUrl="url"
      width="100%"
      height="36"
      :options="{
        normalize: false
      }"
      :fileName="fileName"
      :zoomable="false"
    />
    <i
      v-if="!readonly"
      class="iconfont icon-wdnew_remove cursor-pointer delete-icon"
      @click="handleDelete"
    ></i>
  </div>
</template>
<script>
import AudioBox from '@/components/AudioBox.vue'
export default {
  name: 'DisplayAudio',
  components: {
    AudioBox
  },
  props: {
    readonly: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleDelete() {
      this.$emit('onDelete')
    }
  }
}
</script>

<style lang="less" scoped>
.custom-audio {
  max-width: 300px;
  width: 100%;
  align-items: flex-end;
  ::v-deep .audio-box {
    flex: 1;
    margin: 0;
    width: calc(100% - 28px);
  }
  .delete-icon {
    margin-left: 4px;
    flex: none;
    line-height: 1;
    padding: 4px;
    color: rgba(94, 94, 102, 1);
    border-radius: 4px;
    &:hover {
      background: rgba(19, 76, 255, 0.08);
    }
  }
}
</style>
