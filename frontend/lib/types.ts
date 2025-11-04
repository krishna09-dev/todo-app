export type Priority = 'High' | 'Medium' | 'Low'

export type Todo = {
  id: number
  title: string
  completed: boolean
  priority: Priority
}