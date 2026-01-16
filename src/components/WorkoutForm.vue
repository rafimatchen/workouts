<template>
  <div class="workout-form">
    <div class="form-header">
      <h2>Add New Workout</h2>
      <button
        v-if="lastWorkout"
        type="button"
        @click="copyLastWorkout"
        class="btn-copy-last"
        title="Copy exercises from your last workout"
      >
        📋 Copy Last Workout
      </button>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="workout-date">Date:</label>
        <input
          id="workout-date"
          v-model="workoutDate"
          type="date"
          required
        />
      </div>

      <div class="exercises-section">
        <h3>Exercises</h3>

        <div
          v-for="(exercise, index) in exercises"
          :key="index"
          class="exercise-row"
        >
          <div class="exercise-fields">
            <input
              v-model="exercise.name"
              type="text"
              placeholder="Exercise name"
              required
              class="exercise-name"
              list="exercise-suggestions"
            />

            <input
              v-model.number="exercise.weight"
              type="number"
              placeholder="Weight (lbs)"
              required
              min="0"
              step="0.5"
              class="exercise-weight"
            />

            <input
              v-model.number="exercise.sets"
              type="number"
              placeholder="Sets"
              required
              min="1"
              class="exercise-sets"
            />

            <input
              v-model.number="exercise.reps"
              type="number"
              placeholder="Reps"
              required
              min="1"
              class="exercise-reps"
            />

            <input
              v-model="exercise.notes"
              type="text"
              placeholder="Notes (optional)"
              class="exercise-notes"
            />

            <button
              type="button"
              @click="removeExercise(index)"
              class="btn-remove"
              :disabled="exercises.length === 1"
            >
              ✕
            </button>
          </div>
        </div>

        <button
          type="button"
          @click="addExercise"
          class="btn-add-exercise"
        >
          + Add Exercise
        </button>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-submit">
          Save Workout
        </button>
        <button type="button" @click="resetForm" class="btn-cancel">
          Clear
        </button>
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </form>

    <datalist id="exercise-suggestions">
      <option v-for="name in exerciseSuggestions" :key="name" :value="name" />
    </datalist>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWorkouts } from '../composables/useWorkouts'

const { workouts, addWorkout, getSortedWorkouts } = useWorkouts()

const workoutDate = ref('')
const exercises = ref([createEmptyExercise()])
const successMessage = ref('')

// Get unique exercise names from previous workouts for autocomplete
const exerciseSuggestions = computed(() => {
  const names = new Set()
  workouts.value.forEach(workout => {
    workout.exercises.forEach(ex => {
      if (ex.name) {
        names.add(ex.name)
      }
    })
  })
  return Array.from(names).sort()
})

// Get the most recent workout
const lastWorkout = computed(() => {
  const sorted = getSortedWorkouts()
  return sorted.length > 0 ? sorted[0] : null
})

function createEmptyExercise() {
  return {
    name: '',
    weight: null,
    sets: null,
    reps: null,
    notes: ''
  }
}

function addExercise() {
  exercises.value.push(createEmptyExercise())
}

function removeExercise(index) {
  if (exercises.value.length > 1) {
    exercises.value.splice(index, 1)
  }
}

function copyLastWorkout() {
  if (lastWorkout.value) {
    exercises.value = lastWorkout.value.exercises.map(ex => ({
      name: ex.name,
      weight: ex.weight,
      sets: ex.sets,
      reps: ex.reps,
      notes: ex.notes || ''
    }))
  }
}

function handleSubmit() {
  const workout = {
    date: workoutDate.value, // Store as YYYY-MM-DD to avoid timezone issues
    exercises: exercises.value.map(ex => ({
      name: ex.name,
      weight: ex.weight,
      sets: ex.sets,
      reps: ex.reps,
      notes: ex.notes || ''
    }))
  }

  addWorkout(workout)

  successMessage.value = 'Workout saved successfully!'
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)

  resetForm()
}

function resetForm() {
  workoutDate.value = new Date().toISOString().split('T')[0]
  exercises.value = [createEmptyExercise()]
}

onMounted(() => {
  resetForm()
})
</script>

<style scoped>
.workout-form {
  max-width: 900px;
  margin: 0 auto;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.form-header h2 {
  margin: 0;
}

.btn-copy-last {
  padding: 0.5rem 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-copy-last:hover {
  background: #545b62;
}

h2 {
  margin-bottom: 1.5rem;
}

h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  max-width: 200px;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.exercises-section {
  margin-bottom: 1.5rem;
}

.exercise-row {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.exercise-fields {
  display: grid;
  grid-template-columns: 2fr 1fr 0.7fr 0.7fr 1.2fr 40px;
  gap: 0.5rem;
  align-items: center;
}

.exercise-fields input {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-remove {
  padding: 0.5rem 0.75rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-remove:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-remove:hover:not(:disabled) {
  background: #c82333;
}

.btn-add-exercise {
  padding: 0.75rem 1rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
}

.btn-add-exercise:hover {
  background: #218838;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-submit,
.btn-cancel {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit {
  background: #007bff;
  color: white;
}

.btn-submit:hover {
  background: #0056b3;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #545b62;
}

.success-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .exercise-fields {
    grid-template-columns: 1fr;
  }

  .exercise-name {
    grid-column: 1;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-submit,
  .btn-cancel {
    width: 100%;
  }
}
</style>
