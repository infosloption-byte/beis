import { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ options, value, onChange, placeholder = "Select an option", placement = "bottom" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
          isOpen 
            ? 'border-blue-500 ring-4 ring-blue-500/10 dark:border-blue-500' 
            : 'border-gray-200 dark:border-gray-700'
        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
      >
        <span className={selectedOption ? 'font-medium' : 'text-gray-400 dark:text-gray-500 font-medium'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? (placement === 'top' ? '-rotate-180 text-blue-500' : 'rotate-180 text-blue-500') : ''
          }`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute z-50 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 animate-in fade-in duration-200 ${
          placement === 'top' 
            ? 'bottom-full mb-2 slide-in-from-bottom-2' 
            : 'mt-2 slide-in-from-top-2'
        }`}>
          <ul className="max-h-60 overflow-auto py-2 text-sm custom-scrollbar">
            {options.length === 0 ? (
              <li className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">No options available</li>
            ) : (
              options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => {
                    onChange({ target: { name: option.name, value: option.value } });
                    setIsOpen(false);
                  }}
                  className={`cursor-pointer px-4 py-2.5 transition-colors ${
                    String(value) === String(option.value)
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50 font-medium'
                  }`}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}