<template>
  <el-tooltip
    :content="$t('model_trial.view_code.title')"
    placement="top"
    popper-class="popper-class-text-tip"
  >
    <i
      class="iconfont icon-command common-icon lh1"
      data-sensors-click
      name="查看代码"
      @click="triggleViewCode"
    >
      <el-dialog
        :visible.sync="dialogVisible"
        class="custom-class-dialog-style tl view-code-dialog"
        :title="$t('model_trial.view_code.title')"
        :append-to-body="true"
      >
        <p class="copy-tip">{{ $t('model_trial.view_code.copy_tip') }}</p>
        <div class="dialog-box ft_grey3 fs14">
          <CodeView
            :code="viewCodeParams"
            :dialogVisible="dialogVisible"
            :modeIsShow="true"
            :showLineNumbers="true"
            copyBtn="never"
            :style-type="2"
            code-class="language-python"
          ></CodeView>
        </div>
        <i18n path="model_trial.view_code.tip_text" tag="p" class="tip-desc">
          <router-link to="/usercenter/proj-mgmt/apikeys" target="_blank">{{
            $t('model_trial.view_code.btn')
          }}</router-link>
        </i18n>
        <div slot="footer" class="flex flex-x-end flex-y-center">
          <el-button type="primary" size="small" class="ok-btn" @click="dialogVisible = false">{{
            $t('base.close')
          }}</el-button>
        </div>
      </el-dialog>
    </i>
  </el-tooltip>
</template>

<script>
import CodeView from '@/components/CodeView.vue'

export default {
  name: 'ViewCode',
  components: {
    CodeView
  },
  props: {
    getParams: {
      type: Function,
      default: () => () => {}
    }
  },
  data() {
    return {
      dialogVisible: false,
      viewCodeParams: {
        model: '',
        prompt: []
      }
    }
  },
  methods: {
    triggleViewCode() {
      if (typeof this.getParams === 'function') {
        const { agent_id, custom_variables, messages } = this.getParams()
        this.viewCodeParams = `# pip install zhipuai 请先在终端进行安装

from zhipuai import ZhipuAI

client = ZhipuAI(api_key="your-api-key")
response = client.agents.invoke(
  agent_id = "${agent_id || 'agent_id'}",
  messages = ${this.transformPythonCode(messages)},
  custom_variables = ${this.transformPythonCode(custom_variables)}
)
print(response)`
        this.dialogVisible = true
      }
    },
    transformPythonCode(data) {
      if (data === null || data === undefined) {
        return 'None'
      } else if (typeof data === 'number') {
        return data
      } else if (typeof data === 'string') {
        return `"${data}"`
      } else if (typeof data === 'boolean') {
        return data ? 'True' : 'False'
      } else if (Array.isArray(data)) {
        return '[' + data.map(item => this.transformPythonCode(item)).join(',\n') + ']'
      } else if (typeof data === 'object' && data !== null) {
        const newArr = []
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = this.transformPythonCode(data[key])
            if (value !== `""`) {
              newArr.push(`    "${key}" : ${value}`)
            }
          }
        }
        return '{\n' + newArr.join(',\n') + '\n  }'
      } else {
        return String(data) // 处理其他情况（如 Symbol，但 JS 中通常不会直接传递）
      }
    }
  }
}
</script>

<style lang="less" scoped>
.dialog-box {
  ::v-deep .code-wrap {
    height: 400px;
    pre {
      max-height: 364px;
    }
  }
}

.view-code-dialog {
  .copy-tip {
    margin-bottom: 16px;
    color: var(--mainTextColor);
    font-size: 14px;
    line-height: 22px;
  }
  .tip-desc {
    margin-top: 16px;
    color: var(--mainTextColor);
    font-size: 14px;
    line-height: 22px;
    a {
      color: #134cff;
    }
  }
}

@media screen and (max-width: 767px) {
  .view-code-dialog.custom-class-dialog-style div.el-dialog {
    width: 80%;
  }
}
</style>
