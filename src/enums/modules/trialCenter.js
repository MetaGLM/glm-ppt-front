const webSearch = 'https://cdn.bigmodel.cn/static/platform/images/trialcenter/web_search.png'
const webSearchStop =
  'https://cdn.bigmodel.cn/static/platform/images/trialcenter/web_search_stop.png'
const webSearchGif = 'https://cdn.bigmodel.cn/static/platform/images/trialcenter/web_search.gif'
const knowledge = 'https://cdn.bigmodel.cn/static/platform/images/trialcenter/knowledge.png'
const knowledgeStop =
  'https://cdn.bigmodel.cn/static/platform/images/trialcenter/knowledge_stop.png'
const knowledgeGif = 'https://cdn.bigmodel.cn/static/platform/images/trialcenter/knowledge.gif'
const functionCall = 'https://cdn.bigmodel.cn/static/platform/images/trialcenter/function_call.png'
const functionStop = 'https://cdn.bigmodel.cn/static/platform/images/trialcenter/function_stop.png'
const drawLoading = 'https://cdn.bigmodel.cn/static/platform/images/trialcenter/draw_loading.gif'
const drawComplete = 'https://cdn.bigmodel.cn/static/platform/images/trialcenter/draw_complete.gif'
const drawStop = 'https://cdn.bigmodel.cn/static/platform/images/trialcenter/draw_stop.png'
const drawFail = 'https://cdn.bigmodel.cn/static/platform/images/trialcenter/draw_fail.png'

// 回答结果区域类型
export const ANSWER_TYPE = {
  TIPS: 'tips', // 提示类型
  ORDINARY: 'ordinary', // 普通回答类型
  PROLOGUE: 'prologue' // 开场白类型
}

// 回答结果状态
export const ANSWER_STATUS = {
  WAITTING: 'waitting', // 等待中
  OUTPUT: 'output', // 输出
  STOP: 'stop', // 停止
  CONTINUE: 'continue', // 继续
  COMPLETE: 'complete', // 完成
  SENSITIVE: 'sensitive', // 遇敏感词
  FAIL: 'fail' // 失败
}

// 角色类型
export const ROLE_TYPE = {
  USER: 'user', // 用户
  ASSISTANT: 'assistant', // 助手
  TOOL: 'tool' // 工具
}

// 模型名称
export const MODEL_NAMES = {
  CHARGLM3: 'charglm-3', // charglm-3模型
  GLM4: 'glm-4', // glm-4（文生文）
  GLM40502: 'glm-4-0520', // glm-4系列（文生文）
  GLM4AIR: 'glm-4-air', // glm-4系列（文生文）
  GLM4AIRX: 'glm-4-airx', // glm-4系列（文生文）
  GLM4FLASH: 'glm-4-flash', // glm-4系列（文生文）
  GLM3TURBO: 'glm-3-turbo', // glm-3-turbo（文生文）
  GLM4V: 'glm-4v', // glm-4v（图生文）
  GLM4VFLASH: 'glm-4v-flash', // glm-4v（图生文）
  COGVIEW3: 'cogview-3', // cogview-3（文生图）
  CODEGEEX4: 'codegeex-4', // （文生文）
  COGVIDEO: 'cogvideo', // （文/图生视频）
  COGVIDEOX2: 'cogvideox-2',
  COGVIDEOX_FLASH: 'cogvideox-flash',
  COGVIDEOX3: 'cogvideox-3', // （文/图生视频）
  GLM_4V_PLUS_0111: 'glm-4v-plus-0111' // (特殊模型)
}

// 模型场景类型
export const MODEL_SCENE_TYPE = {
  CODE: 'CODE',
  TOOL: 'TOOL', // 可工具辅助型
  VIDEO_TO_TEXT: 'VIDEO_TO_TEXT', // 视频生文
  AUDIO_TO_AUDIO: 'AUDIO_TO_AUDIO', // 音频生文
  ASR: 'ASR', // ASR音频生文
  AUDIO_TO_TTS: 'AUDIO', // TTS 音频
  IMAGE_TO_TEXT: 'IMAGE_TO_TEXT',
  TEXT_TO_IMAGE: 'TEXT_TO_IMAGE',
  TEXT_TO_VIDEO: 'TEXT_TO_VIDEO',
  NO_TOOLS: 'NO_TOOLS',
  CHARACTER: 'CHARACTER',
  MOE_TOOLS: 'MOE_TOOLS' // MOE工具
}

// 工具类型
export const TOOLS_TYPE = {
  MCP: 'mcp', // mcp服务
  WEB_SEARCH: 'web_search', // 网页检索
  KNOWLEDGE_SEARCH: 'retrieval', // 知识库检索
  FUNCTION_CALL: 'function' // 函数调用
}

