export function useGooglePlacesAPI() {
  const geocoder: Ref<google.maps.Geocoder | undefined> = ref()

  let recheck: NodeJS.Timeout | undefined
  let initializing = false

  onMounted(() => {
    initGeocoder()
    if (!window.google?.maps) {
      recheck = setInterval(initGeocoder, 1000)
    }
  })

  async function initGeocoder() {
    if (window.google?.maps && !initializing) {
      initializing = true
      if (recheck) {
        clearInterval(recheck)
      }
      const { Geocoder } = (await google.maps.importLibrary(
        'geocoding',
      )) as google.maps.GeocodingLibrary
      geocoder.value = new Geocoder()
    }
  }

  async function reverseGeocode(lat: number, lon: number) {
    if (geocoder.value) {
      const { results } = await geocoder.value.geocode({
        location: { lat, lng: lon },
      })
      const preferredMatch =
        results.find((entry) => entry.types.includes('street_address')) ||
        results[0]
      if (preferredMatch) {
        return getGoogleAddressBreakdown(preferredMatch)
      }
    }
    return null
  }

  return { reverseGeocode }
}
