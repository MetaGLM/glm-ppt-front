import { Message } from 'element-ui'

function useSSETimeoutHandler(timeoutCb, timeout = 30000) {
  let timeoutId
  function clearTimer() {
    timeoutId && clearTimeout(timeoutId)
  }
  function resetTimeout() {
    clearTimer()
    timeoutId = setTimeout(() => {
      Message({
        type: 'warning',
        message: '服务响应超时'
      })
      timeoutCb()
    }, timeout)
  }

  return {
    clearTimer,
    resetTimeout
  }
}
export default useSSETimeoutHandler
