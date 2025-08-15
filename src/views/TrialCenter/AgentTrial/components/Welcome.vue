<template>
  <div class="flex1 flex flex-col-center model-trial-welcome">
    <h2 class="tc model-trial-welcome-title">{{ $t('model_trial.title') }}</h2>
    <p class="tc model-trial-welcome-desc">
      {{ $t('model_trial.introduction') }}
    </p>
    <div class="flex welcome-content">
      <div
        v-for="(item, index) in list"
        :key="index"
        class="flex1 flex model-card-item"
        :class="{
          active: !!valueMap[item.modelCode]
        }"
        @click.stop="handleClick(item)"
      >
        <div class="flex-none flex flex-between">
          <ModelIcon class="flex-none" :width="60" :height="60" />
          <div
            class="flex1 w0 model-card-item-content"
            :class="{
              'base-radio-group': max < 2
            }"
          >
            <div class="flex flex-between model-card-item-title">
              <AutoTooltip :content="item.label" />
              <div class="lh1 flex-none flex flex-center" @click.stop>
                <el-checkbox
                  v-if="max > 1"
                  :value="!!valueMap[item.modelCode]"
                  @change="handleClick(item)"
                />
                <el-radio
                  v-else
                  :value="!!valueMap[item.modelCode]"
                  :label="true"
                  @input="handleClick(item)"
                />
              </div>
            </div>
            <div class="flex flex-y-center tag-list flex-none">
              <span v-for="tag in item.tags" :key="tag" class="tag-item">{{ tag }}</span>
            </div>
          </div>
        </div>
        <p class="flex1 model-card-item-desc">{{ item.desc }}</p>
        <div class="flex flex-between flex-none">
          {{ $t('model_trial.welcome.source') }}
          <IconButton
            :tooltip="
              !!valueMap[item.modelCode]
                ? $t('model_trial.model_setting.parameter_config')
                : $t('model_trial.model_setting.parameter_config_tip')
            "
            iconClass="icon-setting"
            sensorsName="参数配置"
            size="mideum"
            :active="item.modelCode === settingModelCode"
            :disabled="!valueMap[item.modelCode]"
            :stopPropagation="true"
            @click="openSetting(item.modelCode)"
          />
        </div>
      </div>
    </div>
    <el-button
      type="default"
      size="small"
      class="flex flex-y-center more-model-btn arrow-right-icon-tertiary"
      data-sensors-click
      name="更多模型"
      @click="$emit('moreModel')"
    >
      {{ $t('model_trial.more_model') }}
    </el-button>
  </div>
</template>

<script>
import AutoTooltip from '@/components/AutoTooltip.vue'
import ModelIcon from '@/components/ModelIcon.vue'
import IconButton from '@/components/Chat/IconButton.vue'

export default {
  name: 'Welcome',
  components: {
    ModelIcon,
    AutoTooltip,
    IconButton
  },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    max: {
      type: Number,
      default: 3
    },
    settingModelCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      innerValue: [],
      valueMap: {}
    }
  },
  methods: {
    handleClick(list) {
      const values =
        Array.isArray(this.innerValue) && this.innerValue?.length > 0
          ? [].concat(this.innerValue)
          : []

      let selectedList = list
      if (!Array.isArray(list)) {
        selectedList = [list]
      }

      selectedList.forEach(item => {
        const index = values.findIndex(val => val?.data?.modelCode === item.modelCode)
        if (index > -1) {
          this.valueMap = {
            ...this.valueMap,
            [item.modelCode]: false
          }
          values.splice(index, 1)
        } else {
          if (this.max <= 1) {
            values.length = 0
            this.valueMap = {}
          }
          values.push({ data: item.data })
          this.valueMap = {
            ...this.valueMap,
            [item.modelCode]: true
          }
        }
      })
      this.innerValue = values
      this.$emit('update:value', values)
      this.$emit('change', values)
    },
    openSetting(item) {
      this.$emit('openSetting', item)
    }
  }
}
</script>
<style lang="less" scoped>
.model-trial-welcome {
  padding: 28px 24px;
  color: #8d8e99;
  font-size: 14px;
  line-height: 22px;
  &-title {
    color: var(--mainTextColor);
    font-size: 28px;
    font-weight: 500;
    line-height: 32px;
  }
  &-desc {
    margin: 16px 0 36px;
  }
  .welcome-content {
    margin-bottom: 24px;
    gap: 16px;
  }
  .model-card-item {
    flex-direction: column;
    padding: 19px;
    border-radius: 10px;
    border: 1px solid rgba(224, 224, 224, 0.6);
    background: #fff;
    cursor: pointer;
    &.active {
      border-color: #134cff;
    }
    &:hover {
      filter: drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.08));
    }
    &-content {
      margin-left: 16px;
      ::v-deep .el-checkbox {
        font-size: 0;
        .el-checkbox__inner {
          width: 16px;
          height: 16px;
          &:after {
            border-width: 2px;
          }
        }
      }
      ::v-deep .el-radio {
        font-size: 0;
        .el-radio__label {
          display: none;
        }
        .el-radio__inner {
          width: 16px;
          height: 16px;
          &:after {
            width: 6px;
            height: 6px;
          }
        }
      }
    }
    &-title {
      color: var(--mainTextColor);
      font-size: 18px;
      font-style: normal;
      font-weight: 500;
      line-height: 28px;
    }
    .tag-list {
      gap: 6px;
      margin-top: 8px;
      .tag-item {
        padding: 2px 8px;
        color: #5e5e66;
        font-size: 12px;
        line-height: 20px;
        border-radius: 6px;
        background: #f7f8fa;
      }
    }
    &-desc {
      margin: 16px 0;
    }
  }

  .more-model-btn {
    padding-right: 10px;
    &:after {
      margin: 0 6px 0 4px;
    }
    &:hover {
      &:after {
        margin-left: 10px;
        margin-right: 0;
      }
    }
  }
}
@media screen and (max-width: 768px) {
  .model-trial-welcome {
    .welcome-content {
      flex-direction: column;
      .model-card-item {
        &.active {
          background: rgba(19, 76, 255, 0.08);
          .tag-list {
            .tag-item {
              background: #cedcf5;
            }
          }
        }
        img {
          width: 32px;
          height: 32px;
        }
        &-content {
          display: flex;
          margin-left: 8px;
        }
        &-title {
          min-width: 0;
          margin-right: 4px;
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
        }
        &-desc {
          margin-top: 4px;
          font-size: 12px;
          line-height: 18px;
        }
        .tag-list {
          margin-top: 0;
        }
      }
    }
  }
}
</style>
