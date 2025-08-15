import { InfiniteScroll } from 'element-ui'
import waves from './waves'
import scroll from './scroll'
import dragFile from './dragFile'

const directives = {
  waves,
  'infinite-scroll': InfiniteScroll,
  scroll,
  'drag-file': dragFile
}

export default {
  install(Vue) {
    Object.keys(directives).forEach(key => {
      Vue.directive(key, directives[key])
    })
  }
}
