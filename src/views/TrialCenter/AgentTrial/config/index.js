export * from './constants'

// 从动态参数中单独提取参数，定制处理
export const SPECIAL_SYSTEM_PROMPT = ['system_prompt']

// 获取模型分类列表
export function getAgentCategoryList(list) {
  if (Array.isArray(list) && list.length === 0) {
    return []
  }

  const categoryTypeMap = new Map()
  for (let index = 0; index < list.length; index++) {
    const item = list[index]
    if (item.cannotGoExperience) {
      continue
    }
    if (categoryTypeMap.has(item.category)) {
      categoryTypeMap.get(item.category).push(item)
    } else {
      categoryTypeMap.set(item.category, [item])
    }
  }

  return Array.from(categoryTypeMap, ([key, children]) => ({ value: key, label: key, children }))
}
