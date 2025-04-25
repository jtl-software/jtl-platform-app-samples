import { Select } from "@jtl/platform-ui-react";
import { TranslationMode } from "../types";

interface TranslationModeSelectorProps {
  value?: TranslationMode;
  onChange?: (value: TranslationMode) => void;
}

export default function TranslationModeSelector({ value, onChange }: TranslationModeSelectorProps) {

  const handleValueChange = (mode: string) => {
    if (mode && onChange) onChange(mode as TranslationMode);
  } 

  return (
    <Select
      options={[
        { label: 'Empty Fields Only', value: 'empty-fields-only' },
        { label: 'All Fields', value: 'all-fields' }
      ]}
      value={value}
      onValueChange={handleValueChange}
    ></Select>
  );
}