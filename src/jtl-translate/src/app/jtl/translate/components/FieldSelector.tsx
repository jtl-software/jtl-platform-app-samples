import { Property } from "../types";
import { Button, DropdownItem, JTLDropdown } from "@jtl/platform-ui-react";

interface LanguageSelectorProps {
  fields: Property[];
  value?: Property[];
  onChange?: (fields: Property[]) => void;
}

export default function FieldSelector({ fields, value, onChange }: LanguageSelectorProps) {

  const handleValueChange = (prop: Property) => {
    const isSelected = !!value?.find((p) => p.prop === prop.prop);
    const updatedSelection = fields.filter((field) => {
      if (field.prop === prop.prop) {
        return !isSelected;
      } else {
        return !!value?.find((p) => p.prop === field.prop);
      }
    });
    onChange?.(updatedSelection);
  };

  return (
    <JTLDropdown position='left' menuItems={fields.map((f) => ({
      type: DropdownItem.Checkbox,
      label: f.label,
      onClick: () => handleValueChange(f),
      isSelected: value && value.includes(f)
    }))}>
      <Button
        variant='outline'
        size='default'
        label={(value?.length ? value : [{ label: 'Select Fields' }]).map((f) => f.label).join(', ')}
        icon='ChevronDown'
        iconPosition='right'
      />
    </JTLDropdown>
  );
}