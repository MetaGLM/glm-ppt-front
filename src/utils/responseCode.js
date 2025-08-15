import i18n from '@/locales'

// 请求code白名单，不需要提示，需要进resolve
export const whiteListCode = [
  200, // 请求成功
  1505, // 安全敏感信息
  1005 // 需要双重认证
]

// token失效code，需要重新登录
export const tokenFail = [401, 1001, 1002, 1003]

// 请求code黑名单，需要公共提示
export const errorCode = {
  401: i18n.t('request.msg.auth_fail'),
  403: i18n.t('request.msg.forbidden'),
  404: i18n.t('request.msg.no_resource'),
  default: i18n.t('request.msg.default')
}

// 组织、项目、成员不存在情况下code，value必须有值，在request中有判断，需要公共提示
export const orgProjectErrCode = {
  6101: i18n.t('request.msg.org_no_exist'),
  6102: i18n.t('request.msg.project_no_exist'),
  6103: i18n.t('request.msg.org_project_member_no_exist')
}
