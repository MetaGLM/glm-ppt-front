<template>
  <img :src="iconUrl" :width="width" :height="height" alt="智谱AI" />
</template>
<script>
import { MODEL_TYPE } from '@/constants/modules/model'

export default {
  name: 'ModelIcon',
  props: {
    modelType: {
      type: String,
      default: ''
    },
    width: {
      type: Number,
      default: 40
    },
    height: {
      type: Number,
      default: 40
    },
    url: {
      type: String,
      default: ''
    }
  },
  computed: {
    iconUrl() {
      if (this.url) {
        return this.url
      }
      // 微调
      if (this.modelType === MODEL_TYPE.FINE_TUNING) {
        return `https://cdn.bigmodel.cn/static/platform/images/modelcenter/finetuning-model-logo.svg`
      }
      // 私有
      if (this.modelType === MODEL_TYPE.PRIVATE) {
        return `https://cdn.bigmodel.cn/static/platform/images/modelcenter/instance-logo.svg`
      }
      return `https://cdn.bigmodel.cn/static/platform/images/modelcenter/base-model-logo.svg`
    }
  }
}
</script>
