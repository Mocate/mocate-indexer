<template>
  <div
    ref="mapContainer"
    class="h-full w-full min-h-75 rounded-(--ui-radius)"
  />
</template>

<script setup lang="ts">
import { DEFAULT_MAP_CENTER } from '~~/shared/utils/constants'

interface LatLon {
  lat: number
  lon: number
}

interface Props {
  center?: LatLon
  markers?: LatLon[]
  markerPosition?: LatLon
  draggable?: boolean
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  center: () => ({ lat: DEFAULT_MAP_CENTER.lat, lon: DEFAULT_MAP_CENTER.lon }),
  markers: undefined,
  markerPosition: undefined,
  draggable: true,
  zoom: 17,
})

const emit = defineEmits<{
  'update:coordinates': [coords: LatLon]
  dragend: [coords: LatLon]
}>()

const mapId = import.meta.env.VITE_GOOGLE_MAP_ID

const mapContainer = ref<HTMLDivElement>()
let map: google.maps.Map | null = null
let markerElements: google.maps.marker.AdvancedMarkerElement[] = []
let Marker: typeof google.maps.marker.AdvancedMarkerElement

let recheck: NodeJS.Timeout | undefined
let initializing = false

function resolvePosition(
  pos: google.maps.marker.AdvancedMarkerElement['position'],
): LatLon | null {
  if (!pos) {
    return null
  }
  const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat
  const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng
  return { lat, lon: lng }
}

function clearMarkers() {
  markerElements.forEach((m) => (m.map = null))
  markerElements = []
}

function markerPositions(): LatLon[] {
  if (props.markers?.length) {
    return props.markers
  }
  return [props.markerPosition || props.center]
}

async function initMap() {
  if (!mapContainer.value || map) {
    return
  }

  const { Map } = (await google.maps.importLibrary(
    'maps',
  )) as google.maps.MapsLibrary
  const { AdvancedMarkerElement } = (await google.maps.importLibrary(
    'marker',
  )) as google.maps.MarkerLibrary
  Marker = AdvancedMarkerElement

  map = new Map(mapContainer.value, {
    center: { lat: props.center.lat, lng: props.center.lon },
    zoom: props.zoom,
    mapId,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  })

  if (props.draggable) {
    map.addListener('click', (event: google.maps.MapMouseEvent) => {
      const p = resolvePosition(event.latLng)
      if (p) {
        moveMarker(p.lat, p.lon)
        emit('dragend', p)
      }
    })
  }

  renderMarkers()
}

function moveMarker(lat: number, lon: number) {
  if (markerElements[0]) {
    markerElements[0].position = { lat, lng: lon }
  }
}

function renderMarkers() {
  if (!map || !Marker) {
    return
  }
  clearMarkers()

  markerPositions().forEach((pos) => {
    const marker = new Marker({
      map: map!,
      position: { lat: pos.lat, lng: pos.lon },
      gmpDraggable: props.draggable,
    })

    if (props.draggable) {
      marker.addListener('dragend', () => {
        const p = resolvePosition(marker.position)
        if (p) {
          emit('dragend', p)
        }
      })
    }

    markerElements.push(marker)
  })
}

function flyTo(lat: number, lon: number) {
  if (map) {
    map.panTo({ lat, lng: lon })
    map.setZoom(props.zoom)
  }
  if (markerElements[0]) {
    markerElements[0].position = { lat, lng: lon }
  }
}

async function tryInit() {
  if (window.google?.maps && !initializing) {
    initializing = true
    if (recheck) {
      clearInterval(recheck)
    }
    await initMap()
  }
}

watch(
  () => props.center,
  (newCenter) => {
    if (newCenter && map) {
      flyTo(newCenter.lat, newCenter.lon)
    }
  },
)

watch(
  () => props.markers,
  () => {
    if (map) {
      renderMarkers()
    }
  },
  { deep: true },
)

watch(
  () => props.markerPosition,
  (newPos) => {
    if (newPos && markerElements[0]) {
      markerElements[0].position = { lat: newPos.lat, lng: newPos.lon }
    }
  },
)

onMounted(() => {
  nextTick(() => {
    tryInit()
    if (!window.google?.maps) {
      recheck = setInterval(tryInit, 1000)
    }
  })
})

onBeforeUnmount(() => {
  if (recheck) {
    clearInterval(recheck)
  }
  clearMarkers()
  map = null
})

defineExpose({ flyTo })
</script>
