import { ref } from 'vue'
import { defineStore } from 'pinia'
import { readRange, appendRow } from '../services/sheets.js'

export const useExpensesStore = defineStore('expenses', () => {
  const categories = ref([])
  const categoryTotals = ref([])
  const monthlyTotals = ref([])
  const loading = ref(false)
  const error = ref(null)

  function currentMonthKey() {
    const now = new Date()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    return `${now.getFullYear()}-${mm}`
  }

  async function fetchCategories() {
    const rows = await readRange('Settings!B3')
    const raw = rows?.[0]?.[0] ?? ''
    categories.value = raw.split(',').map((c) => c.trim()).filter(Boolean)
  }

  async function fetchCategoryTotals() {
    const rows = await readRange('Expenses!A:D')
    const key = currentMonthKey()
    const totals = {}
    rows.forEach((row) => {
      if (!row[0] || !String(row[0]).startsWith(key)) return
      const category = row[2] ?? 'Uncategorised'
      totals[category] = (totals[category] ?? 0) + (parseFloat(row[3]) || 0)
    })
    categoryTotals.value = Object.entries(totals).map(([category, totalSpent]) => ({
      category,
      totalSpent,
    }))
  }

  async function fetchMonthlyTotals() {
    const rows = await readRange('ExpenseSummary!E2:G89')
    const key = currentMonthKey()
    monthlyTotals.value = rows
      .filter((row) => !!row[0] && row[0] <= key)
      .map((row) => ({
        month: row[0],
        totalSpent: parseFloat(row[1]) || 0,
        remaining: parseFloat(row[2]) || 0,
      }))
  }

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      await Promise.all([fetchCategories(), fetchCategoryTotals(), fetchMonthlyTotals()])
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function logExpense(date, description, category, amount) {
    await appendRow('Expenses!A:D', [date, description, category, amount])
    await fetchAll()
  }

  return {
    categories,
    categoryTotals,
    monthlyTotals,
    loading,
    error,
    fetchAll,
    logExpense,
  }
})
