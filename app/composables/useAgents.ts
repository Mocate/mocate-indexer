import type { Database } from '~~/shared/types/database'

type AgentInsert = Database['public']['Tables']['agents']['Insert']

export interface CreateAgentPayload {
  id?: string
  name: string
  attendant?: string
  location: {
    lat: number
    lon: number
    address?: string
    city?: string
    country?: string
    plus_code?: string
    street_name?: string
    town?: string
    post_code?: string
    administrative_area_level_1?: string
    administrative_area_level_2?: string
  }
  networks: {
    network_id: number
    merchant_code?: string
  }[]
  operational_hours: {
    working_day: string
    opens_at: string
    closes_at: string
  }[]
  logo?: string
  banner?: string
  imagePaths?: string[]
}

type AgentLocationInsert =
  Database['public']['Tables']['agent_locations']['Insert']

function buildLocationRow(
  agentId: string,
  location: CreateAgentPayload['location'],
): AgentLocationInsert {
  return {
    agent_id: agentId,
    lat: location.lat,
    lon: location.lon,
    address: location.address || null,
    city: location.city || null,
    country: location.country || 'Ghana',
    plus_code: location.plus_code || null,
    street_name: location.street_name || null,
    town: location.town || null,
    post_code: location.post_code || null,
    administrative_area_level_1: location.administrative_area_level_1 || null,
    administrative_area_level_2: location.administrative_area_level_2 || null,
  }
}

export function useAgents() {
  const { $supabase } = useNuxtApp()

  async function createAgent(payload: CreateAgentPayload) {
    // Generate the id client-side so we don't need to .select() the row back.
    // Public (anon) submitters have INSERT but no SELECT policy on `agents`,
    // so returning the inserted representation would fail RLS (401 / 42501).
    const agentId = payload.id ?? crypto.randomUUID()

    const agentData: AgentInsert = {
      id: agentId,
      name: payload.name,
      attendant: payload.attendant || null,
      logo: payload.logo || null,
      banner: payload.banner || null,
    }

    const { error: agentError } = await $supabase
      .from('agents')
      .insert(agentData)

    if (agentError) {
      throw agentError
    }

    // Insert location
    const { error: locError } = await $supabase
      .from('agent_locations')
      .insert(buildLocationRow(agentId, payload.location))
    if (locError) {
      throw locError
    }

    // Insert networks
    if (payload.networks.length > 0) {
      const { error: netError } = await $supabase.from('agent_networks').insert(
        payload.networks.map((n) => ({
          agent_id: agentId,
          network_id: n.network_id,
          merchant_code: n.merchant_code || null,
        })),
      )
      if (netError) {
        throw netError
      }
    }

    // Insert operational hours
    if (payload.operational_hours.length > 0) {
      const { error: hoursError } = await $supabase
        .from('operational_hours')
        .insert(
          payload.operational_hours.map((h) => ({
            agent_id: agentId,
            working_day: h.working_day,
            opens_at: h.opens_at,
            closes_at: h.closes_at,
          })),
        )
      if (hoursError) {
        throw hoursError
      }
    }

    // Insert image records
    if (payload.imagePaths && payload.imagePaths.length > 0) {
      const { error: imgError } = await $supabase.from('agent_images').insert(
        payload.imagePaths.map((path) => ({
          agent_id: agentId,
          storage_path: path,
        })),
      )
      if (imgError) {
        throw imgError
      }
    }

    return { id: agentId, ...agentData }
  }

  async function fetchAgents(page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await $supabase
      .from('agents')
      .select(
        `
        *,
        agent_locations (*),
        agent_networks (*, networks (*)),
        operational_hours (*)
      `,
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      throw error
    }

    return {
      agents: data || [],
      total: count || 0,
      page,
      pageSize,
    }
  }

  async function fetchAgent(id: string) {
    const { data, error } = await $supabase
      .from('agents')
      .select(
        `
        *,
        agent_locations (*),
        agent_networks (*, networks (*)),
        operational_hours (*),
        agent_images (*)
      `,
      )
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async function updateAgent(id: string, payload: CreateAgentPayload) {
    // Update agent record
    const { error: agentError } = await $supabase
      .from('agents')
      .update({
        name: payload.name,
        attendant: payload.attendant || null,
        logo: payload.logo || null,
        banner: payload.banner || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (agentError) {
      throw agentError
    }

    // Replace location
    await $supabase.from('agent_locations').delete().eq('agent_id', id)
    const { error: locError } = await $supabase
      .from('agent_locations')
      .insert(buildLocationRow(id, payload.location))
    if (locError) {
      throw locError
    }

    // Replace networks
    await $supabase.from('agent_networks').delete().eq('agent_id', id)
    if (payload.networks.length > 0) {
      const { error: netError } = await $supabase.from('agent_networks').insert(
        payload.networks.map((n) => ({
          agent_id: id,
          network_id: n.network_id,
          merchant_code: n.merchant_code || null,
        })),
      )
      if (netError) {
        throw netError
      }
    }

    // Replace operational hours
    await $supabase.from('operational_hours').delete().eq('agent_id', id)
    if (payload.operational_hours.length > 0) {
      const { error: hoursError } = await $supabase
        .from('operational_hours')
        .insert(
          payload.operational_hours.map((h) => ({
            agent_id: id,
            working_day: h.working_day,
            opens_at: h.opens_at,
            closes_at: h.closes_at,
          })),
        )
      if (hoursError) {
        throw hoursError
      }
    }

    // Replace images
    if (payload.imagePaths) {
      await $supabase.from('agent_images').delete().eq('agent_id', id)
      if (payload.imagePaths.length > 0) {
        const { error: imgError } = await $supabase.from('agent_images').insert(
          payload.imagePaths.map((path) => ({
            agent_id: id,
            storage_path: path,
          })),
        )
        if (imgError) {
          throw imgError
        }
      }
    }
  }

  async function fetchNetworks() {
    const { data, error } = await $supabase
      .from('networks')
      .select('*')
      .order('name')

    if (error) {
      throw error
    }

    return data || []
  }

  return {
    createAgent,
    fetchAgents,
    fetchAgent,
    updateAgent,
    fetchNetworks,
  }
}
