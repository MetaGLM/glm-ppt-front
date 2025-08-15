import Vue from 'vue'

const GlobalConsts = {}

// 获取moudules文件下所有js文件；
const context = require.context('./modules', true, /\.js$/)
context.keys().forEach(key => {
  const { default: defaultExport, ...reset } = context(key)
  Object.assign(GlobalConsts, reset || {}, defaultExport || {})
})

// 集体导出 并注入到全局变量
Vue.prototype.$GlobalConsts = GlobalConsts

export default GlobalConsts
