/**
 * src/components/PrimaryButton.tsx
 * Fully-rounded pill button — primary and outline variants.
 */
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
}

export function PrimaryButton({
  title,
  onPress,
  isLoading,
  disabled,
  variant = 'primary',
}: PrimaryButtonProps) {
  const isDisabled = disabled || isLoading;
  const isOutline = variant === 'outline';

  let containerClass = "rounded-full py-3.5 items-center justify-center shadow-md shadow-[#0d254c]/20 elevation-3 ";
  if (isOutline) {
    containerClass += "bg-transparent border-1.5 border-[#0d254c]";
  } else if (isDisabled) {
    containerClass += "bg-[#0d254c]/50 opacity-70";
  } else {
    containerClass += "bg-[#0d254c]";
  }

  let textClass = "font-bold text-base ";
  if (isOutline) {
    textClass += "color-[#0284C7]";
  } else {
    textClass += "color-white";
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={containerClass}
    >
      {isLoading ? (
        <ActivityIndicator color={isOutline ? theme.colors.primary : theme.colors.textInverse} />
      ) : (
        <Text className={textClass}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

