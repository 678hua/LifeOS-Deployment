import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

export const useNoteStore = defineStore('note', () => {
  const notes = ref([])
  const currentType = ref(0) // 0: review, 1: memo

  const stats = computed(() => {
    const review = notes.value.filter(n => n.type === 0).length
    const memo = notes.value.filter(n => n.type === 1).length
    return { review, memo, total: notes.value.length }
  })

  function setType(type) {
    currentType.value = type
  }

  async function fetchNotes() {
    try {
      const res = await api.get('/notes')
      notes.value = res
    } catch (e) {
      console.error('Failed to fetch notes:', e)
    }
  }

  async function addNote(note) {
    notes.value.push(note)
    await api.post('/notes', note)
  }

  async function updateNote(id, updatedNote) {
    const index = notes.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notes.value[index] = updatedNote
      await api.put(`/notes/${id}`, updatedNote)
    }
  }

  async function removeNote(id) {
    notes.value = notes.value.filter(n => n.id !== id)
    await api.delete(`/notes/${id}`)
  }

  async function fetchNotes() {
    try {
      const res = await api.get('/notes')
      notes.value = res.map(n => ({
        ...n,
        type: parseInt(n.type)
      }))
    } catch (e) {
      console.error('Failed to fetch notes:', e)
    }
  }

  return { notes, currentType, stats, setType, fetchNotes, addNote, updateNote, removeNote }
})
