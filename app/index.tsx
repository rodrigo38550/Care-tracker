import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  useEffect(() => {
    const fetchProfile = async () => {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) {
          const token = await AsyncStorage.getItem("token");
          if (!token) {
            router.replace("/auth/login");
            return;
          }
        }
    };
    fetchProfile();
  }, []);
  return <Redirect href="/tabs" />;
}