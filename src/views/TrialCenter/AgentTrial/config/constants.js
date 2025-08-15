// 默认状态
export const DEFAULT_STATUS = {
  showEmpty: true,
  hasChat: false,
  isPending: false,
  isInterrupting: false
}

export const EVENT_BUS = {
  // PPT 相关
  PPT_PANE_OPEN: 'ppt:pane:open', // 打开PPT预览
  PPT_INIT: 'ppt:init', // (agentId: string) => void
  PPT_DONE: 'ppt:done', // (agentId: string) => void
  PPT_UPDATE_LIST: 'ppt:update_list', // 更新PPT数组，传递list
  PPT_UPDATE: 'ppt:update', // 更新单个PPT，传递PPT索引 (position: number) => void
  PPT_SELECTED: 'ppt:selected', // 选中单个PPT，传递PPT索引 (position: number) => void
  PPT_SHOW_TYPE: 'ppt:show_type', // 传递预览页面还是HTML (type: 'preview' | 'html') => void
  PPT_WORK_PROCESSING: 'ppt:work:processing', // (position: number) => void
  PPT_WORK_COMPLETE: 'ppt:work:complete', // 单个PPT数据传输完成，传递PPT索引 (position: number) => void
  SUBMIT_PROMPT: 'submit:prompt', // (prompt: string) => void
  RESIZE_EVENT: 'ppt:resize', // 用于监听PPT预览窗口大小变化
  SEARCH_LIST: 'ppt:search_list', // 用于处理search数组
  HIDDEN_OLD_VIEW_BUTTON: 'ppt:hidden_old_view_button' // 隐藏旧版预览按钮
}

export const PPT_TOOLS_NAME = {
  FIND_ON_PAGE: 'find_on_page_ctrl_f', // 页面查找
  PAGE_UP: 'page_up', // 向上翻页
  PAGE_DOWN: 'page_down', // 向下翻页
  PYTHON: 'python', // 执行Python脚本
  FIND_NEXT: 'find_next', // 查找下一个
  CLICK: 'click', // 点击链接
  GO_BACK: 'go_back', // 返回

  SEARCH: 'search', // 搜索
  VISIT_PAGE: 'visit_page', // 访问页面
  CREATE_SLIDE: 'create_slide', // 创建幻灯片
  ADD_SLIDE: 'add_slide', // 添加幻灯片
  UPDATE_SLIDE: 'update_slide', // 修改幻灯片
  REMOVE_SLIDES: 'remove_slides' // 删除幻灯片
}

export const PPT_PHASE = {
  THINKING: 'thinking', // 思考中
  TOOL: 'tool', // 命中工具执行中
  ANSWER: 'answer' // 回答中
}

export const PPT_STATUS = {
  DONE: 'done'
}

export const PPT_SHOW_TYPE = {
  PREVIEW: 'preview',
  HTML: 'html'
}

// PPT 工具ID
export const PPT_AGENT_ID = 'slides_glm_agent'

export const PPT_SHARE = {
  EXPORT_PDF: 'exportPDF'
}
