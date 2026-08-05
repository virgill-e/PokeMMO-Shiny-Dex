<script setup lang="ts">
import { TYPE_COLORS } from '~/utils/types'

defineProps<{ type: string }>()
</script>

<template>
  <span
    class="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
    :class="TYPE_COLORS[type] ?? 'bg-neutral-500'"
  >
    {{ type }}
  </span>
</template>
