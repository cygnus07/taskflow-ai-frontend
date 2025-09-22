export interface Task {
  _id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  assignees: Array<{
    _id: string
    name: string
    email: string
  }>
  comments?: Array<{
    _id: string
    text: string
    user: { name: string }
    createdAt: string
  }>
  dependencies?: Array<{
    _id: string
    title: string
  }>
  subtasks?: Array<{
    _id: string
    title: string
    status: string
  }>
  aiMetadata?: {
    suggestedPriority?: string
  }
}
