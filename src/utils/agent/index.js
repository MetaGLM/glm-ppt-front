// agent 文件临时存放，后期删除

const filesContext = require.context('./modules', false, /\.js$/)
const AGENT_LIST = filesContext
  .keys()
  .filter(key => key !== './index.js')
  .map(key => {
    return deepFreeze(filesContext(key).default)
  })

AGENT_LIST.sort((a, b) => a.order - b.order)
export { AGENT_LIST }

function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  // 冻结当前对象
  Object.freeze(obj)

  // 遍历所有属性
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = obj[prop]
    // 递归冻结嵌套对象
    if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
      deepFreeze(value)
    }
  })

  return obj
}
