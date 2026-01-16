import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useWorkouts } from './useWorkouts'
import { nextTick } from 'vue'

describe('useWorkouts', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    localStorage.getItem.mockReturnValue(null)
    localStorage.setItem.mockClear()
  })

  describe('initialization', () => {
    it('should initialize with empty workouts when localStorage is empty', () => {
      const { workouts } = useWorkouts()
      expect(workouts.value).toEqual([])
    })

    it('should load workouts from localStorage on initialization', () => {
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [{ name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' }]
        }
      ]
      localStorage.getItem.mockReturnValue(JSON.stringify(mockWorkouts))

      const { workouts } = useWorkouts()
      expect(workouts.value).toEqual(mockWorkouts)
    })

    it('should return empty array when localStorage has invalid JSON', () => {
      localStorage.getItem.mockReturnValue('invalid json')
      const { workouts } = useWorkouts()
      expect(workouts.value).toEqual([])
    })
  })

  describe('addWorkout', () => {
    it('should add a new workout with generated id', () => {
      const { workouts, addWorkout } = useWorkouts()

      const workout = {
        date: '2024-01-15',
        exercises: [{ name: 'Squat', weight: 225, sets: 3, reps: 8, notes: 'Good form' }]
      }

      const result = addWorkout(workout)

      expect(workouts.value).toHaveLength(1)
      expect(result.id).toBeDefined()
      expect(result.date).toBe('2024-01-15')
      expect(result.exercises).toEqual(workout.exercises)
    })

    it('should add workout with today\'s date if no date provided', () => {
      const { workouts, addWorkout } = useWorkouts()
      const today = new Date().toISOString().split('T')[0]

      const workout = {
        exercises: [{ name: 'Deadlift', weight: 315, sets: 1, reps: 5, notes: '' }]
      }

      const result = addWorkout(workout)

      expect(result.date).toBe(today)
    })

    it('should add workouts to the beginning of the array', () => {
      const { workouts, addWorkout } = useWorkouts()

      addWorkout({ date: '2024-01-15', exercises: [] })
      addWorkout({ date: '2024-01-16', exercises: [] })

      expect(workouts.value[0].date).toBe('2024-01-16')
      expect(workouts.value[1].date).toBe('2024-01-15')
    })

    it('should save to localStorage after adding workout', async () => {
      const { addWorkout } = useWorkouts()

      addWorkout({ date: '2024-01-15', exercises: [] })

      // Wait for the watch to trigger
      await nextTick()

      expect(localStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('updateWorkout', () => {
    it('should update an existing workout', async () => {
      const mockWorkouts = [
        { id: '1', date: '2024-01-15', exercises: [] }
      ]
      localStorage.getItem.mockReturnValue(JSON.stringify(mockWorkouts))

      const { workouts, updateWorkout } = useWorkouts()

      const result = updateWorkout('1', {
        date: '2024-01-16',
        exercises: [{ name: 'Press', weight: 135, sets: 3, reps: 10, notes: '' }]
      })

      expect(result).toBe(true)
      expect(workouts.value[0].date).toBe('2024-01-16')
      expect(workouts.value[0].exercises).toHaveLength(1)
    })

    it('should return false when workout id not found', () => {
      const { updateWorkout } = useWorkouts()

      const result = updateWorkout('nonexistent', { date: '2024-01-15' })

      expect(result).toBe(false)
    })

    it('should merge updated fields with existing workout', async () => {
      const mockWorkouts = [
        { id: '1', date: '2024-01-15', exercises: [{ name: 'Squat', weight: 200, sets: 3, reps: 10 }] }
      ]
      localStorage.getItem.mockReturnValue(JSON.stringify(mockWorkouts))

      const { workouts, updateWorkout } = useWorkouts()

      updateWorkout('1', { date: '2024-01-16' })

      expect(workouts.value[0].date).toBe('2024-01-16')
      expect(workouts.value[0].exercises).toEqual(mockWorkouts[0].exercises)
    })
  })

  describe('deleteWorkout', () => {
    it('should delete an existing workout', () => {
      const mockWorkouts = [
        { id: '1', date: '2024-01-15', exercises: [] },
        { id: '2', date: '2024-01-16', exercises: [] }
      ]
      localStorage.getItem.mockReturnValue(JSON.stringify(mockWorkouts))

      const { workouts, deleteWorkout } = useWorkouts()

      const result = deleteWorkout('1')

      expect(result).toBe(true)
      expect(workouts.value).toHaveLength(1)
      expect(workouts.value[0].id).toBe('2')
    })

    it('should return false when workout id not found', () => {
      const { deleteWorkout } = useWorkouts()

      const result = deleteWorkout('nonexistent')

      expect(result).toBe(false)
    })
  })

  describe('getSortedWorkouts', () => {
    it('should return workouts sorted by date (newest first)', () => {
      const mockWorkouts = [
        { id: '1', date: '2024-01-10', exercises: [] },
        { id: '2', date: '2024-01-15', exercises: [] },
        { id: '3', date: '2024-01-12', exercises: [] }
      ]
      localStorage.getItem.mockReturnValue(JSON.stringify(mockWorkouts))

      const { getSortedWorkouts } = useWorkouts()

      const sorted = getSortedWorkouts()

      expect(sorted[0].date).toBe('2024-01-15')
      expect(sorted[1].date).toBe('2024-01-12')
      expect(sorted[2].date).toBe('2024-01-10')
    })

    it('should not mutate original workouts array', () => {
      const mockWorkouts = [
        { id: '1', date: '2024-01-10', exercises: [] },
        { id: '2', date: '2024-01-15', exercises: [] }
      ]
      localStorage.getItem.mockReturnValue(JSON.stringify(mockWorkouts))

      const { workouts, getSortedWorkouts } = useWorkouts()

      const sorted = getSortedWorkouts()
      sorted[0].date = '2024-01-01'

      expect(workouts.value[0].date).toBe('2024-01-10')
    })
  })

  describe('importWorkouts', () => {
    it('should import valid JSON workout data', () => {
      const { workouts, importWorkouts } = useWorkouts()

      const jsonData = JSON.stringify([
        { id: '1', date: '2024-01-15', exercises: [] }
      ])

      const result = importWorkouts(jsonData)

      expect(result).toBe(true)
      expect(workouts.value).toHaveLength(1)
    })

    it('should return false for invalid JSON', () => {
      const { importWorkouts } = useWorkouts()

      const result = importWorkouts('invalid json')

      expect(result).toBe(false)
    })

    it('should return false for non-array JSON', () => {
      const { importWorkouts } = useWorkouts()

      const result = importWorkouts(JSON.stringify({ not: 'an array' }))

      expect(result).toBe(false)
    })

    it('should replace existing workouts on import', () => {
      const mockWorkouts = [
        { id: '1', date: '2024-01-10', exercises: [] }
      ]
      localStorage.getItem.mockReturnValue(JSON.stringify(mockWorkouts))

      const { workouts, importWorkouts } = useWorkouts()

      const newWorkouts = [
        { id: '2', date: '2024-01-15', exercises: [] }
      ]

      importWorkouts(JSON.stringify(newWorkouts))

      expect(workouts.value).toHaveLength(1)
      expect(workouts.value[0].id).toBe('2')
    })
  })

  describe('getExerciseHistory', () => {
    it('should return all instances of an exercise across workouts', () => {
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [
            { name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' },
            { name: 'Squat', weight: 225, sets: 3, reps: 8, notes: '' }
          ]
        },
        {
          id: '2',
          date: '2024-01-17',
          exercises: [
            { name: 'Bench Press', weight: 190, sets: 3, reps: 10, notes: 'Felt strong' }
          ]
        }
      ]
      localStorage.getItem.mockReturnValue(JSON.stringify(mockWorkouts))

      const { getExerciseHistory } = useWorkouts()

      const history = getExerciseHistory('Bench Press')

      expect(history).toHaveLength(2)
      expect(history[0].date).toBe('2024-01-17')
      expect(history[0].weight).toBe(190)
      expect(history[1].date).toBe('2024-01-15')
      expect(history[1].weight).toBe(185)
    })

    it('should be case-insensitive when matching exercise names', () => {
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [{ name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' }]
        }
      ]
      localStorage.getItem.mockReturnValue(JSON.stringify(mockWorkouts))

      const { getExerciseHistory } = useWorkouts()

      const history = getExerciseHistory('bench press')

      expect(history).toHaveLength(1)
    })

    it('should return empty array when exercise not found', () => {
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [{ name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' }]
        }
      ]
      localStorage.getItem.mockReturnValue(JSON.stringify(mockWorkouts))

      const { getExerciseHistory } = useWorkouts()

      const history = getExerciseHistory('Deadlift')

      expect(history).toEqual([])
    })

    it('should sort history by date (newest first)', () => {
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-10',
          exercises: [{ name: 'Squat', weight: 200, sets: 3, reps: 10, notes: '' }]
        },
        {
          id: '2',
          date: '2024-01-15',
          exercises: [{ name: 'Squat', weight: 225, sets: 3, reps: 8, notes: '' }]
        },
        {
          id: '3',
          date: '2024-01-12',
          exercises: [{ name: 'Squat', weight: 210, sets: 3, reps: 10, notes: '' }]
        }
      ]
      localStorage.getItem.mockReturnValue(JSON.stringify(mockWorkouts))

      const { getExerciseHistory } = useWorkouts()

      const history = getExerciseHistory('Squat')

      expect(history[0].weight).toBe(225)
      expect(history[1].weight).toBe(210)
      expect(history[2].weight).toBe(200)
    })
  })

  describe('exportWorkouts', () => {
    it('should create a download link with workout data', () => {
      const mockWorkouts = [
        { id: '1', date: '2024-01-15', exercises: [] }
      ]
      localStorage.getItem.mockReturnValue(JSON.stringify(mockWorkouts))

      // Mock DOM APIs
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
      global.URL.revokeObjectURL = vi.fn()
      document.createElement = vi.fn(() => mockLink)

      const { exportWorkouts } = useWorkouts()
      exportWorkouts()

      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(mockLink.href).toBe('blob:mock-url')
      expect(mockLink.download).toContain('workout-backup-')
      expect(mockLink.download).toContain('.json')
      expect(mockLink.click).toHaveBeenCalled()
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })
  })

  describe('localStorage persistence', () => {
    it('should save to localStorage when workouts are modified', async () => {
      const { workouts } = useWorkouts()

      // Manually trigger a modification
      workouts.value.push({ id: '1', date: '2024-01-15', exercises: [] })

      // Wait for the watch to trigger
      await nextTick()

      expect(localStorage.setItem).toHaveBeenCalled()
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'workout-tracker-data',
        expect.any(String)
      )
    })
  })
})
