import dayjs from 'dayjs'
import Fingerprint2 from 'fingerprintjs2'
import { LangKey } from '@/constants/modules/tokenKey'
/**
 * 格式化数字，自动加单位
 * @param {*} value 要转换的数据值
 * @param {*} decimal 保留小数位数
 * @returns 返回处理后的字符串
 */
export function formatNumAutoUnit(value, decimal = 2) {
  const num = parseInt(value)
  if (isNaN(num)) return value || ''
  if (getDefaultLang() === 'en') {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(decimal) + 'million'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'thousand'
    } else {
      return num + ''
    }
  } else {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(decimal) + '亿'
    } else if (num >= 10000) {
      return (num / 10000).toFixed(0) + '万'
    } else {
      return num + ''
    }
  }
}

/**
 * 获取客户端唯一指纹
 * @param {*} fn 参数
 */
export function fingerprint(fn) {
  Fingerprint2.get(components => {
    const values = components.map((component, index) => {
      if (index === 0) {
        return component.value.replace(/\bNetType\/\w+\b/, '')
      }
      return component.value
    })
    // 生成最终指纹id
    const deviceUniqueId = Fingerprint2.x64hash128(values.join(''), 31)
    fn(deviceUniqueId)
  })
}

/**
 * 参数转换
 * @param {*} params 参数
 * @returns 返回处理后的字符串
 */
export function tansParams(params) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    var part = encodeURIComponent(propName) + '='
    if (value !== null && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && typeof value[key] !== 'undefined') {
            const params = propName + '[' + key + ']'
            var subPart = encodeURIComponent(params) + '='
            result += subPart + encodeURIComponent(value[key]) + '&'
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&'
      }
    }
  }
  return result
}

/**
 * 验证百分比（不可以小数）
 * @param val 当前值字符串
 * @returns 返回处理后的字符串
 */
export function verifyNumberPercentage(val) {
  // 匹配空格
  let v = val.replace(/(^\s*)|(\s*$)/g, '')
  // 只能是数字和小数点，不能是其他输入
  v = v.replace(/[^\d]/g, '')
  // 不能以0开始
  v = v.replace(/^0/g, '')
  // 数字超过100，赋值成最大值100
  v = v.replace(/^[1-9]\d\d{1,3}$/, '100')
  // 返回结果
  return v
}

/**
 * 验证百分比（可以小数）
 * @param val 当前值字符串
 * @returns 返回处理后的字符串
 */
export function verifyNumberPercentageFloat(val) {
  let v = verifyNumberIntegerAndFloat(val)
  // 数字超过100，赋值成最大值100
  v = v.replace(/^[1-9]\d\d{1,3}$/, '100')
  // 超过100之后不给再输入值
  v = v.replace(/^100\.$/, '100')
  // 返回结果
  return v
}

/**
 * 小数或整数(不可以负数)
 * @param val 当前值字符串
 * @returns 返回处理后的字符串
 */
export function verifyNumberIntegerAndFloat(val) {
  // 匹配空格
  let v = val.replace(/(^\s*)|(\s*$)/g, '')
  // 只能是数字和小数点，不能是其他输入
  v = v.replace(/[^\d.]/g, '')
  // 以0开始只能输入一个
  v = v.replace(/^0{2}$/g, '0')
  // 保证第一位只能是数字，不能是点
  v = v.replace(/^\./g, '')
  // 小数只能出现1位
  v = v.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
  // 小数点后面保留2位
  v = v.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
  // 返回结果
  return v
}

/**
 * 正整数验证
 * @param val 当前值字符串
 * @returns 返回处理后的字符串
 */
export function verifiyNumberInteger(val) {
  // 匹配空格
  let v = val.replace(/(^\s*)|(\s*$)/g, '')
  // 去掉 '.' , 防止贴贴的时候出现问题 如 0.1.12.12
  v = v.replace(/[\.]*/g, '')
  // 去掉以 0 开始后面的数, 防止贴贴的时候出现问题 如 00121323
  v = v.replace(/(^0[\d]*)$/g, '0')
  // 首位是0,只能出现一次
  v = v.replace(/^0\d$/g, '0')
  // 只匹配数字
  v = v.replace(/[^\d]/g, '')
  // 返回结果
  return v
}

/**
 * 去掉中文及空格
 * @param val 当前值字符串
 * @returns 返回处理后的字符串
 */
