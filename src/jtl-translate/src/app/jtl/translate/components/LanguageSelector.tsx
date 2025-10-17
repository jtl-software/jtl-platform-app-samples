import { Language } from '../types';
import { Select } from '@jtl/platform-ui-react';

interface LanguageSelectorProps {
  languages: Language[];
  value?: Language;
  onChange?: (language: Language) => void;
}

export default function LanguageSelector({ languages, value, onChange }: LanguageSelectorProps) {
  const handleValueChange = (iso: string) => {
    const selectedLanguage = languages.find(lang => lang.iso === iso);
    if (selectedLanguage && onChange) {
      onChange(selectedLanguage);
    }
  };

  return <Select options={languages.map(l => ({ label: l.label, value: l.iso }))} value={value?.iso} onValueChange={handleValueChange}></Select>;
}
