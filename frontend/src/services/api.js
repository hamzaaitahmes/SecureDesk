import axios from 'axios';

const api = axios.create({ baseURL: '/api', withCredentials: true, timeout: 15000 });

function readCookie(name) {
  const prefix = `${name}=`;
  const entry = document.cookie.split('; ').find((item) => item.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : '';
}

api.interceptors.request.use((config) => {
  if (!['get', 'head', 'options'].includes(config.method?.toLowerCase())) {
    const csrfToken = readCookie('csrfToken');
    if (csrfToken) config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      window.dispatchEvent(new Event('securedesk:session-expired'));
    }
    return Promise.reject(error);
  },
);

export function errorMessage(error) {
  return error.response?.data?.message || 'Une erreur est survenue. Réessayez.';
}

export default api;

