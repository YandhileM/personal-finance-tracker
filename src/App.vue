<script setup>
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const drawer = ref(false)

const isDark = computed(() => theme.global.name.value === 'dark')

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

const navItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
  { title: 'Expenses', icon: 'mdi-receipt-text', to: '/expenses' },
  { title: 'Settings', icon: 'mdi-cog', to: '/settings' },
]
</script>

<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list-item
        title="Finance Tracker"
        subtitle="Personal Finance"
        prepend-icon="mdi-finance"
        class="py-4"
      />

      <v-divider />

      <v-list nav density="compact">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          rounded="lg"
          @click="drawer = false"
        />
      </v-list>

      <template #append>
        <v-divider />
        <v-list-item class="py-3">
          <template #prepend>
            <v-icon>{{ isDark ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
          </template>
          <v-list-item-title>{{ isDark ? 'Dark Mode' : 'Light Mode' }}</v-list-item-title>
          <template #append>
            <v-switch
              :model-value="isDark"
              hide-details
              density="compact"
              @change="toggleTheme"
            />
          </template>
        </v-list-item>
      </template>
    </v-navigation-drawer>

    <v-app-bar elevation="1">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>Finance Tracker</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
