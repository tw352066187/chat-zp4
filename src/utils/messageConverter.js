/**
 * 消息格式转换工具
 * 将 useZhipuChat 返回的消息格式转换为现有组件期望的格式
 */

/**
 * 将单个消息转换为显示格式
 * @param {Object} message - useZhipuChat 返回的消息
 * @returns {Object} - 组件期望的消息格式
 */
export function convertToDisplayMessage(message) {
  return {
    key: message.id,
    from: message.role === 'user' ? 'user' : 'assistant',
    versions: [{
      id: message.id,
      content: message.content || '',
    }],
    // 可选字段
    sources: message.sources || undefined,
    reasoning: message.reasoning || undefined,
    tools: message.tools || undefined,
  }
}

/**
 * 将消息列表转换为显示格式
 * @param {Array} messages - useZhipuChat 返回的消息列表
 * @returns {Array} - 组件期望的消息列表格式
 */
export function convertToDisplayMessages(messages) {
  return messages.map(convertToDisplayMessage)
}

/**
 * 将显示格式的消息转换回 API 格式
 * @param {Object} displayMessage - 显示格式的消息
 * @returns {Object} - API 格式的消息
 */
export function convertFromDisplayMessage(displayMessage) {
  return {
    id: displayMessage.key,
    role: displayMessage.from === 'user' ? 'user' : 'assistant',
    content: displayMessage.versions[0]?.content || '',
  }
}

/**
 * 将显示格式的消息列表转换回 API 格式
 * @param {Array} displayMessages - 显示格式的消息列表
 * @returns {Array} - API 格式的消息列表
 */
export function convertFromDisplayMessages(displayMessages) {
  return displayMessages.map(convertFromDisplayMessage)
}
