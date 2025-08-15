// request请求相关
export default {
  loading: {
    text: '加载中...',
    ocr_text: '正在自动识别中...'
  },
  msg: {
    token_fail: '登录凭证已失效，正在为您跳转到登录页，请稍等...',
    redirected: '接口重定向了！',
    params_error: '参数不正确！',
    unlogin: '您未登录，或者登录已经超时，请先登录！',
    no_permission: '您没有权限操作！',
    url_error: '请求地址出错: {url}',
    timeout: '请求超时！',
    exist_data: '系统已存在相同数据！',
    server_error: '服务器内部错误！',
    service_no_fulfilled: '服务未实现！',
    gateway_error: '网关错误！',
    service_unavailable: '服务不可用！',
    service_temp_unavailable: '服务暂时无法访问，请稍后再试！',
    http_version_not_supported: 'HTTP版本不受支持！',
    contact_service: '异常问题，请联系官方客服！',
    network_timeout: '网络请求超时！',
    server_abnormal: '服务端异常！',
    disconnected: '您断网了！',
    auth_fail: '认证失败，无法访问系统资源！',
    forbidden: '当前操作没有权限！',
    no_resource: '访问资源不存在！',
    default: '系统未知错误,请反馈给在线客服！',
    org_no_exist: '组织不存在',
    project_no_exist: '项目不存在',
    org_project_member_no_exist: '组织项目成员不存在',
    reload_page: '，正在为您刷新页面，请稍等...'
  },
  common_msg: {
    fail: '请求失败'
  }
}
