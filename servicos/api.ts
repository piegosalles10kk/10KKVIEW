import axios from "axios";

const link = 'http://10.10.10.61:2500'
const test = 'http://localhost:2500'

const api = axios.create({
    baseURL: link,
});

export default api
