import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkoutHistory from './WorkoutHistory.vue'
import { nextTick } from 'vue'

// Mock the useWorkouts composable
vi.mock('../composables/useWorkouts', () => ({
  useWorkouts: vi.fn(() => ({
    workouts: { value: [] },
    updateWorkout: vi.fn(),
    deleteWorkout: vi.fn(),
    getSortedWorkouts: vi.fn(() => []),
    exportWorkouts: vi.fn()
  }))
}))

describe('WorkoutHistory', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(WorkoutHistory)
  })

  describe('component rendering', () => {
    it('should render the component', () => {
      expect(wrapper.find('.workout-history').exists()).toBe(true)
      expect(wrapper.find('h2').text()).toBe('Workout History')
    })

    it('should render search input', () => {
      expect(wrapper.find('.search-input').exists()).toBe(true)
    })

    it('should render export button', () => {
      expect(wrapper.find('.btn-export').exists()).toBe(true)
      expect(wrapper.find('.btn-export').text()).toBe('Export Data')
    })

    it('should show empty state when no workouts exist', () => {
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-state p').text()).toBe('No workouts yet. Add your first workout!')
    })
  })

  describe('displaying workouts', () => {
    it('should display workouts when they exist', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [
            { name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' }
          ]
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: vi.fn(),
        deleteWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      expect(wrapper.find('.empty-state').exists()).toBe(false)
      expect(wrapper.findAll('.workout-card')).toHaveLength(1)
    })

    it('should display formatted date', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: []
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: vi.fn(),
        deleteWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      const dateText = wrapper.find('.workout-info h3').text()
      expect(dateText).toContain('2024')
    })

    it('should display exercise count', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [
            { name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' },
            { name: 'Squat', weight: 225, sets: 3, reps: 8, notes: '' }
          ]
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: vi.fn(),
        deleteWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      expect(wrapper.find('.exercise-count').text()).toBe('2 exercises')
    })

    it('should use singular form for single exercise', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [{ name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' }]
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: vi.fn(),
        deleteWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      expect(wrapper.find('.exercise-count').text()).toBe('1 exercise')
    })
  })

  describe('expanding workouts', () => {
    it('should not show workout details by default', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [{ name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' }]
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: vi.fn(),
        deleteWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      expect(wrapper.find('.workout-details').exists()).toBe(false)
    })

    it('should expand workout when header is clicked', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [{ name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' }]
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: vi.fn(),
        deleteWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      await wrapper.find('.workout-header').trigger('click')
      await nextTick()

      expect(wrapper.find('.workout-details').exists()).toBe(true)
    })

    it('should display exercises in a table when expanded', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [
            { name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: 'Good form' }
          ]
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: vi.fn(),
        deleteWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      await wrapper.find('.workout-header').trigger('click')
      await nextTick()

      expect(wrapper.find('.exercises-table').exists()).toBe(true)
      expect(wrapper.find('.exercises-table tbody tr').text()).toContain('Bench Press')
      expect(wrapper.find('.exercises-table tbody tr').text()).toContain('185 lbs')
    })
  })

  describe('search functionality', () => {
    it('should filter workouts by exercise name', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [{ name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' }]
        },
        {
          id: '2',
          date: '2024-01-16',
          exercises: [{ name: 'Squat', weight: 225, sets: 3, reps: 8, notes: '' }]
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: vi.fn(),
        deleteWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      await wrapper.find('.search-input').setValue('Bench')
      await nextTick()

      expect(wrapper.findAll('.workout-card')).toHaveLength(1)
    })

    it('should show message when no search results found', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [{ name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' }]
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: vi.fn(),
        deleteWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      await wrapper.find('.search-input').setValue('Deadlift')
      await nextTick()

      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-state p').text()).toContain('No workouts found matching "Deadlift"')
    })
  })

  describe('edit functionality', () => {
    it('should show edit modal when edit button is clicked', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [{ name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' }]
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: vi.fn(),
        deleteWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      await wrapper.find('.btn-edit').trigger('click')
      await nextTick()

      expect(wrapper.find('.modal-overlay').exists()).toBe(true)
      expect(wrapper.find('.modal h3').text()).toBe('Edit Workout')
    })

    it('should populate edit form with workout data', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [{ name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: 'Good' }]
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: vi.fn(),
        deleteWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      await wrapper.find('.btn-edit').trigger('click')
      await nextTick()

      const dateInput = wrapper.find('.modal .form-group input[type="date"]')
      expect(dateInput.element.value).toBe('2024-01-15')
    })

    it('should close modal when cancel is clicked', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [{ name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' }]
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: vi.fn(),
        deleteWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      await wrapper.find('.btn-edit').trigger('click')
      await nextTick()

      expect(wrapper.find('.modal-overlay').exists()).toBe(true)

      await wrapper.find('.modal .btn-cancel').trigger('click')
      await nextTick()

      expect(wrapper.find('.modal-overlay').exists()).toBe(false)
    })

    it('should call updateWorkout when save is clicked', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockUpdateWorkout = vi.fn()
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [{ name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' }]
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: mockUpdateWorkout,
        deleteWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      await wrapper.find('.btn-edit').trigger('click')
      await nextTick()

      await wrapper.find('.modal .btn-save').trigger('click')

      expect(mockUpdateWorkout).toHaveBeenCalled()
    })
  })

  describe('delete functionality', () => {
    it('should call deleteWorkout when delete is confirmed', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockDeleteWorkout = vi.fn()
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [{ name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' }]
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: vi.fn(),
        deleteWorkout: mockDeleteWorkout,
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      // Mock window.confirm
      global.confirm = vi.fn(() => true)

      await wrapper.find('.btn-delete').trigger('click')

      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this workout?')
      expect(mockDeleteWorkout).toHaveBeenCalledWith('1')
    })

    it('should not delete workout when confirmation is cancelled', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockDeleteWorkout = vi.fn()
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [{ name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' }]
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: vi.fn(),
        deleteWorkout: mockDeleteWorkout,
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      // Mock window.confirm to return false
      global.confirm = vi.fn(() => false)

      await wrapper.find('.btn-delete').trigger('click')

      expect(mockDeleteWorkout).not.toHaveBeenCalled()
    })
  })

  describe('export functionality', () => {
    it('should call exportWorkouts when export button is clicked', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockExportWorkouts = vi.fn()

      useWorkouts.mockReturnValue({
        workouts: { value: [] },
        updateWorkout: vi.fn(),
        deleteWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => []),
        exportWorkouts: mockExportWorkouts
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      await wrapper.find('.btn-export').trigger('click')

      expect(mockExportWorkouts).toHaveBeenCalled()
    })
  })

  describe('edit modal exercise management', () => {
    it('should add exercise in edit modal', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [{ name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' }]
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: vi.fn(),
        deleteWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      await wrapper.find('.btn-edit').trigger('click')
      await nextTick()

      expect(wrapper.findAll('.modal .exercise-row')).toHaveLength(1)

      await wrapper.find('.modal .btn-add-exercise').trigger('click')
      await nextTick()

      expect(wrapper.findAll('.modal .exercise-row')).toHaveLength(2)
    })

    it('should remove exercise in edit modal', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [
            { name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' },
            { name: 'Squat', weight: 225, sets: 3, reps: 8, notes: '' }
          ]
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: vi.fn(),
        deleteWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      await wrapper.find('.btn-edit').trigger('click')
      await nextTick()

      expect(wrapper.findAll('.modal .exercise-row')).toHaveLength(2)

      await wrapper.findAll('.modal .btn-remove')[0].trigger('click')
      await nextTick()

      expect(wrapper.findAll('.modal .exercise-row')).toHaveLength(1)
    })

    it('should disable remove button in edit modal when only one exercise', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockWorkouts = [
        {
          id: '1',
          date: '2024-01-15',
          exercises: [{ name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: '' }]
        }
      ]

      useWorkouts.mockReturnValue({
        workouts: { value: mockWorkouts },
        updateWorkout: vi.fn(),
        deleteWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => mockWorkouts),
        exportWorkouts: vi.fn()
      })

      wrapper = mount(WorkoutHistory)
      await nextTick()

      await wrapper.find('.btn-edit').trigger('click')
      await nextTick()

      const removeButton = wrapper.find('.modal .btn-remove')
      expect(removeButton.attributes('disabled')).toBeDefined()
    })
  })
})
