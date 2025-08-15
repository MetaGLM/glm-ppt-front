<template>
  <div :class="['code', `define-code-style-${styleType}`]">
    <div
      class="pr code-wrap tl pointer"
      @mouseenter="copyBtnShow = true"
      @mouseleave="copyBtnShow = false"
    >
      <div v-if="modeIsShow" class="copy flex flex-between">
        <div>
          <el-dropdown
            v-if="modelList && modelList.length > 0"
            @command="modeChange"
            @visible-change="visibleChange"
            trigger="click"
          >
            <span class="el-dropdown-link">
              <label>{{ selectModeCode }}</label
              ><i
                class="el-icon-arrow-down el-icon--right"
                :class="{ active: dropDownListStatus }"
              ></i>
            </span>
            <el-dropdown-menu class="choose-model-panel" slot="dropdown">
              <el-dropdown-item
                v-for="(item, index) in modelList"
                :class="{ active: item.isActive }"
                :key="index"
                :command="item.modelCode"
                >{{ item.modelName }}</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
          <label>{{ codeLanguage }}</label>
        </div>
        <button class="h-full flex flex-ai-center" name="复制代码" @click="executeCopy">
          <i class="iconfont icon-wdapp_copy"></i
          ><span v-show="!media.isPhone">{{ $t('common.copy_code') }}</span>
        </button>
      </div>
      <i
        v-if="showCopyBtn"
        class="pa icon-copy fs16 iconfont ft_white icon-wdfuzhidaima"
        @click="executeCopy"
      ></i>
      <pre
        class="scroll-display-none"
      ><code ref="codeArea"  :class="[codeClass, { wrap: isWrap }]" v-text="code ? code : viewCode" ></code></pre>
    </div>
  </div>
</template>

<script>
import * as hljs from 'highlight.js/lib/core'
import java from 'highlight.js/lib/languages/java'
import { lineNumbersBlock } from '@/utils/lines'

