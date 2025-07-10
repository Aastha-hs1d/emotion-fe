import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const ENDPOINTS = {
    PROD: "",
    LOCAL: "http://127.0.0.1:8000"
} 

export const useEmotionPredictor = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post(`${ENDPOINTS.LOCAL}/api/predict/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });
};
