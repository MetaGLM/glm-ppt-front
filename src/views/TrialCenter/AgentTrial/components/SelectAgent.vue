<template>
  <el-dialog
    class="custom-class-dialog-style tl has-footer trial-model-select-dialog"
    :title="$t('agent_trial.select_agent')"
    :append-to-body="true"
    :fullscreen="fullscreen"
    :visible.sync="visible"
    @closed="handleClose"
  >
    <div v-if="!fullscreen" class="flex flex-between">
      <div class="flex-none total-model-num">
        {{ $t('agent_trial.agent_count', [sortDataSource.total]) }}
      </div>
      <el-input
        :placeholder="$t('base.search')"
        v-model.trim="searchText"
        size="small"
        class="search-input"
        :class="{
          'has-value': searchText && searchText.length > 0
        }"
        prefix-icon="iconfont icon-wdsearch"
      >
        <i
          slot="suffix"
          class="el-icon-error cursor-pointer clear-input-btn lh32"
          @click="clearSearchText"
        ></i>
      </el-input>
    </div>
    <el-tabs
      v-if="sortDataSource.list && sortDataSource.list.length > 0"
      class="custom-tabs-style-class select-model-tabs"
      v-model="activeType"
    >
      <template v-for="typeItem in sortDataSource.list">
        <template>
          <el-tab-pane
            v-if="typeItem.children.length > 0"
            :key="typeItem.value"
            :name="typeItem.value"
            :lazy="true"
          >
            <div slot="label" class="tab-label">
              {{ typeItem.label }}<span class="model-num">{{ typeItem.children.length }}</span>
            </div>
            <template v-if="typeItem.children.length > 0">
              <div v-if="!fullscreen" class="row-common row-header">
                <div>{{ $t('cb_base.agent_trial') }}</div>
                <div class="placeholer"></div>
                <div class="flex flex-y-center cursor-pointer">
                  {{ $t('agent_trial.introduce') }}
                </div>
              </div>
              <el-radio-group class="scroll-display-none" v-model="innerValue" :disabled="disabled">
                <el-radio
                  v-for="item in typeItem.children"
                  :key="item.agentId"
                  class="row-common row-item"
                  :label="item.agentId"
                >
                  <ListItem labelField="agentName" :item="item" :onlyDisplay="true">
                    <ModelIcon slot="logo" :url="item.head_picture" :width="32" :height="32" />
                  </ListItem>
                  <AutoTooltip :content="item.desc" />
                </el-radio>
              </el-radio-group>
            </template>
            <template v-else>
              <EmptyData class="empty-data-wrap">
                <img
                  slot="icon"
                  src="https://cdn.bigmodel.cn/static/platform/images/trialcenter/model_empty.svg"
                  alt="智谱AI"
                />
                <template slot="content">
                  <p>{{ $t('agent_trial.no_agent') }}</p>
                </template>
              </EmptyData>
            </template>
          </el-tab-pane>
        </template>
      </template>
    </el-tabs>
    <EmptyData v-else class="empty-data-wrap">
      <img
        slot="icon"
        src="https://cdn.bigmodel.cn/static/platform/images/trialcenter/model_empty.svg"
        alt="智谱AI"
      />
      <template slot="content">
        <p>{{ $t('agent_trial.no_agent') }}</p>
      </template>
    </EmptyData>
    <div slot="footer" class="flex flex-x-end footer-content">
      <template v-if="!fullscreen">
        <el-button class="flex-none" size="small" :disabled="isLoading" @click="visible = false">{{
          $t('cb_base.cancel')
        }}</el-button>
      </template>
      <el-button
        class="flex-none save-btn"
        size="small"
        :disabled="okDisabled"
        :loading="isLoading"
        type="primary"
        @click="confirmSelected"
        >{{ $t('cb_base.confirm') }}</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import AutoTooltip from '@/components/AutoTooltip.vue'
import EmptyData from '@/components/EmptyData.vue'
import ListItem from '@/components/List/ListItem.vue'
import ModelIcon from '@/components/ModelIcon.vue'

