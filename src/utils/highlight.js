/**
 * 自定义代码高亮插件
 */
import * as hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/vs2015.css'
import 'highlight.js/styles/a11y-dark.css'

hljs.configure({
  ignoreUnescapedHTML: true,
  throwUnescapedHTML: false
})

hljs.registerLanguage('python', require('highlight.js/lib/languages/python'))
hljs.registerLanguage('shell', require('highlight.js/lib/languages/shell'))
hljs.registerLanguage('java', require('highlight.js/lib/languages/java'))
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'))
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'))
hljs.registerLanguage('json', require('highlight.js/lib/languages/json'))

function injectHtml(el, binding) {
  const targets = el.querySelectorAll('code')
  targets.forEach(target => {
    if (typeof binding.value === 'string') {
      target.textContent = binding.value
    }
    hljs.highlightElement(target)
  })
}

const install = function(Vue) {
  Vue.directive('highlight', {
    deep: true,
    bind(el, binding) {
      injectHtml(el, binding)
    },
    componentUpdated(el, binding) {
      injectHtml(el, binding)
    }
  })
}

export default install
