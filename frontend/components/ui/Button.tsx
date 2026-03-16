import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 active:bg-indigo-700',
  secondary: 'bg-zinc-700 active:bg-zinc-600',
  outline: 'border border-indigo-500 bg-transparent active:bg-indigo-500/10',
};

const textStyles: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-zinc-100',
  outline: 'text-indigo-400',
};

export default function Button({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      className={`
        flex-row items-center justify-center rounded-xl px-6 py-4
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
        ${className ?? ''}
      `}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? '#818cf8' : '#ffffff'}
        />
      ) : (
        <Text
          className={`text-base font-semibold ${textStyles[variant]}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
