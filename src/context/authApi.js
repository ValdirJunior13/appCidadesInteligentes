import axios from 'axios';
import Cookies from 'js-cookie';


const API_URL = 'http://56.125.35.215:8000'; 

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/register/`, userData); 
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axios.get(`${API_URL}/user/me`, {
    headers: authHeader()
  });
  return response.data;
};

export const authHeader = () => {
  const token = Cookies.get('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};


export default {
  registerUser,
  loginUser,
  getCurrentUser,
  authHeader
};