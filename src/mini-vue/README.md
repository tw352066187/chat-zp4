# 手写 Vue createApp 实现

## 📖 项目说明

这是一个简化版的 Vue 3 `createApp` 实现，用于理解 Vue 核心原理。

## 🎯 实现的功能

### 1. 响应式系统
- `reactive()` - 创建响应式对象
- `ref()` - 创建响应式引用
- 自动依赖追踪和更新

### 2. 组件系统
- `setup()` - Composition API
- `render()` - 渲染函数
- 组件生命周期（挂载、更新）

### 3. 渲染器
- VNode 创建
- DOM 挂载
- 事件处理
- 属性绑定

### 4. 应用实例
- `createApp()` - 创建应用
- `mount()` - 挂载应用
- `unmount()` - 卸载应用
- `use()` - 插件系统
- `component()` - 全局组件注册
- `provide()` - 依赖注入

## 🚀 如何运行

### 方法一：直接打开 HTML
```bash
# 在浏览器中打开
open src/mini-vue/example.html
```

### 方法二：使用本地服务器
```bash
# 使用 Python
python -m http.server 8080

# 或使用 Node.js
npx serve .

# 然后访问
# http://localhost:8080/src/mini-vue/example.html
```

## 📝 核心代码解析

### 1. 响应式实现
```javascript
function reactive(target) {
  return new Proxy(target, {
    get(target, key) {
      // 依赖收集
      return target[key]
    },
    set(target, key, value) {
      target[key] = value
      // 触发更新
      update()
      return true
    }
  })
}
```

### 2. createApp 实现
```javascript
function createApp(rootComponent) {
  const app = {
    mount(container) {
      // 1. 创建 VNode
      const vnode = createVNode(rootComponent)
      
      // 2. 渲染到 DOM
      render(vnode, container)
    },
    
    use(plugin) {
      plugin.install(app)
      return app
    }
  }
  
  return app
}
```

### 3. 渲染流程
```
createApp(Component)
  ↓
mount('#app')
  ↓
创建 VNode
  ↓
执行 setup()
  ↓
执行 render()
  ↓
挂载到 DOM
  ↓
响应式更新
```

## 🔍 与真实 Vue 的区别

### 简化的部分
1. **响应式系统**
   - 真实：effect、track、trigger、依赖收集
   - 简化：全局 update 函数

2. **虚拟 DOM**
   - 真实：完整的 diff 算法
   - 简化：直接重新渲染

3. **组件系统**
   - 真实：完整的生命周期钩子
   - 简化：只有挂载和更新

4. **编译器**
   - 真实：模板编译成 render 函数
   - 简化：直接写 render 函数

### 保留的核心概念
✅ 响应式原理（Proxy）  
✅ 组件挂载流程  
✅ VNode 结构  
✅ 插件系统  
✅ 链式调用  

## 💡 学习要点

### 1. 理解响应式
打开控制台，点击按钮，观察日志：
```
[响应式] 读取属性: value
[响应式] 设置属性: value = 1
[生命周期] 组件更新
```

### 2. 理解渲染流程
查看挂载过程的日志：
```
[应用] 开始挂载到: #app
[生命周期] 组件挂载
[应用] 挂载完成
```

### 3. 理解插件系统
```javascript
const plugin = {
  install(app) {
    // 扩展应用功能
  }
}
app.use(plugin)
```

## 🎓 扩展练习

1. **添加 computed 计算属性**
2. **实现 watch 侦听器**
3. **添加更多生命周期钩子**
4. **实现简单的 diff 算法**
5. **支持模板语法编译**

## 📚 相关资源

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vue 3 源码](https://github.com/vuejs/core)
- [Vue 3 设计与实现](https://book.douban.com/subject/35768338/)

## ⚠️ 注意事项

这只是一个教学示例，不要在生产环境使用！

真实的 Vue 3 有：
- 完整的错误处理
- 性能优化
- 边界情况处理
- 完整的 TypeScript 支持
- 更多的 API 和功能
