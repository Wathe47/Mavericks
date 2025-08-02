import axios from 'axios';

const axiosInstance = axios.create({
   baseURL: 'http://localhost:8000/api', 
   timeout: 100000, 
   headers: {
      'Content-Type': 'application/json',
   },
});

// // Add a request interceptor (optional)
// axiosInstance.interceptors.request.use(
//    (config) => {
//       // You can add authorization tokens or other custom headers here
//       const token = localStorage.getItem('authToken');
//       if (token) {
//          config.headers.Authorization = `Bearer ${token}`;
//       }
//       return config;
//    },
//    (error) => {
//       return Promise.reject(error);
//    }
// );

// // Add a response interceptor (optional)
// axiosInstance.interceptors.response.use(
//    (response) => response,
//    (error) => {
//       // Handle errors globally
//       console.error('Axios Error:', error.response || error.message);
//       return Promise.reject(error);
//    }
// );

export default axiosInstance;