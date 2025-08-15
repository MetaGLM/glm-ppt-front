import axios from 'axios'
import store from '@/store'
import i18n from '@/locales'
import { Message, Loading } from 'element-ui'
import { sleep } from '@/utils/tools'
import { whiteListCode, tokenFail, errorCode, orgProjectErrCode } from '@/utils/responseCode'

// 请求map
const pendingMap = new Map()
// loading实例
const LoadingInstance = {
  _target: null,
  _count: 0
}

function request(axiosConfig, insetCustomOptions, loadingOptions) {
  const service = axios.create({
    baseURL: axiosConfig.baseUrl || process.env.VUE_APP_API_PATH, // 设置统一的请求前缀
    timeout: 10000, // 设置统一的超时时长10s
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Set-Language': i18n?.locale,
      'Accept-Language': i18n?.locale
    }
  })

  // 自定义配置
  const customOptions = Object.assign(
    {
      repeatRequestCancel: true, // 是否开启取消重复请求，默认为 true
      reductDataFormat: true, // 是否开启简洁的数据结构响应，默认为true
      errorMessageShow: true, // 是否开启接口错误信息展示，默认为true
      codeMessageShow: true, // 是否开启code不为200时的信息提示，默认为true
      withToken: true, // 是否携带token，默认为true
      loading: true // 是否开启loading层效果，默认为true
    },
    insetCustomOptions
  )

  // 请求拦截
  service.interceptors.request.use(
    config => {
      removePending(config)
      customOptions.repeatRequestCancel && addPending(config)
      // 创建loading实例
      if (customOptions.loading) {
        LoadingInstance._count++
        if (LoadingInstance._count === 1) {
          LoadingInstance._target = Loading.service(
            Object.assign(
              {
                lock: true,
                text: i18n.t('request.loading.text'),
                spinner: 'el-icon-loading',
                background: '#f7f8fa'
              },
              loadingOptions
            )
          )
        }
      }
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  // 响应拦截
  service.interceptors.response.use(
    response => {
      removePending(response.config)
      customOptions.loading && closeLoading(customOptions) // 关闭loading
      // code为401、1001、1002、1003跳转登录页
      if (response.data) {
        if (tokenFail.includes(response.data.code)) {
          Message({
            type: 'info',
            message: i18n.t('request.msg.token_fail'),
            duration: 1000
          })
          // message消失后再跳转login
          sleep(1000).then(() => {
            alert('token失效')
          })
          return Promise.reject(response.data)
        } else if (response.data.code === 402) {
          store.commit('Permission/SET_BOUND_STATE', false)
          return Promise.reject(response.data)
        } else if (orgProjectErrCode[response.data.code]) {
          // 处理针对组织、项目、成员不存在情况
          Message({
            type: 'error',
            message: `${orgProjectErrCode[response.data.code]}${i18n.t('request.msg.reload_page')}`,
            duration: 1000
          })
          // message消失后再跳转reload
          sleep(1000).then(() => {
            window.location.reload()
          })
          return Promise.reject(response.data)
        }
        // 针对属性codeMessageShow为true（开启code不为200的message提示），并且code码不包含在白名单中的，进行message提示。
        if (customOptions.codeMessageShow && !whiteListCode.includes(response.data.code)) {
          const message =
            errorCode[response.data.code] ||
            response.data.msg ||
            response.data.message ||
            errorCode.default

          Message({
            type: 'error',
            message
          })
          return Promise.reject(response.data) // 直接Promise.reject，在调用中走catch函数
        }
        return customOptions.reductDataFormat ? response.data : response
      } else {
        Message({
          type: 'error',
          message: i18n.t('request.msg.server_abnormal')
        })
        // response.data 返回空字符串表示接口没有任何响应，返回原始response，手动追加code及message
        return Promise.reject({ code: 503, message: i18n.t('request.msg.server_abnormal') })
      }
    },
    error => {
      error.config && removePending(error.config)
      customOptions.loading && closeLoading(customOptions) // 关闭loading
      customOptions.errorMessageShow && httpErrorStatusHandle(error) // 处理错误状态码
      return Promise.reject(error) // 错误继续返回给到具体页面
    }
  )

  return service(axiosConfig)
}

export default request

/**
 * 处理异常
 * @param {*} error
 */
function httpErrorStatusHandle(error) {
  // 处理被取消的请求
  if (axios.isCancel(error)) return console.error('请求的重复请求：' + error.message)
  let message = ''
  let type = 'error'
  // 处理error.response.status情况下的message
  const errMessage =
    error.response &&
    error.response.data &&
    (error.response.data.msg || error.response.data.message)
  if (error && error.response) {
    switch (error.response.status) {
      case 302:
        message = i18n.t('request.msg.redirected')
        break
      case 400:
        message = i18n.t('request.msg.params_error')
        break
      case 401:
        type = 'info'
        message = i18n.t('request.msg.unlogin')
        break
      case 403:
        message = i18n.t('request.msg.no_permission')
        break
      case 404:
        message = i18n.t('request.msg.url_error', { url: error.response.config.url })
        break // 在正确域名下
      case 408:
        message = i18n.t('request.msg.timeout')
        break
      case 409:
        message = i18n.t('request.msg.exist_data')
        break
      case 500:
        message = i18n.t('request.msg.server_error')
        break
      case 501:
        message = i18n.t('request.msg.service_no_fulfilled')
        break
      case 502:
        message = i18n.t('request.msg.gateway_error')
        break
      case 503:
        message = i18n.t('request.msg.service_unavailable')
        break
      case 504:
        message = i18n.t('request.msg.service_temp_unavailable')
        break
      case 505:
        message = i18n.t('request.msg.http_version_not_supported')
        break
      default:
        message = i18n.t('request.msg.contact_service')
        break
    }
  }
  if (error.message.includes('timeout')) message = i18n.t('request.msg.network_timeout')
  if (error.message.includes('Network')) {
    message = window.navigator.onLine
      ? i18n.t('request.msg.server_abnormal')
      : i18n.t('request.msg.disconnected')
  }

  Message({
    type,
    message: errMessage || message
  })
}

/**
 * 关闭Loading层实例
 * @param {*} _options
 */
function closeLoading(_options) {
  if (_options.loading && LoadingInstance._count > 0) LoadingInstance._count--
  if (LoadingInstance._count === 0) {
    LoadingInstance._target.close()
    LoadingInstance._target = null
  }
}

/**
 * 储存每个请求的唯一cancel回调, 以此为标识
 * @param {*} config
 */
function addPending(config) {
  const pendingKey = getPendingKey(config)
  config.cancelToken =
    config.cancelToken ||
    new axios.CancelToken(cancel => {
      if (!pendingMap.has(pendingKey)) {
        pendingMap.set(pendingKey, cancel)
      }
    })
}

/**
 * 删除重复的请求
 * @param {*} config
 */
function removePending(config) {
  const pendingKey = getPendingKey(config)
  if (pendingMap.has(pendingKey)) {
    const cancelToken = pendingMap.get(pendingKey)
    cancelToken(pendingKey)
    pendingMap.delete(pendingKey)
  }
}

/**
 * 生成唯一的每个请求的唯一key
 * @param {*} config
 * @returns
 */
function getPendingKey(config) {
  let { url, method, params, data } = config
  if (typeof data === 'string') data = JSON.parse(data) // response里面返回的config.data是个字符串对象
  return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&')
}
