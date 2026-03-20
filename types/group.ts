import { User } from './user'

export interface Group {
  id: string
  name: string
  created_by?: string
  created_at?: string
  members: GroupMember[]
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  created_at?: string
  user?: User
}
