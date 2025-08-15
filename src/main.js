import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router' // 路由
import store from '@/store' // store
import Highlight from '@/utils/highlight' // 代码高亮
import VueClipBoard from 'vue-clipboard2' // 文本粘贴插件
import elementConfig from '@/utils/elementUiConfig' // element-ui组件引入
import to from '@/utils/await-to-js' // 优化async-await
import axios from 'axios'
import directives from '@/directives' // 全局指令引入
import { installSvgIcon } from '@/icons'
import smoothscroll from 'smoothscroll-polyfill' // 处理window.scroll兼容性
import VueScreen from 'vue-screen'
import i18n from '@/locales'
import '@/constants'
import '@/enums'
import 'highlight.js/styles/vs2015.css'
import 'highlight.js/styles/a11y-dark.css'
import '@/assets/style/element-ui.css' // 自定义element-ui样式，按需引入组件需要放在按需组件引入下方方可生效
import '@/assets/style/index.less' // 初始化样式，全局样式
// eslint-disable-next-line import/no-absolute-path
import '/node_modules/flag-icons/css/flag-icons.min.css'

smoothscroll.polyfill()
// 全局引入axios
Vue.prototype.$axios = axios
// 优雅处理async await
Vue.prototype.awaitTo = to
// 按需引入element-ui 组件
elementConfig(Vue)
installSvgIcon(Vue)
// 文本粘贴
Vue.use(VueClipBoard)
// 代码高亮显示
Vue.use(Highlight)
// 监听屏幕分辨率
Vue.use(VueScreen, 'tailwind')
// 阻止启动生产消息
Vue.config.productionTip = false
// 全局指令
Vue.use(directives)
// 初始化Vue实例
new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
