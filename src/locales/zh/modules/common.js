// 公共模块
export default {
  please_input: '请输入{0}',
  please_select: '请选择{0}',
  please_upload: '请上传{0}',
  not_empty: '{0}不能为空',
  tooltip: {
    copy: '复制',
    view: '查看',
    del: '删除',
    preivew: '预览'
  },
  dialog: {
    preview: '预览',
    tips: '提示'
  },
  upload: {
    upload: '上传',
    preparing: '上传准备中',
    uploading: '上传中',
    verifying: '校验中',
    verify_failed: '校验失败',
    check_reason: '查看原因',
    upload_success: '文件上传成功！',
    file_type_error: '文件格式不正确, 请上传{type}格式文件!',
    file_size_error: '上传图片大小不能超过 {size} MB!',
    file_size_error_no_unit: '上传文件大小不能超过 {size} !',
    file_ext_error: '文件名（包含后缀名）的最大长度不能超过100个字符',
    file_nums_error: '上传文件数量不能超过 {limit} 个!',
    upload_error: '上传失败',
    uploadLimit: `目前仅支持上传{0}文件类型，单文件最大可上传{1}MB`,
    upload_limit_no_unit: `目前仅支持上传{0}文件类型，单文件最大可上传{1}`,
    uploadLimit1: `目前仅支持上传{0}文件类型，单文件上传无大小限制`,
    re_upload: '重新上传',
    size_error: '上传文件大小不能超过 {size} MB!',
    uploading_tip1: '离开页面会导致您上传的信息被清空，请确认后操作。',
    uploading_tip2: '切换选择会导致您上传的信息被清空，请确认后操作。',
    version_tip:
      '检测您的浏览器版本较低，可能导致文件上传功能受限，请升级您的浏览器或使用最新版本的Chrome浏览器。'
  },
  download: {
    success: '下载成功',
    fail: '下载失败'
  },
  qrcode: {
    text1: '扫一扫添加智谱AI企微客服'
  },
  index_bar: {
    title: '选择 国家/地区',
    search: '搜索',
    placeholder: '搜索国家和地区',
    empty_msg: '您输入的内容没有匹配项'
  },
  prompt: '提示',
  cancel: '取消',
  close: '关闭',
  shumei: {
    verify_text: '验证码',
    loading: '滑动验证码加载中...'
  },
  // 组件内容新增
  Components: {
    useAccount: '认证后查看汇款账号并使用您的对公账户汇款',
    pay: '{0}支付',
    payStatus: '您已完成购买，立即查看资源包详情？',
    confirmValue: '确认支付后将从账户余额中直接扣除相应金额',
    notEnough: '当前账户可用余额{0}元，不足支付金额，请先充值后再使用余额支付。',
    payFail: '余额不足',
    buy: 'Tokens资源包购买',
    dataFail: '接口返回数据异常',
    getSuccess: '恭喜，您已领取成功',
    goto: '立即前往',
    titleMap: {
      dify: '返回 Dify 页面后即可立即使用体验额度',
      hai: '立即前往智谱使用额度'
    },
    pageination: {
      go: '去{0}页'
    },
    marked: {
      text: '标注',
      cancel: '取消标注'
    }
  },
  bills: {
    outOfAccount: '出账中',
    outOfAccountSuccess: '已结算',
    unAccount: '未结算'
  },
  payment_type: {
    postpaid: '后付费',
    postpaid_adjustment: '后付费(调账)',
    prepaid: '预付费',
    credit: '信用额度',
    credit_adjustment: '信用额度(调账)'
  },
  view_mode: {
    day: '按天',
    detail: '按明细'
  },
  credit_status: {
    unopen: '未开通',
    closed: '已关闭',
    opened: '已开通'
  },
  no_data: '暂无数据',
  table: '表格',
  radar_map: '雷达图',
  bar_chart: '柱状图',
  create_success: '创建成功',
  create_failed: '创建失败',
  model_categorys: [
    { value: 'LANGUAGE', label: '通用大模型' },
    { value: 'PICTURE', label: '图像模型' },
    { value: 'EMBEDDING', label: '向量模型' },
    { value: 'CODE', label: '代码模型' },
    { value: 'CHARACTER', label: '拟人模型' },
    { value: 'FINE_TUNING', label: '微调模型' },
    { value: 'VIDEO', label: '多模态模型' },
    { value: 'NEW_FINE_TUNE', label: '微调模型' },
    { value: 'PRIVATE', label: '私有模型' },
    { value: 'OTHER', label: '其他模型' }
  ],
  null_tip_text: '{0}不能为空',
  model_name: '模型名称',
  model_code: '模型编码',
  model_type: '模型分类',
  average: '平均分',
  dstdev: '标准差',
  median: '中位数',
  save: '保存',
  saving: '保存中...',
  auotSaved: '已自动保存',
  autoSaveFailed: '自动保存失败 {0}',
  retry: '重试',
  start_dialog: '开始对话',
  start_recording: '开始录音',
  stop_recording: '停止录音',
  recording_fail: '录音失败',
  sure_del: '确认删除',
  sure_remove: '确认移除',
  back: '返回',
  drag_file_text: '将文件拖拽到这里',
  upload_file_limit_tip: '一次只能上传一张图片',
  sync_point: '同步定位',
  model_price_unit: {
    tokens: '元/千tokens',
    times: '元/次'
  },
  next_time_no_alert: '下次不再提醒',
  copy_code: '复制代码',
  input_parameters: '输入参数',
  output_parameters: '输出参数',
  fail: '失败',
  reload_page: '点击刷新'
}
