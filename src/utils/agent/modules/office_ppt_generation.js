import { SELECTION_TYPE } from '../constant'
import { PPT_AGENT_ID } from '@/views/TrialCenter/AgentTrial/config/constants'

export default {
  order: 1,
  agentId: PPT_AGENT_ID, // 智能体id
  category: '办公效能', // 分类
  type: 'office_effect',
  agentName: 'GLM PPT', // 智能体名称
  companyName: '智谱',
  head_picture: 'https://cdn.bigmodel.cn/static/platform/agent/ai_ppt_agent.png',
  desc: '基于GLM大模型原生能力的PPT制作助手，集信息搜索、内容整理、幻灯片设计于一体，让您轻松创建专业级幻灯片。',
  detailDesc:
    '基于GLM大模型原生能力的PPT制作助手，集信息搜索、内容整理、幻灯片设计于一体，让您轻松创建专业级幻灯片。', // marketplace首页描述文案
  tag: ['PPT生成', '一键成稿', '智能排版'], // 介绍标签, 数组形式
  tagIntro: 'PPT生成、一键成稿、智能排版',
  badge: 'NEW', // HOT | NEW, 可以为空字符串，选填
  multiChat: true, // 是否支持多轮对话，true | false
  stream: true, // 是否支持流式输出，true | false
  markdownList: [
    {
      type: 'type1',
      introTitle: '产品介绍',
      introContent:
        'GLM PPT是面向职场人与创作者的新一代智能工具。基于GLM大模型深度驱动，区别于传统工程化拼接方案，实现从自然语言指令到可交互幻灯片的一键生成。深度融合内容生成与设计规范，可快速交付专业级作品，降低设计门槛，提升内容生产效率。'
    },
    {
      type: 'type3',
      introTitle: '应用示例',
      introContent: `| 需求场景         | 需求描述（提示词）                       | 效果展示                                 |
| :--------------- | :-------------------------------------- | :-------------------------------------- |
| 工作总结汇报      | 制作一份技术团队Q4季度向管理层汇报的PPT | <iframe frameborder="0" allowfullscreen src="https://cdn.bigmodel.cn/static/platform/agent/ppt/summary/%E6%8A%80%E6%9C%AF%E5%9B%A2%E9%98%9FQ4%E5%AD%A3%E5%BA%A6%E6%B1%87%E6%8A%A5.pdf#toolbar=0" style="min-width: 400px; height:400px;"></iframe> |
| 市场分析报告      | 帮AI创业团队制作一份大模型市场分析PPT | <iframe frameborder="0" allowfullscreen src="https://cdn.bigmodel.cn/static/platform/agent/ppt/analysis/AI%E5%A4%A7%E6%A8%A1%E5%9E%8B%E5%B8%82%E5%9C%BA%E5%88%86%E6%9E%90%20.pdf#toolbar=0" style="min-width: 400px; height:400px;"></iframe> |
| 业务数据分析报告  | 请制作电商平台用户行为数据分析PPT        | <iframe frameborder="0" allowfullscreen src="https://cdn.bigmodel.cn/static/platform/agent/ppt/report/%E7%94%B5%E5%95%86%E5%B9%B3%E5%8F%B0%E7%94%A8%E6%88%B7%E8%A1%8C%E4%B8%BA%E6%95%B0%E6%8D%AE%E5%88%86%E6%9E%90.pdf#toolbar=0" style="min-width: 400px; height:400px;"></iframe> |`
    },
    {
      type: 'desc',
      introTitle: '核心功能',
      introContent:
        '- **智能信息搜索**: 自动搜索并整理相关资料，多源信息汇总，确保内容丰富准确，支持实时网络信息获取\n\n- **精美视觉设计**：专业级视觉标准，确保演示效果出众，智能布局算法，自动优化内容排版\n\n- **丰富内容展示**：多媒体内容智能整合，文字图表完美融合，专业数据可一目了然\n\n- **高效制作流程**：默认生成3-4张精品幻灯片，支持自定义页数需求'
    },
    {
      type: 'type3',
      introTitle: '应用场景',
      introContent:
        '|适用场景|典型需求|\n|:------|:------|\n|职场汇报|周报、项目路演、答辩PPT等，需快速结构化呈现数据|\n|教育培训|课程教学课件、学术论文展示、培训材料制作等|\n|个人用途|工作总结汇报、活动策划方案、知识分享演示|'
    },
    {
      type: 'type3',
      introTitle: '使用说明',
      introContent:
        '只需一句话描述您的PPT需求，GLM PPT 就能为您制作出专业级的演示文稿！\n1. **描述需求**: 输入您要制作什么主题的PPT\n\n2. **信息搜集**:  智能体自动搜索相关资料\n\n3. **生成幻灯片**:  基于搜集信息制作精美PPT\n\n4. **优化调整**:  根据您输入的反馈进行修改完善（在线编辑功能即将上线）\n\n5. **导出使用**:  支持导出PDF格式文件 （PPTX等多格式导出功能开发中）'
    },
    {
      type: 'type3',
      introTitle: '价格',
      introContent:
        '- **按Tokens消耗后付费，2.5元 ~~5元~~ / 百万Tokens，限时5折优惠，截止至2025年8月31日**\n- 计量范围：智能体全任务流节点产生的Tokens总数'
    }
  ], // marketplace详情页展示的markdown格式信息
  guide: {
    desc: '基于GLM大模型原生能力的PPT制作助手，集信息搜索、内容整理、幻灯片设计于一体，让您轻松创建专业级幻灯片。',
    example_title: '使用示例',
    exampleList: [
      {
        iconName: 'example_left.png',
        title: '工作总结汇报',
        text: '制作一份技术团队Q4季度向管理层汇报的PPT',
        params: {}
      },
      {
        iconName: 'example_translate.png',
        title: '市场分析报告',
        text: '帮AI创业团队制作一份大模型市场分析PPT',
        params: {}
      },
      {
        iconName: 'example_ppt.png',
        title: '业务数据分析报告',
        text: '请制作电商平台用户行为数据分析PPT',
        params: {}
      }
    ]
  },
  setting: {
    selectionType: SELECTION_TYPE.ONE_OF,
    textProps: {
      placeholder: '请输入PPT主题，如：制作一份5页回顾乔丹篮球生涯的PPT'
    },
    fileProps: {}
  },
  paramsList: [],
  guide_doc: {
    zh: '/cn/guide/agents/glm-ppt',
    en: '/en/guide/agents/glm-ppt'
  }
}
