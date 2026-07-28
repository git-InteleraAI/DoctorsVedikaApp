/**
 * src/components/Checkbox.tsx
 * Simple labeled checkbox — used on RegisterScreen for Terms & Conditions.
 */
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Check } from 'lucide-react-native';

export interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
}

export function Checkbox({ checked, onToggle, label }: CheckboxProps) {
  return (
    <TouchableOpacity className="flex-row items-center mb-4" onPress={onToggle} activeOpacity={0.7}>
      <View className={`w-5 h-5 rounded border-1.5 items-center justify-center mr-2.5 ${checked ? 'bg-[#0284C7] border-[#0284C7]' : 'border-slate-300'}`}>
        {checked ? <Check size={13} color="#FFFFFF" /> : null}
      </View>
      <Text className="text-xs color-slate-500 flex-1">{label}</Text>
    </TouchableOpacity>
  );
}