export default {
  name: 'SelectAgent',
  components: {
    AutoTooltip,
    EmptyData,
    ListItem,
    ModelIcon
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    dataSource: {
      type: Array,
      default: () => []
    },
    // 可被勾选最大数量
    max: {
      type: Number,
      default: 1
    },
    addedModel: {
      type: Function,
      default: () => {}
    },
    fullscreen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false,
      activeType: '',
      innerValue: [],
      multiple: true,
      isLoading: false,
      searchText: ''
    }
  },
  computed: {
    orginTotal() {
      let total = 0
      this.dataSource.forEach(item => {
        total += item.children?.length || 0
      })
      return total
    },
    filterDataSource() {
      const searchText = this.searchText.trim()
      if (searchText?.length > 0) {
        const searchRegex = new RegExp(searchText, 'i')
        let total = 0
        const list = this.dataSource.reduce((arr, item) => {
          let children = []
          if (item.children?.length > 0) {
            children = item.children.filter(child => {
              return searchRegex.test(child.agentName)
            })
          }
          if (children.length > 0) {
            total += children.length
            arr.push({
              ...item,
              children
            })
          }
          return arr
        }, [])

        return {
          list,
          total
        }
      }
      return {
        list: this.dataSource || [],
        total: this.orginTotal
      }
    },
    sortDataSource() {
      if (this.dataSource?.length < 1) {
        return {
          list: [],
          total: 0
        }
      }

      let total = 0
      const list = []
      this.filterDataSource.list.forEach(item => {
        let children = []
        if (item.children?.length > 0) {
          total += item.children.length
          children = [].concat(item.children)
        }

        list.push({
          ...item,
          children
        })
      })
      return {
        list,
        total
      }
    },
    okDisabled() {
      if (this.isLoading) {
        return true
      }

      if (Array.isArray(this.innerValue) && this.innerValue.length > 0) {
        return false
      }
      if (this.innerValue) {
        return false
      }

      return true
    }
  },
  watch: {
    'sortDataSource.list': {
      handler(val) {
        if (val?.length > 0) {
          const isExisted = val.some(item => item.value === this.activeType)
          if (!isExisted) {
            this.activeType = val[0].value
          }
        }
      }
    }
  },
  methods: {
    showDialog() {
      this.visible = true
      this.innerValue = ''
      if (this.dataSource?.length > 0) {
        this.activeType = this.dataSource[0].value
      }
    },
    // 打开弹框
    open(val) {
      if (Array.isArray(val) && val.length > 0) {
        const { group, child } = this.findTargetModel(val[0])
        if (child && group) {
          this.activeType = group.value
        }

        this.innerValue = val[0]
        this.visible = true
      } else {
        this.showDialog()
      }
    },
    findTargetModel(value) {
      const length = this.dataSource.length
      if (length < 1) {
        return {
          child: null,
          group: null
        }
      }
      for (let index = 0; index < this.dataSource.length; index++) {
        const item = this.dataSource[index]
        if (item.children?.length > 0) {
          for (let i = 0; i < item.children.length; i++) {
            const child = item.children[i]
            if (child.agentId === value) {
              return {
                child,
                group: item
              }
            }
          }
        } else {
          if (item.value === value) {
            return {
              child: item,
              group: null
            }
          }
        }
      }
      return {
        child: null,
        group: null
      }
    },
    confirmSelected() {
      if (this.isLoading) {
        return
      }

      const { child } = this.findTargetModel(this.innerValue)

      if (typeof this.addedModel === 'function') {
        const promise = this.addedModel(child)
        if (typeof promise?.then === 'function') {
          this.isLoading = true
          promise
            .then(() => {
              this.visible = false
              this.innerValue = ''
              this.handleClose()
            })
            .finally(() => {
              this.isLoading = false
            })
        } else {
          this.visible = false
          this.addedModel(child)
          this.handleClose()
          this.innerValue = ''
        }
      } else {
        this.visible = false
        this.$emit('change', child)
        this.handleClose()
        this.innerValue = ''
      }
    },
    handleClose() {
      this.$emit('close')
      this.clearSearchText()
    },
    clearSearchText() {
      this.searchText = ''
    }
  }
}
</script>

