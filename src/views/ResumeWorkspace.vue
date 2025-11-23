<template>
  <div class="container">
    <div class="resume-panel">
      <div class="main-tabs">
        <div 
          class="tab" 
          :class="{ active: mainTab === 'markdown' }"
          @click="mainTab = 'markdown'"
        >
          Markdown
        </div>
        <div 
          class="tab" 
          :class="{ active: mainTab === 'preview' }"
          @click="mainTab = 'preview'"
        >
          Preview
        </div>
      </div>
      
      <div class="content-area">
        <!-- Preview模式 -->
        <div v-if="mainTab === 'preview'" class="preview-content">
          <ResumeRender
            ref="resumeRenderRef"
            id="preview"
            :markdown="markdownContent"
            :css="cssContent"
            :styles="resumeStyles"
          />
        </div>
        
        <!-- Markdown模式 -->
        <div v-else class="markdown-content">
          <!-- 子标签：MD和CSS -->
          <div class="sub-tabs">
            <div 
              class="sub-tab" 
              :class="{ active: currentTab === 'markdown' }"
              @click="switchTab('markdown')"
            >
              MD
            </div>
            <div 
              class="sub-tab" 
              :class="{ active: currentTab === 'css' }"
              @click="switchTab('css')"
            >
              CSS
            </div>
          </div>
          
          <!-- 编辑器内容 -->
          <div class="editor-content">
            <textarea
              v-if="currentTab === 'markdown'"
              v-model="markdownContent"
              class="editor"
              placeholder="在这里输入Markdown内容..."
              @input="updatePreview"
            ></textarea>
            
            <textarea
              v-else
              v-model="cssContent"
              class="editor"
              placeholder="在这里输入CSS样式..."
              @input="updatePreview"
            ></textarea>
          </div>
        </div>
      </div>
      
      <div class="status-bar">
        <span>{{ statusText }}</span>
        <div>
          <button class="btn" @click="exportPDF">Export PDF</button>
          <button class="btn btn-secondary" @click="resetContent">Reset</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick, inject } from 'vue'
import ResumeRender from '../components/ResumeRender.vue'

