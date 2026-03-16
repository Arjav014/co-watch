import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import api, { getErrorMessage } from '@/services/api';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await login(data.data.token, data.data.user);
      router.replace('/(app)');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-zinc-950"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Logo / Brand */}
          <View className="items-center mb-10 mt-8">
            <View className="w-16 h-16 rounded-[22px] bg-white items-center justify-center mb-6 shadow-sm">
              <Ionicons name="film-outline" size={36} color="#000000" />
            </View>
            <Text className="text-3xl font-extrabold text-white tracking-tight">Welcome to CoWatch</Text>
            <Text className="text-zinc-400 text-base mt-2 font-medium">
              Sign in to watch with friends
            </Text>
          </View>

          {/* Form */}
          <View className="mb-2">
            <Input
              label="Email address"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              labelRight={
                <TouchableOpacity onPress={() => {}}>
                  <Text className="text-zinc-300 text-sm font-semibold">Forgot password?</Text>
                </TouchableOpacity>
              }
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? (
            <View className="flex-row items-center mb-4 px-1">
              <Ionicons name="alert-circle" size={16} color="#f87171" />
              <Text className="text-red-400 text-sm ml-2">{error}</Text>
            </View>
          ) : null}

          <Button
            title="Sign in"
            variant="white"
            onPress={handleLogin}
            loading={loading}
            className="mt-2"
          />

          {/* Register link */}
          <View className="flex-row justify-center mt-12 mb-8">
            <Text className="text-zinc-500 font-medium text-[15px]">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-white font-bold text-[15px]">Create one now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
