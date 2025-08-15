import React from 'react';
import { CustomField } from '../../services/apiService';

interface DynamicFormFieldProps {
  field: CustomField;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  value,
  onChange,
  className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
}) => {
  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
          placeholder={field.placeholder}
          required={field.required}
        />
      );

    case 'email':
      return (
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
          placeholder={field.placeholder}
          required={field.required}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
          placeholder={field.placeholder}
          required={field.required}
        />
      );

    case 'textarea':
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
          placeholder={field.placeholder}
          required={field.required}
          rows={3}
        />
      );

    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
          required={field.required}
        >
          <option value="">Select an option</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

    case 'multiselect':
      return (
        <select
          multiple
          value={value ? value.split(',') : []}
          onChange={(e) => {
            const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
            onChange(selectedValues.join(','));
          }}
          className={className}
          required={field.required}
        >
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

    case 'date':
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
          required={field.required}
        />
      );

    case 'checkbox':
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            required={field.required}
          />
          <span className="ml-2 text-sm text-gray-700">
            {field.placeholder || field.label}
          </span>
        </div>
      );

    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
          placeholder={field.placeholder}
          required={field.required}
        />
      );
  }
};

export default DynamicFormField;
