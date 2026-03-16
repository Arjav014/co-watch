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
        <View className="flex-1 justify-center px-8 py-12">
          {/* Logo / Brand */}
          <View className="items-center mb-12">
            <View className="w-16 h-16 rounded-2xl bg-indigo-600 items-center justify-center mb-4">
              <Ionicons name="play-circle" size={36} color="#ffffff" />
            </View>
            <Text className="text-3xl font-bold text-white">CoWatch</Text>
            <Text className="text-zinc-500 text-base mt-1">
              Watch together, vibe together
            </Text>
          </View>

          {/* Form */}
          <Input
            label="Email"
            icon="mail-outline"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            icon="lock-closed-outline"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? (
            <View className="flex-row items-center mb-4 px-1">
              <Ionicons name="alert-circle" size={16} color="#f87171" />
              <Text className="text-red-400 text-sm ml-2">{error}</Text>
            </View>
          ) : null}

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
          />

          {/* Register link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-zinc-500">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-indigo-400 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
