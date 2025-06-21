'use server'

import axios from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_URL } from './utils';

const serverClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

serverClient.interceptors.request.use(
  async (config) => {
    const cookieStore = await cookies();

    const token = cookieStore.get('token')?.value;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

serverClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const cookieStore = await cookies();
      const refreshToken = cookieStore.get('refresh_token')?.value;

      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const newToken = response.data.access;

        const res = NextResponse.next();
        res.cookies.set('token', newToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' }); 
        cookieStore.set('token', newToken);

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return serverClient(originalRequest);
      } catch (err) {
        const res = NextResponse.next();

        res.cookies.delete('token');
        res.cookies.delete('refresh_token');
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export { serverClient as stackbase }
