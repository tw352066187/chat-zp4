import { Ref, ComputedRef } from 'vue'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  parts?: Array<{ type: 'text'; text: string }>
}

export interface UseZhipuChatOptions {
  model?: string
  onError?: (error: Error) => void
  onFinish?: (result: { message: Message; finishReason: string }) => void
}

export interface UseZhipuChatReturn {
  messages: Ref<Message[]>
  status: Ref<'idle' | 'submitted' | 'streaming' | 'error'>
  error: Ref<Error | null>
  isLoading: ComputedRef<boolean>
  currentModel: Ref<string>
  sendMessage: (message: string | { text: string }) => Promise<void>
  stop: () => void
  clearMessages: () => void
  setModel: (modelId: string) => void
  regenerate: () => Promise<void>
}

export function useZhipuChat(options?: UseZhipuChatOptions): UseZhipuChatReturn
