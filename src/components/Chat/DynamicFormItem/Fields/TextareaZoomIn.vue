<template>
  <div class="textarea-zoomin">
    <el-input
      type="textarea"
      :value="value"
      :disabled="disabled"
      :rows="6"
      :maxlength="maxlength"
      :minlength="minlength"
      :autosize="autosize"
      :placeholder="$t('cb_base.inputPlaceholder')"
      @input="onInput"
    />
    <i
      v-if="showUnfoldIcon"
      class="iconfont icon-unfold common-icon unfold-btn pointer"
      @click="openDialog"
    ></i>
    <el-dialog
      v-if="showUnfoldIcon"
      :title="title"
      class="custom-class-dialog-style has-footer"
      :class="{ 'dialog-limie-over': showUnfoldIcon && dialogValueLength > maxlength }"
      :append-to-body="true"
      :visible.sync="dialogVisible"
    >
      <div class="flex flex-between mb10" v-if="subTitle">
        <h5>{{ subTitle }}</h5>
      </div>
      <el-input
        type="textarea"
        v-model="dialogValue"
        :disabled="disabled"
        :minlength="minlength"
        :rows="6"
        :show-word-limit="true"
        :placeholder="$t('cb_base.inputPlaceholder')"
      />
      <div class="input-length-box" :class="{ 'over-limit': dialogValueLength > maxlength }">
        <span class="input-length-text">{{ dialogValueLength }}</span
        >/<span>{{ maxlength }}</span>
      </div>
      <div slot="footer" class="dialog-footer">
        <template v-if="disabled">
          <el-button :disabled="false" type="primary" @click="dialogVisible = false">
            {{ $t('base.close') }}
          </el-button>
        </template>
        <template v-else>
          <el-button size="small" @click="dialogVisible = false">
            {{ $t('common.cancel') }}
          </el-button>
          <el-button
            type="primary"
            size="small"
            :disabled="dialogValueLength > maxlength"
            @click="savePrompt"
          >
            {{ $t('cb_base.confirm') }}
          </el-button>
        </template>
      </div>
    </el-dialog>
  </div>
</template>
<script>
/**
 * @componentName: TextareaZoomIn;
 * @description: 多行文本带弹框放大功能;
 * @maxlength：如果有限制最大输入，长度超过100，支持放大功能
 * @value: 支持 v-model
 * @emit：change
 */

export default {
  name: 'TextareaZoomIn',
  model: {
    value: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    maxlength: Number,
    minlength: {
      type: Number,
      default: 0
    },
    autosize: {
      type: [Object, Boolean],
      default: () => ({ minRows: 3, maxRows: 6 })
    },
    title: {
      type: String,
      default: ''
    },
    subTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogVisible: false,
      dialogValue: ''
    }
  },
  computed: {
    showUnfoldIcon() {
      if (this.maxlength === undefined) {
        return false
      }
      if (this.maxlength > 100) {
        return true
      }
      return false
    },
    dialogValueLength() {
      return this.dialogValue ? this.dialogValue.trim().length : 0
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      this.dialogValue = this.value
    },
    onInput(val) {
      this.$emit('change', val)
    },
    savePrompt() {
      if (this.dialogValueLength > this.maxlength) {
        return
      }
      this.onInput(this.dialogValue)
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.textarea-zoomin {
  position: relative;
  color: var(--mainTextColor);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  &:hover {
    ::v-deep .el-textarea__inner {
      border-color: var(--primaryColor);
    }
    .unfold-btn {
      visibility: visible;
      opacity: 1;
      transition: all 0.2s;
    }
  }
}
.unfold-btn {
  position: absolute;
  right: 8px;
  bottom: 4px;
  width: 24px;
  height: 24px;
  color: #000;
  background-color: #fff;
  visibility: hidden;
  opacity: 0;
  transition: all 0.2s;
  &:hover {
    background: rgba(19, 18, 18, 0.05);
  }
  &:active {
    background: rgba(19, 18, 18, 0.08);
  }
}

::v-deep .el-textarea__inner {
  padding: 12px 12px 18px 12px !important;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

::v-deep .el-dialog {
  max-width: 640px;
  width: 80vw !important;

  .el-dialog__body {
    position: relative;
    .el-textarea {
      width: 100%;
      max-height: 433px;
      height: 70vh;
      .el-textarea__inner {
        height: 100%;
        color: var(--mainTextColor);
        line-height: 22px;
      }
      &.is-disabled {
        .el-textarea__inner {
          color: #8d8e99;
        }
      }
    }
    .input-length-box {
      position: absolute;
      right: 28px;
      bottom: 9px;
      padding: 0 4px;
      color: #8d8e99;
      font-size: 12px;
      line-height: 18px;
      background: #fff;
      &.over-limit {
        color: #f01d24;
        .input-length-text {
          color: #f01d24;
        }
      }
      &-text {
        color: #5e5e66;
        font-weight: 500;
      }
    }
  }
}

.dialog-limie-over {
  ::v-deep .el-dialog {
    .el-dialog__body {
      .el-textarea {
        .el-textarea__inner {
          border-color: #f01d24 !important;
          &:hover {
            border-color: #f01d24;
          }
        }
      }
    }
  }
}
</style>
