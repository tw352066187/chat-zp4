<script setup lang="ts">
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import type { ChatStatus } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { CheckIcon, GlobeIcon, MicIcon, Trash2Icon } from "lucide-vue-next";
import { computed, ref } from "vue";
import { useZhipuChat } from "@/composables/useZhipuChat";
import { ZHIPU_MODELS, DEFAULT_MODEL } from "@/constants";

// 使用智谱 AI 聊天
const {
  messages: chatMessages,
  status: chatStatus,
  error: chatError,
  currentModel,
  sendMessage,
  stop,
  setModel,
  isLoading,
  clearMessages,
} = useZhipuChat({
  model: DEFAULT_MODEL,
  onError: (err) => console.error('聊天错误:', err),
});

// 状态映射
const status = computed<ChatStatus>(() => chatStatus.value as ChatStatus);

// 模型选择器状态
const modelSelectorOpen = ref(false);
const useWebSearch = ref(false);
const useMicrophone = ref(false);

// 当前选中的模型数据
const selectedModelData = computed(() =>
  ZHIPU_MODELS.find(({ id }) => id === currentModel.value)
);

// 建议列表
const suggestions = [
  "请介绍一下你自己",
  "Vue 3 的 Composition API 有什么优势？",
  "如何使用 TypeScript 开发 Vue 项目？",
  "解释一下 JavaScript 的闭包概念",
];

// 处理消息提交
function handleSubmit({ text, files }: PromptInputMessage) {
  if (isLoading.value) return;
  
  const content = text.trim();
  if (content || files.length) {
    sendMessage({ text: content || "发送了附件" });
  }
}

// 处理建议点击
const handleSuggestionClick = (text: string) => 
  !isLoading.value && sendMessage({ text });

// 处理模型选择
const handleModelSelect = (id: string) => {
  setModel(id);
  modelSelectorOpen.value = false;
};

// 切换状态
const toggleMicrophone = () => (useMicrophone.value = !useMicrophone.value);
const toggleWebSearch = () => (useWebSearch.value = !useWebSearch.value);
</script>

<template>
  <div class="relative flex size-full flex-col divide-y overflow-hidden w-[1000px] mx-auto">
    <!-- 错误提示 -->
    <div v-if="chatError" class="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4">
      <div class="flex">
        <div class="ml-3">
          <p class="text-sm text-red-700">
            {{ chatError.message || '发生错误，请重试' }}
          </p>
        </div>
      </div>
    </div>

    <div class="h-[calc(100vh-240px)]">
      <Conversation>
        <ConversationContent>
          <!-- 空状态提示 -->
          <div v-if="chatMessages.length === 0" class="flex items-center justify-center h-full text-gray-400">
            <div class="text-center">
              <p class="text-lg mb-2">开始与智谱 AI 对话</p>
              <p class="text-sm">选择下方的建议或输入你的问题</p>
            </div>
          </div>

          <!-- 消息列表 -->
          <Message
            v-for="msg in chatMessages"
            :key="msg.id"
            :from="msg.role"
          >
            <MessageContent>
              <MessageResponse
                :content="msg.content"
                :controls="{
                  mermaid: true,
                }"
                :shiki-options="{
                  langs: ['ts', 'vue', 'javascript', 'python', 'css', 'html'],
                }"
              />
            </MessageContent>
          </Message>
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>

    <div class="grid shrink-0 gap-4 pt-4">
      <Suggestions class="px-4">
        <Suggestion
          v-for="suggestion in suggestions"
          :key="suggestion"
          :suggestion="suggestion"
          @click="handleSuggestionClick"
        />
      </Suggestions>

      <div class="w-full px-4 pb-4">
        <PromptInput class="w-full" multiple global-drop @submit="handleSubmit">
          <!-- <PromptInputHeader>
            <PromptInputAttachments>
              <template #default="{ file }">
                <PromptInputAttachment :file="file" />
              </template>
            </PromptInputAttachments>
          </PromptInputHeader> -->

          <PromptInputBody>
            <PromptInputTextarea />
          </PromptInputBody>

          <PromptInputFooter>
            <PromptInputTools>
              <!-- <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu> -->

              <!-- <PromptInputButton
                :variant="useMicrophone ? 'default' : 'ghost'"
                @click="toggleMicrophone"
              >
                <MicIcon :size="16" />
                <span class="sr-only">Microphone</span>
              </PromptInputButton> -->

              <!-- <PromptInputButton
                :variant="useWebSearch ? 'default' : 'ghost'"
                @click="toggleWebSearch"
              >
                <GlobeIcon :size="16" />
                <span>Search</span>
              </PromptInputButton> -->

              

              <ModelSelector v-model:open="modelSelectorOpen">
                <ModelSelectorTrigger as-child>
                  <PromptInputButton>
                    <ModelSelectorLogo
                      v-if="selectedModelData?.chefSlug"
                      :provider="selectedModelData.chefSlug"
                    />
                    <ModelSelectorName v-if="selectedModelData?.name">
                      {{ selectedModelData.name }}
                    </ModelSelectorName>
                  </PromptInputButton>
                </ModelSelectorTrigger>

                <ModelSelectorContent>
                  <ModelSelectorInput placeholder="搜索模型..." />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>未找到模型</ModelSelectorEmpty>

                    <ModelSelectorGroup heading="智谱">
                      <ModelSelectorItem
                        v-for="m in ZHIPU_MODELS"
                        :key="m.id"
                        :value="m.id"
                        @select="() => handleModelSelect(m.id)"
                      >
                        <ModelSelectorLogo :provider="m.chefSlug" />
                        <ModelSelectorName>{{ m.name }}</ModelSelectorName>
                        <span class="text-xs text-gray-500 ml-2">{{ m.description }}</span>
                        <CheckIcon
                          v-if="currentModel === m.id"
                          class="ml-auto size-4"
                        />
                        <div v-else class="ml-auto size-4" />
                      </ModelSelectorItem>
                    </ModelSelectorGroup>
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>
              <!-- 清空对话按钮 -->
              <PromptInputButton
                v-if="chatMessages.length > 0"
                variant="ghost"
                :disabled="isLoading"
                @click="clearMessages"
              >
                <Trash2Icon :size="16" />
                <span>清空对话</span>
              </PromptInputButton>
            </PromptInputTools>

            <PromptInputSubmit
              :disabled="false"
              :status="status"
              @stop="stop"
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  </div>
</template>
