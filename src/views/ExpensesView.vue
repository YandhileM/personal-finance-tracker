<script setup>
import { ref, computed, onMounted } from 'vue'
import { Doughnut, Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js'
import { useExpensesStore } from '../stores/expenses.js'
import { useInvestmentsStore } from '../stores/investments.js'

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
)

const store = useExpensesStore()
const investmentsStore = useInvestmentsStore()

// ── Form ──────────────────────────────────────────────────────────────────────
const form = ref({
  category: '',
  description: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
})
const formRef = ref(null)
const submitting = ref(false)
const snackbar = ref({ show: false, message: '', color: 'success' })

async function submitForm() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  submitting.value = true
  try {
    await store.logExpense(
      form.value.date,
      form.value.description,
      form.value.category,
      parseFloat(form.value.amount),
    )
    snackbar.value = { show: true, message: 'Expense logged successfully.', color: 'success' }
    form.value.description = ''
    form.value.amount = ''
    formRef.value.resetValidation()
  } catch (e) {
    snackbar.value = { show: true, message: `Error: ${e.message}`, color: 'error' }
  } finally {
    submitting.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatZAR(value) {
  return `R ${Number(value).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function currentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// ── This month summary ────────────────────────────────────────────────────────
const thisMonth = computed(() =>
  store.monthlyTotals.find((r) => r.month === currentMonthKey()) ?? null,
)

const salary = computed(() => investmentsStore.salary)

const spentPercent = computed(() => {
  if (!salary.value || !thisMonth.value) return 0
  return Math.min(100, Math.round((thisMonth.value.totalSpent / salary.value) * 100))
})

// ── True Remaining ────────────────────────────────────────────────────────────
const trueRemaining = computed(() => {
  const s = salary.value
  const expenses = thisMonth.value?.totalSpent ?? 0
  const contributions = investmentsStore.contributionsThisMonth
  return s - expenses - contributions
})

// ── Category breakdown ────────────────────────────────────────────────────────
const activeCategoryTotals = computed(() =>
  store.categoryTotals.filter((c) => c.totalSpent > 0),
)

const CHART_COLORS = [
  '#2196F3', '#4CAF50', '#FF9800', '#E91E63',
  '#9C27B0', '#00BCD4', '#FF5722', '#8BC34A',
]

const doughnutData = computed(() => ({
  labels: activeCategoryTotals.value.map((c) => c.category),
  datasets: [
    {
      data: activeCategoryTotals.value.map((c) => c.totalSpent),
      backgroundColor: activeCategoryTotals.value.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
      borderWidth: 0,
    },
  ],
}))

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.label}: R ${Number(ctx.parsed).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
      },
    },
  },
}

// ── Monthly graphs ────────────────────────────────────────────────────────────
const hasEnoughMonthlyData = computed(() => store.monthlyTotals.length >= 2)

const barData = computed(() => ({
  labels: store.monthlyTotals.map((r) => r.month),
  datasets: [
    {
      type: 'bar',
      label: 'Spent',
      data: store.monthlyTotals.map((r) => r.totalSpent),
      backgroundColor: '#2196F3',
      order: 2,
    },
    {
      type: 'line',
      label: 'Salary',
      data: store.monthlyTotals.map(() => salary.value),
      borderColor: '#FF5722',
      backgroundColor: 'transparent',
      pointRadius: 0,
      borderDash: [6, 3],
      order: 1,
    },
  ],
}))

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: R ${Number(ctx.parsed.y).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
      },
    },
  },
  scales: {
    y: {
      ticks: { callback: (v) => `R ${Number(v).toLocaleString('en-ZA')}` },
    },
  },
}

const lineData = computed(() => ({
  labels: store.monthlyTotals.map((r) => r.month),
  datasets: [
    {
      label: 'Total Expenses',
      data: store.monthlyTotals.map((r) => r.totalSpent),
      borderColor: '#4CAF50',
      backgroundColor: 'transparent',
      pointRadius: 3,
      tension: 0.3,
    },
  ],
}))

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: R ${Number(ctx.parsed.y).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
      },
    },
  },
  scales: {
    y: {
      ticks: { callback: (v) => `R ${Number(v).toLocaleString('en-ZA')}` },
    },
  },
}

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(() => {
  store.fetchAll()
  if (!investmentsStore.salary) investmentsStore.fetchBalances()
  investmentsStore.fetchContributionsThisMonth()
})
</script>

<template>
  <v-container class="pa-4">

    <!-- Error alert -->
    <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4">
      {{ store.error }}
    </v-alert>

    <!-- Section 1: Log Expense -->
    <v-card rounded="lg" elevation="2" class="mb-4">
      <v-card-title class="pa-4 pb-0">
        <v-icon icon="mdi-receipt-text-plus" class="mr-2" color="primary" />
        Log Expense
      </v-card-title>

      <v-card-text class="pa-4">
        <v-form ref="formRef" @submit.prevent="submitForm">
          <v-row>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.category"
                :items="store.categories"
                label="Category"
                variant="outlined"
                density="comfortable"
                :rules="[v => !!v || 'Category is required']"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.description"
                label="Description"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-text"
                :rules="[v => !!v || 'Description is required']"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.amount"
                label="Amount (R)"
                type="number"
                min="0.01"
                step="0.01"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-currency-usd"
                :rules="[
                  v => !!v || 'Amount is required',
                  v => parseFloat(v) > 0 || 'Amount must be greater than 0',
                ]"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.date"
                label="Date"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
                :rules="[v => !!v || 'Date is required']"
              />
            </v-col>

            <v-col cols="12">
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="submitting"
                prepend-icon="mdi-check"
              >
                Submit
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Section 2: This Month Summary -->
    <v-card rounded="lg" elevation="2" class="mb-4">
      <v-card-title class="pa-4 pb-0">
        <v-icon icon="mdi-calendar-month" class="mr-2" color="primary" />
        This Month
      </v-card-title>

      <v-card-text class="pa-4">
        <v-skeleton-loader v-if="store.loading" type="list-item-three-line" />

        <template v-else-if="thisMonth">
          <v-row class="mb-3">
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Total Spent</div>
              <div class="text-h6 font-weight-bold">{{ formatZAR(thisMonth.totalSpent) }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Remaining</div>
              <div
                class="text-h6 font-weight-bold"
                :class="thisMonth.remaining >= 0 ? 'text-success' : 'text-error'"
              >
                {{ formatZAR(thisMonth.remaining) }}
              </div>
            </v-col>
          </v-row>

          <div class="d-flex justify-space-between text-caption mb-1">
            <span>{{ spentPercent }}% of salary ({{ formatZAR(salary) }})</span>
          </div>
          <v-progress-linear
            :model-value="spentPercent"
            :color="spentPercent >= 90 ? 'error' : spentPercent >= 70 ? 'warning' : 'primary'"
            rounded
            height="8"
            bg-color="surface-variant"
          />
        </template>

        <v-alert v-else type="info" variant="tonal">
          No expense data found for this month.
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- True Remaining card -->
    <v-card rounded="lg" elevation="2" class="mb-4">
      <v-card-title class="pa-4 pb-0">
        <v-icon icon="mdi-wallet" class="mr-2" color="primary" />
        True Remaining
      </v-card-title>

      <v-card-text class="pa-4">
        <v-skeleton-loader v-if="store.loading || investmentsStore.loading" type="list-item-three-line" />

        <template v-else>
          <div class="d-flex justify-space-between text-body-1 mb-2">
            <span class="text-medium-emphasis">Salary</span>
            <span>{{ formatZAR(salary) }}</span>
          </div>
          <div class="d-flex justify-space-between text-body-1 mb-2">
            <span class="text-medium-emphasis">Minus expenses</span>
            <span class="text-error">− {{ formatZAR(thisMonth?.totalSpent ?? 0) }}</span>
          </div>
          <div class="d-flex justify-space-between text-body-1 mb-3">
            <span class="text-medium-emphasis">Minus contributions</span>
            <span class="text-error">− {{ formatZAR(investmentsStore.contributionsThisMonth) }}</span>
          </div>
          <v-divider class="mb-3" />
          <div class="d-flex justify-space-between align-center">
            <span class="text-subtitle-1 font-weight-bold">True Remaining</span>
            <span
              class="text-h6 font-weight-bold"
              :class="trueRemaining >= 0 ? 'text-success' : 'text-error'"
            >
              {{ formatZAR(trueRemaining) }}
            </span>
          </div>
        </template>
      </v-card-text>
    </v-card>

    <!-- Section 3: Category Breakdown -->
    <v-card rounded="lg" elevation="2" class="mb-4">
      <v-card-title class="pa-4 pb-0">
        <v-icon icon="mdi-tag-multiple" class="mr-2" color="primary" />
        Category Breakdown
      </v-card-title>

      <v-card-text class="pa-4">
        <v-skeleton-loader v-if="store.loading" type="list-item-two-line@4" />

        <template v-else-if="activeCategoryTotals.length > 0">
          <v-list density="compact" class="mb-4">
            <v-list-item
              v-for="(item, i) in activeCategoryTotals"
              :key="item.category"
              :title="item.category"
              :subtitle="formatZAR(item.totalSpent)"
            >
              <template #prepend>
                <v-icon
                  icon="mdi-circle"
                  :color="CHART_COLORS[i % CHART_COLORS.length]"
                  size="12"
                  class="mr-2"
                />
              </template>
            </v-list-item>
          </v-list>

          <div style="height: 260px; position: relative;">
            <Doughnut :data="doughnutData" :options="doughnutOptions" />
          </div>
        </template>

        <v-alert v-else type="info" variant="tonal">
          No category spending recorded for this month.
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Section 4: Monthly Graphs -->
    <v-card rounded="lg" elevation="2">
      <v-card-title class="pa-4 pb-0">
        <v-icon icon="mdi-chart-bar" class="mr-2" color="primary" />
        Monthly Trends
      </v-card-title>

      <v-card-text class="pa-4">
        <v-skeleton-loader v-if="store.loading" type="image" />

        <template v-else-if="hasEnoughMonthlyData">
          <div class="text-subtitle-2 mb-2">Spending vs Salary</div>
          <div style="height: 260px; position: relative;" class="mb-6">
            <Bar :data="barData" :options="barOptions" />
          </div>

          <div class="text-subtitle-2 mb-2">Expense Trend</div>
          <div style="height: 220px; position: relative;">
            <Line :data="lineData" :options="lineOptions" />
          </div>
        </template>

        <v-alert v-else type="info" variant="tonal">
          Graphs will appear once you have 2 months of data.
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="bottom"
    >
      {{ snackbar.message }}
    </v-snackbar>

  </v-container>
</template>
