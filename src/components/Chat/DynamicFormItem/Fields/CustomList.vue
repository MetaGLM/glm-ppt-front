<template>
  <div class="custom-list-box">
    <i
      class="add-item-btn el-icon-circle-plus-outline"
      :class="{
        disabled: innerValue.length >= this.limit
      }"
      @click="addItemFn"
    ></i>
    <div v-for="(item, index) in innerValue" :key="index" class="custom-list-item">
      <div class="custom-list-item-title">
        <span>{{ $t('cb_base.customList.title') }}{{ index + 1 }}</span>
        <i
          class="remove-item-btn el-icon-circle-close"
          v-if="innerValue.length > 1"
          @click="removeItemFn(index)"
        ></i>
      </div>
      <el-input
        v-model="item.name"
        :disabled="disabled"
        :maxlength="20"
        :show-word-limit="true"
        :clearable="true"
        class="custom-input-item"
        :placeholder="placeholder[0] || $t('common.please_input')"
        @change="handleChange"
      />
      <el-input
        type="textarea"
        v-model="item.rule"
        :disabled="disabled"
        :maxlength="50"
        :show-word-limit="true"
        :clearable="true"
        :placeholder="placeholder[1] || $t('common.please_input')"
        :autosize="{ minRows: 1, maxRows: 6 }"
        class="custom-input-item"
        @change="handleChange"
      />
    </div>
  </div>
</template>

<script>
import baseMixin from './baseMixin'

export default {
  name: 'CustomList',
  mixins: [baseMixin],
  props: {
    value: {
      type: String,
      default: ''
    },
    // 是否禁用表单
    disabled: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 20
    },
    format: {
      type: String,
      default: 'json'
    },
    placeholder: {
      type: [String, Array],
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      oldValue: '',
      innerValue: []
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val === this.oldValue) {
          if (this.format === 'json') {
            if (!val) {
              this.innerValue = [
                {
                  name: '',
                  rule: ''
                }
              ]
            }
          }
          return
        }
        if (this.format === 'json') {
          try {
            const result = JSON.parse(val)
            if (result?.length < 1) {
              this.innerValue = [
                {
                  name: '',
                  rule: ''
                }
              ]
            }
          } catch (error) {
            this.innerValue = [
              {
                name: '',
                rule: ''
              }
            ]
          }
        } else {
          if (val !== this.innerValue) {
            this.innerValue = val
          }
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    handleChange() {
      if (this.innerValue?.length > 0) {
        const results = []
        this.innerValue.forEach(item => {
          if (item.name && item.rule) {
            results.push({ [item.name]: item.rule })
          }
        })
        this.handleValueChange(results)
      } else {
        this.handleValueChange([])
      }
    },
    addItemFn() {
      if (this.innerValue.length >= this.limit) {
        return
      }
      this.innerValue.push({
        name: '',
        rule: ''
      })
    },
    // 删除指定字段项，至少保留一个
    removeItemFn(index) {
      if (this.innerValue.length > 1) {
        this.innerValue.splice(index, 1)
      }
      this.handleValueChange(this.innerValue)
    },
    handleValueChange(val) {
      let newValue = val
      if (this.format === 'json') {
        newValue = JSON.stringify(val)
      }
      this.oldValue = newValue
      this.update(newValue)
    }
  }
}
</script>

<style lang="less" scoped>
.custom-list-box {
  .add-item-btn {
    position: absolute;
    right: 0;
    top: -29px;
    font-size: 20px;
    color: #134cff;
    cursor: pointer;
    &.disabled {
      color: #8d8e99;
      cursor: not-allowed;
    }
  }
  .remove-item-btn {
    margin-left: 4px;
    font-size: 14px;
    color: #8d8e99;
    cursor: pointer;
  }
  .custom-list-item {
    margin-bottom: 16px;
    position: relative;
    ::v-deep textarea {
      font-family: Arial, Helvetica, sans-serif;
    }
    .custom-list-item-title {
      margin-bottom: 8px;
    }
    .custom-input-item {
      margin-top: 4px;
    }
  }
}
</style>
