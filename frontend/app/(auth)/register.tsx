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
        <View className="flex-1 justify-center px-6 py-8 mt-12 mb-8">
          {/* Header */}
          <View className="flex-row items-center mb-10">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2" hitSlop={{top:20,bottom:20,left:20,right:20}}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white font-bold text-xs tracking-[0.2em] flex-1 text-center mr-8">
              COWATCH
            </Text>
          </View>

          <View className="mb-8">
            <Text className="text-4xl font-extrabold text-white mb-3 tracking-tight">Create an account</Text>
            <Text className="text-zinc-400 text-[15px] font-medium">
              Enter your details below to join the community.
            </Text>
          </View>

          {/* Form */}
          <View className="mb-2">
            <Input
              label="USERNAME"
              placeholder="johndoe"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <Input
              label="EMAIL ADDRESS"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="PASSWORD"
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
            title="Create Account"
            variant="white"
            onPress={handleRegister}
            loading={loading}
            className="mt-2"
          />

          <View className="flex-row items-center my-8">
            <View className="flex-1 h-[1px] bg-zinc-800" />
            <Text className="text-zinc-500 mx-4 text-[11px] font-bold tracking-widest">OR CONTINUE WITH</Text>
            <View className="flex-1 h-[1px] bg-zinc-800" />
          </View>
          
          <View className="flex-row gap-4 mb-4">
            <TouchableOpacity className="flex-1 flex-row items-center justify-center border border-zinc-800 rounded-xl py-[14px]">
              <Ionicons name="logo-google" size={20} color="white" />
              <Text className="text-white font-semibold ml-2 text-[15px]">Google</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center border border-zinc-800 rounded-xl py-[14px]">
              <Ionicons name="logo-apple" size={20} color="white" />
              <Text className="text-white font-semibold ml-2 text-[15px]">Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-zinc-500 font-medium text-[15px]">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-white font-bold text-[15px]">Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
