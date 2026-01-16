<template>
  <div class="workout-history">
    <div class="history-header">
      <h2>Workout History</h2>

      <div class="actions">
        <button @click="exportWorkouts" class="btn-export">
          Export Data
        </button>
      </div>
    </div>

    <div class="filter-section">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by exercise name or date..."
        class="search-input"
      />
    </div>

    <div v-if="filteredWorkouts.length === 0" class="empty-state">
      <p v-if="searchQuery">No workouts found matching "{{ searchQuery }}"</p>
      <p v-else>No workouts yet. Add your first workout!</p>
    </div>

    <div v-else class="workouts-list">
      <div
        v-for="workout in filteredWorkouts"
        :key="workout.id"
        class="workout-card"
      >
        <div class="workout-header" @click="toggleWorkout(workout.id)">
          <div class="workout-info">
            <h3>{{ formatDate(workout.date) }}</h3>
            <span class="exercise-count">
              {{ workout.exercises.length }} exercise{{ workout.exercises.length !== 1 ? 's' : '' }}
            </span>
          </div>
          <div class="workout-actions">
            <button
              @click.stop="editWorkout(workout)"
              class="btn-edit"
              title="Edit"
            >
              ✎
            </button>
            <button
              @click.stop="confirmDelete(workout.id)"
              class="btn-delete"
              title="Delete"
            >
              🗑
            </button>
            <span class="expand-icon">
              {{ expandedWorkouts[workout.id] ? '▼' : '▶' }}
            </span>
          </div>
        </div>

        <div v-if="expandedWorkouts[workout.id]" class="workout-details">
          <table class="exercises-table">
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Weight</th>
                <th>Sets</th>
                <th>Reps</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(exercise, index) in workout.exercises" :key="index">
                <td>{{ exercise.name }}</td>
                <td>{{ exercise.weight }} lbs</td>
                <td>{{ exercise.sets }}</td>
                <td>{{ exercise.reps }}</td>
                <td>{{ exercise.notes || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editingWorkout" class="modal-overlay" @click="cancelEdit">
      <div class="modal" @click.stop>
        <h3>Edit Workout</h3>

        <div class="form-group">
          <label>Date:</label>
          <input
            v-model="editForm.date"
            type="date"
            required
          />
        </div>

        <div class="exercises-section">
          <h4>Exercises</h4>

          <div
            v-for="(exercise, index) in editForm.exercises"
            :key="index"
            class="exercise-row"
          >
            <div class="exercise-fields">
              <input
                v-model="exercise.name"
                type="text"
                placeholder="Exercise name"
                required
              />

              <input
                v-model.number="exercise.weight"
                type="number"
                placeholder="Weight"
                required
                min="0"
                step="0.5"
              />

              <input
                v-model.number="exercise.sets"
                type="number"
                placeholder="Sets"
                required
                min="1"
              />

              <input
                v-model.number="exercise.reps"
                type="number"
                placeholder="Reps"
                required
                min="1"
              />

              <input
                v-model="exercise.notes"
                type="text"
                placeholder="Notes"
              />

              <button
                type="button"
                @click="removeExercise(index)"
                class="btn-remove"
                :disabled="editForm.exercises.length === 1"
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

        <div class="modal-actions">
          <button @click="saveEdit" class="btn-save">Save</button>
          <button @click="cancelEdit" class="btn-cancel">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWorkouts } from '../composables/useWorkouts'

const {
  workouts,
  updateWorkout,
  deleteWorkout,
  getSortedWorkouts,
  exportWorkouts
} = useWorkouts()

const searchQuery = ref('')
const expandedWorkouts = ref({})
const editingWorkout = ref(null)
const editForm = ref({
  date: '',
  exercises: []
})

const filteredWorkouts = computed(() => {
  const sorted = getSortedWorkouts()
  if (!searchQuery.value) {
    return sorted
  }

  const query = searchQuery.value.toLowerCase()
  return sorted.filter(workout => {
    const dateMatch = formatDate(workout.date).toLowerCase().includes(query)
    const exerciseMatch = workout.exercises.some(ex =>
      ex.name.toLowerCase().includes(query)
    )
    return dateMatch || exerciseMatch
  })
})

function formatDate(dateString) {
  // Parse YYYY-MM-DD without timezone conversion
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day) // month is 0-indexed
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function toggleWorkout(id) {
  expandedWorkouts.value[id] = !expandedWorkouts.value[id]
}

function editWorkout(workout) {
  editingWorkout.value = workout.id
  editForm.value = {
    date: workout.date, // Already in YYYY-MM-DD format
    exercises: JSON.parse(JSON.stringify(workout.exercises))
  }
}

function addExercise() {
  editForm.value.exercises.push({
    name: '',
    weight: null,
    sets: null,
    reps: null,
    notes: ''
  })
}

function removeExercise(index) {
  if (editForm.value.exercises.length > 1) {
    editForm.value.exercises.splice(index, 1)
  }
}

function saveEdit() {
  updateWorkout(editingWorkout.value, {
    date: editForm.value.date, // Store as YYYY-MM-DD
    exercises: editForm.value.exercises
  })
  cancelEdit()
}

function cancelEdit() {
  editingWorkout.value = null
  editForm.value = {
    date: '',
    exercises: []
  }
}

function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this workout?')) {
    deleteWorkout(id)
    delete expandedWorkouts.value[id]
  }
}
</script>

<style scoped>
.workout-history {
  max-width: 900px;
  margin: 0 auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-export {
  padding: 0.5rem 1rem;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-export:hover {
  background: #138496;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.workouts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.workout-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.workout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  background: #f8f9fa;
  transition: background 0.2s;
}

.workout-header:hover {
  background: #e9ecef;
}

.workout-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
}

.exercise-count {
  color: #6c757d;
  font-size: 0.9rem;
}

.workout-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-edit,
.btn-delete {
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.btn-edit:hover {
  opacity: 0.7;
}

.btn-delete:hover {
  opacity: 0.7;
}

.expand-icon {
  margin-left: 0.5rem;
  color: #6c757d;
}

.workout-details {
  padding: 1rem;
  border-top: 1px solid #ddd;
}

.exercises-table {
  width: 100%;
  border-collapse: collapse;
}

.exercises-table th {
  text-align: left;
  padding: 0.5rem;
  background: #f8f9fa;
  border-bottom: 2px solid #ddd;
}

.exercises-table td {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.exercises-table tr:last-child td {
  border-bottom: none;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h3 {
  margin-top: 0;
}

.form-group {
  margin-bottom: 1rem;
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

.exercises-section h4 {
  margin-bottom: 1rem;
}

.exercise-row {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.exercise-fields {
  display: grid;
  grid-template-columns: 2fr 1fr 0.8fr 0.8fr 1.5fr auto;
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
  width: 100%;
}

.btn-add-exercise:hover {
  background: #218838;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-save,
.btn-cancel {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-save {
  background: #007bff;
  color: white;
}

.btn-save:hover {
  background: #0056b3;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #545b62;
}

@media (max-width: 768px) {
  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .exercises-table {
    font-size: 0.9rem;
  }

  .exercises-table th,
  .exercises-table td {
    padding: 0.3rem;
  }

  .exercise-fields {
    grid-template-columns: 1fr;
  }

  .modal {
    width: 95%;
    padding: 1rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-save,
  .btn-cancel {
    width: 100%;
  }
}
</style>
