import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref([])

  const stats = computed(() => {
    return {
      notAccepted: tasks.value.filter(t => t.status === 0).length,
      inProgress: tasks.value.filter(t => t.status === 1).length,
      completed: tasks.value.filter(t => t.status === 2).length,
      total: tasks.value.length,
    }
  })

  const totalMoPoints = computed(() => {
    return tasks.value
      .filter(t => t.status === 2)
      .reduce((sum, t) => sum + t.moPoints, 0)
  })

  async function addTask(task) {
    tasks.value.push(task)
    await api.post('/tasks', task)
  }

  async function updateTask(id, updatedTask) {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value[index] = updatedTask
      await api.put(`/tasks/${id}`, updatedTask)
    }
  }

  async function removeTask(id) {
    tasks.value = tasks.value.filter(t => t.id !== id)
    await api.delete(`/tasks/${id}`)
  }

  async function fetchTasks() {
    try {
      const res = await api.get('/tasks')
      tasks.value = res.map(t => ({
        ...t,
        duration: parseInt(t.duration),
        level: parseInt(t.level),
        status: parseInt(t.status)
      }))
    } catch (e) {
      console.error('Failed to fetch tasks:', e)
    }
  }

  return { tasks, stats, totalMoPoints, addTask, updateTask, removeTask, fetchTasks }
})
