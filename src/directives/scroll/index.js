export default {
  bind(el, binding) {
    // 绑定事件监听器
    el.addEventListener('scroll', binding.value)
  },
  unbind(el, binding) {
    // 移除事件监听器
    el.removeEventListener('scroll', binding.value)
  }
}
