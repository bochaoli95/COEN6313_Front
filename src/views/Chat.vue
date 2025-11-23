<template>
  <div class="chat" style="display: grid; grid-template-columns: 180px 1fr; gap: 20px; height: calc(100vh - 100px); max-height: calc(100vh - 100px); padding: 0;">
    <!-- Sidebar: sessions list -->
    <aside class="card" style="display: flex; flex-direction: column; padding: 0; overflow: hidden;">
      <div style="padding: 16px; border-bottom: 1px solid #565869; display: flex; justify-content: space-between; align-items: center;">
        <strong style="color: #ececf1;">Sessions</strong>
        <button class="btn btn-primary" @click="createNewSession">New</button>
      </div>
      <div style="flex: 1; overflow-y: auto;">
        <div
          v-for="s in sessions"
          :key="s.session_id"
          @click="selectSession(s.session_id)"
          :style="{
            padding: '12px 16px',
            borderBottom: '1px solid #565869',
            cursor: 'pointer',
            background: s.session_id === sessionId ? '#2d2e3a' : 'transparent',
            color: '#ececf1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }"
        >
          <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">{{ s.title || 'Untitled' }}</span>
          <button class="btn btn-secondary" style="padding: 4px 8px;" @click.stop="deleteExistingSession(s.session_id)">Del</button>
        </div>
      </div>
    </aside>

    <!-- Chat panel -->
    <div class="card" style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0;">
        <h2 style="color: #ececf1; font-size: 18px;">AI Resume Optimization Assistant</h2>
        <button class="btn btn-secondary" @click="createNewSession">New Chat</button>
      </div>

      <!-- Messages container -->
      <div ref="messagesContainer" style="flex: 1; overflow-y: auto; overflow-x: hidden; margin-bottom: 12px; padding: 20px; background: #2d2e3a; border-radius: 6px; min-height: 0;">
        <!-- Empty state -->
        <div v-if="messages.length === 0" class="empty-state" style="padding: 40px;">
          <h3>Start Conversation</h3>
          <p>Enter your questions and the AI assistant will help optimize your resume</p>
          <div v-if="!sessionId" style="margin-top: 16px;">
            <button class="btn btn-primary" @click="createNewSession">New Chat</button>
          </div>
        </div>

        <!-- Message list -->
        <div v-for="(msg, index) in messages" :key="index" :style="{ marginBottom: '15px', textAlign: msg.role === 'user' ? 'right' : 'left' }">
          <div :style="{
            display: 'inline-block',
            maxWidth: '70%',
            padding: '12px 16px',
            borderRadius: '12px',
            background: msg.role === 'user' ? '#10a37f' : '#40414f',
            color: '#ececf1',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }">
            <div style="font-weight: 500; margin-bottom: 4px; font-size: 12px; opacity: 0.8;">
              {{ msg.role === 'user' ? 'You' : 'AI Assistant' }}
            </div>
            <div v-if="msg.loading" style="display: flex; align-items: center; gap: 8px;">
              <span class="spinner"></span>
            </div>
            <div v-else style="white-space: pre-wrap;">{{ msg.content }}</div>
          </div>
        </div>
      </div>

      <!-- Message input form -->
      <form @submit.prevent="sendMessage" style="display: flex; gap: 10px; flex-shrink: 0;">
        <input
          v-model="currentMessage"
          type="text"
          class="input"
          placeholder="Enter your question..."
          :disabled="sending"
        />
        <button type="submit" class="btn btn-primary" :disabled="sending || !currentMessage.trim()" style="display: flex; align-items: center; gap: 8px; justify-content: center; min-width: 80px;">
          <span v-if="sending" class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span>
          <span v-else>Send</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, inject } from 'vue'
import { useRoute } from 'vue-router'
import { chatAPI, sessionAPI } from '../services/api'
import { useAuthStore } from '../stores/auth'

// 注入更新resume_md和sessionId的函数
const updateResumeMd = inject('updateResumeMd', null)
const updateSessionId = inject('updateSessionId', null)

// Route and store setup
const route = useRoute()
const authStore = useAuthStore()