<style lang="less" scoped>
.trial-model-select-dialog {
  ::v-deep .el-dialog {
    max-width: 800px;
    width: 80vw;

    &.is-fullscreen {
      width: 100vw;
      max-width: 100%;
      border-radius: 0;
      border: none;
      background: #fff;
      .el-dialog__header {
        text-align: left;
        .el-dialog__title {
          display: block;
          line-height: 24px;
        }
      }
      .select-model-tabs {
        .el-tabs__nav-scroll {
          overflow: auto;
          //隐藏代码滚动条
          -ms-overflow-style: none; /* IE 10+ */
          scrollbar-width: none; /* Firefox */
          &::-webkit-scrollbar {
            display: none; /* Chrome Safari */
          }
        }
      }
      .el-dialog__footer {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 2;
        width: 100%;
        padding-bottom: calc(8px + constant(safe-area-inset-bottom));
        padding-bottom: calc(8px + env(safe-area-inset-bottom));
      }
      .footer-content {
        .save-btn {
          flex: 1;
        }
      }
      .el-radio-group,
      .el-checkbox-group {
        height: calc(100vh - 196px);
        .el-radio__input {
          display: none;
        }
      }
      .row-item {
        border: 1px solid rgba(224, 224, 224, 0.6);
        transition: all 0.2s;
        &.is-checked {
          border-color: #134cff;
          background: rgba(19, 76, 255, 0.08);
        }
        & + .row-item {
          margin-top: 12px;
        }
        .el-radio__label,
        .el-checkbox__label {
          grid-template-columns: minmax(240px, 1fr);
          gap: 16px;
        }
      }
    }
    .el-dialog__body {
      padding-top: 2px;
      & > .empty-data-wrap {
        height: 491px;
        margin-top: 20px;
      }
    }

    .select-model-tabs {
      margin-top: 12px;
      .el-tabs__header {
        margin-bottom: 20px;
        .el-tabs__item {
          .tab-label {
            color: var(--mainTextColor);
          }
          &.is-active {
            .tab-label {
              color: #134cff;
              font-weight: 500;
            }
            .model-num {
              color: #134cff;
              font-weight: 400;
            }
          }
        }
      }
      .model-num {
        margin-left: 4px;
        color: #8d8e99;
      }
    }
    .search-input {
      max-width: 240px;
      .clear-input-btn {
        line-height: 32px;
      }
      .el-input__prefix {
        left: 12px;
        color: #5e5e66;
        font-size: 16px;
      }
      .el-input__suffix {
        right: 12px;
        color: #8d8e99;
        font-size: 16px;
        visibility: hidden;
        opacity: 0;
        transition: all 0.2s;
      }
      .el-input__inner {
        padding-left: 36px;
        padding-right: 12px;
        transition: all 0.2s;
      }
      &.has-value {
        .el-input__suffix {
          visibility: visible;
          opacity: 1;
        }
      }
      &:hover {
        .el-input__inner {
          padding-right: 36px;
          border-color: var(--primaryColor);
        }
      }
    }
    .total-model-num {
      color: #5e5e66;
      font-size: 12px;
      line-height: 22px;
    }
  }
  .footer-content {
    flex-direction: row;
    .el-button + .el-button {
      margin-left: 8px;
    }
  }
}

.row-common {
  overflow: hidden;
  box-sizing: border-box;
  padding: 12px 12px 12px 15px;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  border-bottom: 1px solid rgba(224, 224, 224, 0.2);
  &.is-checked {
    background: rgba(19, 18, 18, 0.05);
  }
}
.row-header {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) 40px minmax(120px, 2fr);
  padding-top: 0;
  color: #8d8e99;
  .placeholer {
    width: 16px;
    margin-left: 8px;
    margin-right: 16px;
  }
  .caret-wrapper {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    height: 12px;
    width: 12px;
    margin-left: 4px;
    &.desc {
      .descending {
        border-top-color: var(--primaryColor);
      }
    }
    &.asce {
      .ascending {
        border-bottom-color: var(--primaryColor);
      }
    }
  }
}

::v-deep .el-radio-group,
::v-deep .el-checkbox-group {
  overflow: auto;
  width: 100%;
  height: 399px;
  .row-item {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin: 0;
    color: var(--mainTextColor);
    border-radius: 8px;
    &.is-checked {
      margin-bottom: 1px;
      border-bottom-width: 0;
    }
    &:hover {
      background: rgba(19, 18, 18, 0.05);
      border-bottom-color: transparent;
      border-bottom-width: 0;
      margin-bottom: 1px;
    }
    .el-radio__label,
    .el-checkbox__label {
      flex: 1;
      display: grid;
      grid-template-columns: minmax(240px, 1fr) minmax(120px, 2fr);
      align-items: center;
      gap: 16px;
      padding-left: 8px;
      color: var(--mainTextColor);
    }

    .el-radio__input,
    .el-radio__inner {
      height: 16px;
      width: 16px;
      &:after {
        width: 6px;
        height: 6px;
      }
    }
    .el-checkbox__input,
    .el-checkbox__inner {
      height: 16px;
      width: 16px;
      border-radius: 3px;
      &:after {
        left: 5px;
        border-width: 2px;
      }
    }
  }
}

.empty-data-wrap {
  box-sizing: border-box;
  height: 434px;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  p {
    color: #8d8e99;
    margin-top: 12px;
    margin-bottom: 16px;
  }
  .el-button {
    padding: 5px 16px;
    font-weight: 400;
    line-height: 20px;
    border-radius: 6px;
  }
}
</style>