export default {
  name: 'CodeView',
  props: {
    dialogVisible: {
      type: Boolean,
      default: () => false
    },
    // 显示代码
    code: {
      type: String,
      default: () => ''
    },
    // 显示复制按钮
    copyBtn: {
      type: String,
      default: 'hover',
      validator: function(value) {
        return ['always', 'hover', 'never'].includes(value)
      }
      // always/hover/never
    },
    // 显示模型 语言下拉部分
    modeIsShow: {
      type: Boolean,
      default: () => true
    },
    // 显示行号
    showLineNumbers: {
      type: Boolean,
      default: () => false
    },
    // code的样式，可自行添加类名
    styleType: {
      type: [String, Number],
      default: ''
    },
    // code的预置语言样式
    codeClass: {
      type: String,
      default: ''
    },
    // code的预置语言
    codeLanguage: {
      type: String,
      default: 'Python'
    },
    // 模型列表
    modelList: {
      type: Array,
      default() {
        return []
      }
    },
    // 通过参数获取代码块
    codeParams: {
      type: Object,
      default: () => ({})
    },
    // 模型code
    codeMode: {
      type: String,
      default: 'chatglm_turbo'
    },
    // 类型判断
    type: {
      type: String,
      default: ''
    },
    // 拷贝内容
    copyContent: {
      type: String,
      default: ''
    },
    isWrap: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelItem: null,
      copyBtnShow: false,
      copyIcon: false,
      viewDetailId: '',
      selectModeCode: '',
      selectLanguageId: 0,
      languages: [],
      viewCode: '',
      dropDownListStatus: false
    }
  },
  computed: {
    showCopyBtn() {
      if (this.copyBtn === 'never') {
        return false
      }
      if (this.copyBtn === 'always') {
        return true
      }
      if (this.copyBtn === 'hover') {
        return this.copyBtnShow
      }
      return false
    }
  },
  watch: {
    viewCode(val) {
      if (val) {
        this.addHighAndLineNum()
      }
    },
    codeLanguage: {
      handler(val) {
        if (val) {
          this.languages.push({
            languageType: val,
            id: 0
          })
        }
      },
      immediate: true
    },
    code: {
      handler(val) {
        if (val) {
          this.addHighAndLineNum()
        }
      },
      immediate: true
    },
    modelList: {
      handler(val) {
        if (val && val.length > 0) {
          this.selectModeCode = val[0].modelCode
          this.modeChange(this.selectModeCode)
        }
      },
      immediate: true
    }
  },
  created() {
    hljs.registerLanguage('java', java)
  },
  methods: {
    executeCopy() {
      const content = this.copyContent ? this.copyContent : this.code ? this.code : this.viewCode
      this.copy(content)
    },
    visibleChange(value) {
      this.dropDownListStatus = value
    },
    addHighAndLineNum() {
      this.$nextTick(() => {
        const codeBlock = this.$refs.codeArea
        hljs.highlightElement(codeBlock)
        if (this.showLineNumbers) {
          lineNumbersBlock(codeBlock)
        }
      })
    },
    // 变更模型下拉框选项
    modeChange(val) {
      this.$emit('update:codeMode', val)
      this.selectModeCode = val

      if (this.modelItem) {
        this.modelItem.isActive = false
      }
      this.modelItem = this.modelList.find(e => e.modelCode === val)
      this.modelItem.isActive = true

      let params = {
        ...this.codeParams,
        ...{
          model: val
        }
      }

      if (this.modelItem) {
        const { inputText } = JSON.parse(this.modelItem.productSceneCase.requestCase)[0]
        if (inputText) {
          params = {
            ...this.codeParams,
            ...{
              model: val,
              prompt: [{ role: 'user', content: inputText }]
            }
          }
        }
      }
    }
  }
}
</script>
<style scoped lang="less">
.choose-model-panel {
  margin-top: 10px;
  padding: 6px 0;
  background-color: #000;
  border: 1px solid #000;
  ::v-deep .popper__arrow {
    border-top-color: #000;
    border-bottom-color: #000;
    &::after {
      border-top-color: #000;
      border-bottom-color: #000;
    }
  }
  li {
    color: #dad7d7;
    height: 28px;
    line-height: 28px;
    &:hover {
      color: #fff;
      background-color: #58595a;
    }
    &.active {
      background-color: #333;
    }
  }
}
.code {
  ::v-deep .el-dropdown-link {
    color: #fff;
    margin-right: 10px;
    label {
      font-size: 12px;
    }
    i {
      vertical-align: middle;
      transition: transform 0.4s ease-out;
      &.active {
        transform: rotate(180deg);
      }
    }
  }
  ::v-deep .el-select {
    margin-right: 10px;
    .el-input__suffix {
      right: 0;
    }
    &.language-select {
      width: 70px;
    }
    .el-input__inner {
      background: #6e6f76;
      border: none;
      color: #fff;
      padding: 0;
      height: 26px;
      line-height: 26px;
      padding-left: 6px;
      padding-right: 16px;
    }
  }
  ::v-deep .el-select .el-input .el-input__inner,
  ::v-deep .el-select .el-input.is-focus .el-input__inner,
  ::v-deep .el-select .el-input__inner:focus {
    border-color: #35373f;
  }
  .code-wrap {
    overflow: auto;
    border-radius: 8px;
    .copy {
      width: 100%;
      background-color: #595b63;
      color: #e0e0e0;
      height: 36px;
      line-height: 36px;
      font-size: 12px;
      box-sizing: border-box;
      padding: 0 12px;
      button {
        background-color: transparent;
        cursor: pointer;
        color: #e0e0e0;
        &:hover {
          color: #ffffff;
        }
        &:active {
          color: #e0e0e0;
        }
        i {
          vertical-align: bottom;
          margin-right: 4px;
        }
      }
    }
    .icon-copy {
      z-index: 1;
      top: 16px;
      right: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 32px;
      height: 32px;
      color: #e6e6e6;
      border-radius: 6px;
      background-color: hsla(0, 0%, 90.2%, 0.2);
      opacity: 0.5;
      &:hover {
        opacity: 1;
      }
    }
    ::v-deep .hljs {
      padding: 15px;
    }
  }
  &.define-code-style-1 {
    .icon-copy {
      color: #000000;
      background-color: #e6e6e6;
    }
    ::v-deep .hljs {
      padding: 15px;
      background: #f8f8f8;
      color: #363636;
      font-weight: bold;
      & > span {
        font-weight: bold;
        color: #363636;
      }
    }
  }
  &.define-code-style-2 {
    .code-wrap {
      height: 100%;
      background: #35373f;
    }
    pre {
      height: 100%;
      overflow: auto;
      border-radius: 8px;
      ::v-deep code {
        &.hljs {
          font-size: 14px;
          line-height: 24px;
          background: #35373f;
          padding: 20px;
          color: #fff;
          white-space: pre;
          border-radius: 8px;
          &.wrap {
            word-break: break-all; // 只对英文起作用,以字母作为换行依据
            white-space: pre-wrap; // 只对中文起作用，强制换行
          }
          &-attr {
            color: #e9c188;
          }
          &-string {
            color: #53a4ee;
          }
          table {
            tr {
              background-color: transparent;
              border-top: none;
            }
            td {
              padding: 0;
              padding-right: 5px;
              border: none;
              &.hljs-ln-numbers {
                color: #6e6e7f;
                border-right: none;
                white-space: nowrap;
                text-align: right;
                vertical-align: top;
              }
            }
          }
        }
      }
    }
  }
}
</style>
