// src/config.js
export const SOCKET_URL = "http://192.168.1.2:5000";
export const API_BASE_URL = "http://192.168.1.2:5000/api";

export const API_SEND_OTP = `${API_BASE_URL}/auth/send-otp`;
export const API_VERIFY_OTP = `${API_BASE_URL}/auth/verify-otp`;
export const API_SEARCH_USERS = `${API_BASE_URL}/chat/search`;
export const API_CREATE_CHAT = `${API_BASE_URL}/chat`;
export const API_GET_MESSAGES = (chatId) => `${API_BASE_URL}/chat/message/${chatId}`;
export const API_SEND_MESSAGE = `${API_BASE_URL}/chat/message`;