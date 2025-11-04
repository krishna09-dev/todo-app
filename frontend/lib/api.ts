import type { Todo } from './types'

const API = process.env.NEXT_PUBLIC_API_URL as string

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${body || res.statusText}`)
  }
  return res.json()
}

export const api = {
  list: async () => json<Todo[]>(await fetch(`${API}/todos`, { cache: 'no-store' })),
  create: async (todo: Todo) =>
    json<Todo>(await fetch(`${API}/todos`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(todo) })),
  update: async (id: number, todo: Todo) =>
    json<Todo>(await fetch(`${API}/todos/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(todo) })),
  toggle: async (id: number) =>
    json<Todo>(await fetch(`${API}/todos/${id}/toggle`, { method: 'PATCH' })),
  remove: async (id: number) =>
    json<{deleted:number}>(await fetch(`${API}/todos/${id}`, { method: 'DELETE' })),
}