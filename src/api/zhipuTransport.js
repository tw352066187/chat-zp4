/**
 * 智谱 AI 自定义 Transport
 * 用于 AI SDK 的 useChat hook，直接调用智谱 API
 */

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

/**
 * 解析 SSE 数据行
 * @param {string} line - SSE 数据行
 * @returns {Object|null} - 解析后的数据对象
 */
function parseSSELine(line) {
  if (!line.startsWith('data: ')) {
    return null
  }
  
  const data = line.slice(6).trim()
  
  // 检查是否是结束标记
  if (data === '[DONE]') {
    return { done: true }
  }
  
  try {
    return JSON.parse(data)
  } catch (e) {
    console.warn('解析 SSE 数据失败:', data)
    return null
  }
}

/**
 * 将 UI 消息转换为智谱 API 格式
 * @param {Array} messages - UI 消息数组
 * @returns {Array} - API 格式的消息数组
 */
function convertToApiMessages(messages) {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content || msg.parts?.find(p => p.type === 'text')?.text || ''
  }))
}

/**
 * 智谱 AI Chat Transport
 * 实现 AI SDK 的 ChatTransport 接口
 */
export class ZhipuChatTransport {
  constructor(options = {}) {
    this.apiKey = options.apiKey
    this.model = options.model || 'glm-4-flash'
    this.temperature = options.temperature ?? 0.7
    this.maxTokens = options.maxTokens
  }

  /**
   * 发送消息并返回流式响应
   * @param {Object} params - 请求参数
   * @returns {Promise<Response>} - 流式响应
   */
  async sendMessages({ messages, abortSignal }) {
    const apiMessages = convertToApiMessages(messages)
    
    const requestBody = {
      model: this.model,
      messages: apiMessages,
      stream: true,
      temperature: this.temperature,
    }
    
    if (this.maxTokens) {
      requestBody.max_tokens = this.maxTokens
    }

    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: abortSignal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`)
    }

    return this.createStreamResponse(response)
  }

  /**
   * 创建流式响应，转换为 AI SDK 期望的格式
   * @param {Response} response - fetch 响应
   * @returns {Response} - 转换后的响应
   */
  createStreamResponse(response) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read()
          
          if (done) {
            // 发送结束标记
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
            controller.close()
            return
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine) continue
            
            const parsed = parseSSELine(trimmedLine)
            if (!parsed) continue
            
            if (parsed.done) {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
              continue
            }

            // 转换为 AI SDK 格式
            const content = parsed.choices?.[0]?.delta?.content || ''
            if (content) {
              const aiSdkChunk = {
                type: 'text-delta',
                textDelta: content,
              }
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify(aiSdkChunk)}\n\n`)
              )
            }
          }
        } catch (error) {
          controller.error(error)
        }
      },
      cancel() {
        reader.cancel()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  }
}

/**
 * 创建智谱 Transport 实例
 * @param {Object} options - 配置选项
 * @returns {ZhipuChatTransport} - Transport 实例
 */
export function createZhipuTransport(options = {}) {
  return new ZhipuChatTransport({
    apiKey: options.apiKey || import.meta.env.VITE_ZHIPU_API_KEY,
    model: options.model || 'glm-4-flash',
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  })
}

export { parseSSELine, convertToApiMessages }
