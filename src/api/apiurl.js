const api = 'http://127.0.0.1:8000'
const apibase = 'https://api.keablr.in'

// Use local API in development, production API in production
export const Api = process.env.NODE_ENV === 'development' ? api : apibase