// 清理resume_md的辅助函数
const cleanResumeMd = (md) => {
  if (!md || typeof md !== 'string') return md || ''
  
  let cleaned = md.trim()
  
  // 1. 尝试解析完整JSON对象
  try {
    const parsed = JSON.parse(cleaned)
    if (parsed.resume_md) return parsed.resume_md
    if (parsed.message) return parsed.message
    if (typeof parsed === 'string') return parsed
  } catch (e) {
    // 不是完整JSON，继续处理
  }
  
  // 2. 尝试提取JSON对象中的message或resume_md字段值
  const jsonObjectMatch = cleaned.match(/\{[^}]*["']?(?:message|resume_md)["']?\s*:\s*["']([^"']*(?:\\.[^"']*)*)["'][^}]*\}/i)
  if (jsonObjectMatch && jsonObjectMatch[1]) {
    cleaned = jsonObjectMatch[1]
  } else {
    // 3. 移除开头的JSON key格式
    cleaned = cleaned.replace(/^[^"]*["']?(?:message|resume_md)["']?\s*:\s*["']?/i, '')
    cleaned = cleaned.replace(/["']?\s*[,}]\s*$/i, '')
    cleaned = cleaned.replace(/["']\s*$/i, '')
  }
  
  // 4. 移除markdown代码块标记
  cleaned = cleaned.replace(/^```(?:markdown)?\s*/i, '')
  cleaned = cleaned.replace(/\s*```$/i, '')
  
  // 5. 处理JSON转义字符
  cleaned = cleaned.replace(/\\\\/g, '\\ESCAPED_BACKSLASH\\')
  cleaned = cleaned.replace(/\\n/g, '\n')
  cleaned = cleaned.replace(/\\r/g, '\r')
  cleaned = cleaned.replace(/\\t/g, '\t')
  cleaned = cleaned.replace(/\\"/g, '"')
  cleaned = cleaned.replace(/\\'/g, "'")
  cleaned = cleaned.replace(/\\ESCAPED_BACKSLASH\\/g, '\\')
  
  return cleaned.trim()
}

// Reactive state
const messages = ref([])
const currentMessage = ref('')
const sending = ref(false)
const messagesContainer = ref(null)
const sessionId = ref(null)
const sessions = ref([])

// Initialize session on component mount
onMounted(async () => {
  sessionId.value = route.params.sessionId
  const userId = authStore.userId
  
  // 通知ResumeWorkspace当前Session
  if (sessionId.value && updateSessionId) {
    updateSessionId(sessionId.value)
  }
  
  // Load sessions for sidebar
  await loadSessions()

  if (sessionId.value) {
    // Load existing session history
    await loadHistory()
  }

})


// Load chat history for current session
const loadHistory = async () => {
  const userId = authStore.userId
  if (!sessionId.value || !userId) return
  try {
    const history = await sessionAPI.getHistory(sessionId.value)
    if (history && Array.isArray(history)) {
      messages.value = history
    } else if (history?.messages) {
      messages.value = history.messages
    }
  } catch (error) {
    console.error('Failed to load history:', error)
  }
}

// Load user's sessions for sidebar
const loadSessions = async () => {
  const userId = authStore.userId
  if (!userId) return
  try {
    sessions.value = await sessionAPI.getAllByUserId(userId)
  } catch (e) {
    console.error('Failed to load sessions:', e)
  }
}

// Select a session from sidebar
const selectSession = async (id) => {
  if (!id) return
  sessionId.value = id
  
  // 通知ResumeWorkspace切换Session（使用chat的sessionId）
  if (updateSessionId) {
    console.log('Switching to session:', id)
    updateSessionId(id)
  }
  
  await loadHistory()
}

// Create a new session
const createNewSession = async () => {
  const userId = authStore.userId
  if (!userId) return
  try {
    const newSession = {
      session_id: `session_${Date.now()}`,
      user_id: userId,
      title: null,
      messages: []
    }
    const created = await sessionAPI.create(newSession)
    sessionId.value = created.session_id
    
    // 通知ResumeWorkspace切换Session
    if (updateSessionId) {
      updateSessionId(sessionId.value)
    }
    
    await loadSessions()
    messages.value = []
  } catch (e) {
    console.error('Failed to create session:', e)
  }
}

// Delete a session
const deleteExistingSession = async (id) => {
  if (!confirm('Delete this session?')) return
  try {
    await sessionAPI.delete(id)
    if (sessionId.value === id) {
      messages.value = []
      sessionId.value = null
    }
    await loadSessions()
  } catch (e) {
    console.error('Failed to delete session:', e)
  }
}

// Auto-scroll to bottom when messages change
watch(messages, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}, { deep: true })

// Send message to AI assistant
const sendMessage = async () => {
  const userId = authStore.userId
  if (!currentMessage.value.trim() || !userId || !sessionId.value) return

  // Add user message to local messages
  const userMessage = {
    role: 'user',
    content: currentMessage.value,
    timestamp: new Date().toISOString()
  }

  messages.value.push(userMessage)
  const messageToSend = currentMessage.value
  currentMessage.value = ''
  sending.value = true

  // Add assistant placeholder with spinner
  const assistantPlaceholder = {
    role: 'assistant',
    content: '',
    loading: true,
    timestamp: new Date().toISOString()
  }
  messages.value.push(assistantPlaceholder)

  try {
    // Send message to API
    const response = await chatAPI.sendMessage({
      user_id: userId,
      session_id: sessionId.value,
      message: messageToSend
    })

    // Extract assistant text from different response formats
    const extractAssistantText = (resp) => {
      if (!resp) return ''
      if (typeof resp === 'string') return resp
      if (resp.message) return resp.message
      if (resp.content) return resp.content
      if (resp.reply) return resp.reply
      if (resp.text) return resp.text
      if (Array.isArray(resp.messages)) {
        const last = resp.messages.filter(m => m.role === 'assistant').pop() || resp.messages[resp.messages.length - 1]
        if (last?.content) return last.content
      }
      if (resp.data && (resp.data.message || resp.data.content)) return resp.data.message || resp.data.content
      return ''
    }

    const assistantText = extractAssistantText(response)
    // Replace placeholder content
    const idx = messages.value.findIndex(m => m.loading)
    if (idx !== -1) {
      messages.value[idx] = {
        role: 'assistant',
        content: assistantText || ' ',
        loading: false,
        timestamp: new Date().toISOString()
      }
    }
    
    // 更新Resume的markdown内容
    if (response.resume_md && updateResumeMd) {
      const cleanedMd = cleanResumeMd(response.resume_md)
      console.log('Updating resume_md:', cleanedMd.substring(0, 100) + '...')
      updateResumeMd(cleanedMd)
    } else {
      console.log('No resume_md in response or updateResumeMd not available', {
        hasResumeMd: !!response.resume_md,
        hasUpdateFn: !!updateResumeMd,
        response: response
      })
    }
    
    // If still empty, try reloading from history
    if (!assistantText) await loadHistory()
  } catch (error) {
    console.error('Failed to send message:', error)
    // Replace placeholder with error
    const idx = messages.value.findIndex(m => m.loading)
    if (idx !== -1) {
      messages.value[idx] = {
        role: 'assistant',
        content: 'Sorry, an error occurred while sending your message. Please try again later.',
        loading: false,
        timestamp: new Date().toISOString()
      }
    }
  } finally {
    sending.value = false
  }
}
</script>
