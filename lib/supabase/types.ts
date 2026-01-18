export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      hubs: {
        Row: {
          id: string
          name: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name?: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          created_by?: string
        }
      }
      hub_members: {
        Row: {
          id: string
          hub_id: string
          user_id: string
          role: "owner" | "member"
          created_at: string
        }
        Insert: {
          id?: string
          hub_id: string
          user_id: string
          role?: "owner" | "member"
          created_at?: string
        }
        Update: {
          id?: string
          hub_id?: string
          user_id?: string
          role?: "owner" | "member"
          created_at?: string
        }
      }
      hub_invites: {
        Row: {
          id: string
          hub_id: string
          email: string
          invited_by: string
          created_at: string
        }
        Insert: {
          id?: string
          hub_id: string
          email: string
          invited_by: string
          created_at?: string
        }
        Update: {
          id?: string
          hub_id?: string
          email?: string
          invited_by?: string
          created_at?: string
        }
      }
      move_details: {
        Row: {
          id: string
          hub_id: string
          current_address: string | null
          new_address: string | null
          move_date: string | null
          created_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hub_id: string
          current_address?: string | null
          new_address?: string | null
          move_date?: string | null
          created_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hub_id?: string
          current_address?: string | null
          new_address?: string | null
          move_date?: string | null
          created_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          hub_id: string
          title: string
          description: string | null
          status: "pending" | "in-progress" | "completed"
          priority: "low" | "medium" | "high"
          category: string | null
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hub_id: string
          title: string
          description?: string | null
          status?: "pending" | "in-progress" | "completed"
          priority?: "low" | "medium" | "high"
          category?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hub_id?: string
          title?: string
          description?: string | null
          status?: "pending" | "in-progress" | "completed"
          priority?: "low" | "medium" | "high"
          category?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          hub_id: string
          description: string
          amount: number
          category: string
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          hub_id: string
          description: string
          amount: number
          category: string
          date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          hub_id?: string
          description?: string
          amount?: number
          category?: string
          date?: string
          notes?: string | null
          created_at?: string
        }
      }
      timeline_events: {
        Row: {
          id: string
          hub_id: string
          title: string
          date: string
          type: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          hub_id: string
          title: string
          date: string
          type: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          hub_id?: string
          title?: string
          date?: string
          type?: string
          notes?: string | null
          created_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          hub_id: string
          name: string
          room: string
          disposition: string
          box: string | null
          value: number | null
          notes: string | null
          sold: boolean
          sold_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hub_id: string
          name: string
          room: string
          disposition: string
          box?: string | null
          value?: number | null
          notes?: string | null
          sold?: boolean
          sold_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hub_id?: string
          name?: string
          room?: string
          disposition?: string
          box?: string | null
          value?: number | null
          notes?: string | null
          sold?: boolean
          sold_amount?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          hub_id: string
          total_budget: number
          category_budgets: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hub_id: string
          total_budget: number
          category_budgets?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hub_id?: string
          total_budget?: number
          category_budgets?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_hub_member: {
        Args: { check_hub_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types for use in components
export type Hub = Database["public"]["Tables"]["hubs"]["Row"]
export type HubMember = Database["public"]["Tables"]["hub_members"]["Row"]
export type HubInvite = Database["public"]["Tables"]["hub_invites"]["Row"]
export type MoveDetailsRow = Database["public"]["Tables"]["move_details"]["Row"]
export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"]
export type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"]
export type TimelineEventRow = Database["public"]["Tables"]["timeline_events"]["Row"]
export type InventoryItemRow = Database["public"]["Tables"]["inventory_items"]["Row"]
export type BudgetRow = Database["public"]["Tables"]["budgets"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
