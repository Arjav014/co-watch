import React from 'react';
import { View, Text } from 'react-native';

interface AvatarProps {
  username?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8',
  md: 'w-11 h-11',
  lg: 'w-16 h-16',
};

const textSizes = {
  sm: 'text-xs',
  md: 'text-base',
  lg: 'text-xl',
};

export default function Avatar({
  username = '?',
  size = 'md',
  className,
}: AvatarProps) {
  const initials = username
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      className={`
        ${sizeStyles[size]} rounded-full bg-indigo-600 items-center justify-center
        ${className ?? ''}
      `}
    >
      <Text className={`${textSizes[size]} font-bold text-white`}>
        {initials}
      </Text>
    </View>
  );
}
