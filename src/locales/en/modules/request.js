// request请求相关
export default {
  loading: {
    text: 'Loading...',
    ocr_text: 'Loading...'
  },
  msg: {
    token_fail:
      'Your login credentials have expired. Redirecting you to the login page, please wait...',
    redirected: 'Interface redirected!',
    params_error: 'The parameter is incorrect!',
    unlogin: 'You are not logged in, or the login has timed out, please log in first!',
    no_permission: 'You do not have permission to operate!',
    url_error: 'Error requesting URL:{url}',
    timeout: 'Request timed out!',
    exist_data: 'The same data already exists in the system!',
    server_error: 'Internal server error!',
    service_no_fulfilled: 'Service not fulfilled!',
    gateway_error: 'Gateway error!',
    service_unavailable: 'Service is not available!',
    service_temp_unavailable: 'The service is temporarily unavailable, please try again later!',
    http_version_not_supported: 'HTTP version not supported!',
    contact_service: 'An error has occurred. Please contact official customer support!',
    network_timeout: 'Network request timed out!',
    server_abnormal: 'Server Exception!',
    disconnected: 'You are disconnected!',
    auth_fail: 'Authentication failed, unable to access system resources!',
    forbidden: 'Permission denied!',
    no_resource: 'Resource not found!',
    default: 'Unknown error. Please contact online support!',
    org_no_exist: 'Organization does not exist',
    project_no_exist: 'Project does not exist',
    org_project_member_no_exist: 'Project member not exist',
    reload_page: ' and is refreshing the page for you. Please wait...'
  },
  common_msg: {
    fail: 'Request failure!'
  }
}
