/// <reference types="vite/client" />
/**
 * Menghasilkan URL dasar API secara dinamis.
 * - Local Dev: Menggunakan http://hostname:5000 (Cross-origin)
 * - Production: Menggunakan origin yang sama (Same-origin)
 */
export const getApiBaseUrl = () => {
    const { hostname, protocol, port } = window.location;

    // Deteksi environment berdasarkan hostname dan port
    // Development: localhost atau 127.0.0.1 dengan port 3000
    const isLocalDev = (hostname === 'localhost' || hostname === '127.0.0.1') && (port === '3000' || port === '');

    if (isLocalDev || import.meta.env.DEV) {
        // Development: API server berjalan di port 5000
        return `${protocol}//${hostname}:5000`;
    }

    // Production (Railway atau hosting lain): API disajikan dari origin yang sama
    // Menggunakan origin saat ini untuk request API
    return window.location.origin;
};

export const API_BASE_URL = getApiBaseUrl();
