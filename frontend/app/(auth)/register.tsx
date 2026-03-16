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

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        username,
        email,
        password,
      });
      await register(data.data.token, data.data.user);
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
          {/* Header */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-2xl bg-indigo-600 items-center justify-center mb-4">
              <Ionicons name="person-add" size={32} color="#ffffff" />
            </View>
            <Text className="text-3xl font-bold text-white">Join CoWatch</Text>
            <Text className="text-zinc-500 text-base mt-1">
              Create your account
            </Text>
          </View>

          {/* Form */}
          <Input
            label="Username"
            icon="person-outline"
            placeholder="Choose a username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

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
            placeholder="Create a password"
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
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
          />

          {/* Login link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-zinc-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-indigo-400 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
