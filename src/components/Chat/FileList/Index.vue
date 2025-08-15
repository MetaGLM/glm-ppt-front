<template>
  <ul class="file-list scroll-display-none" :class="{ readonly: readonly }">
    <li
      v-for="(item, index) in fileList"
      :key="(item && (item.fileId || item.uid)) || index"
      class="file-box"
      :class="{
        'file-box-audio': !!(item && item.format)
      }"
    >
      <slot
        :data="item"
        :readonly="readonly"
        :reuploadFile="() => handleReUpload(index)"
        :onDelete="() => handleDelete(index)"
      >
        <DisplayAudio
          v-if="item.customType === 'audio' || item.format"
          :url="item.url"
          :readonly="readonly"
          :fileName="item.name"
          v-bind="audioOptions"
          @onDelete="handleDelete(index)"
        />
        <AFileItem
          v-else
          :data="item"
          :readonly="readonly"
          @onDelete="handleDelete(index)"
          @onReUpload="handleReUpload(index)"
        />
      </slot>
    </li>
  </ul>
</template>

<script>
import { transformFileSizeUnit } from '@/utils/tools'
import AFileItem from './FileItem.vue'
import DisplayAudio from './DisplayAudio.vue'

// uploading
// success
// fail
// ready

export default {
  name: 'FileList',
  components: {
    AFileItem,
    DisplayAudio
  },
  props: {
    readonly: {
      type: Boolean,
      default: false
    },
    fileList: {
      type: Array,
      default: () => []
    },
    audioOptions: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    transformFileSizeUnit,
    handleDelete(index) {
      this.fileList.splice(index, 1)
      this.$emit('change', { fileList: this.fileList })
    },
    handleReUpload(index) {
      this.$emit('reUpload', index)
    }
  }
}
</script>

<style scoped lang="less">
.file-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(160px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.file-box {
  box-sizing: border-box;
  min-width: 160px;
  // max-width: 252px;
  border-radius: 8px;
  background: #f5f5f5;
  &-audio {
    width: 100%;
    max-width: initial;
    background: transparent;
    grid-column-start: 1;
    grid-column-end: 4;
  }
}
@media screen and(max-width: 768px) {
  .file-list {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
