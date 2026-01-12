import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface FloatingLabelInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  maxLength?: number;
  error?: string;
  className?: string;
  hasToggle?: boolean;
  autoCapitalizeWords?: boolean;
  onToggleVisibility?: () => void;
  showPassword?: boolean;
}

export const FloatingLabelInput = ({
  id,
  label,
  value,
  onValueChange,
  maxLength,
  error,
  className = '',
  hasToggle = false,
  autoCapitalizeWords = false,
  onToggleVisibility,
  showPassword = false,
  ...props
}: FloatingLabelInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasValue = value.length > 0;
  const showLabel = isFocused || hasValue;

  return (
    <div className={`relative ${className}`}>
      <div className="relative h-14">
        <div className="relative h-full">
          <Input
            ref={inputRef}
            id={id}
            value={value}
            onChange={(e) => {
              let newValue = e.target.value;
              if (autoCapitalizeWords && newValue) {
                // Capitalize first letter of each word
                newValue = newValue.replace(/\b\w/g, (char) => char.toUpperCase());
              }
              onValueChange(newValue);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              peer h-full w-full bg-background border-2 ${error ? 'border-destructive' : 'border-gray-300'} 
              rounded-lg px-4 pt-4 pb-0 text-foreground focus:outline-none focus:ring-2 
              focus:ring-primary focus:border-transparent transition-all duration-200
              ${hasToggle ? 'pr-10' : ''}
              [&:-webkit-autofill]:!bg-background [&:-webkit-autofill]:!text-foreground
              [&:-webkit-autofill]:!shadow-[0_0_0_1000px_hsl(var(--background))_inset]
              [&:-webkit-autofill:hover]:!bg-background [&:-webkit-autofill:focus]:!bg-background
              [&:-webkit-autofill]:[-webkit-text-fill-color:hsl(var(--foreground))]
              [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]
            `}
            maxLength={maxLength}
            {...props}
          />
          <label
            htmlFor={id}
            className={`
              absolute left-4 transition-all duration-200 pointer-events-none
              ${showLabel 
                ? 'text-xs top-2 text-muted-foreground' 
                : 'text-base top-1/2 -translate-y-1/2 text-muted-foreground/70'
              }
              peer-focus:text-xs peer-focus:top-2 peer-focus:text-primary
            `}
          >
            {label}
          </label>
        </div>
        {hasToggle && onToggleVisibility && (
          <button
            type="button"
            onClick={onToggleVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7.5 10-7.5 10 7.5 10 7.5-3 7.5-10 7.5S2 12 2 12z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            )}
          </button>
        )}
        {maxLength && !hasToggle && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};

export default FloatingLabelInput;
