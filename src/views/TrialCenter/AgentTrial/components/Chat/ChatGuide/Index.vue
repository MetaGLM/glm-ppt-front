<template>
  <div class="chat-guide">
    <div class="user-name">{{ $t('agent_trial.welcome_experience') }}</div>
    <div class="flex chat-guide-content">
      <div class="flex1 w0">
        <div v-if="guide && guide.desc" class="guide-text" v-html="guide.desc"></div>
        <template v-if="guide && guide.exampleList && guide.exampleList.length > 0">
          <div class="example-title">{{ guide.example_title }}</div>
          <ul
            class="flex example-list"
            :class="{ ['num-' + guide.exampleList.length]: true, 'narrow-img': guide.isNarrowImg }"
          >
            <li
              v-for="(item, index) in guide.exampleList"
              :key="index"
              class="example-list-item flex1"
              @click="chooseExample(item)"
            >
              <div class="flex flex-y-center flex-none example-list-item-title">
                <img
                  v-if="item.iconName"
                  :src="require(`@/assets/images/agent/${item.iconName}`)"
                  alt="智谱AI"
                />
                <template v-else>
                  <img
                    v-if="index % 2 === 0 && !(item.images && item.images.length > 0)"
                    src="@/assets/images/agent/example_left.png"
                    alt="智谱AI"
                  />
                  <img
                    v-if="index % 2 === 1 && !(item.images && item.images.length > 0)"
                    src="@/assets/images/agent/example_right.png"
                    alt="智谱AI"
                  /> </template
                >{{ item.title }}
              </div>
              <div
                v-if="item.images && item.images.length > 0"
                class="flex example-list-item-imgs"
                :class="{ ['num-' + item.images.length]: true }"
              >
                <el-image
                  v-for="item in item.images"
                  :key="item.url"
                  :src="item.url"
                  :preview-src-list="[item.url]"
                  alt="ZHIPU·AI"
                >
                </el-image>
              </div>
              <AutoTooltip
                v-if="item.text"
                class="flex-none example-list-item-text"
                :class="{
                  'dot-2': guide.isNarrowImg,
                  'dot-4': !guide.isNarrowImg
                }"
                :disabled="true"
                :isAuto="false"
                :line="guide.exampleList && guide.exampleList.length === 3 ? 2 : 4"
                :content="item.text"
              />
              <AutoTooltip
                class="flex-none example-list-item-text dot-4"
                v-if="item.resultText"
                :disabled="true"
                :isAuto="false"
                :line="4"
                :content="item.resultText"
              />
            </li>
          </ul>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import AutoTooltip from '@/components/AutoTooltip.vue'

export default {
  name: 'ChatGuide',
  components: {
    AutoTooltip
  },
  props: {
    guide: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {}
  },
  methods: {
    // 选择场景示例
    chooseExample(item) {
      this.$emit('chooseExample', item)
    }
  }
}
</script>

<style lang="less" scoped>
.chat-guide {
  border-top: 1px solid #d9d9d9;
  .user-name {
    display: inline-flex;
    margin: 28px 0 24px;
    font-size: 40px;
    font-weight: 500;
    line-height: 60px;
    color: transparent;
    background-image: linear-gradient(89deg, #134cff 10.86%, #b16fef 99.86%);
    background-clip: text;
  }
  &.center {
    display: flex;
    justify-content: center;
    align-items: center;
    max-height: 100%;
    height: 100%;
  }
  &-content {
    gap: 12px;
  }
  .guide-text {
    color: #737a87;
    font-size: 14px;
    font-weight: 500;
    line-height: 24px;
    span {
      font-weight: 600;
    }
  }
  .example-title {
    margin-top: 24px;
    color: #131212;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }
  .example-list {
    gap: 20px;
    margin-top: 15px;
    &-item {
      box-sizing: border-box;
      max-width: 260px;
      padding: 14px;
      border-radius: 12px;
      border: 1px solid #e0e2ed;
      background: rgba(217, 217, 217, 0);
      cursor: pointer;
      &:hover {
        border-color: #134cff;
      }
      &-title {
        margin-bottom: 12px;
        color: #131212;
        font-size: 18px;
        font-weight: 500;
        line-height: 26px;
        img {
          flex: none;
          width: 30px;
          height: 30px;
          margin-right: 10px;
        }
      }
      &-text {
        color: #737a87;
        font-size: 14px;
        line-height: 22px;
      }
      &-imgs {
        flex-wrap: wrap;
        align-items: stretch;
        gap: 4px;
        margin-bottom: 10px;
        &.num-1 {
          ::v-deep .el-image {
            width: 100%;
            max-height: 116px;
            border-radius: 10px;
            background: #d9d9d9;
            img {
              object-position: top;
              object-fit: cover;
            }
          }
        }
        &.num-2 {
          .el-image {
            overflow: hidden;
            flex: 1;
            max-width: 50%;
            border-radius: 10px;
            background: #d9d9d9;
          }
        }
        &.num-4 {
          .el-image {
            overflow: hidden;
            flex: 1;
            max-width: 50%;
            background: #d9d9d9;
          }
        }
      }
    }
    &.narrow-img {
      .example-list-item {
        display: flex;
        flex-direction: column;
        max-width: 170px;
        min-height: 290px;
        .example-list-item-imgs {
          flex: 1;
          .el-image {
            height: 100%;
            max-height: 100%;
          }
        }
      }
    }
  }
}
</style>
