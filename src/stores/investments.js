import { ref } from 'vue'
import { defineStore } from 'pinia'
import { readRange, appendRow } from '../services/sheets.js'

export const useInvestmentsStore = defineStore('investments', () => {
  const buckets = ref([])
  const salary = ref(0)
  const hasContributionThisMonth = ref(true)
  const loading = ref(false)
  const error = ref(null)

  async function fetchBalances() {
    loading.value = true
    error.value = null
    try {
      const [summaryRows, settingsRows] = await Promise.all([
        readRange('Summary!A2:D4'),
        readRange('Settings!B2'),
      ])

      buckets.value = summaryRows.map((row) => ({
        name: row[0] ?? '',
        totalIn: parseFloat(row[1]) || 0,
        totalOut: parseFloat(row[2]) || 0,
        balance: parseFloat(row[3]) || 0,
      }))

      salary.value = parseFloat(settingsRows?.[0]?.[0]) || 0
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function checkThisMonthContribution() {
    try {
      const rows = await readRange('Transactions!A:E')
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      hasContributionThisMonth.value = rows.some((row) => {
        if (!row[0]) return false
        const d = new Date(row[0])
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
    } catch {
      // non-critical, leave as true to avoid false banner
      hasContributionThisMonth.value = true
    }
  }

  async function logContribution(bucket, type, amount, date, note) {
    await appendRow('Transactions!A:E', [date, bucket, type, amount, note ?? ''])
    await checkThisMonthContribution()
  }

  return {
    buckets,
    salary,
    hasContributionThisMonth,
    loading,
    error,
    fetchBalances,
    checkThisMonthContribution,
    logContribution,
  }
})