export function verifyCnAndSpace(val) {
  // 匹配中文与空格
  let v = val.replace(/[\u4e00-\u9fa5\s]+/g, '')
  // 匹配空格
  v = v.replace(/(^\s*)|(\s*$)/g, '')
  // 返回结果
  return v
}

/**
 * 去掉英文及空格
 * @param val 当前值字符串
 * @returns 返回处理后的字符串
 */
export function verifyEnAndSpace(val) {
  // 匹配英文与空格
  let v = val.replace(/[a-zA-Z]+/g, '')
  // 匹配空格
  v = v.replace(/(^\s*)|(\s*$)/g, '')
  // 返回结果
  return v
}

/**
 * 禁止输入空格
 * @param val 当前值字符串
 * @returns 返回处理后的字符串
 */
export function verifyAndSpace(val) {
  // 匹配空格
  const v = val.replace(/(^\s*)|(\s*$)/g, '')
  // 返回结果
  return v
}

/**
 * 金额用 `,` 区分开
 * @param val 当前值字符串
 * @returns 返回处理后的字符串
 */
export function verifyNumberComma(val) {
  if (val == null) {
    return val
  }

  let v = val.toString()
  // 调用小数或整数(不可以负数)方法
  v = verifyNumberIntegerAndFloat(v)
  // 字符串转成数组
  v = v.toString().split('.')
  // \B 匹配非单词边界，两边都是单词字符或者两边都是非单词字符
  v[0] = v[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  // 数组转字符串
  v = v.join('.')
  // 返回结果
  return v
}

/**
 * 匹配文字变色（搜索时）
 * @param val 当前值字符串
 * @param text 要处理的字符串值
 * @param color 搜索到时字体高亮颜色
 * @returns 返回处理后的字符串
 */
export function verifyTextColor(val, text = '', color = 'red') {
  // 返回内容，添加颜色
  const v = text.replace(new RegExp(val, 'gi'), `<span style='color: ${color}'>${val}</span>`)
  // 返回结果
  return v
}

/**
 * 数字转中文大写
 * @param val 当前值字符串
 * @param unit 默认：仟佰拾亿仟佰拾万仟佰拾元角分
 * @returns 返回处理后的字符串
 */
export function verifyNumberCnUppercase(val, unit = '仟佰拾亿仟佰拾万仟佰拾元角分', v = '') {
  // 当前内容字符串添加 2个0，为什么??
  val += '00'
  // 返回某个指定的字符串值在字符串中首次出现的位置，没有出现，则该方法返回 -1
  const lookup = val.indexOf('.')
  // substring：不包含结束下标内容，substr：包含结束下标内容
  if (lookup >= 0) val = val.substring(0, lookup) + val.substr(lookup + 1, 2)
  // 根据内容 val 的长度，截取返回对应大写
  unit = unit.substr(unit.length - val.length)
  // 循环截取拼接大写
  for (let i = 0; i < val.length; i++) {
    v += '零壹贰叁肆伍陆柒捌玖'.substr(val.substr(i, 1), 1) + unit.substr(i, 1)
  }
  // 正则处理
  v = v
    .replace(/零角零分$/, '整')
    .replace(/零[仟佰拾]/g, '零')
    .replace(/零{2,}/g, '零')
    .replace(/零([亿|万])/g, '$1')
    .replace(/零+元/, '元')
    .replace(/亿零{0,3}万/, '亿')
    .replace(/^元/, '零元')
  // 返回结果
  return v
}

/**
 * 手机号码
 * @param val 当前值字符串
 * @returns 返回 true: 手机号码正确
 */
export function verifyPhone(val) {
  if (!/^1[3-9]\d{9}$/.test(val)) {
    return false
  } else {
    return true
  }
}

/**
 * 国内电话号码
 * @param phoneNum 要校验的电话号码
 * @param countryCode 国家区号
 * @param desensitize 是否支持脱敏校验
 * @returns 返回 true: 国内电话号码正确
 */
export function multiVerifyPhone({ phoneNum, countryCode, desensitize }) {
  // 临时特殊处理，全量发布后撤掉
  let regex = null
  if (countryCode === '86') {
    if (desensitize) {
      regex = new RegExp(/^(1[3-9]\d\*{4}\d{4}$|^1[3-9]\d{9})$/)
    } else {
      regex = new RegExp(/^1[3-9]\d{9}$/)
    }
  } else {
    regex = new RegExp(/^\d+$/)
  }
  return regex.test(phoneNum)
}

/**
 * 国内电话号码
 * @param val 当前值字符串
 * @returns 返回 true: 国内电话号码正确
 */
export function verifyTelPhone(val) {
  // false: 国内电话号码不正确
  if (!/\d{3}-\d{8}|\d{4}-\d{7}/.test(val)) return false
  // true: 国内电话号码正确
  else return true
}

/**
 * 登录账号 (字母开头，允许5-16字节，允许字母数字下划线)
 * @param val 当前值字符串
 * @returns 返回 true: 登录账号正确
 */
export function verifyAccount(val) {
  // false: 登录账号不正确
  if (!/^[a-zA-Z][a-zA-Z0-9_]{4,15}$/.test(val)) return false
  // true: 登录账号正确
  else return true
}

/**
 * 密码 (以字母开头，长度在6~16之间，只能包含字母、数字和下划线)
 * @param val 当前值字符串
 * @returns 返回 true: 密码正确
 */
export function verifyPassword(val) {
  // false: 密码不正确
  if (!/^[a-zA-Z]\w{5,15}$/.test(val)) return false
  // true: 密码正确
  else return true
}

/**
 * 强密码 (字母+数字+特殊字符，长度在8-20之间)
 * @param val 当前值字符串
 * @returns 返回 true: 强密码正确
 */
export function verifyPasswordPowerful(val) {
  // false: 强密码不正确
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!?])[A-Za-z\d@#$%&*!?]{8,20}$/.test(val)) {
    return false
  } else {
    return true
  }
}

