<template>
  <div class="lottery-view">
    <!-- 抽奖区域 -->
    <div class="draw-section">
      <div class="draw-circle" :class="{ drawing: isDrawing }">
        <div v-if="isDrawing" class="loading">
          <div class="spinner"></div>
        </div>
        <div v-else-if="currentPrize" class="prize-result" :class="`star-${currentPrize.star}`">
          <div class="prize-icon">{{ currentPrize.icon }}</div>
          <div class="prize-name">{{ currentPrize.name }}</div>
          <div class="prize-star">{{ getStarText(currentPrize.star) }}</div>
        </div>
        <div v-else class="default-text">
          <span class="icon">✨</span>
          <span>点击祈愿</span>
        </div>
      </div>

      <div class="cost-display">
        <span class="icon">⭐</span>
        <span>消耗：{{ currentCost }} 墨点/次</span>
      </div>

      <button
        class="draw-btn"
        :class="{ disabled: isDrawing }"
        @click="showDrawConfirm = true"
      >
        祈愿 {{ currentCost }} 墨点
      </button>

      <!-- 概率展示 -->
      <div class="rates">
        <span class="rate five">5 星 {{ rates.five }}%</span>
        <span class="rate four">4 星 {{ rates.four }}%</span>
        <span class="rate three">3 星 {{ rates.three }}%</span>
      </div>
    </div>

    <!-- 记录区域 -->
    <div class="records-section">
      <div class="section-header">
        <h3>祈愿记录</h3>
        <div class="stats">
          <span class="stat five">5 星：{{ stats.five }}</span>
          <span class="stat four">4 星：{{ stats.four }}</span>
          <span class="stat three">3 星：{{ stats.three }}</span>
        </div>
      </div>

      <div class="records-list">
        <div v-if="records.length === 0" class="empty">暂无记录</div>
        <div
          v-for="record in records"
          :key="record.id"
          class="record-item"
          :class="`star-${record.star}`"
        >
          <div class="record-icon">{{ getRarityIcon(record.star) }}</div>
          <div class="record-info">
            <div class="record-name">{{ record.prizeName }}</div>
            <div class="record-time">{{ formatTime(record.drawTime) }}</div>
          </div>
          <div class="record-cost">
            -{{ record.costMoPoints }}
          </div>
        </div>
      </div>
    </div>

    <!-- 确认对话框 -->
    <div v-if="showDrawConfirm" class="dialog-overlay" @click="showDrawConfirm = false">
      <div class="dialog" @click.stop>
        <h3>确认祈愿</h3>
        <p>将消耗 {{ currentCost }} 墨点</p>
        <div class="dialog-actions">
          <button @click="showDrawConfirm = false" class="btn-cancel">取消</button>
          <button @click="confirmDraw" class="btn-confirm">祈愿</button>
        </div>
      </div>
    </div>

    <!-- 结果对话框 -->
    <div v-if="showResult && currentPrize" class="dialog-overlay" @click="showResult = false">
      <div class="result-dialog" :class="`star-${currentPrize.star}`" @click.stop>
        <div class="result-bg">{{ currentPrize.icon }}</div>
        <div class="result-content">
          <div class="result-icon">{{ currentPrize.icon }}</div>
          <h2>{{ currentPrize.name }}</h2>
          <div class="result-star">{{ getStarText(currentPrize.star) }}</div>
          <p>{{ currentPrize.description }}</p>
          <p v-if="currentPrize.effect" class="result-effect">效果：{{ currentPrize.effect }}</p>
          <button @click="showResult = false" class="btn-collect">收下奖励</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLotteryStore } from '../stores/lottery'

const store = useLotteryStore()

const isDrawing = ref(false)
const showDrawConfirm = ref(false)
const showResult = ref(false)

const currentPrize = computed(() => store.currentPrize)
const currentCost = computed(() => store.currentCost)
const records = computed(() => store.records)
const stats = computed(() => store.stats)
const rates = computed(() => store.rates)

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const getRarityIcon = (star) => {
  const icons = ['✨', '🌟', '⭐']
  return icons[star] || '✨'
}

const getStarText = (star) => {
  const texts = ['3 星', '4 星', '5 星']
  return texts[star] || '3 星'
}

const confirmDraw = async () => {
  showDrawConfirm.value = false
  isDrawing.value = true
  
  try {
    await store.draw()
    isDrawing.value = false
    showResult.value = true
  } catch (e) {
    isDrawing.value = false
    alert('祈愿失败：' + e.message)
  }
}

onMounted(() => {
  store.fetchRecords()
})
</script>

<style scoped>
.lottery-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* 抽奖区域 */
.draw-section {
  flex: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(180deg, rgba(30, 30, 46, 0.5) 0%, rgba(20, 20, 30, 0.8) 100%);
}

