/**
 * frontend/src/core/components/QuickActionButton.tsx
 * Icon-in-circle + label button used on the Home dashboard quick actions row.
 */
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

export interface QuickActionButtonProps {
  renderIcon: (color: string, size: number) => React.ReactNode;
  label: string;
  onPress: () => void;
}

export function QuickActionButton({ renderIcon, label, onPress }: QuickActionButtonProps) {
  return (
    <TouchableOpacity className="items-center w-[76px]" onPress={onPress} activeOpacity={0.7}>
      <View className="w-[52px] h-[52px] rounded-full bg-sky-50 items-center justify-center mb-1">
        {renderIcon('#0284C7', 20)}
      </View>
      <Text className="text-xs color-slate-800 text-center" numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

