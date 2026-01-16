import { ref, watch } from 'vue'

const STORAGE_KEY = 'workout-tracker-data'

// Generate a simple unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Load workouts from localStorage
function loadWorkouts() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error loading workouts:', error)
    return []
  }
}

// Save workouts to localStorage
function saveToStorage(workouts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts))
  } catch (error) {
    console.error('Error saving workouts:', error)
  }
}

export function useWorkouts() {
  const workouts = ref(loadWorkouts())

  // Auto-save whenever workouts change
  watch(workouts, (newWorkouts) => {
    saveToStorage(newWorkouts)
  }, { deep: true })

  // Add a new workout
  function addWorkout(workout) {
    const newWorkout = {
      id: generateId(),
      date: workout.date || new Date().toISOString().split('T')[0],
      exercises: workout.exercises || []
    }
    workouts.value.unshift(newWorkout)
    return newWorkout
  }

  // Update an existing workout
  function updateWorkout(id, updatedWorkout) {
    const index = workouts.value.findIndex(w => w.id === id)
    if (index !== -1) {
      workouts.value[index] = {
        ...workouts.value[index],
        ...updatedWorkout
      }
      return true
    }
    return false
  }

  // Delete a workout
  function deleteWorkout(id) {
    const index = workouts.value.findIndex(w => w.id === id)
    if (index !== -1) {
      workouts.value.splice(index, 1)
      return true
    }
    return false
  }

  // Get workouts sorted by date (newest first)
  function getSortedWorkouts() {
    return [...workouts.value].sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    )
  }

  // Export workouts as JSON
  function exportWorkouts() {
    const dataStr = JSON.stringify(workouts.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `workout-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Import workouts from JSON
  function importWorkouts(jsonData) {
    try {
      const importedWorkouts = JSON.parse(jsonData)
      if (Array.isArray(importedWorkouts)) {
        workouts.value = importedWorkouts
        return true
      }
      return false
    } catch (error) {
      console.error('Error importing workouts:', error)
      return false
    }
  }

  // Get exercise history (all instances of an exercise across workouts)
  function getExerciseHistory(exerciseName) {
    const history = []
    workouts.value.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (exercise.name.toLowerCase() === exerciseName.toLowerCase()) {
          history.push({
            date: workout.date,
            ...exercise
          })
        }
      })
    })
    return history.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  return {
    workouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getSortedWorkouts,
    exportWorkouts,
    importWorkouts,
    getExerciseHistory
  }
}
