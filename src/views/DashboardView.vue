<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInvestmentsStore } from '../stores/investments.js'

const store = useInvestmentsStore()

const SAVINGS_GOAL = 25000
const BUCKETS = ['Savings', 'TFSA', 'Normal']
const TYPES = ['Contribution', 'Withdrawal']

const form = ref({
  bucket: 'Savings',
  type: 'Contribution',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  note: '',
})

const formRef = ref(null)
const submitting = ref(false)
const snackbar = ref({ show: false, message: '', color: 'success' })
const bannerDismissed = ref(false)

const showBanner = computed(
  () => !store.hasContributionThisMonth && !bannerDismissed.value
)

function formatZAR(value) {
  return `R ${Number(value).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function savingsProgress(balance) {
  return Math.min(100, Math.round((balance / SAVINGS_GOAL) * 100))
}

function bucketIcon(name) {
  if (name === 'Savings') return 'mdi-piggy-bank'
  if (name === 'TFSA') return 'mdi-shield-star'
  return 'mdi-trending-up'
}

async function submitForm() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  submitting.value = true
  try {
    await store.logContribution(
      form.value.bucket,
      form.value.type,
      parseFloat(form.value.amount),
      form.value.date,
      form.value.note,
    )
    await store.fetchBalances()
    snackbar.value = { show: true, message: 'Transaction logged successfully.', color: 'success' }
    form.value.amount = ''
    form.value.note = ''
    formRef.value.resetValidation()
  } catch (e) {
    snackbar.value = { show: true, message: `Error: ${e.message}`, color: 'error' }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  store.fetchBalances()
  store.checkThisMonthContribution()
})
</script>

<template>
  <v-container class="pa-4">

    <!-- Monthly reminder banner -->
    <v-alert
      v-if="showBanner"
      type="warning"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="bannerDismissed = true"
    >
      You haven't logged any contributions this month. Remember to log your monthly investment!
    </v-alert>

    <!-- Error alert -->
    <v-alert
      v-if="store.error"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ store.error }}
    </v-alert>

    <!-- Balance cards -->
    <v-row class="mb-4">
      <v-col
        v-for="bucket in (store.loading ? [{}, {}, {}] : store.buckets)"
        :key="bucket.name ?? Math.random()"
        cols="12"
        sm="4"
      >
        <v-skeleton-loader v-if="store.loading" type="card" />

        <v-card v-else rounded="lg" elevation="2">
          <v-card-item>
            <template #prepend>
              <v-icon :icon="bucketIcon(bucket.name)" size="28" color="primary" />
            </template>
            <v-card-title>{{ bucket.name }}</v-card-title>
            <v-card-subtitle>Current Balance</v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <div class="text-h5 font-weight-bold mb-2">
              {{ formatZAR(bucket.balance) }}
            </div>

            <!-- Savings progress bar -->
            <template v-if="bucket.name === 'Savings'">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>Goal: {{ formatZAR(SAVINGS_GOAL) }}</span>
                <span>{{ savingsProgress(bucket.balance) }}%</span>
              </div>
              <v-progress-linear
                :model-value="savingsProgress(bucket.balance)"
                color="primary"
                rounded
                height="8"
                bg-color="surface-variant"
              />
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Log Contribution form -->
    <v-card rounded="lg" elevation="2">
      <v-card-title class="pa-4 pb-0">
        <v-icon icon="mdi-plus-circle" class="mr-2" color="primary" />
        Log Transaction
      </v-card-title>

      <v-card-text class="pa-4">
        <v-form ref="formRef" @submit.prevent="submitForm">
          <v-row>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.bucket"
                :items="BUCKETS"
                label="Bucket"
                variant="outlined"
                density="comfortable"
                :rules="[v => !!v || 'Bucket is required']"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.type"
                :items="TYPES"
                label="Type"
                variant="outlined"
                density="comfortable"
                :rules="[v => !!v || 'Type is required']"
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
              <v-text-field
                v-model="form.note"
                label="Note (optional)"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-note-text"
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

    <!-- Snackbar feedback -->
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
