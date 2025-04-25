'use client';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  Button,
  DropdownMenuContent,
  Input,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  Icon,
} from '@jtl/platform-ui-react';
import { useState, useRef, useCallback } from 'react';
import { Item, useItemsQuery } from '@/hooks/useWawi';
import { useDebounce } from 'react-use';

/**
 * Finds a product
 */
export default function ProductSelector({ item, onItemSelected }: { item?: Item; onItemSelected?: (item: Item) => void }) {
  const [query, setQuery] = useState('');
  const [queryDecounced, setQueryDebounced] = useState(query);
  const [selectedItem, setSelectedItem] = useState<Item | null>(item ?? null);
  const [isOpen, setIsOpen] = useState(false);
  const { data, error, isFetching } = useItemsQuery(queryDecounced);
  const inputRef = useRef<HTMLInputElement>(null);
  useDebounce(() => setQueryDebounced(query), 500, [query]);

  /**
   * Handle dropdown open state change
   */
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, []);

  /**
   * Handles changes in item selection
   */
  const handleItemSelected = (product: Item) => {
    setSelectedItem(product);
    onItemSelected?.(product);
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange} open={isOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" icon="ChevronDown" iconPosition="right" label={selectedItem?.name || 'Select Product...'} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <Input
          ref={inputRef}
          key="input"
          type="text"
          leftIcon="Search"
          onValueChange={setQuery}
          onBlur={() => requestAnimationFrame(() => inputRef.current?.focus())}
          value={query}
          placeholder="Find Items..."
        />
        <DropdownMenuSeparator />
        {isFetching && (
          <DropdownMenuItem>
            <Icon name="Loader" className="animate-spin"></Icon> Searching...
          </DropdownMenuItem>
        )}
        {!isFetching && error && (
          <DropdownMenuItem>
            <Icon name="AlertTriangle"></Icon> {error.message}
          </DropdownMenuItem>
        )}
        {!isFetching && !data?.length && <DropdownMenuItem disabled>No Results</DropdownMenuItem>}
        {data &&
          data.map(item => (
            <DropdownMenuCheckboxItem
              key={item.id}
              checked={item.id === selectedItem?.id}
              onCheckedChange={() => {
                handleItemSelected(item);
                setIsOpen(false);
              }}
            >
              {item.name}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