/**
 * 密码强度
 * @param val 当前值字符串
 * @description 弱：纯数字，纯字母，纯特殊字符
 * @description 中：字母+数字，字母+特殊字符，数字+特殊字符
 * @description 强：字母+数字+特殊字符
 * @returns 返回处理后的字符串：弱、中、强
 */
export function verifyPasswordStrength(val) {
  let v = ''
  // 弱：纯数字，纯字母，纯特殊字符
  if (/^(?:\d+|[a-zA-Z]+|[!@#$%^&\.*]+){6,16}$/.test(val)) v = '弱'
  // 中：字母+数字，字母+特殊字符，数字+特殊字符
  if (/^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&\.*]+$)[a-zA-Z\d!@#$%^&\.*]{6,16}$/.test(val)) v = '中'
  // 强：字母+数字+特殊字符
  if (
    /^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&\.*]+$)(?![a-zA-z\d]+$)(?![a-zA-z!@#$%^&\.*]+$)(?![\d!@#$%^&\.*]+$)[a-zA-Z\d!@#$%^&\.*]{6,16}$/.test(
      val
    )
  ) {
    v = '强'
  }
  // 返回结果
  return v
}

/**
 * IP地址
 * @param val 当前值字符串
 * @returns 返回 true: IP地址正确
 */
export function verifyIPAddress(val) {
  // false: IP地址不正确
  if (
    !/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(
      val
    )
  ) {
    return false
  } else {
    return true
  }
}

/**
 * 邮箱
 * @param val 当前值字符串
 * @returns 返回 true: 邮箱正确
 */
export function verifyEmail(val) {
  // false: 邮箱不正确
  if (
    !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      val
    )
  ) {
    return false
  } else {
    return true
  }
}
/**
 * 邮箱脱敏
 * @param val 当前值字符串
 * @returns 返回脱敏后的结果
 */
export function maskEmail(val) {
  if (val == null || !val.includes('@')) {
    return val // 如果邮箱格式不正确，则不进行处理
  }
  const atIndex = val.indexOf('@')
  // 确保邮箱地址中有@符号，并且@符号不在第一位
  if (atIndex > 0) {
    // 保留邮箱用户名的第一个字符，其余用星号代替
    const maskedUsername = val.substring(0, 1) + '****'
    // 获取邮箱域名部分
    const domain = val.substring(atIndex)
    // 返回遮盖后的邮箱地址
    return maskedUsername + domain
  }
  return val
}

/**
 * 身份证
 * @param val 当前值字符串
 * @returns 返回 true: 身份证正确
 */
export function verifyIdCard(val) {
  // false: 身份证不正确
  /**
   * 表达式解释
   * ^[1-9]\d{5}：身份证号码的前6位是行政区划代码，以1-9的数字开头，后面跟着5个数字。
   * (18|19|20)\d{2}：接下来的4位是年份，可以是18、19或20开头的年份。
   * (0[1-9]|1[0-2])：接下来的2位是月份，01到12之间的数字。
   * (0[1-9]|[12]\d|3[01])：接下来的2位是日期，可以是01到31之间的数字。
   * \d{3}：接下来的3位是顺序码，通常是随机生成的数字。
   * [\dxX]$：最后一位是校验位，可以是数字、小写字母x或大写字母X，用于校验身份证号码的合法性。
   */
  if (!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dxX]$/.test(val)) {
    return false
  } else {
    return true
  }
}

