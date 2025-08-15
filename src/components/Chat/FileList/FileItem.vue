<template>
  <div class="file-item" :class="{ readonly: readonly }">
    <img
      v-if="data.status === 'fail'"
      src="@/assets/images/file/fail.png"
      alt="error"
      class="file-icon drag-none"
    />
    <img v-else :src="fileUrl" alt="ZHIPU·AI" class="file-icon drag-none" />
    <div class="file-info">
      <AutoTooltip class="file-name" :content="fileInfo.name" placement="top" />
      <div v-if="data.status === 'success'" class="file-status status-success file-type-size">
        <span>{{ fileType }}</span>
        {{ fileInfo.size }}
      </div>
      <div
        v-if="data.status === 'ready' || data.status === 'uploading'"
        class="flex file-status status-ready"
      >
        <img
          src="@/assets/images/loading/loading1.gif"
          :width="12"
          :height="12"
          alt="ZHIPU·AI"
          class="drag-none"
        />
        {{ $t('common.upload.upload') }}
      </div>
      <div
        v-if="data.status === 'fail'"
        type="text"
        class="file-status status-fail"
        @click.stop="$emit('onReUpload')"
      >
        <slot name="fail-text">
          {{ $t('common.upload.re_upload') }}
        </slot>
      </div>
    </div>
    <i
      v-if="!readonly"
      class="iconfont icon-wdcomponents-delete delete-icon"
      @click.stop="$emit('onDelete')"
    ></i>
  </div>
</template>

<script>
import { transformFileSizeUnit } from '@/utils/tools'
import AutoTooltip from '@/components/AutoTooltip.vue'
// uploading
// success
// fail
// ready

export default {
  name: 'FileItem',
  components: {
    AutoTooltip
  },
  props: {
    readonly: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    fileInfo() {
      const { name = '', size } = this.data
      const splitIndex = name?.lastIndexOf('.')

      return {
        name: name.slice(0, splitIndex > -1 ? splitIndex : name.length),
        size: this.transformFileSizeUnit(size)
      }
    },
    fileType() {
      const { name = '' } = this.data
      const splitIndex = name?.lastIndexOf('.')
      return (name?.slice(splitIndex + 1) || '').toUpperCase()
    },
    fileUrl() {
      const { url, raw } = this.data
      return (
        this.convertFileIcon({ type: this.fileType, url, raw }) ||
        require('@/assets/images/file/file.png')
      )
    }
  },
  beforeDestroy() {
    const url = (this.fileUrl || '').trim()
    if (url.startsWith('blob:http')) {
      URL.revokeObjectURL(this.fileUrl)
    }
  },
  methods: {
    transformFileSizeUnit,
    convertFileIcon({ type, url, raw }) {
      switch (type) {
        case 'PNG':
        case 'JPG':
        case 'JPEG':
        case 'GIF':
        case 'BMP':
          if (url) {
            return url
          }
          if (raw) {
            return URL.createObjectURL(raw)
          }
          return ''
        case 'DOC':
        case 'DOCX':
        case 'TXT':
          return require('@/assets/images/file/doc.png')
        case 'XLSX':
        case 'CSV':
          return require('@/assets/images/file/xlsx.png')
        case 'PDF':
          return require('@/assets/images/file/pdf.png')
        case 'MP4':
          return require('@/assets/images/file/video.png')
        case 'PPT':
        case 'PPTX':
        case 'KEY':
          return require('@/assets/images/file/ppt.png')
        default:
          return require('@/assets/images/file/file.png')
      }
    }
  }
}
</script>

<style scoped lang="less">
.file-item {
  box-sizing: border-box;
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
  width: 100%;
  padding: 10px;
  .delete-icon {
    position: absolute;
    top: -4px;
    right: -4px;
    padding: 1px;
    color: rgba(0, 0, 0, 0.6);
    cursor: pointer;
  }
  .file-icon {
    overflow: hidden;
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }
  .file-info {
    overflow: hidden;
    flex: 1;
    color: #838a95;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
    text-align: left;
    .file-name {
      color: #1a2029;
    }
  }
}

.file-status {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
}
.status-ready {
  gap: 4px;
}
.status-success {
}

.status-fail {
  color: #2454ff;
  cursor: pointer;
  &:hover {
    color: var(--primaryColor);
  }
}
</style>
