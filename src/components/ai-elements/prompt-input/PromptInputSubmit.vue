<script setup lang="ts">
import type { ChatStatus } from 'ai'
import type { HTMLAttributes } from 'vue'
import { InputGroupButton } from '@/components/ui/input-group'
import { cn } from '@/lib/utils'
import { CornerDownLeftIcon, Loader2Icon, SquareIcon, XIcon } from 'lucide-vue-next'
import { computed } from 'vue'

type InputGroupButtonProps = InstanceType<typeof InputGroupButton>['$props']

interface Props extends /* @vue-ignore */ InputGroupButtonProps {
  class?: HTMLAttributes['class']
  status?: ChatStatus
  variant?: InputGroupButtonProps['variant']
  size?: InputGroupButtonProps['size']
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'icon-sm',
})

const emit = defineEmits<{
  stop: []
}>()

// 是否处于加载状态（可以停止）
const isStreaming = computed(() => props.status === 'streaming' || props.status === 'submitted')

const icon = computed(() => {
  if (props.status === 'submitted') {
    return Loader2Icon
  }
  else if (props.status === 'streaming') {
    return SquareIcon
  }
  else if (props.status === 'error') {
    return XIcon
  }
  return CornerDownLeftIcon
})

const iconClass = computed(() => {
  if (props.status === 'submitted') {
    return 'size-4 animate-spin'
  }
  return 'size-4'
})

// 处理点击事件
function handleClick(e: MouseEvent) {
  if (isStreaming.value) {
    e.preventDefault()
    emit('stop')
  }
}

const { status, size, variant, class: _, ...restProps } = props
</script>

<template>
  <InputGroupButton
    aria-label="Submit"
    :class="cn(props.class)"
    :size="size"
    :variant="isStreaming ? 'destructive' : variant"
    :type="isStreaming ? 'button' : 'submit'"
    v-bind="restProps"
    @click="handleClick"
  >
    <slot>
      <component :is="icon" :class="iconClass" />
    </slot>
  </InputGroupButton>
</template>