// 输出状态
export const OUTPUT_STATUS = {
  TEXT_TO_IMAGE: {
    // 文生图的各状态信息提示
    [ANSWER_STATUS.WAITTING]: {
      img: drawLoading,
      msg: 'CogView AI绘画...'
    },
    [ANSWER_STATUS.STOP]: {
      img: drawStop,
      msg: '停止CogView AI绘画'
    },
    [ANSWER_STATUS.COMPLETE]: {
      img: drawComplete,
      msg: 'CogView AI绘画：已完成'
    },
    [ANSWER_STATUS.FAIL]: {
      img: drawFail,
      msg: 'CogView AI绘画失败'
    }
  },
  TEXT_TO_VIDEO: {
    // 文生视频的各状态信息提示
    [ANSWER_STATUS.WAITTING]: {
      img: drawLoading,
      msg: 'CogVideoX AI生成...'
    },
    [ANSWER_STATUS.STOP]: {
      img: drawStop,
      msg: '停止CogVideoX AI生成'
    },
    [ANSWER_STATUS.COMPLETE]: {
      img: drawComplete,
      msg: 'CogVideoX AI生成：已完成'
    },
    [ANSWER_STATUS.FAIL]: {
      img: drawFail,
      msg: 'CogVideoX AI生成失败'
    },
    [ANSWER_STATUS.SENSITIVE]: {
      img: drawFail,
      msg: 'CogVideoX AI生成失败'
    }
  },
  [TOOLS_TYPE.WEB_SEARCH]: {
    [ANSWER_STATUS.WAITTING]: {
      img: webSearchGif,
      msg: '网页检索...'
    },
    [ANSWER_STATUS.OUTPUT]: {
      img: webSearch,
      msg: '网页检索：输出中'
    },
    [ANSWER_STATUS.STOP]: {
      img: webSearchStop,
      msg: '停止网页检索'
    },
    [ANSWER_STATUS.COMPLETE]: {
      img: drawComplete,
      msg: '网页检索：已完成'
    },
    [ANSWER_STATUS.FAIL]: {
      img: drawFail,
      msg: '网页检索失败'
    }
  },
  [TOOLS_TYPE.KNOWLEDGE_SEARCH]: {
    [ANSWER_STATUS.WAITTING]: {
      img: knowledgeGif,
      msg: '知识库检索...'
    },
    [ANSWER_STATUS.OUTPUT]: {
      img: knowledge,
      msg: '知识库检索：输出中'
    },
    [ANSWER_STATUS.STOP]: {
      img: knowledgeStop,
      msg: '停止知识库检索'
    },
    [ANSWER_STATUS.COMPLETE]: {
      img: drawComplete,
      msg: '知识库检索：已完成'
    },
    [ANSWER_STATUS.FAIL]: {
      img: drawFail,
      msg: '知识库检索失败'
    }
  },
  [TOOLS_TYPE.FUNCTION_CALL]: {
    [ANSWER_STATUS.WAITTING]: {
      img: functionCall,
      msg: '函数调用...'
    },
    [ANSWER_STATUS.OUTPUT]: {
      img: functionCall,
      msg: '函数调用：输出中'
    },
    [ANSWER_STATUS.STOP]: {
      img: functionStop,
      msg: '停止函数调用'
    },
    [ANSWER_STATUS.CONTINUE]: {
      img: functionCall,
      msg: '函数调用：输入结果'
    },
    [ANSWER_STATUS.COMPLETE]: {
      img: drawComplete,
      msg: '函数调用：已完成'
    },
    [ANSWER_STATUS.FAIL]: {
      img: drawFail,
      msg: '函数调用失败'
    }
  }
}

// 文/图生视频任务异步状态
export const LANG_TO_VIDEO_STATUS = {
  PROCESSING: 'PROCESSING', // 处理中
  FAIL: 'FAIL', // 失败
  SUCCESS: 'SUCCESS' // 成功
}

// 执行状态，包含整个模型执行过程中出现状态
export const EXECUTION_STATUS = {
  NONE: 'NONE', // 无状态
  WAITTING: 'WAITTING', // 等待中
  WEBSEARCH: 'WEBSEARCH', // 网页检索中
  THINKING: 'THINKING', // 思考中
  THOUGHT: 'THOUGHT', // 思考结束
  TOOL_INVOCATION: 'TOOL_INVOCATION', // 工具调用中
  TOOL_SUCCESS: 'TOOL_SUCCESS', // 工具调用成功
  TOOL_FAIL: 'TOOL_FAIL', // 工具调用失败
  OUTPUT: 'OUTPUT', // 输出中
  STOP: 'STOP', // 停止
  FINISH: 'FINISH', // 完成
  ERROR: 'Error' // 失败
}
