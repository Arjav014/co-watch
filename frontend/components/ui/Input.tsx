import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  labelRight?: React.ReactNode;
  containerClassName?: string;
}

export default function Input({
  label,
  error,
  icon,
  labelRight,
  containerClassName,
  secureTextEntry,
  className,
  ...rest
}: InputProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? false);

  return (
    <View className={`w-full mb-4 ${className ?? ''}`}>
      {(label || labelRight) && (
        <View className="flex-row justify-between items-center mb-2 ml-1">
          {label ? (
            <Text className="text-[#a1a1aa] text-[13px] font-bold tracking-widest">
              {label}
            </Text>
          ) : <View />}
          {labelRight && labelRight}
        </View>
      )}
      <View
        className={`
          flex-row items-center rounded-xl bg-[#09090b] border px-4 h-14
          ${error ? 'border-red-500' : 'border-zinc-800'}
          ${containerClassName ?? ''}
        `}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color="#a1a1aa"
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          placeholderTextColor="#71717a"
          secureTextEntry={isSecure}
          className="flex-1 text-white text-base py-4"
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecure((prev) => !prev)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#a1a1aa"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-red-400 text-xs mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}
