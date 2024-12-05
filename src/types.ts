export interface Worker {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
  progress: number
  lastActive: string
} 