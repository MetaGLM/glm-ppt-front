<template>
  <el-image :src="imgSrc" class="chat-avatar flex-none" draggable="false">
    <div slot="error" v-if="errorSrc" class="image-slot">
      <img :src="errorSrc" alt="ZHIPU·AI" />
    </div>
  </el-image>
</template>
<script>
import { ROLE_TYPE } from '@/enums/modules/trialCenter'

export default {
  name: 'ChatAvatar',
  props: {
    type: {
      type: String,
      default: ''
    },
    src: {
      type: String,
      default: ''
    },
    errorSrc: {
      type: [String, Object],
      default: ''
    }
  },
  computed: {
    imgSrc() {
      if (this.type === ROLE_TYPE.ASSISTANT) {
        return this.src || 'https://cdn.bigmodel.cn/static/platform/images/trialcenter/robot.png'
      }
      // 默认用户头像
      return this.src || 'https://cdn.bigmodel.cn/static/platform/images/svgs/user.svg'
    }
  }
}
</script>

<style lang="less" scoped>
.chat-avatar {
  width: 24px;
  height: 24px;
}
</style>
