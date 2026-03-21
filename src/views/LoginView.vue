<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../services/auth.js'

const router = useRouter()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const submitting = ref(false)
const errorMessage = ref('')

async function submit() {
  errorMessage.value = ''
  submitting.value = true
  try {
    await login(username.value, password.value)
    router.push('/')
  } catch (e) {
    errorMessage.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="d-flex align-center justify-center" style="min-height: 100vh;">
    <v-card width="360" rounded="lg" elevation="4" class="pa-2">
      <v-card-item class="text-center pb-0">
        <v-icon icon="mdi-lock" size="40" color="primary" class="mb-2" />
        <v-card-title class="text-h5 font-weight-bold">Finance Tracker</v-card-title>
        <v-card-subtitle>Sign in to continue</v-card-subtitle>
      </v-card-item>

      <v-card-text class="pt-4">
        <v-form @submit.prevent="submit">
          <v-text-field
            v-model="username"
            label="Username"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-account"
            class="mb-3"
            :disabled="submitting"
          />

          <v-text-field
            v-model="password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-key"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            class="mb-4"
            :disabled="submitting"
            @click:append-inner="showPassword = !showPassword"
          />

          <v-btn
            type="submit"
            color="primary"
            size="large"
            block
            :loading="submitting"
          >
            Sign In
          </v-btn>

          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mt-4"
          >
            {{ errorMessage }}
          </v-alert>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>
