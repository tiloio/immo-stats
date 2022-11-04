<script>
    import Ad from 'ad.svelte';

  /** @type {import('./$types').PageData} */
  export let data;
</script>


<h1>All Ads</h1>

{#each data.ads as ad}
  <Ad {ad} />
{/each}