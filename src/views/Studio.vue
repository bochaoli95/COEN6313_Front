<template>
  <div class="studio-container">
    <div class="pane pane-left">
      <ChatView />
    </div>

    <div class="pane pane-right">
      <ResumeWorkspace />
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import ChatView from './Chat.vue'
import ResumeWorkspace from './ResumeWorkspace.vue'

// 共享的resume_md状态
const resumeMd = ref('')

// 更新resume_md的函数
const updateResumeMd = (md) => {
  resumeMd.value = md
}

// 提供给子组件
provide('resumeMd', resumeMd)
provide('updateResumeMd', updateResumeMd)
</script>

<style scoped>
.studio-container {
  display: grid;
  grid-template-columns: 1fr 1fr; 
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  margin-left: 0px;
  overflow: hidden;
  background-color: #202123;
}

.pane {
  height: 100%;
  overflow: hidden;
}

.pane-left {
  border-right: 1px solid #444;
}
:global(main.container) {
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>

