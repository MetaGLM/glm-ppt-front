import i18n from '@/locales'
import { Message } from 'element-ui'
import { fetchEventSource, EventStreamContentType } from '@fortaine/fetch-event-source'
/**
 * 基于@fortaine/fetch-event-source 封装的FetchEventSourceClass
 *
 * @param {object} #options 实例化实例时传入的参数
 * @param {function} #options.onopen - 请求成功链接成功回调
 * @param {function} #options.onmessage - 数据接收回调
 * @param {function} #options.onerror - 请求失败回调
 * @param {function} #options.onclose - 请求关闭回调
 * @param {function} #options.parseMessage - 自定义解析数据
 * @param {string} #options[on + event] - 自定义事件回调，采用on +'事件名称'的形式使用，如：onfinish、 onadd，如果没有定义onmessage，则默认使用onmessage
 *
 * method fetch
 * @param {object} options - fetchEventSource的参数 [required] 参考：https://github.com/microsoft/fetch-event-source
 */

const CLIENT_PREXIX = 'client___'
const SERVER_PREXIX = 'server___'

const DEFAULT_EVENT_NAMES = {
  ONOPEN: 'onopen',
  ONMESSAGE: 'onmessage',
  ONERROR: 'onerror',
  ONCLOSE: 'onclose'
}

class FetchEventSourceClass {
  _options
  _abortController

  constructor(options = {}) {
    this._options = options
    this._abortController = this.creatAbortController()
  }

  _abort() {
    if (this._abortController) {
      this._abortController.abort()
    }
    this._abortController = null
  }

  _handleMessage(response, aliasEvent = DEFAULT_EVENT_NAMES.ONMESSAGE) {
    const { event, data } = response || {}
    let callback
    const eventName = event ? 'on' + event : aliasEvent
    if (typeof this._options[eventName] === 'function') {
      callback = this._options[eventName]
    } else if (typeof this._options[aliasEvent] === 'function') {
      callback = this._options[aliasEvent]
    } else {
      // no do things
    }

    // 解析data数据
    let parseData = response
    if (typeof this._options.parseMessage === 'function') {
      parseData = this._options.parseMessage(response)
    } else {
      parseData = defaultParseMessage(response)
    }

    if (typeof callback === 'function') {
      callback(parseData)
    }
  }

  _handleError(error) {
    if (typeof this._options?.onerror === 'function') {
      this._options.onerror(error)
    }
  }

  _getHeaders(headers) {
    const overrideHeaders = {
      'Set-Language': i18n?.locale,
      'Content-Type': 'application/json',
      ...headers
    }

    for (const key in overrideHeaders) {
      // 将headers 中的空字符串、undefined、null删除
      if (
        Object.prototype.hasOwnProperty.call(overrideHeaders, key) &&
        (overrideHeaders[key] == null || overrideHeaders[key] === '')
      ) {
        delete overrideHeaders[key]
      }
    }

    return overrideHeaders
  }

  _handleClose() {
    if (typeof this._options?.onclose === 'function') {
      this._options.onclose()
    }
  }

  // 创建AbortController
  creatAbortController() {
    return new AbortController()
  }

  // 是否已终止
  aborted() {
    if (this._abortController) {
      return this._abortController?.signal?.aborted
    }
    return true
  }

  // 发起请求方法
  fetch(options) {
    const { url, data, headers, ...reset } = options || {}
    if (!this.aborted()) {
      this._abort()
    }
    this._abortController = this.creatAbortController()
    const that = this

    fetchEventSource(url || this._options.url, {
      signal: that._abortController.signal,
      openWhenHidden: true,
      withCredentials: true,
      method: 'POST',
      headers: this._getHeaders(headers),
      body: data ? JSON.stringify(data) : undefined,
      ...reset,
      async onopen(response) {
        const contentType = response.headers.get('content-type')
        if (response.ok && contentType?.includes(EventStreamContentType)) {
          if (typeof that._options?.onopen === 'function') {
            that._options.onopen(response)
          }
        } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new Error(CLIENT_PREXIX + response.status)
        } else {
          throw new Error(SERVER_PREXIX + response.status)
        }
      },
      onmessage(ev) {
        if (!that.aborted()) {
          that._handleMessage(ev)
        }
      },
      onerror(err) {
        console.log('fetchEventSource--onerror', err)
        throw new Error(err)
      },
      onclose() {
        that._handleClose()
      }
    }).catch(err => {
      console.log('fetchEventSource--catch', err)

      let type = 'error'
      let errMessage = ''

      if (err.message.indexOf('Failed to fetch') > -1) {
        errMessage = window.navigator.onLine
          ? i18n.t('request.msg.server_abnormal')
          : i18n.t('request.msg.disconnected')
      } else if (err.message.indexOf(CLIENT_PREXIX) > -1) {
        const index = err.message.indexOf(CLIENT_PREXIX)
        const errType = err.message.slice(index)
        if (errType === `${CLIENT_PREXIX}401`) {
          type = 'info'
          errMessage = i18n.t('request.msg.unlogin')
        } else if (errType === `${CLIENT_PREXIX}404`) {
          errMessage = i18n.t('request.msg.url_error', { url })
        } else if (errType === `${CLIENT_PREXIX}408`) {
          errMessage = i18n.t('request.msg.timeout')
        } else if (errType === `${CLIENT_PREXIX}6101`) {
          errMessage = i18n.t('request.msg.org_no_exist')
        } else if (errType === `${CLIENT_PREXIX}6102`) {
          errMessage = i18n.t('request.msg.project_no_exist')
        } else if (errType === `${CLIENT_PREXIX}6103`) {
          errMessage = i18n.t('request.msg.org_project_member_no_exist')
        } else {
          errMessage = i18n.t('request.msg.contact_service')
        }
      } else if (err.message.indexOf(SERVER_PREXIX) > -1) {
        errMessage = i18n.t('request.msg.server_error')
      } else {
        that._handleError({ data: err.message })
      }

      if (errMessage) {
        Message({
          type,
          message: errMessage
        })
        that._handleError({ data: '' })
      }
    })
  }

  // 关闭请求方法
  close() {
    this._abort()
  }

  // 销毁方法
  destroy() {
    this._options = null
    this.close()
  }
}

function defaultParseMessage(response) {
  return response
}

export default FetchEventSourceClass
