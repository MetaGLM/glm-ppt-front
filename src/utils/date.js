const DEFAULT_FORMAT = {
  h: '小时',
  m: '分钟',
  s: '秒'
}

export function transformDuration(time) {
  const duration = Number(time)
  if (isNaN(duration)) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0
    }
  }
  // 将毫秒转换为秒
  let seconds = Math.floor(duration / 1000)

  // 计算小时、分钟和秒
  const hours = Math.floor(seconds / 3600)
  seconds %= 3600
  const minutes = Math.floor(seconds / 60)
  seconds %= 60

  return {
    hours,
    minutes,
    seconds
  }
}

export function formatDuration(time, config) {
  // const duration = Number(time)
  // if (isNaN(duration)) {
  //   return ''
  // }
  // // 将毫秒转换为秒
  // let seconds = Math.floor(duration / 1000)

  // // 计算小时、分钟和秒
  // const hours = Math.floor(seconds / 3600)
  // seconds %= 3600
  // const minutes = Math.floor(seconds / 60)
  // seconds %= 60

  const { hours, minutes, seconds } = transformDuration(time)

  let formatConfig = { ...DEFAULT_FORMAT }
  if (config) {
    if (typeof config === 'string') {
      formatConfig = {
        h: config,
        m: config,
        s: config
      }
    } else {
      formatConfig = config
    }
  }

  let str = ''
  if (hours > 0) {
    if (formatConfig.h) {
      str += `${hours}${formatConfig.h}`
    } else {
      str += hours
    }
  }
  if (minutes > 0) {
    if (formatConfig.m) {
      str += `${minutes}${formatConfig.m}`
    } else {
      str += minutes
    }
  }

  if (seconds > 0) {
    if (formatConfig.s) {
      str += `${seconds}${formatConfig.s}`
    } else {
      str += seconds
    }
  }

  // 格式化输出
  return str
}

export function calculationEndTime() {
  // 记录开始时间的变量，初始化为null
  let startTime = null
  // 返回一个闭包函数，该函数可以启动和停止计时器
  return {
    start: function() {
      // 开始计时，记录当前时间
      startTime = Date.now()
    },
    end: function() {
      // 结束计时，计算并返回消耗的时间
      if (startTime === null) {
        return 0
      }
      const endTime = Date.now()
      const timeTaken = endTime - startTime
      startTime = null // 重置开始时间
      return timeTaken
    },
    reset: function() {
      startTime = null
    }
  }
}