/**
 * 姓名
 * @param val 当前值字符串
 * @returns 返回 true: 姓名正确
 */
export function verifyFullName(val) {
  // false: 姓名不正确
  if (!/^[\u4e00-\u9fa5]{1,6}(·[\u4e00-\u9fa5]{1,6}){0,2}$/.test(val)) return false
  // true: 姓名正确
  else return true
}

/**
 * 邮政编码
 * @param val 当前值字符串
 * @returns 返回 true: 邮政编码正确
 */
export function verifyPostalCode(val) {
  // false: 邮政编码不正确
  if (!/^[1-9][0-9]{5}$/.test(val)) return false
  // true: 邮政编码正确
  else return true
}

/**
 * url 处理
 * @param val 当前值字符串
 * @returns 返回 true: url 正确
 */
export function verifyUrl(val) {
  // false: url不正确
  if (
    !/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
      val
    )
  ) {
    return false
  } else {
    return true
  }
}
/**
 * 验证码位数校验
 * @param {*} val 验证码
 * @param {*} num 验证码位数
 */
export function verifyCode(val) {
  const reg = new RegExp(/^[0-9]\d{5}$/)
  if (!reg.test(val)) return false
  else return true
}

// 转义Html
export function escapeHtml(value) {
  if (!value) {
    return ''
  }
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export function decodeHtml(value) {
  if (!value) {
    return ''
  }
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
}

export const sleep = (time = 0) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })

export const downloadFile = (url = '', fileName = '未知文件', cb) => {
  const a = document.createElement('a')
  a.style.display = 'none'
  a.setAttribute('target', '_blank')
  /*
   * download的属性是HTML5新增的属性
   * href属性的地址必须是非跨域的地址，如果引用的是第三方的网站或者说是前后端分离的项目(调用后台的接口)，这时download就会不起作用。
   * 此时，如果是下载浏览器无法解析的文件，例如.exe,.xlsx..那么浏览器会自动下载，但是如果使用浏览器可以解析的文件，比如.txt,.png,.pdf....浏览器就会采取预览模式
   * 所以，对于.txt,.png,.pdf等的预览功能我们就可以直接不设置download属性(前提是后端响应头的Content-Type: application/octet-stream，如果为application/pdf浏览器则会判断文件为 pdf ，自动执行预览的策略)
   */
  fileName && a.setAttribute('download', fileName)
  a.href = url
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  cb && cb()
}

export const downloadBlob = (data, fileName = '未知文件.xlsx', type, cb = () => {}) => {
  const blob = new Blob([data], { type }) // 处理文档流
  const a = document.createElement('a') // 创建a标签
  a.download = fileName.replace(new RegExp('"', 'g'), '')
  a.style.display = 'none'
  a.href = URL.createObjectURL(blob) // 创建blob地址
  document.body.appendChild(a) // 将a标签添加到body中
  a.click()
  URL.revokeObjectURL(a.href) // 释放URL对象
  document.body.removeChild(a) // 从body中移除a标签
  if (typeof cb === 'function') {
    cb()
  }
}

export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss', unix = false) => {
  if (!date) {
    return ''
  }

  let newFormat = format
  let newUnix = unix

  if (typeof format === 'boolean') {
    newUnix = format
    newFormat = 'YYYY-MM-DD HH:mm:ss'
  }

  if (newUnix) {
    return dayjs.unix(date).format(newFormat)
  }

  return dayjs(date).format(newFormat)
}
/**
 *
 * @param {String} name query key
 */
export const getQueryString = (name, url = window.location.href) => {
  // const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  // const r = window.location.search.substr(1).match(reg)
  // if (r != null) return unescape(r[2])
  // return null
  const parseUrl = new URL(url)
  const query = new URLSearchParams(parseUrl.search)
  const redirect = query.get('redirect')
  if (redirect && redirect !== 'null') {
    const redirectUrl = new URL(redirect, parseUrl.origin)
    const query1 = new URLSearchParams(redirectUrl.search)
    return query1.get(name)
  }
  return query.get(name)
}

