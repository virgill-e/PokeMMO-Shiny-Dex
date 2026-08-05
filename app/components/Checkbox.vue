<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()
</script>

<template>
  <label class="flex cursor-pointer items-center gap-2 text-sm text-neutral-400">
    <span class="relative flex h-4 w-4 shrink-0 items-center justify-center">
      <input
        type="checkbox"
        :checked="modelValue"
        class="peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-neutral-600 bg-neutral-800 transition-colors checked:border-amber-400 checked:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      >
      <svg
        class="pointer-events-none absolute h-3 w-3 text-neutral-900 opacity-0 transition-opacity peer-checked:opacity-100"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
    <slot />
  </label>
</template>
