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
          warehouse_id: string | null
          is_verified: boolean
          disabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'System Admin' | 'Warehouse Manager' | 'Warehouse Staff' | 'Viewer'
          avatar_url?: string | null
          warehouse_id?: string | null
          is_verified?: boolean
          disabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'System Admin' | 'Warehouse Manager' | 'Warehouse Staff' | 'Viewer'
          avatar_url?: string | null
          warehouse_id?: string | null
          is_verified?: boolean
          disabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          }
        ]
      }
      warehouses: {
        Row: {
          id: string
          name: string
          short_code: string
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          short_code: string
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          short_code?: string
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          id: string
          name: string
          short_code: string
          warehouse_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          short_code: string
          warehouse_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          short_code?: string
          warehouse_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          short_code: string
          sku: string
          category: string
          unit: string
          reorder_level: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          short_code?: string
          sku?: string
          category?: string
          unit?: string
          reorder_level?: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          short_code?: string
          sku?: string
          category?: string
          unit?: string
          reorder_level?: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_stock: {
        Row: {
          id: string
          product_id: string
          warehouse_id: string
          location_id: string | null
          available: number
          reserved: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          warehouse_id: string
          location_id?: string | null
          available?: number
          reserved?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          warehouse_id?: string
          location_id?: string | null
          available?: number
          reserved?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_stock_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_stock_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_stock_location_id_fkey"
            columns: ["location_id"]
            referencedRelation: "locations"
            referencedColumns: ["id"]
          }
        ]
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
export type Warehouse = Database['public']['Tables']['warehouses']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductStock = Database['public']['Tables']['product_stock']['Row']
