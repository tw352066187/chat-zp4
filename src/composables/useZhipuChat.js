/**
 * 智谱 AI 聊天 Composable
 * 纯前端实现，直接调用智谱 API
 */

import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

// 模块级别的响应式状态（单例模式）
const messages = ref([])
const status = ref('idle') // idle | submitted | streaming | error
const error = ref(null)
const currentModel = ref('glm-4-flash')

// 用于取消请求
let abortController = null

/**
 * 更新助手消息内容
 */
function updateAssistantMessage(id, content, reasoning) {
  const index = messages.value.findIndex(msg => msg.id === id)
  if (index !== -1) {
    const updatedMessages = [...messages.value]
    updatedMessages[index] = {
      ...updatedMessages[index],
      content,
      reasoning: reasoning ?? updatedMessages[index].reasoning,
      parts: [{ type: 'text', text: content }],
    }
    messages.value = updatedMessages
  }
}

/**
 * 智谱 AI 聊天 hook
 */
export function useZhipuChat(options = {}) {
  const apiKey = import.meta.env.VITE_ZHIPU_API_KEY
  
  // 初始化模型
  if (options.model) {
    currentModel.value = options.model
  }

  // 计算属性
  const isLoading = computed(() => status.value === 'streaming' || status.value === 'submitted')

  /**
   * 发送消息
   */
  async function sendMessage(message) {
    const text = typeof message === 'string' ? message : message.text
    
    if (!text?.trim()) return

    // 重置错误状态
    error.value = null
    status.value = 'submitted'

    // 添加用户消息
    const userMessage = {
      id: nanoid(),
      role: 'user',
      content: text,
      parts: [{ type: 'text', text }],
    }
    messages.value = [...messages.value, userMessage]

    // 创建助手消息占位
    const assistantMessage = {
      id: nanoid(),
      role: 'assistant',
      content: '',
      reasoning: '',
      parts: [{ type: 'text', text: '' }],
    }
    messages.value = [...messages.value, assistantMessage]

    // 创建 AbortController
    abortController = new AbortController()

    try {
      // 准备 API 消息格式
      const apiMessages = messages.value
        .filter(msg => {
          if (msg.role === 'assistant' && !msg.content) return false
          return true
        })
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }))

      const response = await fetch(ZHIPU_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: currentModel.value,
          messages: apiMessages,
          stream: true,
          thinking: { type: 'disabled' },
        }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`)
      }

      status.value = 'streaming'

      // 解析 SSE 流
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''
      let fullReasoning = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue

          const data = trimmedLine.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta || {}
            const content = delta.content || ''
            const reasoning = delta.reasoning_content || ''
            
            if (reasoning) {
              fullReasoning += reasoning
            }
            if (content) {
              fullContent += content
            }
            if (reasoning || content) {
              updateAssistantMessage(assistantMessage.id, fullContent, fullReasoning)
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }

      // 流结束
      status.value = 'idle'
      options.onFinish?.({
        message: {
          role: 'assistant',
          content: fullContent,
        },
        finishReason: 'stop',
      })

    } catch (err) {
      if (err.name === 'AbortError') {
        status.value = 'idle'
        return
      }
      
      error.value = err
      status.value = 'error'
      options.onError?.(err)
      
      // 移除空的助手消息
      messages.value = messages.value.filter(msg => msg.id !== assistantMessage.id)
    } finally {
      abortController = null
    }
  }

  /**
   * 停止生成
   */
  function stop() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    status.value = 'idle'
  }

  /**
   * 清空消息
   */
  function clearMessages() {
    messages.value = []
    error.value = null
    status.value = 'idle'
  }

  /**
   * 设置模型
   */
  function setModel(modelId) {
    currentModel.value = modelId
  }

  /**
   * 重新生成最后一条回复
   */
  async function regenerate() {
    if (messages.value.length < 2) return
    
    const lastAssistantIndex = messages.value.findLastIndex(msg => msg.role === 'assistant')
    if (lastAssistantIndex === -1) return
    
    const lastUserMessage = messages.value
      .slice(0, lastAssistantIndex)
      .findLast(msg => msg.role === 'user')
    
    if (!lastUserMessage) return

    messages.value = messages.value.slice(0, lastAssistantIndex)
    await sendMessage(lastUserMessage.content)
  }

  return {
    messages,
    status,
    error,
    isLoading,
    currentModel,
    sendMessage,
    stop,
    clearMessages,
    setModel,
    regenerate,
  }
}
