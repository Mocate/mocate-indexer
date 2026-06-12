import type { Dictionary, GoogleAddressBreakdown } from '~/types/utils'

export default function (
  address: google.maps.GeocoderResult,
): GoogleAddressBreakdown {
  const trimDigits = (float: number): number => parseFloat(float.toFixed(8))

  const mappings: Dictionary<string> = {
    neighbourhood: 'town',
    sublocality: 'town',
    route: 'street_name',
    locality: 'city',
    country: 'country',
    postal_code: 'post_code',
  }

  const breakdown: GoogleAddressBreakdown = {
    plus_code: address.plus_code?.global_code,
    address: address.formatted_address,
    lon: trimDigits(address.geometry.location.lng()),
    lat: trimDigits(address.geometry.location.lat()),
  }

  address.address_components.forEach(
    ({ long_name: ln, types }: google.maps.GeocoderAddressComponent) => {
      const type = types.find((t: string) => t !== 'political') as string
      const key = mappings[type] || type
      breakdown[key] = ln
    },
  )

  return breakdown
}
