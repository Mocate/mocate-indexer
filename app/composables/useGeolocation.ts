export function useGeolocation() {
  const position = ref<GeolocationCoordinates | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)

  async function getCurrentPosition(): Promise<GeolocationCoordinates> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser')
    }

    loading.value = true
    error.value = null

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log({ pos })
          position.value = pos.coords
          loading.value = false
          resolve(pos.coords)
        },
        (err) => {
          console.log({ err })
          loading.value = false
          error.value = err.message
          reject(new Error(err.message))
        },
        // { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    })
  }

  return {
    position: readonly(position),
    error: readonly(error),
    loading: readonly(loading),
    getCurrentPosition,
  }
}
