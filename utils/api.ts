/**
 * Menghasilkan URL dasar API secara dinamis.
 * - Local Dev: Menggunakan http://hostname:5000 (Cross-origin)
 * - Production: Menggunakan path relatif (Same-origin)
 */
export const getApiBaseUrl = () => {
    const { hostname, protocol, port } = window.location;

    // Jika sedang dalam mode pengembangan (Vite port 3000)
    if (port === '3000' || port === '5173') {
        return `${protocol}//${hostname}:5000`;
    }

    // Di Production (Railway), API disajikan dari origin yang sama
    // Mengembalikan string kosong agar fetch('/api/...') bekerja secara relatif
    return '';
};

export const API_BASE_URL = getApiBaseUrl();
