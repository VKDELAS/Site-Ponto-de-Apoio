import { useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingLabelInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  showVisibilityToggle?: boolean;
  onVisibilityToggle?: () => void;
  isPasswordVisible?: boolean;
  showCheckmark?: boolean;
  isValid?: boolean;
  autoComplete?: string;
  required?: boolean;
}

export function FloatingLabelInput({
  label,
  type = 'text',
  value,
  onChange,
  icon,
  showVisibilityToggle = false,
  onVisibilityToggle,
  isPasswordVisible = false,
  showCheckmark = false,
  isValid = false,
  autoComplete = 'off',
  required = false,
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || value.length > 0;

  return (
    <div className="relative group">
      {/* Ícone */}
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FFD700] transition-all duration-300 pointer-events-none">
          {icon}
        </div>
      )}

      {/* Label Flutuante */}
      <motion.label
        animate={{
          y: isActive ? -28 : 0,
          scale: isActive ? 0.85 : 1,
          x: isActive ? (icon ? -8 : 0) : (icon ? 40 : 0),
        }}
        transition={{ duration: 0.2 }}
        className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none transition-colors duration-300 ${
          isActive
            ? 'text-[#FFD700] bg-[#0a0a0a] px-2'
            : 'text-gray-500 group-focus-within:text-[#FFD700]'
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </motion.label>

      {/* Input */}
      <input
        type={showVisibilityToggle && isPasswordVisible ? 'text' : type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoComplete={autoComplete}
        className="w-full bg-black/40 border border-white/5 focus:border-[#FFD700]/50 h-14 px-4 pl-12 text-white placeholder:text-gray-700 font-medium transition-all duration-300 rounded-xl hover:bg-black/50 hover:border-white/10 focus:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:shadow-[inset_0_2px_8px_rgba(255,215,0,0.1),0_0_20px_rgba(255,215,0,0.1)]"
        required={required}
      />

      {/* Botão de Visibilidade de Senha */}
      {showVisibilityToggle && (
        <motion.button
          type="button"
          onClick={onVisibilityToggle}
          whileHover={{ scale: 1.1 }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#FFD700] transition-colors duration-300"
        >
          {isPasswordVisible ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m4.753-4.753L3.596 3.596m16.807 16.807L9.404 9.404m0 0L3.596 3.596m16.807 16.807l-6.404-6.404" />
            </svg>
          )}
        </motion.button>
      )}

      {/* Checkmark de Validação */}
      {showCheckmark && isValid && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}
