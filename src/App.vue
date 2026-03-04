<template>
  <div id="app">
    <router-view />
    <nav class="bottom-nav">
      <router-link to="/" class="nav-item">
        <span class="nav-label">首页</span>
      </router-link>
      <router-link to="/checkin" class="nav-item">
        <span class="nav-label">打卡</span>
      </router-link>
      <router-link to="/tasks" class="nav-item">
        <span class="nav-label">任务</span>
      </router-link>
      <router-link to="/notes" class="nav-item">
        <span class="nav-label">思记</span>
      </router-link>
      <router-link to="/profile" class="nav-item">
        <span class="nav-label">我的</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
