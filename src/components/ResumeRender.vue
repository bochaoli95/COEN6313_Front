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

const PAPER = {
  A4: { w: 210, h: 297 },
  'US Letter': { w: 216, h: 279 },
  'US Legal': { w: 216, h: 356 }
}

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

    const getPaperPx = (paper, dimension) => {
      const config = PAPER[paper] || PAPER.A4
      const mmValue = dimension === 'h' ? config.h : config.w
      return (mmValue * 3.78)
    }

    const onFontLoaded = (styles) => {
      return new Promise(resolve => {
        setTimeout(resolve, 100)
      })
    }

    const forceUpdate = () => {
      if (smartRef.value) {
        smartRef.value.resolvePages(100)
      }
    }

    const updateStyles = () => {
      const dynamicCss = `
        #vue-smart-pages-${props.id} {
          font-family: ${props.styles.fontEN.name || 'Verdana'}, ${props.styles.fontCJK.name || 'SimSun'};
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
      
      const oldDynamicStyle = document.getElementById(`dynamic-${props.id}`)
      if (oldDynamicStyle) oldDynamicStyle.remove()
      
      const dynamicStyle = document.createElement('style')
      dynamicStyle.id = `dynamic-${props.id}`
      dynamicStyle.textContent = dynamicCss
      document.head.appendChild(dynamicStyle)
      
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
