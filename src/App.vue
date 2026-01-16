<template>
  <div id="app">
    <header>
      <h1>Alpha Class Workout Tracker</h1>
      <p class="subtitle">Track your Lifetime Gym Alpha workouts</p>
    </header>

    <nav class="tabs">
      <button
        :class="['tab', { active: currentView === 'form' }]"
        @click="currentView = 'form'"
      >
        Add Workout
      </button>
      <button
        :class="['tab', { active: currentView === 'history' }]"
        @click="currentView = 'history'"
      >
        History
      </button>
    </nav>

    <main>
      <WorkoutForm v-if="currentView === 'form'" />
      <WorkoutHistory v-else-if="currentView === 'history'" />
    </main>

    <footer>
      <p>Data stored locally in your browser</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import WorkoutForm from './components/WorkoutForm.vue'
import WorkoutHistory from './components/WorkoutHistory.vue'

const currentView = ref('form')
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1rem;
  opacity: 0.9;
}

.tabs {
  display: flex;
  background: white;
  border-bottom: 2px solid #ddd;
  justify-content: center;
  gap: 0;
}

.tab {
  flex: 1;
  max-width: 200px;
  padding: 1rem 2rem;
  background: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: #6c757d;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
}

.tab:hover {
  background: #f8f9fa;
  color: #495057;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: #f8f9fa;
}

main {
  flex: 1;
  padding: 2rem 1rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

footer {
  text-align: center;
  padding: 1rem;
  background: white;
  border-top: 1px solid #ddd;
  color: #6c757d;
  font-size: 0.9rem;
}

button {
  font-family: inherit;
}

input,
select,
textarea {
  font-family: inherit;
}

@media (max-width: 768px) {
  header h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  main {
    padding: 1rem 0.5rem;
  }

  .tab {
    padding: 1rem;
    font-size: 0.9rem;
  }
}
</style>
