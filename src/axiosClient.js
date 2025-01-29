import axios from "axios";

// Instance principale pour les requêtes avec le token d'accès
const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
});


// Instance pour le rafraîchissement du token (sans en-tête d'autorisation)
const axiosRefreshClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
});

// Intercepteur de requête pour inclure le token d'accès
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercepteur de réponse pour gérer l'expiration du token
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si le token est expiré, tente de le rafraîchir une fois
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Appel à l'API pour rafraîchir le token sans en-tête d'autorisation
                const refreshToken = localStorage.getItem("REFRESH_TOKEN");
                const refreshResponse = await axiosRefreshClient.post('/auth/refresh', {
                    token: refreshToken,
                });

                const newToken = refreshResponse.data.access_token;

                // Mettre à jour le token dans le localStorage et les headers d'Axios
                localStorage.setItem("ACCESS_TOKEN", newToken);
                axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                // Répéter la requête initiale avec le nouveau token
                return axiosClient(originalRequest);
            } catch (refreshError) {
                // Si le rafraîchissement échoue, supprimez le token et redirigez vers la page de connexion
                localStorage.removeItem("ACCESS_TOKEN");
                localStorage.removeItem("REFRESH_TOKEN");
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
