export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'System Admin' | 'Warehouse Manager' | 'Warehouse Staff' | 'Viewer'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'System Admin' | 'Warehouse Manager' | 'Warehouse Staff' | 'Viewer'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'System Admin' | 'Warehouse Manager' | 'Warehouse Staff' | 'Viewer'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      user_role: 'System Admin' | 'Warehouse Manager' | 'Warehouse Staff' | 'Viewer'
    }
  }
}

export type UserRole = Database['public']['Enums']['user_role']
export type Profile = Database['public']['Tables']['profiles']['Row']
