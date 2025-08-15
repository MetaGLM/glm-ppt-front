import request from '@/utils/request'

// 查询 Agent 同步请求结果 或 发布异步请求
export function fetchAgentRequestApi(data, cancelToken, headers) {
  return request(
    {
      url: `/v1/agents`,
      method: 'post',
      cancelToken,
      data,
      timeout: 3000000,
      headers
    },
    {
      loading: false,
      codeMessageShow: false // agent接口独有
    }
  )
}

// 查询 agent 异步请求结果
export function fetchAgentAsyncResultApi(data, cancelToken, headers) {
  return request(
    {
      url: `/v1/agents/async-result`,
      method: 'post',
      cancelToken,
      data,
      timeout: 3000000,
      headers
    },
    {
      loading: false,
      codeMessageShow: false // agent接口独有
    }
  )
}

// 获取 Agent PPT 预览地址
export function fetchAgentPPTUrlApi(data, cancelToken, headers) {
  return request(
    {
      url: `/v1/agents/conversation/`,
      method: 'post',
      cancelToken,
      data,
      timeout: 3000000,
      headers
    },
    {
      loading: false,
      errorMessageShow: false,
      codeMessageShow: false // agent接口独有
    }
  )
}