export default {
  name: 'App',
  components: {
    ResumeRender
  },
  setup() {
    // 注入共享的resume_md和sessionId
    const resumeMd = inject('resumeMd', ref(''))
    const currentSessionId = inject('currentSessionId', ref(null))
    
    console.log('ResumeWorkspace: resumeMd injected', resumeMd)
    
    // 响应式数据
    const mainTab = ref('markdown') // 'markdown' 或 'preview'
    const currentTab = ref('markdown') // 'markdown' 或 'css' (在Markdown模式下的子标签)
    const markdownContent = ref('')
    const cssContent = ref('')
    const statusText = ref('就绪')
    const resumeRenderRef = ref(null)
    
    // 简历样式配置
    const resumeStyles = ref({
      marginV: 55,
      marginH: 30,
      lineHeight: 1.3,
      paragraphSpace: 5,
      themeColor: '#000000',
      fontCJK: {
        name: '华康宋体',
        fontFamily: 'HKST'
      },
      fontEN: {
        name: 'Verdana'
      },
      fontSize: 12,
      paper: 'A4'
    })
    
    // 默认内容 - 使用原项目的示例
    const defaultMarkdown = `---
---

# Bruce Wayne

<span class="iconify" data-icon="charm:person"></span> [example.com](https://example.com/)
  : <span class="iconify" data-icon="tabler:brand-github"></span> [github.com/example](https://github.com/example)
  : <span class="iconify" data-icon="tabler:phone"></span> [(+1) 123-456-7890](https://wa.me/11234567890)

<span class="iconify" data-icon="ic:outline-location-on"></span> 1234 Abc Street, Example, EX 01234
  : <span class="iconify" data-icon="tabler:brand-linkedin"></span> [linkedin.com/in/example](https://linkedin.com/in/example/)
  : <span class="iconify" data-icon="tabler:mail"></span> [email@example.com](mailto:email@example.com)

## Experience

**Machine Learning Engineer Intern**
  : **Slow Feet Technology**
  : **Jul 2021 - Present**

- Devised a new food-agnostic formulation for fine-grained cross-ingredient meal cooking and subsumed the recent popular works into the proposed scheme
- Proposed a cream of mushroom soup recipe which is competitive when compared with the SOTA recipes with complex steps by only altering the way of cutting mushroom, published in NeurIPS 2099 (see [~P1])
- Developed a pan for meal cooking which is benefiting the group members' research work


**Reseach Intern**
  : **Paddling University**
  : **Aug 2020 - Present**

- Designed an efficient method for mapo tofu quality estimation via thermometer
- Proposed a fast stir frying algorithm for tofu cooking problems, which specifies the amount of the hot sauce instead of using terms like "as much as you can", published in CVPR 2077 (see [~P2])
- Outperformed SOTA methods while cooking much more efficient in experiments on popular tofu


**Research Assistant**
  : **Huangdu Institute of Technology**
  : **Mar 2020 - Jun 2020**

- Proposed a novel framework consisting of a spoon and a pair of chopsticks for eating mapo toufu
- Designed a tofu filtering strategy inspired by beans grinding method for building a dataset for this new task
- Designed two new evaluation criteria to assess the novelty and diversity of the eating plans
- Outperformed baselines and existed methods substantially in terms of diversity, novelty and coherence


**Reseach Intern**
  : **Paddling University**
  : **Jul 2018 - Aug 2018**

- Designed two sandwiches consisting of breads and meat of two traditional bacon cheese burgers to make use of unused ingredients
- Utilized the structure duality to boost the cooking speed of two dual tasks based on shared ingredients
- Outperformed strong baselines on QWE'15 and ASDF'14 dataset

## Education

**M.S. in Computer Science**
  : **Sep 2021 - Jan 2023**

University of Charles River
  : Boston, MA

**B.Eng. in Software Engineering**
  : **Sep 2016 - Jul 2020**

Huangdu Institute of Technology
  : Shanghai, China

## Skills

**Programming Languages:** <span class="iconify" data-icon="vscode-icons:file-type-python"></span> Python, <span class="iconify" data-icon="vscode-icons:file-type-js-official"></span> JavaScript / <span class="iconify" data-icon="vscode-icons:file-type-typescript-official"></span> TypeScript, <span class="iconify" data-icon="vscode-icons:file-type-html"></span> HTML / <span class="iconify" data-icon="vscode-icons:file-type-css"></span> CSS, <span class="iconify" data-icon="logos:java" data-inline="false"></span> Java

**Tools and Frameworks:** Git, PyTorch, Keras, scikit-learn, Linux, Vue, React, Django, $\\LaTeX$

**Languages:** English (proficient), Indonesia (native)

## Awards and Honors

**Gold**, International Collegiate Catching Fish Contest (ICCFC)
  : 2018

**First Prize**, China National Scholarship for Outstanding Dragons
  : 2017, 2018

## Publications

[~P1]: **Eating is All You Need**

    <u>Haha Ha</u>, San Zhang

    *Conference on Neural Information Processing Systems (NeurIPS), 2099*

[~P2]: **You Only Cook Once: Unified, Real-Time Mapo Tofu Recipe**

    <u>Haha Ha</u>, San Zhang, Si Li, Wu Wang

    *Computer Vision and Pattern Recognition Conference (CVPR), 2077 **(Best Paper Honorable Mention)***`

    const defaultCSS = `/* Backbone CSS for Resume Template 1 */

/* Basic */
#vue-smart-pages-preview {
  background-color: white;
  color: black;
  text-align: left;
  -moz-hyphens: auto;
  -ms-hyphens: auto;
  -webkit-hyphens: auto;
  hyphens: auto;
}

#vue-smart-pages-preview p,
#vue-smart-pages-preview li,
#vue-smart-pages-preview dl {
  margin: 0;
}

/* Headings */
#vue-smart-pages-preview h1,
#vue-smart-pages-preview h2,
#vue-smart-pages-preview h3 {
  font-weight: bold;
}

#vue-smart-pages-preview h1 {
  font-size: 2.5em;
  letter-spacing: 0.1em;
  text-align: center;
  margin-bottom: 0.25em;
}

#vue-smart-pages-preview h2,
#vue-smart-pages-preview h3 {
  margin-bottom: 0.25em;
  margin-top: 1.0em;
  font-size: 1.2em;
}

#vue-smart-pages-preview h1,
#vue-smart-pages-preview h2 {
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-bottom-color: darkgrey;
}

/* Lists */
#vue-smart-pages-preview ul,
#vue-smart-pages-preview ol {
  padding-left: 1.5em;
  margin: 0.2em 0 1.0em 0;
}

#vue-smart-pages-preview ul {
  list-style-type: disc;
}

#vue-smart-pages-preview ol {
  list-style-type: decimal;
}

/* Definition Lists */
#vue-smart-pages-preview dl {
  display: flex;
}

#vue-smart-pages-preview dl dt,
#vue-smart-pages-preview dl dd:not(:last-child) {
  flex: 1;
}

/* Tex */
#vue-smart-pages-preview :not(span.katex-display) > span.katex {
  font-size: 1em !important;
}

/* SVG & Images */
#vue-smart-pages-preview svg.iconify {
  vertical-align: -0.2em;
}

#vue-smart-pages-preview img {
  max-width: 100%;
}

/* Header */
#vue-smart-pages-preview .resume-header {
  text-align: center;
}

#vue-smart-pages-preview .resume-header h1 {
  text-align: center;
  line-height: 1;
  margin-bottom: 8px;
}

#vue-smart-pages-preview .resume-header-item:not(.no-separator)::after {
  content: " | ";
}

/* Citations */
#vue-smart-pages-preview ul.crossref-list {
  padding-left: 1.2em;
}

#vue-smart-pages-preview li.crossref-item p {
  margin-left: 0.5em;
}

#vue-smart-pages-preview li.crossref-item::marker {
  content: attr(data-caption);
}

#vue-smart-pages-preview sup.crossref-ref {
  font-size: 100%;
  top: 0;
}

/* Dark & print mode */
.dark #vue-smart-pages-preview {
  background-color: #334155;
  color: #e5e7eb;
}

@media print {
  #vue-smart-pages-preview {
    background-color: white !important;
    color: black !important;
  }

  .dark #vue-smart-pages-preview a {
    color: black !important;
  }
}`

    // 切换标签页
    const switchTab = (tab) => {
      currentTab.value = tab
    }

    // 更新预览
    const updatePreview = async () => {
      try {
        statusText.value = '正在渲染...'
        
        await nextTick()
        
        // 强制更新ResumeRender组件
        if (resumeRenderRef.value) {
          resumeRenderRef.value.forceUpdate()
        }
        
        statusText.value = 'Done'
      } catch (error) {
        console.error('渲染错误:', error)
        statusText.value = '渲染失败: ' + error.message
      }
    }

    // 导出PDF
    const exportPDF = async () => {
      if (mainTab.value !== 'preview') {
        alert('请先切换到Preview标签页')
        return
      }
      
      statusText.value = '正在导出PDF...'
      
      try {
        await nextTick()
        
        // 获取预览区域的DOM元素
        const previewElement = document.getElementById('vue-smart-pages-preview')
        if (!previewElement) {
          throw new Error('找不到预览内容')
        }
        
        // 获取所有相关的样式
        const getAllStyles = () => {
          let styles = ''
          
          // 1. 获取动态样式
          const dynamicStyle = document.getElementById('dynamic-preview')
          if (dynamicStyle) {
            styles += dynamicStyle.textContent + '\n'
          }
          
          // 2. 获取用户CSS
          const userStyle = document.getElementById('user-preview')
          if (userStyle) {
            styles += userStyle.textContent + '\n'
          }
          
          // 3. 获取SmartPages样式
          const smartPagesStyle = document.getElementById('smart-pages-preview')
          if (smartPagesStyle) {
            styles += smartPagesStyle.textContent + '\n'
          }
          
          // 4. 添加用户自定义CSS
          if (cssContent.value) {
            styles += cssContent.value.replaceAll('#vue-smart-pages-preview', '#vue-smart-pages-preview') + '\n'
          }
          
          // 5. 添加打印样式
          styles += `
            @media print {
              body { 
                margin: 0; 
                padding: 0; 
                background: white !important;
              }
              #vue-smart-pages-preview {
                background: white !important;
                color: black !important;
              }
              #vue-smart-pages-preview a {
                color: black !important;
              }
            }
          `
          
          return styles
        }
        
        // 获取渲染后的HTML内容
        const htmlContent = previewElement.innerHTML
        
        // 创建打印窗口
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
          throw new Error('无法打开打印窗口，请检查浏览器弹窗设置')
        }
        
        // 构建完整的HTML文档
        const allStyles = getAllStyles()
        const paperSize = resumeStyles.value.paper || 'A4'
        const paperWidth = paperSize === 'A4' ? '210mm' : paperSize === 'US Letter' ? '216mm' : '216mm'
        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Resume - PDF Export</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: ${resumeStyles.value.fontEN.name || 'Verdana'}, ${resumeStyles.value.fontCJK.name || '华康宋体'};
                font-size: ${resumeStyles.value.fontSize}px;
                line-height: ${resumeStyles.value.lineHeight};
                background: white;
                color: black;
                padding: 0;
                margin: 0;
              }
              
              #vue-smart-pages-preview {
                width: ${paperWidth};
                max-width: ${paperWidth};
                margin: 0 auto;
                background: white;
                color: black;
                padding: ${resumeStyles.value.marginV}px ${resumeStyles.value.marginH}px;
              }
              
              ${allStyles}
              
              @page {
                size: ${paperSize};
                margin: 0;
              }
            </style>
          </head>
          <body>
            <div id="vue-smart-pages-preview">${htmlContent}</div>
          </body>
          </html>
        `)
        
        printWindow.document.close()
        
        // 等待内容加载完成后打印
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.focus()
            printWindow.print()
            statusText.value = 'PDF导出完成'
          }, 300)
        }
        
        // 如果onload已经触发，直接打印
        if (printWindow.document.readyState === 'complete') {
          setTimeout(() => {
            printWindow.focus()
            printWindow.print()
            statusText.value = 'PDF导出完成'
          }, 300)
        }
        
      } catch (error) {
        console.error('导出PDF失败:', error)
        statusText.value = '导出失败: ' + error.message
        alert('导出PDF失败: ' + error.message)
      }
    }

    // 重置内容
    const resetContent = () => {
      if (confirm('确定要重置所有内容吗？')) {
        markdownContent.value = defaultMarkdown
        cssContent.value = defaultCSS
        updatePreview()
        statusText.value = '内容已重置'
      }
    }

    // 获取Session相关的localStorage key（使用chat的sessionId）
    const getSessionKey = (key) => {
      const sessionId = currentSessionId.value
      const fullKey = sessionId ? `${key}_${sessionId}` : key
      console.log('Getting localStorage key:', fullKey, 'for sessionId:', sessionId)
      return fullKey
    }

    // 保存内容到本地存储（按Session隔离）
    const saveContent = () => {
      const sessionId = currentSessionId.value
      if (!sessionId) {
        console.warn('No sessionId, cannot save content')
        return
      }
      
      localStorage.setItem(getSessionKey('vueResumeMarkdown'), markdownContent.value)
      localStorage.setItem(getSessionKey('vueResumeCSS'), cssContent.value)
      localStorage.setItem(getSessionKey('vueResumeStyles'), JSON.stringify(resumeStyles.value))
      statusText.value = '内容已保存到本地'
    }

    // 加载本地存储的内容（按Session隔离）
    const loadContent = () => {
      const sessionId = currentSessionId.value
      if (!sessionId) {
        console.warn('No sessionId, loading default content')
        markdownContent.value = defaultMarkdown
        cssContent.value = defaultCSS
        updatePreview()
        return
      }
      
      const savedMarkdown = localStorage.getItem(getSessionKey('vueResumeMarkdown'))
      const savedCSS = localStorage.getItem(getSessionKey('vueResumeCSS'))
      const savedStyles = localStorage.getItem(getSessionKey('vueResumeStyles'))
      
      if (savedMarkdown) {
        markdownContent.value = savedMarkdown
      } else {
        markdownContent.value = defaultMarkdown
      }
      
      if (savedCSS) {
        cssContent.value = savedCSS
      } else {
        cssContent.value = defaultCSS
      }
      
      if (savedStyles) {
        try {
          resumeStyles.value = { ...resumeStyles.value, ...JSON.parse(savedStyles) }
        } catch (e) {
          console.error('解析样式失败:', e)
        }
      }
      
      updatePreview()
    }

    // 监听sessionId变化，切换Session时加载对应内容（使用chat的sessionId）
    watch(() => currentSessionId.value, (newSessionId, oldSessionId) => {
      console.log('SessionId changed in ResumeWorkspace:', { 
        old: oldSessionId, 
        new: newSessionId,
        isChatSessionId: true
      })
      if (newSessionId) {
        loadContent()
      }
    }, { immediate: false })

    // 监听共享的resume_md，更新markdownContent
    watch(() => resumeMd.value, (newMd, oldMd) => {
      console.log('ResumeMd changed:', {
        old: oldMd?.substring(0, 50),
        new: newMd?.substring(0, 50),
        hasContent: !!(newMd && newMd.trim()),
        newMdType: typeof newMd,
        newMdLength: newMd?.length
      })
      if (newMd && newMd.trim()) {
        console.log('Updating markdownContent from resumeMd')
        markdownContent.value = newMd
        nextTick(() => {
          updatePreview()
          console.log('Markdown content updated and preview refreshed')
        })
      } else {
        console.log('Skipping update: newMd is empty or whitespace')
      }
    }, { immediate: true })

    // 监听内容变化，自动保存
    watch([markdownContent, cssContent, resumeStyles], () => {
      saveContent()
    }, { deep: true })

    // 组件挂载时加载内容
    onMounted(() => {
      loadContent()
    })

    return {
      mainTab,
      currentTab,
      markdownContent,
      cssContent,
      resumeStyles,
      statusText,
      resumeRenderRef,
      switchTab,
      updatePreview,
      exportPDF,
      resetContent
    }
  }
}
</script>

<style scoped>
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.markdown-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sub-tabs {
  flex-shrink: 0;
}

.editor-content {
  padding: 0 20px;  
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  transform: none; 
}
</style>