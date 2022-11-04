const IMMO_API_URL = env('IMMO_API_URL');

export const transferImmos = (immos: Immo[]) => {
    console.log(`Transfer ${immos.length} immos to ${IMMO_API_URL}`);
    const response = await fetch(IMMO_API_URL, {
        method: 'POST',
        body: JSON.stringify({ immos }),
        headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) return;

    throw new Error(`IMMO API ERROR - Couldn't transfer immos: POST ${IMMO_API_URL}: ${response.status} "${await response.text()}"`)
}