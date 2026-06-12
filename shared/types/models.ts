export interface ServiceNetwork {
  id: number
  name: 'MTN' | 'Telecel' | 'AirtelTigo' | 'GMoney'
  logo: string
}

export interface AgentNetwork {
  id: number
  agent_id: string
  network_id: number
  merchant_code?: string
  network?: ServiceNetwork
}

export type OperationalHour = {
  id?: number
  agent_id?: string
  working_day:
    | 'Sunday'
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
  opens_at: string
  closes_at: string
}

export type AgentLocation = {
  id?: string
  agent_id?: string
  lon: number
  lat: number
  city: string
  country: string
  address: string
  created_at?: string
}

export interface AgentImage {
  id: string
  agent_id: string
  storage_path: string
  created_at?: string
}

export interface Agent {
  id: string
  name: string
  attendant?: string
  logo?: string
  banner?: string
  created_at: string
  updated_at?: string
  location?: AgentLocation
  networks?: AgentNetwork[]
  operational_hours?: OperationalHour[]
  images?: AgentImage[]
}
