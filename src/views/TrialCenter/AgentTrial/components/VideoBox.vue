<template>
  <div>
    <video class="video-box" controls v-if="isComplete">
      <source :src="innerUrl" :poster="coverImgUrl" type="video/mp4" />
      {{ $t('model_trial.extra.not_support') }}
    </video>
    <div class="loading-box" v-if="isWatting">
      <div class="loading-box-animation"></div>
    </div>
  </div>
</template>

<script>
import { ANSWER_STATUS } from '@/enums/modules/trialCenter'

export default {
  name: 'VideoBox',
  props: {
    coverImgUrl: {
      type: String,
      default: ''
    },
    videoUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
  },
  computed: {
    isWatting() {
      return this.status === ANSWER_STATUS.WAITTING
    },
    isComplete() {
      return this.status === ANSWER_STATUS.COMPLETE
    },
    innerUrl() {
      if (!this.videoUrl) return ''
      return this.videoUrl.replace('http://', 'https://')
    }
  }
}
</script>

<style scoped lang="less">
.video-box {
  width: 100%;
  max-width: 692px;
  max-height: 395px;
  border-radius: 8px;
}

.loading-box {
  &-animation {
    margin-top: 9px;
    margin-bottom: 9px;
    width: 100%;
    max-width: 692px;
    height: 395px;
    border-radius: 8px;
    animation: imageLoading 1.7s infinite;
    background: linear-gradient(
      90deg,
      rgba(212, 219, 228, 0.3) 10%,
      rgba(213, 217, 223, 0.5) 50%,
      rgba(212, 219, 228, 0.3) 100%
    );
    background-size: 1000px 104px;
  }
  &-text {
    margin-top: 24px;
    color: #b0b7c0;
  }
}

@keyframes imageLoading {
  0% {
    background-position: -300px 0;
  }
  100% {
    background-position: 300px 0;
  }
}
</style>