/**
 * 获取默认使用的语言
 * zh-CN：中文；zh-SG：马新简体；zh-TW、zh-HK：繁体中文
 * en：英文；en-US：美国；en-EG：阿拉伯埃及共和国；en-AU：澳大利亚；en-GB：英国；en-CA：加拿大；en-NZ：新西兰；en-IE：爱尔兰；en-ZA：南非；en-JM：牙买加；en-BZ：伯利兹；en-TT：特立尼达和多巴哥；
 * Chrome浏览器测试：chrome://settings/languages
 */
export const getDefaultLang = () => {
  let lang = 'en'
  if (getQueryString(LangKey)) {
    // 获取地址栏中的language
    lang = getQueryString(LangKey)
  } else if (localStorage.getItem(LangKey)) {
    // 获取localStorage中的language
    lang = localStorage.getItem(LangKey)
  } else {
    // 获取浏览器中的language
    lang = window.navigator.language
  }
  if (lang.startsWith('zh')) {
    return 'zh'
  } else if (lang.startsWith('en')) {
    return 'en'
  } else {
    return 'en'
  }
  // return 'zh'
}
/**
 * 多维数组去重(包含对象)
 * @param {Array} arrayData // 需要去重的数组
 * @param {String} key // 根据属性进行去重
 */
export const multiArrayDedup = (arrayData = [], key = '') => {
  const hashKey = {}
  const result = [
    ...new Set(
      arrayData.reduce((item, next) => {
        return item.concat(next)
      }, [])
    )
  ].reduce((item, next) => {
    if (next[key]) {
      // eslint-disable-next-line no-unused-expressions
      hashKey[next[key]] ? '' : (hashKey[next[key]] = true && item.push(next))
    } else {
      item.push(next)
    }
    return item
  }, [])
  return result
}

/**
 * 对象数组去重
 * @param {Array} arrayData // 需要去重的数组
 * @param {String} key // 根据属性进行去重
 */
export const objectArrayDedup = (arrayData = [], key = '') => {
  const hash = {} // 缓存对象数组里的某一个属性
  const result = arrayData.reduce((item, next, index, data) => {
    // eslint-disable-next-line no-unused-expressions
    hash[next[key]] ? '' : (hash[next[key]] = true && item.push(next))
    return item
  }, [])
  return result
}

/**
 * 普通数组去重
 * @param {Array} arrayData // 需要去重的数组
 */
export const normalArrayDedup = (arrayData = []) => {
  const result = arrayData.reduce((item, next) => {
    item.indexOf(next) === -1 && item.push(next)
    return item
  }, [])
  return result
}

/**
 * 判断是否文本溢出
 * @param e 事件对象
 * @returns  返回true为未溢出  false溢出
 */
export const isBeyond = e => {
  const ev = window.event || e
  const textRange = el => {
    const textContent = el
    const targetW = textContent.getBoundingClientRect().width
    const range = document.createRange()
    range.setStart(textContent, 0)
    range.setEnd(textContent, textContent.childNodes.length)
    const rangeWidth = range.getBoundingClientRect().width
    return rangeWidth > targetW
  }
  return !textRange(ev.target)
}

// 获取字数 中文单字算一个字数 英文按空格算一个字数
// 例如：a app 两个字数
// a app 很好 四个字数
export const tokenizeLens = text => {
  // 英文分词：按空格分词
  const englishTokens = text.split(' ')

  // 中文分词：按单个字符分词
  const chineseTokens = text.split('').filter(char => /[\u4e00-\u9fff]/.test(char))

  // 合并英文字符和中文单字
  const tokens = englishTokens.concat(chineseTokens)

  // 返回词汇总数
  return tokens.length
}

export function getUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString()
  })
}

/**
 * 字符串校验 (包含特殊字符或仅包含数字)
 * @param val 当前值字符串
 * @returns 返回 true: 包含特殊字符或仅包含数字
 */
