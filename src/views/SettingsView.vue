<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '../stores/settings.js'
import { useExpensesStore } from '../stores/expenses.js'

const store = useSettingsStore()
const expensesStore = useExpensesStore()

const snackbar = ref({ show: false, message: '', color: 'success' })

function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

function formatZAR(value) {
  return `R ${Number(value).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ── Salary ────────────────────────────────────────────────────────────────────
const editingSalary = ref(false)
const salaryInput = ref('')
const savingSalary = ref(false)

function startEditSalary() {
  salaryInput.value = String(store.salary)
  editingSalary.value = true
}

function cancelEditSalary() {
  editingSalary.value = false
  salaryInput.value = ''
}

async function saveSalary() {
  const value = parseFloat(salaryInput.value)
  if (!value || value <= 0) return
  savingSalary.value = true
  try {
    await store.updateSalary(value)
    editingSalary.value = false
    showSnackbar('Salary updated successfully.')
  } catch (e) {
    showSnackbar(`Error: ${e.message}`, 'error')
  } finally {
    savingSalary.value = false
  }
}

// ── Categories ────────────────────────────────────────────────────────────────
const newCategory = ref('')
const savingCategories = ref(false)

async function persistCategories() {
  savingCategories.value = true
  try {
    await store.updateCategories(store.categories)
    await expensesStore.fetchCategories()
  } catch (e) {
    showSnackbar(`Error: ${e.message}`, 'error')
  } finally {
    savingCategories.value = false
  }
}

async function addCategory() {
  const trimmed = newCategory.value.trim()
  if (!trimmed) return
  const duplicate = store.categories.some(
    (c) => c.toLowerCase() === trimmed.toLowerCase(),
  )
  if (duplicate) {
    showSnackbar('Category already exists.', 'warning')
    return
  }
  store.categories.push(trimmed)
  newCategory.value = ''
  await persistCategories()
  showSnackbar('Category added.')
}

async function removeCategory(name) {
  const index = store.categories.indexOf(name)
  if (index === -1) return
  store.categories.splice(index, 1)
  await persistCategories()
  showSnackbar('Category removed.')
}

onMounted(() => store.fetchSettings())
</script>

<template>
  <v-container class="pa-4">

    <!-- Error alert -->
    <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4">
      {{ store.error }}
    </v-alert>

    <!-- Section 1: Salary -->
    <v-card rounded="lg" elevation="2" class="mb-4">
      <v-card-title class="pa-4 pb-0">
        <v-icon icon="mdi-cash" class="mr-2" color="primary" />
        Monthly Salary
      </v-card-title>

      <v-card-text class="pa-4">
        <v-skeleton-loader v-if="store.loading" type="list-item" />

        <template v-else-if="!editingSalary">
          <div class="d-flex align-center justify-space-between">
            <span class="text-h6 font-weight-bold">{{ formatZAR(store.salary) }}</span>
            <v-btn
              variant="tonal"
              size="small"
              prepend-icon="mdi-pencil"
              @click="startEditSalary"
            >
              Edit
            </v-btn>
          </div>
        </template>

        <template v-else>
          <v-text-field
            v-model="salaryInput"
            label="New Salary (R)"
            type="number"
            min="1"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-currency-usd"
            class="mb-3"
            autofocus
          />
          <div class="d-flex gap-2">
            <v-btn
              color="primary"
              variant="tonal"
              :loading="savingSalary"
              prepend-icon="mdi-check"
              @click="saveSalary"
            >
              Save
            </v-btn>
            <v-btn
              variant="text"
              prepend-icon="mdi-close"
              @click="cancelEditSalary"
            >
              Cancel
            </v-btn>
          </div>
        </template>
      </v-card-text>
    </v-card>

    <!-- Section 2: Categories -->
    <v-card rounded="lg" elevation="2">
      <v-card-title class="pa-4 pb-0">
        <v-icon icon="mdi-tag-multiple" class="mr-2" color="primary" />
        Expense Categories
      </v-card-title>

      <v-card-text class="pa-4">
        <v-skeleton-loader v-if="store.loading" type="chip@5" />

        <template v-else>
          <div class="d-flex flex-wrap gap-2 mb-4">
            <v-chip
              v-for="cat in store.categories"
              :key="cat"
              closable
              :disabled="savingCategories"
              @click:close="removeCategory(cat)"
            >
              {{ cat }}
            </v-chip>
            <span v-if="store.categories.length === 0" class="text-medium-emphasis text-body-2">
              No categories yet.
            </span>
          </div>

          <div class="d-flex gap-2 align-start">
            <v-text-field
              v-model="newCategory"
              label="New category"
              variant="outlined"
              density="comfortable"
              hide-details
              @keyup.enter="addCategory"
            />
            <v-btn
              color="primary"
              size="large"
              :loading="savingCategories"
              icon="mdi-plus"
              @click="addCategory"
            />
          </div>
        </template>
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
