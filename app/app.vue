<script setup lang="ts">
const { zones } = useHordes()
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-200">
    <NuxtRouteAnnouncer />

    <header class="border-b border-neutral-800 px-6 py-4">
      <h1 class="text-xl font-bold text-neutral-100">PokeMMO — Farm de hordes</h1>
      <p class="text-sm text-neutral-500">Filtre les hordes par taille, saison et zone pour préparer ta chasse aux shiny.</p>
    </header>

    <main class="flex flex-col gap-4 p-6">
      <FilterBar />

      <p v-if="zones.length === 0" class="py-12 text-center text-neutral-500">
        Aucune horde ne correspond à ces filtres.
      </p>

      <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ZoneCard v-for="zone in zones" :key="`${zone.region}-${zone.location}`" :zone="zone" />
      </div>
    </main>

    <footer class="border-t border-neutral-800 px-6 py-4 text-center text-xs text-neutral-500">
      <p>
        Données de rencontre : <a href="https://pokemmohub.com" target="_blank" rel="noopener" class="underline hover:text-neutral-300">PokeMMO Hub</a> ·
        Sprites : <a href="https://pokeapi.co" target="_blank" rel="noopener" class="underline hover:text-neutral-300">PokeAPI</a>
      </p>
      <p class="mt-1">
        Un problème avec ce site ? Contactez-moi sur
        <a href="https://virgill-e.com/#contact" target="_blank" rel="noopener" class="underline hover:text-neutral-300">virgill-e.com</a>
      </p>
    </footer>
  </div>
</template>
