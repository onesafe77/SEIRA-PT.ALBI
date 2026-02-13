/**
 * Menghasilkan URL dasar API secara dinamis berdasarkan hostname saat ini.
 * Memungkinkan akses dari localhost (PC) maupun IP Lokal (HP).
 */
export const getApiBaseUrl = () => {
    const hostname = window.location.hostname;
    // Gunakan port 5000 sesuai konfigurasi server backend
    return `http://${hostname}:5000`;
};

export const API_BASE_URL = getApiBaseUrl();
