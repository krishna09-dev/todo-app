'use client'
import { useEffect, useRef, useState } from 'react'
import { Pencil, Trash2, PlusCircle, X } from 'lucide-react'

type Priority = 'High' | 'Medium' | 'Low'
type Todo = {
  id: number
  title: string
  completed: boolean
  priority: Priority
}
type Mode = 'create' | 'edit'

export default function TodoApp() {
  // data
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed'>('All')

  // add/edit modal
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('create')
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('Low')
  const [editingId, setEditingId] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // confirm delete modal
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDeleteId, setToDeleteId] = useState<number | null>(null)
  const confirmRef = useRef<HTMLDivElement>(null)

  // ────────────────────────────── load / seed / persist
  useEffect(() => {
    const seedFromAPI = async () => {
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
        const data: Array<{ id: number; title: string; completed: boolean }> = await res.json()
        const seeded: Todo[] = data.map((t) => ({
          id: t.id,
          title: t.title,
          completed: !!t.completed,
          // simple mapping
          priority: t.completed ? 'Low' : 'Medium',
        }))
        setTodos(seeded)
        localStorage.setItem('todos', JSON.stringify(seeded))
      } catch {
        setTodos([]) // fail-safe
      }
    }

    const storedRaw = localStorage.getItem('todos')
    if (!storedRaw) {
      seedFromAPI()
      return
    }
    try {
      const parsed = JSON.parse(storedRaw) as Todo[]
      if (Array.isArray(parsed) && parsed.length > 0) setTodos(parsed)
      else seedFromAPI()
    } catch {
      seedFromAPI()
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  // ESC to close modals
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setConfirmOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const clickBackdrop = (e: React.MouseEvent, which: 'edit' | 'confirm') => {
    const ref = which === 'edit' ? dialogRef.current : confirmRef.current
    if (e.target === ref) which === 'edit' ? setOpen(false) : setConfirmOpen(false)
  }

  // ────────────────────────────── actions
  const openCreate = () => {
    setMode('create')
    setTitle('')
    setPriority('Low')
    setEditingId(null)
    setOpen(true)
  }

  const openEdit = (t: Todo) => {
    setMode('edit')
    setTitle(t.title)
    setPriority(t.priority)
    setEditingId(t.id)
    setOpen(true)
  }

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    if (mode === 'create') {
      const newTodo: Todo = { id: Date.now(), title: trimmed, completed: false, priority }
      setTodos((prev) => [newTodo, ...prev])
    } else if (mode === 'edit' && editingId !== null) {
      setTodos((prev) => prev.map((t) => (t.id === editingId ? { ...t, title: trimmed, priority } : t)))
    }

    setTitle('')
    setPriority('Low')
    setEditingId(null)
    setOpen(false)
  }

  const toggleTodo = (id: number) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))

  const askDelete = (id: number) => {
    setToDeleteId(id)
    setConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (toDeleteId !== null) setTodos((prev) => prev.filter((t) => t.id !== toDeleteId))
    setToDeleteId(null)
    setConfirmOpen(false)
  }

  // clear and reseed from API
  const resetAndSeed = async () => {
    localStorage.removeItem('todos')
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
      const data: Array<{ id: number; title: string; completed: boolean }> = await res.json()
      const seeded: Todo[] = data.map((t) => ({
        id: t.id,
        title: t.title,
        completed: !!t.completed,
        priority: t.completed ? 'Low' : 'Medium',
      }))
      setTodos(seeded)
      localStorage.setItem('todos', JSON.stringify(seeded))
    } catch (e) {
      console.error('Reset seed failed', e)
    }
  }

  // helpers
  const filtered = todos.filter((t) =>
    filter === 'Active' ? !t.completed : filter === 'Completed' ? t.completed : true
  )
  const badgeColor = (p: Priority) =>
    p === 'High' ? 'bg-red-500'
      : p === 'Medium' ? 'bg-yellow-400 text-black'
      : 'bg-green-500'

  // ────────────────────────────── UI
  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={resetAndSeed}
            className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
            title="Clear local data and fetch 5 example tasks"
          >
            Reset &amp; Seed
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition"
          >
            <PlusCircle size={18} />
            New Task
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b text-sm mb-6">
        {(['All', 'Active', 'Completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-2 transition ${
              filter === tab
                ? 'text-purple-600 border-b-2 border-purple-600 font-medium'
                : 'text-gray-500 hover:text-purple-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filtered.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between bg-white shadow-sm border border-gray-100 rounded-lg p-4 hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-5 h-5 accent-purple-600"
                aria-label={`Toggle ${todo.title}`}
              />
              <div>
                <h3 className={`text-base font-medium ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {todo.title}
                </h3>
                <p className="text-sm text-gray-500">Priority</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs text-white px-2 py-1 rounded-full ${badgeColor(todo.priority)}`}>
                {todo.priority}
              </span>
              <button className="text-gray-400 hover:text-purple-600" onClick={() => openEdit(todo)} aria-label="Edit">
                <Pencil size={18} />
              </button>
              <button className="text-gray-400 hover:text-red-500" onClick={() => askDelete(todo.id)} aria-label="Delete">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-10">No tasks yet — add one above 👆</p>
        )}
      </div>

      {/* ───────────── Add/Edit Modal ───────────── */}
      {open && (
        <div
          ref={dialogRef}
          onMouseDown={(e) => clickBackdrop(e, 'edit')}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4"
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 animate-in fade-in zoom-in duration-150"
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">{mode === 'create' ? 'Add New Task' : 'Edit Task'}</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 rounded-md p-1 hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitForm} className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">Task Title</label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grocery shopping"
                  className="
                    w-full rounded-xl border border-gray-300 bg-gray-50/70
                    px-4 py-3 text-[15px] shadow-inner
                    outline-none transition
                    focus:bg-white focus:border-purple-500
                    focus:ring-4 focus:ring-purple-500/20
                    placeholder:text-gray-400
                  "
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium mb-1">Priority</label>
                <div className="relative">
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="
                      w-full appearance-none rounded-xl border border-gray-300 bg-gray-50/70
                      px-4 pr-12 py-3 text-[15px] shadow-inner
                      outline-none transition
                      focus:bg-white focus:border-purple-500
                      focus:ring-4 focus:ring-purple-500/20
                    "
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"
                    viewBox="0 0 20 20" fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 011.04 1.08l-4.24 3.36a.75.75 0 01-.94 0L5.21 8.31a.75.75 0 01.02-1.1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <div className="pt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="
                    px-4 py-2 rounded-lg text-white
                    bg-gradient-to-r from-purple-600 to-fuchsia-600
                    hover:from-purple-700 hover:to-fuchsia-700
                    disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-md">
                  {mode === 'create' ? 'Add Task' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────── Confirm Delete Modal ───────────── */}
      {confirmOpen && (
        <div
          ref={confirmRef}
          onMouseDown={(e) => clickBackdrop(e, 'confirm')}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div
            className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 animate-in fade-in zoom-in duration-150"
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-6 w-6 rounded-full bg-red-100 text-red-600 grid place-items-center">!</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">Delete task?</h3>
                <p className="text-sm text-gray-600">
                  This action can’t be undone. The selected task will be permanently removed.
                </p>
              </div>
              <button
                onClick={() => setConfirmOpen(false)}
                className="text-gray-500 hover:text-gray-700 rounded-md p-1 hover:bg-gray-100"
                aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}