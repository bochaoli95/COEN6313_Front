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
        <div v-if="mainTab === 'preview'" class="preview-content">
          <ResumeRender
            ref="resumeRenderRef"
            id="preview"
            :markdown="markdownContent"
            :css="cssContent"
            :styles="resumeStyles"
          />
        </div>
        
        <div v-else class="markdown-content">
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
          
          <div class="editor-content">
            <textarea
              v-if="currentTab === 'markdown'"
              v-model="markdownContent"
              class="editor"
              placeholder="Enter Markdown content..."
              @input="updatePreview"
            ></textarea>
            
            <textarea
              v-else
              v-model="cssContent"
              class="editor"
              placeholder="Enter CSS styles..."
              @input="updatePreview"
            ></textarea>
          </div>
        </div>
      </div>
      
      <div class="status-bar">
        <span>{{ statusText }}</span>
        <div>
          <button class="btn" @click="exportPDF">Export PDF</button>
          <button class="btn" @click="savePDF">Save PDF</button>
          <button class="btn btn-secondary" @click="resetContent">Reset</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick, inject } from 'vue'
import ResumeRender from '../components/ResumeRender.vue'
import html2pdf from 'html2pdf.js'
import { resumeFilesAPI } from '../services/api'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'App',
  components: {
    ResumeRender
  },
  setup() {
    const resumeMd = inject('resumeMd', ref(''))
    const currentSessionId = inject('currentSessionId', ref(null))
    
    const mainTab = ref('markdown')
    const currentTab = ref('markdown')
    const markdownContent = ref('')
    const cssContent = ref('')
    const statusText = ref('Ready')
    const resumeRenderRef = ref(null)
    
    const resumeStyles = ref({
      marginV: 55,
      marginH: 30,
      lineHeight: 1.3,
      paragraphSpace: 5,
      themeColor: '#000000',
      fontCJK: {
        name: 'SimSun',
        fontFamily: 'HKST'
      },
      fontEN: {
        name: 'Verdana'
      },
      fontSize: 12,
      paper: 'A4'
    })
    
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

    const switchTab = (tab) => {
      currentTab.value = tab
    }

    const updatePreview = async () => {
      try {
        statusText.value = 'Rendering...'
        
        await nextTick()
        
        if (resumeRenderRef.value) {
          resumeRenderRef.value.forceUpdate()
        }
        
        statusText.value = 'Done'
      } catch (error) {
        console.error('Render error:', error)
        statusText.value = 'Render failed: ' + error.message
      }
    }

    const exportPDF = async () => {
      if (mainTab.value !== 'preview') {
        alert('Please switch to Preview tab first')
        return
      }
      
      statusText.value = 'Exporting PDF...'
      
      try {
        await nextTick()
        
        const previewElement = document.getElementById('vue-smart-pages-preview')
        if (!previewElement) {
          throw new Error('Preview content not found')
        }
        
        const getAllStyles = () => {
          let styles = ''
          
          const dynamicStyle = document.getElementById('dynamic-preview')
          if (dynamicStyle) {
            styles += dynamicStyle.textContent + '\n'
          }
          
          const userStyle = document.getElementById('user-preview')
          if (userStyle) {
            styles += userStyle.textContent + '\n'
          }
          
          const smartPagesStyle = document.getElementById('smart-pages-preview')
          if (smartPagesStyle) {
            styles += smartPagesStyle.textContent + '\n'
          }
          
          if (cssContent.value) {
            styles += cssContent.value.replaceAll('#vue-smart-pages-preview', '#vue-smart-pages-preview') + '\n'
          }
          
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
        
        const htmlContent = previewElement.innerHTML
        
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
          throw new Error('Cannot open print window, please check browser popup settings')
        }
        
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
                font-family: ${resumeStyles.value.fontEN.name || 'Verdana'}, ${resumeStyles.value.fontCJK.name || 'SimSun'};
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
        
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.focus()
            printWindow.print()
            statusText.value = 'PDF exported'
          }, 300)
        }
        
        if (printWindow.document.readyState === 'complete') {
          setTimeout(() => {
            printWindow.focus()
            printWindow.print()
            statusText.value = 'PDF exported'
          }, 300)
        }
        
      } catch (error) {
        console.error('Export PDF failed:', error)
        statusText.value = 'Export failed: ' + error.message
        alert('Export PDF failed: ' + error.message)
      }
    }

    const savePDF = async () => {
      if (mainTab.value !== 'preview') {
        alert('Please switch to Preview tab first')
        return
      }
      
      const authStore = useAuthStore()
      const userId = authStore.userId
      
      if (!userId) {
        alert('Please login first')
        return
      }
      
      statusText.value = 'Generating PDF...'
      
      try {
        await nextTick()
        
        const previewElement = document.getElementById('vue-smart-pages-preview')
        if (!previewElement) {
          throw new Error('Preview content not found')
        }
        
        const getAllStyles = () => {
          let styles = ''
          
          const dynamicStyle = document.getElementById('dynamic-preview')
          if (dynamicStyle) {
            styles += dynamicStyle.textContent + '\n'
          }
          
          const userStyle = document.getElementById('user-preview')
          if (userStyle) {
            styles += userStyle.textContent + '\n'
          }
          
          const smartPagesStyle = document.getElementById('smart-pages-preview')
          if (smartPagesStyle) {
            styles += smartPagesStyle.textContent + '\n'
          }
          
          if (cssContent.value) {
            styles += cssContent.value.replaceAll('#vue-smart-pages-preview', '#vue-smart-pages-preview') + '\n'
          }
          
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
        
        const paperSize = resumeStyles.value.paper || 'A4'
        const paperFormat = paperSize.toLowerCase().replace(' ', '')
        
        const opt = {
          margin: [resumeStyles.value.marginV / 3.78, resumeStyles.value.marginH / 3.78],
          filename: `resume_${Date.now()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true,
            backgroundColor: '#ffffff'
          },
          jsPDF: { 
            unit: 'mm', 
            format: paperFormat === 'usletter' ? 'letter' : paperFormat === 'uslegal' ? 'legal' : 'a4',
            orientation: 'portrait' 
          }
        }
        
        statusText.value = 'Converting to PDF...'
        
        const pdfBlob = await html2pdf().set(opt).from(previewElement).outputPdf('blob')
        
        const fileName = `resume_${Date.now()}.pdf`
        const formData = new FormData()
        formData.append('file', pdfBlob, fileName)
        formData.append('file_name', fileName)
        
        // Debug: Log FormData contents
        console.log('📤 FormData Debug Info:')
        console.log('  - fileName:', fileName)
        console.log('  - pdfBlob type:', pdfBlob.constructor.name)
        console.log('  - pdfBlob size:', pdfBlob.size, 'bytes')
        console.log('  - FormData entries:')
        for (const [key, value] of formData.entries()) {
          if (value instanceof File || value instanceof Blob) {
            console.log(`    ${key}:`, {
              type: value.constructor.name,
              name: value.name || 'N/A',
              size: value.size,
              contentType: value.type || 'N/A'
            })
          } else {
            console.log(`    ${key}:`, value)
          }
        }
        
        statusText.value = 'Uploading PDF...'
        
        await resumeFilesAPI.create(formData)
        
        statusText.value = 'PDF saved successfully'
        
        setTimeout(() => {
          statusText.value = 'Ready'
        }, 2000)
        
      } catch (error) {
        console.error('Save PDF failed:', error)
        statusText.value = 'Save failed: ' + (error.userMessage || error.message)
        alert('Save PDF failed: ' + (error.userMessage || error.message))
      }
    }

    const resetContent = () => {
      if (confirm('Reset all content?')) {
        markdownContent.value = defaultMarkdown
        cssContent.value = defaultCSS
        updatePreview()
        statusText.value = 'Content reset'
      }
    }

    const getSessionKey = (key) => {
      const sessionId = currentSessionId.value
      const fullKey = sessionId ? `${key}_${sessionId}` : key
      return fullKey
    }

    const saveContent = () => {
      const sessionId = currentSessionId.value
      if (!sessionId) {
        return
      }
      
      localStorage.setItem(getSessionKey('vueResumeMarkdown'), markdownContent.value)
      localStorage.setItem(getSessionKey('vueResumeCSS'), cssContent.value)
      localStorage.setItem(getSessionKey('vueResumeStyles'), JSON.stringify(resumeStyles.value))
    }

    const loadContent = () => {
      const sessionId = currentSessionId.value
      if (!sessionId) {
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
          console.error('Parse styles failed:', e)
        }
      }
      
      updatePreview()
    }

    watch(() => currentSessionId.value, (newSessionId) => {
      if (newSessionId) {
        loadContent()
      }
    }, { immediate: false })

    watch(() => resumeMd.value, (newMd) => {
      if (newMd && newMd.trim()) {
        markdownContent.value = newMd
        nextTick(() => {
          updatePreview()
        })
      }
    }, { immediate: true })

    watch([markdownContent, cssContent, resumeStyles], () => {
      saveContent()
    }, { deep: true })

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
      savePDF,
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