import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 示例 store
export const useCounterStore = defineStore('counter', () => {
  // 状态
  const count = ref(0)

  // 计算属性
  const doubleCount = computed(() => count.value * 2)

  // 方法
  const increment = () => {
    count.value++
  }

  const decrement = () => {
    count.value--
  }

  return {
    count,
    doubleCount,
    increment,
    decrement,
  }
})
