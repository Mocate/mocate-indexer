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
      agent_images: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          storage_path: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          storage_path: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: 'agent_images_agent_id_fkey'
            columns: ['agent_id']
            isOneToOne: false
            referencedRelation: 'agents'
            referencedColumns: ['id']
          },
        ]
      }
      agent_locations: {
        Row: {
          address: string | null
          administrative_area_level_1: string | null
          administrative_area_level_2: string | null
          agent_id: string
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          lat: number
          lon: number
          plus_code: string | null
          post_code: string | null
          street_name: string | null
          town: string | null
        }
        Insert: {
          address?: string | null
          administrative_area_level_1?: string | null
          administrative_area_level_2?: string | null
          agent_id: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          lat: number
          lon: number
          plus_code?: string | null
          post_code?: string | null
          street_name?: string | null
          town?: string | null
        }
        Update: {
          address?: string | null
          administrative_area_level_1?: string | null
          administrative_area_level_2?: string | null
          agent_id?: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          lat?: number
          lon?: number
          plus_code?: string | null
          post_code?: string | null
          street_name?: string | null
          town?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'agent_locations_agent_id_fkey'
            columns: ['agent_id']
            isOneToOne: false
            referencedRelation: 'agents'
            referencedColumns: ['id']
          },
        ]
      }
      agent_networks: {
        Row: {
          agent_id: string
          id: number
          merchant_code: string | null
          network_id: number
        }
        Insert: {
          agent_id: string
          id?: number
          merchant_code?: string | null
          network_id: number
        }
        Update: {
          agent_id?: string
          id?: number
          merchant_code?: string | null
          network_id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'agent_networks_agent_id_fkey'
            columns: ['agent_id']
            isOneToOne: false
            referencedRelation: 'agents'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'agent_networks_network_id_fkey'
            columns: ['network_id']
            isOneToOne: false
            referencedRelation: 'networks'
            referencedColumns: ['id']
          },
        ]
      }
      agents: {
        Row: {
          attendant: string | null
          banner: string | null
          created_at: string | null
          created_by: string | null
          id: string
          logo: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          attendant?: string | null
          banner?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          logo?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          attendant?: string | null
          banner?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          logo?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      networks: {
        Row: {
          id: number
          logo: string | null
          name: string
        }
        Insert: {
          id?: number
          logo?: string | null
          name: string
        }
        Update: {
          id?: number
          logo?: string | null
          name?: string
        }
        Relationships: []
      }
      operational_hours: {
        Row: {
          agent_id: string
          closes_at: string
          id: number
          opens_at: string
          working_day: string
        }
        Insert: {
          agent_id: string
          closes_at: string
          id?: number
          opens_at: string
          working_day: string
        }
        Update: {
          agent_id?: string
          closes_at?: string
          id?: number
          opens_at?: string
          working_day?: string
        }
        Relationships: [
          {
            foreignKeyName: 'operational_hours_agent_id_fkey'
            columns: ['agent_id']
            isOneToOne: false
            referencedRelation: 'agents'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
