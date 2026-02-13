/// <reference types="vite/client" />
/**
 * API Base URL Configuration
 * - Production: Empty string (same-origin relative path)
 * - Development: http://localhost:5000
 */
export const getApiBaseUrl = (): string => {
    // Cek apakah kita di localhost (development)
    const isLocalhost = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (isLocalhost) {
        // Development: gunakan port 5000 untuk API server
        return `${window.location.protocol}//${window.location.hostname}:5000`;
    }

    // Production: gunakan empty string untuk same-origin relative path
    // fetch('/api/login') akan otomatis menggunakan origin yang sama
    return '';
};

export const API_BASE_URL = getApiBaseUrl();
