<script setup lang="ts">
import { spriteUrl } from '~/utils/types'

const props = defineProps<{ pokemonId: number, pokemonName: string }>()
const shiny = useShiny()

const src = computed(() => spriteUrl(props.pokemonId, shiny.value))
const failed = ref(false)
</script>

<template>
  <img
    v-if="!failed"
    :src="src"
    :alt="pokemonName"
    width="48"
    height="48"
    loading="lazy"
    class="h-12 w-12 shrink-0 image-render-pixel"
    @error="failed = true"
  >
  <div v-else class="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-neutral-800 text-[10px] text-neutral-500">
    ?
  </div>
</template>

<style scoped>
.image-render-pixel {
  image-rendering: pixelated;
}
</style>
