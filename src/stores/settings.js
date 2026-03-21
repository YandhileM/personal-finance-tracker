import { ref } from 'vue'
import { defineStore } from 'pinia'
import { readRange, updateRange } from '../services/sheets.js'

export const useSettingsStore = defineStore('settings', () => {
  const salary = ref(0)
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchSettings() {
    loading.value = true
    error.value = null
    try {
      const [salaryRows, categoryRows] = await Promise.all([
        readRange('Settings!B2'),
        readRange('Settings!B3'),
      ])
      salary.value = parseFloat(salaryRows?.[0]?.[0]) || 0
      const raw = categoryRows?.[0]?.[0] ?? ''
      categories.value = raw.split(',').map((c) => c.trim()).filter(Boolean)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function updateSalary(newSalary) {
    await updateRange('Settings!B2', [String(newSalary)])
    salary.value = newSalary
  }

  async function updateCategories(categoriesArray) {
    await updateRange('Settings!B3', [categoriesArray.join(', ')])
    categories.value = [...categoriesArray]
  }

  return {
    salary,
    categories,
    loading,
    error,
    fetchSettings,
    updateSalary,
    updateCategories,
  }
})
