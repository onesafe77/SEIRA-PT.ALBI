/// <reference types="vite/client" />
/**
 * Menghasilkan URL dasar API secara dinamis.
 * - Local Dev: Menggunakan http://hostname:5000 (Cross-origin)
 * - Production: Menggunakan path relatif (Same-origin)
 */
export const getApiBaseUrl = () => {
    // Jika sedang dalam mode pengembangan (Vite dev server)
    if (import.meta.env.DEV) {
        const { hostname, protocol } = window.location;
        return `${protocol}//${hostname}:5000`;
    }

    // Di Production (Railway), API disajikan dari origin yang sama
    // Mengembalikan string kosong agar fetch('/api/...') bekerja secara relatif
    return '';
};

export const API_BASE_URL = getApiBaseUrl();
