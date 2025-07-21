'use client'

import { useState } from 'react'

import {
  addTodo,
  deleteTodo,
  toggleCompleted,
} from '../../lib/redux/features/todos/todosSlice'
import { useAppDispatch, useAppSelector } from '../../lib/redux/hooks'

export default function TodosPage() {
  const dispatch = useAppDispatch()
  const todos = useAppSelector(state => state.todos)

  const [newTodo, setNewTodo] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newTodo) {
      dispatch(addTodo({ title: newTodo, completed: false, id: Date.now() }))
      setNewTodo('')
    }
  }

  return (
    <div>
      <h1>Todos</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newTodo}
          onChange={e => setNewTodo(e.currentTarget.value)}
          placeholder="Add new todo"
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch(toggleCompleted(todo.id))}
            />
            <span
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
              }}
            >
              {todo.title}
            </span>
            <button onClick={() => dispatch(deleteTodo(todo.id))}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
