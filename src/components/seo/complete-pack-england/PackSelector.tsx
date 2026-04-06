'use client';

interface PackSelectorProps {
  selected: 'section8' | 'section21';
  onSelect: (value: 'section8' | 'section21') => void;
}

const options = [
  { id: 'section8' as const, label: 'Current England Possession Pack' },
];

export function PackSelector({ selected, onSelect }: PackSelectorProps) {
  return (
    <div className="pill-selector" role="tablist" aria-label="Choose eviction pack type">
      {options.map((option) => (
        <button
          key={option.id}
          role="tab"
          type="button"
          aria-selected={selected === option.id}
          tabIndex={selected === option.id ? 0 : -1}
          onClick={() => onSelect(option.id)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault();
              onSelect('section8');
            }
          }}
          className={`pill-selector-btn ${selected === option.id ? 'pill-selector-btn-active' : 'pill-selector-btn-inactive'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
