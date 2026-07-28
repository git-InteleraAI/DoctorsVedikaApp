/**
 * src/components/FormInput.tsx
 * Reusable labeled text field with optional leading icon and password toggle.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

export interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  renderIcon?: (color: string, size: number) => React.ReactNode;
}

export function FormInput({ label, error, renderIcon, secureTextEntry, style, ...rest }: FormInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = !!secureTextEntry;

  return (
    <View className="mb-4">
      <Text className="text-xs font-semibold color-slate-500 mb-1.5">{label}</Text>
      <View className={`flex-row items-center border rounded-xl px-4 bg-slate-50 ${error ? 'border-red-500' : 'border-slate-200'}`}>
        {renderIcon ? renderIcon('#64748B', 18) : null}
        <TextInput
          className="flex-1 py-3 text-base color-slate-900 ml-2"
          placeholderTextColor="#94A3B8"
          secureTextEntry={isPasswordField && !isPasswordVisible}
          {...rest}
        />
        {isPasswordField ? (
          <TouchableOpacity onPress={() => setIsPasswordVisible((v) => !v)} hitSlop={8}>
            {isPasswordVisible ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text className="text-xs color-red-500 mt-1">{error}</Text> : null}
    </View>
  );
}

