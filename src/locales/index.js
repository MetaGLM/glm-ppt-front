// i18n官网：https://kazupon.github.io/vue-i18n/introduction.html
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { getDefaultLang } from '@/utils/tools'
import ElementLocale from 'element-ui/lib/locale'
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import zh from './zh'
import en from './en'

Vue.use(VueI18n)

ElementLocale.i18n((key, value) => i18n.t(key, value)) // 为了实现element插件的多语言切换

const messages = {
  zh: {
    ...zh,
    ...zhLocale
  },
  en: {
    ...en,
    ...enLocale
  }
}

const i18n = new VueI18n({
  locale: getDefaultLang(), // 不采用store.state.Locale.lang是为了避免store循环依赖问题
  messages,
  fallbackLocale: 'zh', // 若某个语言环境变量，则使用fallbackLocale环境下对应的语言
  silentFallbackWarn: true, // 抑制警告
  globalInjection: true, // 全局注入
  silentTranslationWarn: true // 解决vue-i18n黄色警告"value of key 'xxx' is not a string"和"cannot translate the value of keypath 'xxx'.use the value of keypath as default",可忽略
})
export default i18n
