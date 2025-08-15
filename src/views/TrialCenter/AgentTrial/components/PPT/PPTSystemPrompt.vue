<template>
  <div class="ppt-system-prompt">
    <IconButton
      tooltip="System Prompt"
      iconClass="el-icon-document"
      class="system-prompt-btn-icon"
      @click="systemPromptVisible = true"
    />
    <el-dialog title="System Prompt" width="40%" :visible.sync="systemPromptVisible">
      <el-input
        type="textarea"
        :autosize="{ minRows: 4, maxRows: 20 }"
        placeholder="请输入内容"
        v-model="systemPromptText"
      >
      </el-input>

      <span slot="footer" class="dialog-footer">
        <el-button @click="systemPromptVisible = false">取 消</el-button>
        <el-button
type="primary"
:disabled="!systemPromptText"
@click="setSystemPromptFn"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapActions } from 'vuex'
import IconButton from '@/components/Chat/IconButton.vue'
export default {
  name: 'PPTSystemPrompt',
  data() {
    return {
      systemPromptVisible: false,
      systemPromptText: ''
    }
  },
  components: {
    IconButton
  },
  methods: {
    ...mapActions('AgentTrial', ['setPptSystemPrompt']),
    // 点击确定后二次确认
    setSystemPromptFn() {
      this.$confirm('此操作将开启新会话, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'confirm-msg-box confirm-msg-box__style1'
      })
        .then(() => {
          // 二次确认后关闭弹窗，开启新对话，并将系统设置内容保存到pptSystemPrompt
          this.systemPromptVisible = false
          this.$emit('startNewChat')
          this.setPptSystemPrompt(this.systemPromptText)
        })
        .catch(() => {})
    }
  }
}
</script>
<style lang="less" scoped>
.ppt-system-prompt {
  .system-prompt-btn-icon {
    width: 30px;
    height: 30px;
    font-size: 20px;
    color: #5e5e66;
    border-radius: 6px;
    border: 1px solid rgba(224, 224, 224, 0.6);
  }
}
</style>
