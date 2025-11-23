<template>
  <div
    ref="smartPagesRef"
    class="vue-smart-pages"
    :id="pageId"
    v-html="content"
  ></div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'

export default {
  name: 'SmartPages',
  props: {
    id: {
      type: String,
      required: true
    },
    content: {
      type: String,
      default: ''
    },
    height: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    top: {
      type: Number,
      default: 0
    },
    bottom: {
      type: Number,
      default: 0
    },
    left: {
      type: Number,
      default: 0
    },
    right: {
      type: Number,
      default: 0
    },
    watch: {
      type: Array,
      default: () => []
    },
    watchDelay: {
      type: Array,
      default: () => []
    },
    beforeBreakPage: {
      type: Function,
      default: null
    },
    afterBreakPage: {
      type: Function,
      default: null
    }
  },
  setup(props, { expose }) {
    const smartPagesRef = ref(null)
    const pageId = `vue-smart-pages-${props.id}`

    // 简化的CSS更新
    const updateCSS = () => {
      const existingStyle = document.getElementById(`smart-pages-${props.id}`)
      if (existingStyle) {
        existingStyle.remove()
      }
      
      const css = `#${pageId} {
        padding: ${props.top}px ${props.right}px ${props.bottom}px ${props.left}px;
        width: ${props.width}mm;
      }`
      
      const style = document.createElement('style')
      style.id = `smart-pages-${props.id}`
      style.textContent = css
      document.head.appendChild(style)
    }

    // 简化的分页逻辑
    const breakPage = () => {
      const element = document.getElementById(pageId)
      if (!element) return

      const maxHeight = props.height - props.top - props.bottom
      const children = Array.from(element.children)
      let currentHeight = 0

      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const childHeight = child.offsetHeight
        
        if (currentHeight + childHeight > maxHeight && currentHeight > 0) {
          child.style.pageBreakBefore = 'always'
          currentHeight = childHeight
        } else {
          currentHeight += childHeight
        }
      }
    }

    // 解析页面
    const resolvePages = (delay = 0) => {
      updateCSS()

      const resolveBreak = () => {
        breakPage()
        if (props.afterBreakPage) props.afterBreakPage()
      }

      if (props.beforeBreakPage) {
        const fn = props.beforeBreakPage()
        if (fn && typeof fn.then === 'function') {
          if (delay) fn.then(() => setTimeout(resolveBreak, delay))
          else fn.then(resolveBreak)
          return
        }
      }

      if (delay) setTimeout(resolveBreak, delay)
      else resolveBreak()
    }

    // 简化的防抖函数
    let debounceTimer = null
    const debounce = (func, wait) => {
      return (...args) => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => func.apply(this, args), wait)
      }
    }

    // 监听变化
    onMounted(() => {
      // 监听样式变化
      watch(
        () => [
          props.top,
          props.bottom,
          props.left,
          props.right,
          props.width,
          props.content,
          props.height,
          ...props.watch
        ],
        debounce(resolvePages, 200)
      )

      // 字体更新等延迟操作
      watch(
        () => props.watchDelay,
        debounce(() => resolvePages(100), 200)
      )

      // 初始化样式
      updateCSS()
    })

    expose({
      resolvePages
    })

    return {
      smartPagesRef,
      pageId
    }
  }
}
</script>

<style scoped>
.vue-smart-pages {
  min-height: 100%;
}
</style>
