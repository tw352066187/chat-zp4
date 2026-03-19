// 常量定义集中管理

// 示例常量
export const APP_NAME = 'Vue App'

// API 基础路径
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 分页默认配置
export const PAGINATION = {
  pageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
}

// 智谱 AI 模型列表
export const ZHIPU_MODELS = [
  {
    id: 'glm-4-flash',
    name: 'GLM-4 Flash',
    chef: '智谱',
    chefSlug: 'zhipu',
    description: '高性价比，适合日常对话',
    providers: ['zhipu'],
  },
  {
    id: 'glm-4.7-flash',
    name: 'GLM-4.7 Flash',
    chef: '智谱',
    chefSlug: 'zhipu',
    description: '高性价比，适合日常对话',
    providers: ['zhipu'],
  },
]

// 默认模型
export const DEFAULT_MODEL = 'glm-4-flash'
