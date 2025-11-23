<template>
  <SmartPages
    :id="id"
    ref="smartRef"
    :content="renderMarkdown(markdown)"
    :height="getPaperPx(styles.paper, 'h')"
    :width="PAPER[styles.paper].w"
    :top="styles.marginV"
    :bottom="Math.max(styles.marginV - 10, CHROME_PRINT_BOTTOM)"
    :left="styles.marginH"
    :right="styles.marginH"
    :before-break-page="() => onFontLoaded(styles)"
    :watch="[styles.lineHeight, styles.paragraphSpace, styles.fontSize, css]"
    :watch-delay="[styles.fontCJK, styles.fontEN]"
  />
</template>

<script>
import { ref, watch, computed } from 'vue'
import SmartPages from './SmartPages.vue'
import { renderMarkdown } from '../utils/markdown.js'

// 纸张尺寸配置 - 复制原项目
const PAPER = {
  A4: { w: 210, h: 297 },
  'US Letter': { w: 216, h: 279 },
  'US Legal': { w: 216, h: 356 }
}

// Chrome打印底部边距
const CHROME_PRINT_BOTTOM = 20

export default {
  name: 'ResumeRender',
  components: {
    SmartPages
  },
  props: {
    id: {
      type: String,
      required: true
    },
    markdown: {
      type: String,
      default: ''
    },
    css: {
      type: String,
      default: ''
    },
    styles: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const smartRef = ref(null)

    // 获取纸张像素高度 - 复制原项目逻辑
    const getPaperPx = (paper, dimension) => {
      const config = PAPER[paper] || PAPER.A4
      const mmValue = dimension === 'h' ? config.h : config.w
      return (mmValue * 3.78) // 1mm ≈ 3.78px
    }

    // 字体加载完成回调 - 复制原项目逻辑
    const onFontLoaded = (styles) => {
      return new Promise(resolve => {
        // 模拟字体加载延迟
        setTimeout(resolve, 100)
      })
    }

    // 强制更新 - 复制原项目逻辑
    const forceUpdate = () => {
      if (smartRef.value) {
        smartRef.value.resolvePages(100)
      }
    }

    // 简化的样式更新
    const updateStyles = () => {
      // 动态样式
      const dynamicCss = `
        #vue-smart-pages-${props.id} {
          font-family: ${props.styles.fontEN.name || 'Verdana'}, ${props.styles.fontCJK.name || '华康宋体'};
          font-size: ${props.styles.fontSize}px;
          line-height: ${props.styles.lineHeight};
        }
        #vue-smart-pages-${props.id} h1, #vue-smart-pages-${props.id} h2, #vue-smart-pages-${props.id} h3 {
          color: ${props.styles.themeColor};
        }
        #vue-smart-pages-${props.id} h2 {
          margin-top: ${props.styles.paragraphSpace}px;
        }
      `
      
      // 移除旧样式
      const oldDynamicStyle = document.getElementById(`dynamic-${props.id}`)
      if (oldDynamicStyle) oldDynamicStyle.remove()
      
      // 添加动态样式
      const dynamicStyle = document.createElement('style')
      dynamicStyle.id = `dynamic-${props.id}`
      dynamicStyle.textContent = dynamicCss
      document.head.appendChild(dynamicStyle)
      
      // 用户CSS
      if (props.css) {
        const userCss = props.css.replaceAll('#vue-smart-pages-preview', `#vue-smart-pages-${props.id}`)
        
        const oldUserStyle = document.getElementById(`user-${props.id}`)
        if (oldUserStyle) oldUserStyle.remove()
        
        const userStyle = document.createElement('style')
        userStyle.id = `user-${props.id}`
        userStyle.textContent = userCss
        document.head.appendChild(userStyle)
      }
    }

    // 监听样式变化
    watch(
      [() => props.styles, () => props.css],
      updateStyles,
      { immediate: true, deep: true }
    )

    return {
      smartRef,
      renderMarkdown,
      getPaperPx,
      onFontLoaded,
      forceUpdate,
      PAPER,
      CHROME_PRINT_BOTTOM
    }
  }
}
</script>
