import React from 'react';

export const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  readOnly = false,
  error,
  className = '',
  ...props
}) => {
  const baseStyles = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm';
  const errorStyles = error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300';
  const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed' : '';
  const styles = `${baseStyles} ${errorStyles} ${disabledStyles} ${className}`;

  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      className={styles}
      aria-invalid={error ? 'true' : 'false'}
      {...props}
    />
  );
};

export default Input;