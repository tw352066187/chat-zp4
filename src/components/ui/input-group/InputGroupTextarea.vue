<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { Textarea } from '@/components/ui/textarea'
import { computed } from 'vue'

const props = defineProps<{
  class?: HTMLAttributes["class"]
  modelValue?: string | number
  placeholder?: string
  name?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

// 使用 computed 实现双向绑定
const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val as string | number)
})
</script>

<template>
  <Textarea
    v-model="internalValue"
    data-slot="input-group-control"
    :placeholder="placeholder"
    :name="name"
    :class="cn(
      'flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent',
      props.class,
    )"
    v-bind="$attrs"
  />
</template>
