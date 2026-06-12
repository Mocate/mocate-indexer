/// <reference types="@types/google.maps" />

export type Dictionary<T> = { [k: string | number]: T }

export interface GoogleAddressBreakdown extends Dictionary<
  string | number | undefined
> {
  address: string
  lon: number
  lat: number
  plus_code?: string
  street_name?: string
  administrative_area_level_2?: string
  administrative_area_level_1?: string
  country?: string
  city?: string
  town?: string
  post_code?: string
}