.draw-circle {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: linear-gradient(135deg, #A855F7 0%, #C084FC 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.3);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.draw-circle.drawing {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(168, 85, 247, 0.3); }
  50% { transform: scale(1.05); box-shadow: 0 12px 40px rgba(168, 85, 247, 0.5); }
}

.loading .spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.prize-result {
  text-align: center;
  color: #ffffff;
  padding: 20px;
}

.prize-result.star-2 .prize-icon { filter: drop-shadow(0 0 10px #FBBF24); }
.prize-result.star-1 .prize-icon { filter: drop-shadow(0 0 10px #A78BFA); }
.prize-result.star-0 .prize-icon { filter: drop-shadow(0 0 10px #60A5FA); }

.prize-icon {
  font-size: 72px;
  margin-bottom: 8px;
}

.prize-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
}

.prize-star {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.default-text {
  text-align: center;
  color: #ffffff;
}

.default-text .icon {
  font-size: 56px;
  display: block;
  margin-bottom: 8px;
}

.default-text span:last-child {
  font-size: 16px;
  font-weight: bold;
}

/* 消耗显示 */
.cost-display {
  margin-top: 24px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-size: 16px;
}

.cost-display .icon {
  font-size: 20px;
}

/* 抽奖按钮 */
.draw-btn {
  margin-top: 24px;
  padding: 16px 48px;
  border: none;
  border-radius: 30px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  color: #ffffff;
  background: linear-gradient(135deg, #A855F7 0%, #C084FC 100%);
  box-shadow: 0 4px 16px rgba(168, 85, 247, 0.4);
}

.draw-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(168, 85, 247, 0.5);
}

.draw-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 概率展示 */
.rates {
  margin-top: 24px;
  display: flex;
  gap: 16px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}

.rate {
  font-size: 13px;
  font-weight: 500;
}

.rate.five { color: #FBBF24; }
.rate.four { color: #A78BFA; }
.rate.three { color: #60A5FA; }

/* 记录区域 */
.records-section {
  flex: 2;
  background: rgba(30, 30, 46, 0.98);
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 16px;
}

.stats {
  display: flex;
  gap: 12px;
}

.stat {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.stat.five { background: rgba(251, 191, 36, 0.2); color: #FBBF24; }
.stat.four { background: rgba(167, 139, 250, 0.2); color: #A78BFA; }
.stat.three { background: rgba(96, 165, 250, 0.2); color: #60A5FA; }

.records-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty {
  text-align: center;
  color: #666;
  padding: 40px 20px;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background 0.2s;
  border-left: 3px solid transparent;
}

.record-item.star-2 { border-left-color: #FBBF24; }
.record-item.star-1 { border-left-color: #A78BFA; }
.record-item.star-0 { border-left-color: #60A5FA; }

.record-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.record-icon {
  font-size: 24px;
  margin-right: 12px;
}

.record-info {
  flex: 1;
}

.record-name {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.record-time {
  color: #666;
  font-size: 12px;
}

.record-cost {
  color: #F44336;
  font-size: 14px;
  font-weight: bold;
}

/* 对话框 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog {
  background: #1e1e2e;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 360px;
  text-align: center;
}

.dialog h3 {
  margin: 0 0 12px;
  color: #ffffff;
  font-size: 18px;
}

.dialog p {
  color: #888;
  font-size: 14px;
  margin: 0 0 24px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  background: transparent;
  color: #888;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-confirm {
  background: #A855F7;
  color: #ffffff;
}

.btn-confirm:hover {
  background: #C084FC;
}

/* 结果对话框 */
.result-dialog {
  border-radius: 24px;
  padding: 0;
  overflow: hidden;
  max-width: 420px;
  width: 90%;
  position: relative;
}

.result-dialog.star-2 {
  background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
}

.result-dialog.star-1 {
  background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
}

.result-dialog.star-0 {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
}

.result-bg {
  font-size: 120px;
  text-align: center;
  padding: 40px 20px;
  opacity: 0.3;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.result-content {
  position: relative;
  z-index: 1;
  padding: 60px 32px 32px;
  text-align: center;
}

.result-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.result-content h2 {
  margin: 0 0 8px;
  color: #ffffff;
  font-size: 24px;
}

.result-star {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-bottom: 16px;
}

.result-content p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin: 0 0 8px;
}

.result-effect {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 12px;
  display: inline-block;
  margin-bottom: 24px !important;
}

.btn-collect {
  padding: 14px 40px;
  background: #ffffff;
  color: #000000;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-collect:hover {
  transform: scale(1.05);
}
</style>
