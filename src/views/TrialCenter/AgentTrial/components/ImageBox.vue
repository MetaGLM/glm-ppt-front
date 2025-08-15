<template>
  <el-image
    ref="imgBox"
    fit="contain"
    :src="imgBoxUrl"
    :class="{ animation: isAnimation }"
    :preview-src-list="previewSrcList.length > 0 ? previewSrcList : [imgUrl]"
    alt="ZHIPU·AI"
    lazy
  >
    <div v-if="imgUrl" slot="error" class="image-slot">
      <img :src="errorImg" />
    </div>
  </el-image>
</template>

<script>
import errorImg from '@/assets/images/svg/img_load_fail.svg'
import { ANSWER_STATUS } from '@/enums/modules/trialCenter'

export default {
  name: 'ImageBox',
  props: {
    imgUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: ''
    },
    previewSrcList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      errorImg
    }
  },
  computed: {
    imgBoxUrl() {
      if (this.status === ANSWER_STATUS.STOP || this.status === ANSWER_STATUS.FAIL) {
        return this.errorImg
      } else {
        return this.imgUrl
      }
    },
    isAnimation() {
      return this.status === ANSWER_STATUS.WAITTING
    }
  }
}
</script>

<style scoped lang="less">
.el-image {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 9px;
  min-width: 100px;
  min-height: 100px;
  width: 100%;
  height: 100%;
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  text-align: center;
  background: #fff;
  ::v-deep .el-image__error {
    display: none;
  }
  ::v-deep .image-slot {
    width: 100%;
    img {
      width: 48%;
    }
  }
  &.animation {
    width: 200px;
    height: 200px;
    animation: imageLoading 1.7s infinite;
    background: linear-gradient(
      90deg,
      rgba(212, 219, 228, 0.3) 8%,
      rgba(213, 217, 223, 0.5) 18%,
      rgba(212, 219, 228, 0.3) 33%
    );
    background-size: 1000px 104px;
  }
}
@keyframes imageLoading {
  0% {
    background-position: -200px 0;
  }

  100% {
    background-position: 200px 0;
  }
}
</style>
