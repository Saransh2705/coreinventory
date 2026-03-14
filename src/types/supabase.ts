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
      receipts: {
        Row: {
          id: string
          short_code: string
          supplier_name: string
          warehouse_id: string
          status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Cancelled'
          notes: string | null
          received_date: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          short_code?: string
          supplier_name: string
          warehouse_id: string
          status?: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Cancelled'
          notes?: string | null
          received_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          short_code?: string
          supplier_name?: string
          warehouse_id?: string
          status?: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Cancelled'
          notes?: string | null
          received_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      receipt_items: {
        Row: {
          id: string
          receipt_id: string
          product_id: string
          location_id: string | null
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          receipt_id: string
          product_id: string
          location_id?: string | null
          quantity: number
          created_at?: string
        }
        Update: {
          id?: string
          receipt_id?: string
          product_id?: string
          location_id?: string | null
          quantity?: number
          created_at?: string
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          id: string
          short_code: string
          customer_name: string
          warehouse_id: string
          status: 'Draft' | 'Waiting' | 'Ready' | 'Done'
          notes: string | null
          delivery_date: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          short_code?: string
          customer_name: string
          warehouse_id: string
          status?: 'Draft' | 'Waiting' | 'Ready' | 'Done'
          notes?: string | null
          delivery_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          short_code?: string
          customer_name?: string
          warehouse_id?: string
          status?: 'Draft' | 'Waiting' | 'Ready' | 'Done'
          notes?: string | null
          delivery_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery_items: {
        Row: {
          id: string
          delivery_id: string
          product_id: string
          location_id: string | null
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          delivery_id: string
          product_id: string
          location_id?: string | null
          quantity: number
          created_at?: string
        }
        Update: {
          id?: string
          delivery_id?: string
          product_id?: string
          location_id?: string | null
          quantity?: number
          created_at?: string
        }
        Relationships: []
      }
      transfers: {
        Row: {
          id: string
          short_code: string
          from_location_id: string
          to_location_id: string
          status: 'Scheduled' | 'In Transit' | 'Done'
          notes: string | null
          scheduled_date: string | null
          completed_date: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          short_code?: string
          from_location_id: string
          to_location_id: string
          status?: 'Scheduled' | 'In Transit' | 'Done'
          notes?: string | null
          scheduled_date?: string | null
          completed_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          short_code?: string
          from_location_id?: string
          to_location_id?: string
          status?: 'Scheduled' | 'In Transit' | 'Done'
          notes?: string | null
          scheduled_date?: string | null
          completed_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      transfer_items: {
        Row: {
          id: string
          transfer_id: string
          product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          transfer_id: string
          product_id: string
          quantity: number
          created_at?: string
        }
        Update: {
          id?: string
          transfer_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
        }
        Relationships: []
      }
      adjustments: {
        Row: {
          id: string
          short_code: string
          product_id: string
          warehouse_id: string
          location_id: string | null
          before_quantity: number
          after_quantity: number
          difference: number
          reason: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          short_code?: string
          product_id: string
          warehouse_id: string
          location_id?: string | null
          before_quantity: number
          after_quantity: number
          difference: number
          reason: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          short_code?: string
          product_id?: string
          warehouse_id?: string
          location_id?: string | null
          before_quantity?: number
          after_quantity?: number
          difference?: number
          reason?: string
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      move_history: {
        Row: {
          id: string
          short_code: string
          product_id: string
          from_location: string
          to_location: string
          quantity: number
          reference_type: string
          reference_id: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          short_code?: string
          product_id: string
          from_location: string
          to_location: string
          quantity: number
          reference_type: string
          reference_id: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          short_code?: string
          product_id?: string
          from_location?: string
          to_location?: string
          quantity?: number
          reference_type?: string
          reference_id?: string
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      dashboard_kpis: {
        Row: {
          total_products: number
          low_stock_items: number
          out_of_stock_items: number
          pending_receipts: number
          pending_deliveries: number
          scheduled_transfers: number
          total_warehouses: number
          total_locations: number
        }
        Relationships: []
      }
    }
    Functions: {}
    Enums: {
      user_role: 'System Admin' | 'Warehouse Manager' | 'Warehouse Staff' | 'Viewer'
      receipt_status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Cancelled'
      delivery_status: 'Draft' | 'Waiting' | 'Ready' | 'Done'
      transfer_status: 'Scheduled' | 'In Transit' | 'Done'
    }
    CompositeTypes: {}
  }
}

export type UserRole = Database['public']['Enums']['user_role']
export type ReceiptStatus = Database['public']['Enums']['receipt_status']
export type DeliveryStatus = Database['public']['Enums']['delivery_status']
export type TransferStatus = Database['public']['Enums']['transfer_status']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Warehouse = Database['public']['Tables']['warehouses']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductStock = Database['public']['Tables']['product_stock']['Row']
export type Receipt = Database['public']['Tables']['receipts']['Row']
export type ReceiptItem = Database['public']['Tables']['receipt_items']['Row']
export type Delivery = Database['public']['Tables']['deliveries']['Row']
export type DeliveryItem = Database['public']['Tables']['delivery_items']['Row']
export type Transfer = Database['public']['Tables']['transfers']['Row']
export type TransferItem = Database['public']['Tables']['transfer_items']['Row']
export type Adjustment = Database['public']['Tables']['adjustments']['Row']
export type MoveHistory = Database['public']['Tables']['move_history']['Row']

export interface DashboardKPIs {
  total_products: number
  low_stock_items: number
  out_of_stock_items: number
  pending_receipts: number
  pending_deliveries: number
  scheduled_transfers: number
  total_warehouses: number
  total_locations: number
}
