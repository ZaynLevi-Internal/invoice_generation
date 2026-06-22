import Select from 'react-select';
import { airportOptions } from '../lib/airports';

export default function AirportSelect({ label, value, onChange, placeholder, required }) {
  const selected = airportOptions.find(opt => opt.value === value) || null;

  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      borderRadius: '0.5rem',
      borderColor: state.isFocused ? '#2563eb' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #2563eb' : 'none',
      '&:hover': { borderColor: '#2563eb' }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : 'white',
      color: state.isSelected ? 'white' : '#111827',
      cursor: 'pointer'
    }),
    input: (base) => ({ ...base, color: '#111827' }),
    singleValue: (base) => ({ ...base, color: '#111827' })
  };

  const filterOption = (option, input) => {
    const search = input.toLowerCase();
    return (
      option.data.code.toLowerCase().includes(search) ||
      option.data.name.toLowerCase().includes(search)
    );
  };

  return (
    <div className="mb-4">
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Select
        options={airportOptions}
        value={selected}
        onChange={(opt) => onChange(opt?.value || '')}
        placeholder={placeholder}
        isClearable
        styles={customStyles}
        filterOption={filterOption}
        classNamePrefix="airport-select"
      />
    </div>
  );
}
