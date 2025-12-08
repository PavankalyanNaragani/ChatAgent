import axios from "axios";

const baseURL = "http://127.0.0.1:8000/api";

const axiosInstance = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request Interceptor (This is perfect, no changes needed)
axiosInstance.interceptors.request.use(
    function(config){
        const accessToken = localStorage.getItem('accessToken');
        if(accessToken){
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    function(error){
        return Promise.reject(error);
    }
);

// Response Interceptor (FIXED)
axiosInstance.interceptors.response.use(
    function(response){
        return response;
    },
    async function(error){
        const originalRequest = error.config;

        // Check if error is 401 and we haven't retried yet
        if(error.response && error.response.status === 401 && !originalRequest._retry){
            originalRequest._retry = true; // Mark request as retried
            
            try{
                const refreshToken = localStorage.getItem('refreshToken');
                
                // CRITICAL FIX: Use plain 'axios' here, NOT 'axiosInstance'
                // We manually construct the URL to avoid using the intercepted instance
                const response = await axios.post(`${baseURL}/token/refresh/`, {
                    refresh: refreshToken
                });

                // 1. Save the new token
                localStorage.setItem('accessToken', response.data.access);

                // 2. Attach new token to the FAILED request's headers
                originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
                
                // 3. Retry the original request with the new token
                return axiosInstance(originalRequest);

            } catch(refreshError){
                // If refresh fails, user is truly logged out
                console.error("Session expired", refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                // Optional: Redirect to login page
                window.location.href = '/login'; 
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;