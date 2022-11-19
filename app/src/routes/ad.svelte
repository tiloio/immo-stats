<script lang="ts">
	import type { Immo } from "../../../immo";

  export let ad: Immo;
</script>

<li>
    <a target="_blank" href="{ad.scrape.url}" rel="noreferrer">
    {ad.title}
    </a>
</li>