import { env as svelteEnv } from '$env/dynamic/private';

export const env = (name: string) => {
    const envVar = svelteEnv[name];
    if (envVar) return envVar; 
    
    throw new Error(`NO ENV - could not find environment variable "${name}"`);
}

export const envOptional = (name: string) => {
    const envVar = svelteEnv[name];
    if (envVar) return envVar; 
    return envVar === '' ? undefined : envVar;
}