import { ref } from 'vue'
import { defineStore } from 'pinia'
import { readRange, appendRow } from '../services/sheets.js'

export const useInvestmentsStore = defineStore('investments', () => {
  const buckets = ref([])
  const salary = ref(0)
  const hasContributionThisMonth = ref(true)
  const loading = ref(false)
  const error = ref(null)
  const weeklySnapshots = ref([])
  const snapshotsLoading = ref(false)
  const contributionsThisMonth = ref(0)

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

  async function fetchWeeklySnapshots() {
    snapshotsLoading.value = true
    try {
      const rows = await readRange('WeeklySnapshots!A2:E210')
      weeklySnapshots.value = rows
        .filter((row) => {
          if (!row[0]) return false
          const allZero = [row[1], row[2], row[3], row[4]].every(
            (v) => !v || parseFloat(v) === 0,
          )
          return !allZero
        })
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map((row) => ({
          week: row[0],
          savings: parseFloat(row[1]) || 0,
          tfsa: parseFloat(row[2]) || 0,
          normal: parseFloat(row[3]) || 0,
          total: parseFloat(row[4]) || 0,
        }))
    } catch {
      weeklySnapshots.value = []
    } finally {
      snapshotsLoading.value = false
    }
  }

  async function fetchContributionsThisMonth() {
    try {
      const rows = await readRange('Transactions!A:E')
      console.log('Transactions rows:', rows)
      const key = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
      contributionsThisMonth.value = rows.reduce((sum, row) => {
        if (!row[0] || !String(row[0]).startsWith(key)) return sum
        if (row[2] !== 'Contribution') return sum
        return sum + (Number(row[3]) || 0)
      }, 0)
    } catch {
      contributionsThisMonth.value = 0
    }
  }

  return {
    buckets,
    salary,
    hasContributionThisMonth,
    loading,
    error,
    weeklySnapshots,
    snapshotsLoading,
    contributionsThisMonth,
    fetchBalances,
    checkThisMonthContribution,
    logContribution,
    fetchWeeklySnapshots,
    fetchContributionsThisMonth,
  }
})
