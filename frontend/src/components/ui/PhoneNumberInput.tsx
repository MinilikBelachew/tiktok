import React from 'react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import './PhoneNumberInput.css';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  defaultCountry?: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  placeholder = "Enter phone number",
  
  disabled = false,
  error,
  defaultCountry = 'et'
}) => {
  const handleChange = (val: string) => {
    onChange(val);
  };

  return (
    <div className="phone-input-container">
      <div className="phone-input-wrapper">
        <PhoneInput
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          defaultCountry={defaultCountry}
          disabled={disabled}
          className={`phone-input ${error ? 'error' : ''}`}
        />
      </div>
      {error && (
        <div className="phone-input-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default PhoneNumberInput;