export function verifySpecialOrDigits(val) {
  const specialCharactersRegex = /[!@#$%^&*()_+[\]{}|\\;:'",.<>?/`~]/
  const onlyDigitsRegex = /^\d+$/
  return specialCharactersRegex.test(val) || onlyDigitsRegex.test(val)
}

/**
 * 文件大小转换对应单位大小
 * @param size 文件大小，字节（B）单位
 * @returns 返回 string
 */
export function transformFileSizeUnit(size) {
  if (!size) return ''
  let sizestr = ''
  if (size < 0.1 * 1024) {
    // 如果小于0.1KB转化成B
    sizestr = size.toFixed(2) + 'B'
  } else if (size < 1 * 1024 * 1024) {
    // 如果小于1MB转化成KB
    sizestr = (size / 1024).toFixed(2) + 'KB'
  } else if (size < 1 * 1024 * 1024 * 1024) {
    // 如果小于1GB转化成MB
    sizestr = (size / (1024 * 1024)).toFixed(2) + 'MB'
  } else {
    // 其他转化成GB
    sizestr = (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
  }

  return sizestr.replace('.00', '')
}
/**
 * 检测是否是Number类型，排除NaN
 */
export function isNumber(number) {
  return /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g.test(number)
}

/**
 * 检测是否是纯文本 中文
 */
export function isText(text) {
  return /^[\u4e00-\u9fa5]+$/.test(text)
}

/**
 * input[type="number"]：精度转步长
 */

export function getStepFromPrecision(precision) {
  return Number(Math.pow(10, -precision).toFixed(precision))
}

/**
 * 检查数字的精度是否符合精度范围内
 * @param {Number} number 传入的数值
 * @param {Number} precision 精度
 * @returns Boolean
 */
export function checkPrecision(number, precision) {
  // 检查 number 是否为 null、undefined 或 NaN
  if (number === null || number === undefined || isNaN(number)) {
    return false
  }
  // 将 precision 转换为 Number 类型
  precision = Number(precision)
  // 检查 precision 是否为 NaN
  if (isNaN(precision)) {
    precision = 0
  }
  // 将数字转换为字符串以便处理
  const numberString = number.toString()
  // 如果 precision 为 0，检查数字是否类似 '1.' 这样的形式
  if (precision === 0 && numberString.endsWith('.')) {
    return false
  }
  // 判断是否有小数点
  if (numberString.includes('.')) {
    const decimalPart = numberString.split('.')[1]
    // 检查小数部分的长度是否符合精度要求
    return decimalPart.length <= precision
  } else {
    // 如果没有小数部分，则数字是整数，符合任何正数精度要求
    return true
  }
}

/**
 * 空操作函数
 * 作用：1、默认回调；2、占位符；3、避免条件检查
 */
export const noop = () => {}

/**
 * 数字分位转换
 * @param {*} value 传入的数字
 * @param {*} precision 数值精度
 * @param {*} rate 设置倍率
 * @param {*} decimalSeparator 设置小数点
 * @param {*} groupSeparator 设置千分位标识符
 * @returns
 */
export function numberSeparate(
  value,
  precision = null,
  rate = 1000,
  decimalSeparator = '.',
  groupSeparator = ','
) {
  // 如果输入值不是有效数字格式，直接返回原始值
  if (!/^[+-]?(0|([1-9]\d*))(\.\d+)?$/g.test(value)) return value
  // 转换成浮点数以便使用.toFixed()
  value = parseFloat(value)
  // 如果 precision 不为 null 且不是 undefined，就使用toFixed()方法
  if (precision !== null && precision !== undefined) {
    value = value.toFixed(precision)
  }
  // 转换成字符串并拆分成整数和小数部分
  let [integer, decimal] = String(value).split('.')
  // 如果有分组分隔符，处理整数部分
  if (groupSeparator) {
    const level = String(rate).length
    integer = integer.replace(
      new RegExp(`(\\d)(?=(\\d{${level - 1}})+$)`, 'g'),
      `$1${groupSeparator}`
    )
  }
  // 组合整数部分和小数部分，小数部分为空时无需加小数分隔符
  const result = `${integer}${decimal !== undefined ? decimalSeparator + decimal : ''}`
  return result
}

/**
 * 判断是否是base64
 * @param {String} str - base64字符串
 * @returns {boolean}
 */
export const isBase64 = str => /^data:image\/[a-zA-Z]+;base64,/.test(str)

/**
 * 处理跳转到mintlify的文档地址
 * @param {*} object {zh: 'xxx', en: 'xx'}
 * @returns url
 */
export const toMintDoc = (object = {}) => {
  const docUrl = '//docs.bigmodel.cn'
  const lang = localStorage.getItem(LangKey)
  // 目前新版文档没配置英文，如果配置了就放开
  // const path = object[lang] || ''
  const path = object.zh || ''
  return `${docUrl}${path}`
}
