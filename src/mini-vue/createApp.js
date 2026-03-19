/**
 * 简化版 Vue createApp 实现
 * 用于理解 Vue 3 的核心原理
 */

// 创建响应式对象（简化版）
function reactive(target) {
  return new Proxy(target, {
    get(target, key) {
      const result = target[key]
      console.log(`[响应式] 读取属性: ${key}`)
      return result
    },
    set(target, key, value) {
      console.log(`[响应式] 设置属性: ${key} = ${value}`)
      target[key] = value
      // 触发更新
      update()
      return true
    }
  })
}

// 创建 ref（简化版）
function ref(value) {
  return reactive({ value })
}

// 全局更新函数（简化版，实际 Vue 中每个组件有自己的更新函数）
let currentUpdateFn = null
function update() {
  if (currentUpdateFn) {
    currentUpdateFn()
  }
}

// 创建 VNode
function createVNode(type, props = {}, children = null) {
  return {
    type,
    props,
    children,
    el: null, // 真实 DOM 元素
    component: null // 组件实例
  }
}

// 渲染器：将 VNode 渲染成真实 DOM
function createRenderer() {
  // 挂载元素
  function mountElement(vnode, container) {
    const el = document.createElement(vnode.type)
    vnode.el = el

    // 处理 props
    if (vnode.props) {
      for (const key in vnode.props) {
        const value = vnode.props[key]
        
        // 事件处理
        if (key.startsWith('on')) {
          const eventName = key.slice(2).toLowerCase()
          el.addEventListener(eventName, value)
        } else {
          // 属性设置
          el.setAttribute(key, value)
        }
      }
    }

    // 处理子节点
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach(child => {
        mount(child, el)
      })
    }

    container.appendChild(el)
  }

  // 挂载组件
  function mountComponent(vnode, container) {
    const component = vnode.type
    
    // 创建组件实例
    const instance = {
      vnode,
      type: component,
      setupState: null,
      isMounted: false,
      subTree: null
    }
    
    vnode.component = instance

    // 执行 setup
    if (component.setup) {
      const setupResult = component.setup(vnode.props)
      instance.setupState = setupResult
    }

    // 创建渲染效果
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        console.log('[生命周期] 组件挂载')
        
        // 首次挂载
        const subTree = component.render.call(instance.setupState)
        instance.subTree = subTree
        
        mount(subTree, container)
        instance.isMounted = true
      } else {
        console.log('[生命周期] 组件更新')
        
        // 更新（简化版，实际需要 diff 算法）
        const newSubTree = component.render.call(instance.setupState)
        const oldSubTree = instance.subTree
        
        // 简单粗暴：清空重新渲染
        container.innerHTML = ''
        mount(newSubTree, container)
        
        instance.subTree = newSubTree
      }
    }

    // 设置全局更新函数
    currentUpdateFn = componentUpdateFn
    
    // 首次执行
    componentUpdateFn()
  }

  // 统一挂载入口
  function mount(vnode, container) {
    if (typeof vnode.type === 'string') {
      // 普通元素
      mountElement(vnode, container)
    } else if (typeof vnode.type === 'object') {
      // 组件
      mountComponent(vnode, container)
    }
  }

  // 渲染函数
  function render(vnode, container) {
    if (vnode) {
      mount(vnode, container)
    } else {
      // 卸载
      container.innerHTML = ''
    }
  }

  return {
    render,
    createApp: createAppAPI(render)
  }
}

// 创建应用 API
function createAppAPI(render) {
  return function createApp(rootComponent) {
    // 创建应用上下文
    const context = {
      config: {
        globalProperties: {}
      },
      components: {},
      directives: {},
      provides: {}
    }

    const installedPlugins = new Set()
    let isMounted = false

    // 应用实例
    const app = {
      _component: rootComponent,
      _container: null,
      _context: context,

      // 使用插件
      use(plugin, ...options) {
        if (installedPlugins.has(plugin)) {
          console.warn('[警告] 插件已安装')
          return app
        }

        if (plugin && typeof plugin.install === 'function') {
          installedPlugins.add(plugin)
          plugin.install(app, ...options)
          console.log('[插件] 安装成功:', plugin.name || '匿名插件')
        }

        return app
      },

      // 注册全局组件
      component(name, component) {
        if (!component) {
          return context.components[name]
        }
        console.log('[组件] 注册全局组件:', name)
        context.components[name] = component
        return app
      },

      // 提供依赖注入
      provide(key, value) {
        console.log('[依赖注入] 提供:', key)
        context.provides[key] = value
        return app
      },

      // 挂载应用
      mount(rootContainer) {
        if (!isMounted) {
          console.log('[应用] 开始挂载到:', rootContainer)
          
          // 获取容器
          const container = typeof rootContainer === 'string'
            ? document.querySelector(rootContainer)
            : rootContainer

          if (!container) {
            console.error('[错误] 找不到挂载容器')
            return
          }

          // 清空容器
          container.innerHTML = ''

          // 创建根 VNode
          const vnode = createVNode(rootComponent)
          vnode.appContext = context

          // 渲染
          render(vnode, container)

          isMounted = true
          app._container = container

          console.log('[应用] 挂载完成')

          return vnode.component?.setupState
        }
      },

      // 卸载应用
      unmount() {
        if (isMounted) {
          console.log('[应用] 卸载')
          render(null, app._container)
          isMounted = false
        }
      }
    }

    return app
  }
}

// 导出 API
export function createApp(rootComponent) {
  const renderer = createRenderer()
  return renderer.createApp(rootComponent)
}

export { reactive, ref, createVNode }
