import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkoutForm from './WorkoutForm.vue'
import { nextTick } from 'vue'

// Mock the useWorkouts composable
vi.mock('../composables/useWorkouts', () => ({
  useWorkouts: vi.fn(() => ({
    workouts: { value: [] },
    addWorkout: vi.fn(),
    getSortedWorkouts: vi.fn(() => [])
  }))
}))

describe('WorkoutForm', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(WorkoutForm)
  })

  describe('component rendering', () => {
    it('should render the form', () => {
      expect(wrapper.find('form').exists()).toBe(true)
      expect(wrapper.find('h2').text()).toBe('Add New Workout')
    })

    it('should render date input', () => {
      expect(wrapper.find('#workout-date').exists()).toBe(true)
    })

    it('should render at least one exercise row on mount', () => {
      expect(wrapper.findAll('.exercise-row')).toHaveLength(1)
    })

    it('should render submit and clear buttons', () => {
      expect(wrapper.find('.btn-submit').text()).toBe('Save Workout')
      expect(wrapper.find('.btn-cancel').text()).toBe('Clear')
    })

    it('should not show copy last workout button when no workouts exist', () => {
      expect(wrapper.find('.btn-copy-last').exists()).toBe(false)
    })
  })

  describe('form initialization', () => {
    it('should initialize with today\'s date', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(wrapper.find('#workout-date').element.value).toBe(today)
    })

    it('should initialize with one empty exercise', () => {
      const inputs = wrapper.findAll('.exercise-row input')
      expect(inputs.length).toBeGreaterThan(0)
      inputs.forEach(input => {
        expect(input.element.value).toBe('')
      })
    })
  })

  describe('adding exercises', () => {
    it('should add a new exercise row when add button is clicked', async () => {
      expect(wrapper.findAll('.exercise-row')).toHaveLength(1)

      await wrapper.find('.btn-add-exercise').trigger('click')

      expect(wrapper.findAll('.exercise-row')).toHaveLength(2)
    })

    it('should add multiple exercise rows', async () => {
      await wrapper.find('.btn-add-exercise').trigger('click')
      await wrapper.find('.btn-add-exercise').trigger('click')
      await wrapper.find('.btn-add-exercise').trigger('click')

      expect(wrapper.findAll('.exercise-row')).toHaveLength(4)
    })
  })

  describe('removing exercises', () => {
    it('should remove an exercise row when remove button is clicked', async () => {
      await wrapper.find('.btn-add-exercise').trigger('click')
      expect(wrapper.findAll('.exercise-row')).toHaveLength(2)

      await wrapper.findAll('.btn-remove')[0].trigger('click')

      expect(wrapper.findAll('.exercise-row')).toHaveLength(1)
    })

    it('should disable remove button when only one exercise exists', () => {
      const removeButton = wrapper.find('.btn-remove')
      expect(removeButton.attributes('disabled')).toBeDefined()
    })

    it('should enable remove button when multiple exercises exist', async () => {
      await wrapper.find('.btn-add-exercise').trigger('click')

      const removeButtons = wrapper.findAll('.btn-remove')
      expect(removeButtons[0].attributes('disabled')).toBeUndefined()
    })
  })

  describe('form submission', () => {
    it('should call addWorkout when form is submitted', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockAddWorkout = vi.fn()
      useWorkouts.mockReturnValue({
        workouts: { value: [] },
        addWorkout: mockAddWorkout,
        getSortedWorkouts: vi.fn(() => [])
      })

      wrapper = mount(WorkoutForm)

      // Fill in form
      await wrapper.find('#workout-date').setValue('2024-01-15')

      const exerciseInputs = wrapper.findAll('.exercise-row input')
      await exerciseInputs[0].setValue('Bench Press')
      await exerciseInputs[1].setValue('185')
      await exerciseInputs[2].setValue('3')
      await exerciseInputs[3].setValue('10')

      await wrapper.find('form').trigger('submit.prevent')

      expect(mockAddWorkout).toHaveBeenCalled()
    })

    it('should show success message after submission', async () => {
      expect(wrapper.find('.success-message').exists()).toBe(false)

      // Fill in minimal required fields
      await wrapper.find('#workout-date').setValue('2024-01-15')
      const exerciseInputs = wrapper.findAll('.exercise-row input')
      await exerciseInputs[0].setValue('Squat')
      await exerciseInputs[1].setValue('225')
      await exerciseInputs[2].setValue('3')
      await exerciseInputs[3].setValue('8')

      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()

      expect(wrapper.find('.success-message').exists()).toBe(true)
      expect(wrapper.find('.success-message').text()).toBe('Workout saved successfully!')
    })

    it('should reset form after submission', async () => {
      // Fill in form
      await wrapper.find('#workout-date').setValue('2024-01-15')
      const exerciseInputs = wrapper.findAll('.exercise-row input')
      await exerciseInputs[0].setValue('Deadlift')
      await exerciseInputs[1].setValue('315')
      await exerciseInputs[2].setValue('1')
      await exerciseInputs[3].setValue('5')

      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()

      // Check that form is reset
      const newInputs = wrapper.findAll('.exercise-row input')
      expect(newInputs[0].element.value).toBe('')
      expect(wrapper.findAll('.exercise-row')).toHaveLength(1)
    })
  })

  describe('clear button', () => {
    it('should reset form when clear button is clicked', async () => {
      // Fill in form
      await wrapper.find('#workout-date').setValue('2024-01-15')
      const exerciseInputs = wrapper.findAll('.exercise-row input')
      await exerciseInputs[0].setValue('Press')
      await exerciseInputs[1].setValue('135')

      // Add another exercise
      await wrapper.find('.btn-add-exercise').trigger('click')

      expect(wrapper.findAll('.exercise-row')).toHaveLength(2)

      // Click clear
      await wrapper.find('.btn-cancel').trigger('click')
      await nextTick()

      // Check form is reset
      expect(wrapper.findAll('.exercise-row')).toHaveLength(1)
      const resetInputs = wrapper.findAll('.exercise-row input')
      expect(resetInputs[0].element.value).toBe('')
    })
  })

  describe('exercise suggestions', () => {
    it('should provide exercise name suggestions from previous workouts', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      useWorkouts.mockReturnValue({
        workouts: {
          value: [
            {
              id: '1',
              date: '2024-01-10',
              exercises: [
                { name: 'Bench Press', weight: 185, sets: 3, reps: 10 },
                { name: 'Squat', weight: 225, sets: 3, reps: 8 }
              ]
            }
          ]
        },
        addWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => [])
      })

      wrapper = mount(WorkoutForm)
      await nextTick()

      const datalist = wrapper.find('#exercise-suggestions')
      expect(datalist.exists()).toBe(true)

      const options = datalist.findAll('option')
      expect(options.length).toBeGreaterThan(0)
    })
  })

  describe('copy last workout', () => {
    it('should show copy last workout button when workouts exist', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockWorkout = {
        id: '1',
        date: '2024-01-10',
        exercises: [{ name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: 'Good' }]
      }

      useWorkouts.mockReturnValue({
        workouts: { value: [mockWorkout] },
        addWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => [mockWorkout])
      })

      wrapper = mount(WorkoutForm)
      await nextTick()

      expect(wrapper.find('.btn-copy-last').exists()).toBe(true)
    })

    it('should copy exercises from last workout when button is clicked', async () => {
      const { useWorkouts } = await import('../composables/useWorkouts')
      const mockWorkout = {
        id: '1',
        date: '2024-01-10',
        exercises: [
          { name: 'Bench Press', weight: 185, sets: 3, reps: 10, notes: 'Good' },
          { name: 'Squat', weight: 225, sets: 3, reps: 8, notes: '' }
        ]
      }

      useWorkouts.mockReturnValue({
        workouts: { value: [mockWorkout] },
        addWorkout: vi.fn(),
        getSortedWorkouts: vi.fn(() => [mockWorkout])
      })

      wrapper = mount(WorkoutForm)
      await nextTick()

      await wrapper.find('.btn-copy-last').trigger('click')
      await nextTick()

      expect(wrapper.findAll('.exercise-row')).toHaveLength(2)

      const exerciseInputs = wrapper.findAll('.exercise-row input')
      expect(exerciseInputs[0].element.value).toBe('Bench Press')
      expect(exerciseInputs[1].element.value).toBe('185')
    })
  })

  describe('form validation', () => {
    it('should have required attribute on date input', () => {
      expect(wrapper.find('#workout-date').attributes('required')).toBeDefined()
    })

    it('should have required attribute on exercise inputs', () => {
      const exerciseInputs = wrapper.findAll('.exercise-row input')
      // Name, weight, sets, reps should be required
      expect(exerciseInputs[0].attributes('required')).toBeDefined() // name
      expect(exerciseInputs[1].attributes('required')).toBeDefined() // weight
      expect(exerciseInputs[2].attributes('required')).toBeDefined() // sets
      expect(exerciseInputs[3].attributes('required')).toBeDefined() // reps
    })

    it('should have min attribute on weight input', () => {
      const weightInput = wrapper.findAll('.exercise-row input')[1]
      expect(weightInput.attributes('min')).toBe('0')
    })

    it('should have min attribute on sets and reps inputs', () => {
      const exerciseInputs = wrapper.findAll('.exercise-row input')
      expect(exerciseInputs[2].attributes('min')).toBe('1') // sets
      expect(exerciseInputs[3].attributes('min')).toBe('1') // reps
    })
  })
})
