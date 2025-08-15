import i18n from '@/locales'
import { isArray, isObject, isString } from 'lodash-es'
import {
  TOOLS_TYPE // 工具类型
} from '@/enums/modules/trialCenter'

// 服务端冗余字段剔除
const DELETE_KEYS = [
  'precision',
  'description',
  'delFlag',
  'updateBy',
  'checked',
  'id',
  'formatLimit',
  'fillInState',
  'updateTime',
  'thresholdMax',
  'updateById',
  'createBy',
  'thresholdMin',
  'createTime',
  'createById',
  'enableStatus'
]

// 模型参数集合相关处理
export function handleParamValues(value, { hasDeleteKey = true } = {}) {
  let result = []
  let list = []
  const valueData = {}
  if (value) {
    try {
      if (isString(value)) {
        list = JSON.parse(value)
      } else {
        list = value
      }
      if (!isArray(list)) {
        console.log('%c --handleParamValues-参数 不合法')
        return { result, valueData }
      }
      // 分隔符前置
      const index = list.findIndex(
        e =>
          (e.layout === 'right' || e.layout === 'top') &&
          e.type === 'input' &&
          e.subType === 'multiItem'
      )
      const temp = list[index]
      if (temp) {
        list.splice(index, 1)
        list.unshift(temp)
      }
    } catch (e) {
      console.log('%c --handleParamValues-解析currentParamValues出错--', 'color: red', e)
    }
  }

  if (list?.length > 0) {
    result = list.map(item => {
      if (hasDeleteKey) {
        DELETE_KEYS.forEach(key => {
          if (Object.prototype.hasOwnProperty.call(item, key)) {
            delete item[key]
          }
        })
      }
      // 目前支持的一种形式，后续有其他形式再补充
      const { layout, paramCode, def, must, ...rest } = item
      if (layout === 'right' || layout === 'top') {
        valueData[paramCode] = def
      }
      return {
        layout,
        paramCode, // 参数编码
        required: !!must, // 必填
        def, // 默认值
        ...rest
      }
    })
  }
  return { result, valueData }
}

// 检验是否为非空数据
export function validateNotEmpty(value) {
  if (isArray(value)) {
    return value.length > 0
  } else if (isObject(value)) {
    return JSON.stringify(value) !== '{}'
  } else if (isString(value)) {
    return !!value
  }
  return true
}

export function validateModelParamValue(e, value) {
  const rules = e.rules
  for (let j = 0; j < rules.length; j++) {
    if (validateNotEmpty(value)) {
      const rule = rules[j]
      const errorMsg = `${e.paramName}  ${rule.msg}`
      if (rule.ruleType === 'regular') {
        const regx = new RegExp(rule.value, 's')
        if (!regx.test(value)) {
          return {
            isValid: false,
            error: errorMsg
          }
        }
      } else if (rule.ruleType === 'arrLength') {
        if (value.length < e.min || value.length > e.max) {
          return {
            isValid: false,
            error: errorMsg
          }
        }
      } else if (rule.ruleType === 'range') {
        if (e.min > value || value > e.max) {
          return {
            isValid: false,
            error: errorMsg
          }
        }
      }
    } else {
      if (e.required || e.must) {
        return {
          isValid: false,
          error: i18n.t('common.not_empty', [e.paramName])
        }
      }
    }
  }
  return {
    isValid: true,
    error: ''
  }
}

export function converToAIWrap(val) {
  if (isArray(val)) {
    const reg = new RegExp('↵', 'g')
    return val.map(e => {
      if (typeof e === 'string') {
        return e.replace(reg, '<n>')
      }
      return e
    })
  }

  return val
}

// 用于转换模型工具数据
export function converToolsData(toolsData) {
  if (!toolsData) {
    return null
  }

  // 处理工具数据
  // MCP 走 function 逻辑，需特殊处理
  if (toolsData.type === TOOLS_TYPE.MCP) {
    const mcp = toolsData.mcp

    const newTools = []
    mcp.forEach(item => {
      if (item?.tools?.length > 0) {
        item.tools.forEach(tool => {
          newTools.push({
            type: TOOLS_TYPE.FUNCTION_CALL,
            name: item.name,
            mcpCode: item.mcpCode,
            transportType: item.transportType,
            [TOOLS_TYPE.FUNCTION_CALL]: {
              name: tool.name,
              description: tool.description,
              parameters: tool.inputSchema
            }
          })
        })
      }
    })
    return newTools
  }

  return [toolsData]
}
