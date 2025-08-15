export default {
  title: '欢迎体验智谱 AI 大模型！👋',
  introduction: '在这里，你可以快速测试大模型在业务场景上的效果，体验平台提供的各类大模型。',
  welcome_title: '极速体验{0}开启智能对话',
  text_model: '文本模型',
  multimodal_model: '多模态模型',
  image_model: '图像模型',
  video_model: '视频模型',
  voice_model: '语音模型',
  visual_model: '视觉模型',
  add_model: '添加模型比较',
  ai_mark_text: '以上内容为 AI 生成，不代表开发者立场',
  chat_record: '对话记录',
  chat_record_tip: '仅展示一个月内的对话记录',
  chat_empty_text: '暂无对话记录',
  default_chat_title: '新对话',
  new_session: '新建对话',
  new_session_tip: '新的对话已开启',
  clear_chat: {
    text: '清除对话',
    title: '确定要清空对话吗？',
    desc: '清空对话后不可恢复，确认清空吗？'
  },
  model_setting: {
    title: '模型设置',
    view_code: '查看代码',
    sync_config: '同步配置',
    sync_config_tip: '迁移相同类型参数至其他模型，避免重复配置',
    parameter_config: '参数配置',
    parameter_config_tip: '选择模型后进行设置',
    sys_prompt: '系统设定',
    role_define: '角色定义',
    resolution: '分辨率',
    resolution_desc: '选择图片分辨率',
    video: {
      ai_sound: 'AI音效',
      ai_sound_desc: '使用AI为生成的视频音效，使视频更具沉浸感或表现力',
      gen_mode: '生成模式',
      gen_mode_desc:
        '质量优先：生成视频画面质量更佳<br/>速度优先：生成视频速度更快，相对降低视频画面质量',
      gen_mode_desc3:
        '质量优先：生成视频画面质量更佳，该模式不支持首尾帧<br/>速度优先：生成视频速度更快，相对降低视频画面质量，该模式支持首尾帧',
      quality: '质量优先',
      quality_warning: '该模式不支持首尾帧',
      speed: '速度优先',
      frame_rate: '帧率',
      frame_rate_desc: '每秒钟显示的图像帧数，决定了视频的流畅度，常用单位是fps（帧/秒）',
      fps_30: '30帧',
      fps_60: '60帧',
      resolution: '分辨率',
      resolution_desc: '默认生成视频的短边为 1080，长边根据原图片比例缩放。最高支持 4K 分辨率',
      duration: '视频时长',
      duration_desc: '生成视频的时长'
    },
    tool_function_desc: '输入模型调用的函数说明列表。有关示例，请参阅{0}文档',
    function_define: '函数定义',
    example_function: '示例函数',
    search_options: [
      { label: '智谱搜索标准版', value: 'search_std' },
      { label: '智谱搜索Pro版', value: 'search_pro' },
      { label: '搜狗搜索', value: 'search_pro_sogou' },
      { label: '夸克搜索', value: 'search_pro_quark' }
      // { label: 'Jina AI', value: 'search_pro_jina' },
      // { label: '必应搜索', value: 'search_pro_bing' }
    ]
  },
  select_model: '选择模型',
  selected_num: '已选{0}/{1}',
  delete_model_title: '确认移除模型？',
  delete_model_desc: '移除后对话记录将不保存',
  switch_model: '切换模型',
  more_model: '更多模型',
  no_fintune_task: '暂无微调模型',
  no_private_task: '暂无私有模型',
  total_model_num: '共{0}个模型',
  total_model_num_radio: '共{0}个模型',
  total_model_num_new: '共{0}个模型，可选择1~3个模型',
  search_model_empty: '暂无相关模型',
  model_category: {
    language: '通用大模型',
    scence_model: '场景模型',
    image2text: '视觉理解',
    text2image: '文生图模型',
    text2video: '文生视频',
    fintune: '微调模型',
    private: '私有模型',
    audio: '音频模型'
  },
  model_content: {
    slef_model: '我的模型',
    model_square: '模型广场',
    fine_tune_model: '微调模型',
    private_mode: '私有实例'
  },
  welcome: {
    text: [
      {
        label: 'GLM-4-Plus',
        modelCode: 'glm-4-plus',
        tags: ['高智能旗舰'],
        desc: '使用了大量模型辅助构造高质量合成数据以提升模型性能，利用PPO有效提升模型推理的表现。在各项性能指标上，GLM-4-Plus 已达到与 GPT-4o 等第一梯队模型持平的水平。'
      },
      {
        label: 'GLM-Z1-Air',
        modelCode: 'glm-z1-air',
        tags: ['复杂推理'],
        desc: '智谱全自研32B参数GLM推理模型，性能媲美DeepSeek-R1，价格仅为其1/30。'
      },
      {
        label: 'GLM-4-Flash',
        modelCode: 'glm-4-flash',
        tags: ['响应快速且免费'],
        desc: '一款免费且好用的语言模型，适用于处理简单任务，例如，智能问答、摘要生成和文本数据处理等多种应用场景。'
      }
    ],
    multimodal: [
      {
        label: 'GLM-4V-Plus-0111',
        modelCode: 'glm-4v-plus-0111',
        tags: ['视觉理解'],
        desc: '具备卓越的多模态理解能力，可同时处理最多5张图像，最长支持2h 视频内容理解'
      },
      {
        label: 'Cogview-4-250304',
        modelCode: 'cogview-4-250304',
        tags: ['精准图像生成'],
        desc: '具备较强的复杂语义对齐和指令跟随能力，支持任意长度的中英双语输入，能够生成多种分辨率的图像，同时具备较强的文字生成能力。'
      },
      {
        label: 'CogvideoX-3',
        modelCode: 'cogvideox-3',
        tags: ['图/文生视频'],
        desc: '画面更清晰更稳定，大幅运动自然流畅，现实世界模拟、3D风格场景效果全面升级。'
      }
    ],
    voice: {
      title: 'GLM-4-Voice ',
      sub_title: '智谱 AI 推出的端到端语音模型',
      desc: '能够直接理解和生成中英文语音，进行实时语音对话'
    },
    source: '@智谱'
  },
  chat: {
    guide_text: '欢迎体验 {0}，可以试着问我以下问题',
    default_guide_text:
      '欢迎体验智谱的大模型产品，点击下方开启互动，亲身感受智能科技的无限魅力吧！',
    guide_text_4v:
      '模型拥有强大的图片理解与推理能力，可广泛应用于图片描述、图表问答、文本信息抽取等多种场景',
    comparison_text: '同步模型上下文：{0}',
    cost_time_text: '耗时 {0} ms',
    cost_tokens_text: '消耗{0}tokens',
    using_web_search: '调用网页检索：{0}',
    complete_web_search: '完成网页检索：{0}',
    search_result_text: '找到{0}条搜索结果：',
    empty_web_search: '网页检索：{0}调用失败/搜索结果返回为空',
    search_cost_text: '调用{0}次{1}',
    thinking_text: '思考中',
    thought_text: '已深度思考',
    thought_stop_text: '思考已停止'
  },
  chat_answer: {
    placeholder: '请输入函数调用结果',
    btn: '提交',
    mark1: '以上内容为 AI 生成，不代表开发者立场，请勿删除或修改本标记',
    mark2: '离开此页面，任务不会取消。体验中心任务保存24小时。',
    stoped: '本次回答已被终止',
    error1: '函数调用结果不能为空！'
  },
  view_code: {
    title: '查看代码',
    copy_tip: '您可以直接复制以下代码在本地进行使用。',
    tip_text: '您可以在{0}找到您的API。请注意使用环境变量或其他方法来隐藏您的keys。',
    btn: '这里'
  },
  search_box: {
    stop: '停止生成',
    again: '重新生成',
    enter: '发送',
    upload_image_video: '选择视频或图片上传',
    upload_image_video_tip: '上传视频最大{0}，图片最大{1}',
    placeholder: '向我发指令，我可以完成对话聊天、创作文章、生成代码等多种任务',
    placeholder_voice: '通过语音或者打字向我发出指令，我可以直接理解和生成中英文语音',
    placeholder_4v: '请上传图片并发出指令,我可以理解图片内容,并回答相关问题',
    placeholder_4v_plus: '请上传图片或视频并发出指令,我可以理解图片或视频内容,并回答相关问题',
    placeholder_cogview: '用文字向我描述图像生成任务，我可以快速、精准理解',
    placeholder_cogvideo: '输入文本或图片，我可以完成视频制作',
    placeholder_multimodal: '向我发指令,我可以处理并整合多种类型的数据',
    placeholder_radio: '请录音或上传文件，将音频转换为文本',
    file_tooltip: `<strong>功能说明</strong>：文件问答通过上传文件并提取文本作为背景信息输入给大模型，因此文本过多可能会产生较高的费用。为了降低消耗，建议使用GLM-4-Flash进行体验。<br>
    <strong>文件限制</strong>：上传最多10个文件，单个文件最大50M，图片最大5M。支持PDF、Word、Excel、PPT、text、图片等格式。`,
    ideas: '提出你的想法...',
    upload_asr_tip: '支持.wav、.mp3文件，时长最多1分钟',
    upload_asr_error: '上传语音时长最多60秒，请删除重新上传',
    uploadImage: '上传图片',
    new_session: '新建对话',
    file_num_limt: '上传最多 {0} 个文件',
    file_size_limt: '单个文件最大{0}，图片最大{1}',
    file_uploading_tip: '文件正在上传中，请稍后...',
    upload_audio: '支持.wav、.mp3文件，时长最多10分钟',
    upload_audio_ASR_minate: '支持.wav、.mp3文件，时长最多1分钟',
    audio_limit_tip: '最多支持上传{0}段音频',
    please_start_speaking: '请开始说话...'
  },
  function_call: {
    name_error_tip: 'name：只能包含 a-z、A-Z、0-9、下划线和连字符且最大长度为64'
  },
  model_tools: {
    tool_select: '工具选择',
    title: '工具调用',
    choosePlaceholder: '请选择知识库',
    noContent: '暂无内容',
    toCreate: '去创建',
    to_create_fine_tune_model: '前往模型微调',
    to_create_private_mode: '前往私有实例部署',
    no_fintune_task_model: '暂无微调模型',
    no_private_task_model: '暂无私有实例',
    toolData: {
      tools4: {
        paramName: 'MCP',
        desc: '可以通过标准化协议（MCP）连接工具服务API并发起调用，{0}。',
        link: '查看工具收费',
        add: '添加MCP'
      },
      tools1: {
        paramName: '联网搜索',
        desc: '可以进行联网搜索，然后将搜索结果传递给大模型进行进一步的生成和处理'
      },
      tools2: {
        paramName: '知识库检索',
        desc: '通过访问开放平台知识库作为背景知识，来回答用户提出的问题'
      },
      tools3: {
        paramName: '函数调用',
        desc: '函数调用功能可以增强模型推理效果或进行其他外部操作，如信息检索、数据库操作、知识图谱搜索与推理、操作系统、触发外部操作等工具调用场景'
      }
    },
    select_mcp: {
      title: '选择MCP服务',
      tools_num: '工具{0}',
      add_mcp_num: '已添加MCP {0}/{1}',
      no_tool_tip: '选择MCP 工具不能为空'
    }
  },
  timbre: {
    title: '音色选择',
    tongtong: '彤彤',
    female: '标准女声',
    male: '标准男声'
  },
  request_info: {
    video_fail: '已有视频正在生成中、请稍后再试',
    fail_mess: '生成图片失败',
    cancel: '取消请求',
    tts_fail: '生成失败',
    audio_fail: '音频生成失败，请重新尝试'
  },
  // 额外信息
  extra: {
    clickEdit: '点击编辑函数',
    editFun: '编辑函数',
    enterCode: '请输入函数代码',
    standJson: '请输入标准的JSON格式',
    mustInput: 'Function name 必须填写',
    placeInterFun: '请输入函数',
    not_support: '您的浏览器不支持视频播放'
  },
  reload: '重新拉取',
  call_mcp_name: '调用MCP工具：{0}',
  tokens_cost_tip: '模型体验将按实际消耗计费，具体价格请参考',
  pricing_text: '产品定价',
  knowledge_setting: {
    title: '知识库问答',
    go_config: '管理我的知识库',
    go_add: '创建我的知识库'
  },
  search_setting: {
    title: '联网搜索',
    search_placeholder: '搜索工具选择',
    config: {
      title: '配置',
      paramName1: '搜索数量',
      paramName2: '意图识别',
      paramName3: '时间范围',
      paramName4: '返回内容长度',
      paramName5: '限定搜索域名',
      paramName_des1: '返回搜索结果数量，范围1-50，默认为10',
      paramName_des1_10: '返回搜索结果数量，限定10, 20, 30, 40, 50，默认为10',
      paramName_des2: '是否进行搜索意图识别',
      paramName_des3: '搜索指定时间范围内的网页',
      paramName_des4: '控制返回网页内容的长短',
      paramName_des5: '用于限定搜索结果的范围，仅支持读取1个指定白名单域名的内容',
      date_option: [
        { label: '不限', value: 'noLimit' },
        { label: '一天内', value: 'oneDay' },
        { label: '一周内', value: 'oneWeek' },
        { label: '一月内', value: 'oneMonth' },
        { label: '一年内', value: 'oneYear' }
      ],
      content_size_option: [
        { label: '摘要', value: 'medium' },
        { label: '最大化上下文', value: 'high' }
      ]
    }
  },
  exit_scene: '点击退出场景',
  deep_thinking: '深度思考',
  deep_thinking_tooltip: '点击切换思考模式',
  deep_thinking_options: [
    {
      label: '自动',
      value: 'enabled',
      desc: '智能开启深度思考'
    },
    {
      label: '关闭',
      value: 'disabled',
      desc: '快速直接回答'
    }
  ],
  ppt: {
    export_pdf: '导出PDF',
    not_found: '未找到PPT',
    export: '导出',
    exporting: '导出中',
    export_success: '导出成功',
    export_cancel: '导出已取消',
    export_error: '导出失败，请稍后再试',
    export_ask: '导出耗时可能较长（预计1-10分钟），您可操作其他应用，但不要关闭此页面或浏览器。',
    export_confirm: '确认导出'
  }
}
