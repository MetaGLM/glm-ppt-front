<template>
  <div class="flex chat-prompt">
    <FileList
      v-if="fileContentList && fileContentList.length > 0"
      :class="{
        single: fileContentList.length < 2
      }"
      :readonly="true"
      :fileList="fileContentList"
      :audioOptions="$userAudioOptions"
    />
    <p v-if="question" class="chat-prompt-text" v-text="question"></p>
    <div v-if="question" class="float-layer">
      <IconButton
        size="mideum"
        :tooltip="$t('base.copy')"
        iconClass="icon-copy"
        sensorsName="输入复制"
        @click="copyPrompt"
      />
    </div>
  </div>
</template>
<script>
import {
  ROLE_TYPE // 角色类型
} from '@/enums/modules/trialCenter'
import IconButton from '@/components/Chat/IconButton.vue'
import FileList from '@/components/Chat/FileList/Index.vue'

export default {
  name: 'ChatPrompt',
  components: {
    IconButton,
    FileList
  },
  props: {
    showAvater: {
      type: Boolean,
      default: true
    },
    question: {
      type: String,
      default: ''
    },
    fileContentList: {
      type: Array,
      default: () => []
    },
    showSyncPoint: {
      type: Boolean,
      default: false
    }
  },
  created() {
    this.$userAudioOptions = {
      isDefault: false
    }
    this.ROLE_TYPE = ROLE_TYPE
  },
  methods: {
    copyPrompt() {
      this.copy(this.question)
    },
    editPrompt() {}
  }
}
</script>

<style lang="less" scoped>
.chat-prompt {
  box-sizing: border-box;
  position: relative;
  padding-left: 36px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  margin-bottom: 32px;
  &-text {
    box-sizing: border-box;
    max-width: 100%;
    padding: 10px 20px;
    margin-top: 3px;
    font-size: 16px;
    line-height: 28px;
    color: var(--mainTextColor);
    white-space: pre-wrap;
    word-break: break-all;
    background: #e8f0fc;
    border-radius: 12px;
    &:hover {
      & + .float-layer {
        opacity: 1;
        visibility: visible;
      }
    }
  }

  ::v-deep .file-list {
    max-width: 100%;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    direction: rtl;
    gap: 12px;
    .file-box {
      width: 100%;
      direction: ltr;
      .custom-audio {
        width: 300px;
      }
    }
    &.single {
      grid-template-columns: repeat(1, minmax(200px, 1fr));
    }
  }

  .float-layer {
    position: absolute;
    bottom: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    padding: 4px;
    transform: translate(0, 100%);
    border-radius: 8px;
    background: #fff;
    box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.08), 0px 8px 24px 0px rgba(0, 0, 0, 0.16);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
    &:hover {
      opacity: 1;
      visibility: visible;
    }
  }
}

@media screen and (max-width: 768px) {
  .chat-prompt {
    ::v-deep .file-list {
      .file-box {
        background: #fff;
      }
    }
    &-text {
      background: rgba(19, 76, 255, 0.06);
    }
  }
}
</style>
