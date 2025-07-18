import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface Todo {
  id: number
  title: string
  completed: boolean
}

const initialState: Todo[] = []

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<Todo>) => {
      state.push(action.payload)
    },
    toggleCompleted: (state, action: PayloadAction<number>) => {
      const todo = state.find(todo => todo.id === action.payload)
      if (todo) {
        todo.completed = !todo.completed
      }
    },
    deleteTodo: (state, action: PayloadAction<number>) => {
      return state.filter(todo => todo.id !== action.payload)
    },
  },
})

export const { addTodo, toggleCompleted, deleteTodo } = todosSlice.actions

export default todosSlice.reducer
