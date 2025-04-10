/**
 * RadioCardWithHighlight Component
 *
 * An extension of the RadioCard component that supports highlighting search matches
 */
import React, { useMemo } from 'react';
import { Circle } from 'lucide-react';
import { cn, splitTextByMatch } from '@/lib/utils';
import { RadioCardProps } from '@/types/types';
import { useAppSelector } from '@/app/hooks';
import { selectSearchQuery } from '@/store/climate-variable-slice';

/**
 * HighlightedText Component - Highlights parts of text that match a search term
 */
interface HighlightedTextProps {
  text: string | undefined;
  searchTerm: string;
  className?: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = React.memo(({ 
  text = '', 
  searchTerm,
  className = '' 
}) => {
  // Only recalculate parts when text or searchTerm changes
  const parts = useMemo(() => {
    return splitTextByMatch(text, searchTerm);
  }, [text, searchTerm]);

  // If no search term or no matches, just return the text
  if (!searchTerm || parts.length === 1) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, index) => (
        <span 
          key={index} 
          className={part.isMatch ? 'bg-yellow-200 font-medium' : ''}
        >
          {part.text}
        </span>
      ))}
    </span>
  );
});

// Memoize the RadioCardWithHighlight component to prevent unnecessary re-renders
const RadioCardWithHighlight: React.FC<RadioCardProps> = React.memo(({
  value,
  radioGroup,
  title,
  description,
  selected,
  onSelect,
  className,
  thumbnail,
  children,
  ...props
}) => {
  const searchQuery = useAppSelector(selectSearchQuery);
  
  // No need to highlight if there's no search query
  const shouldHighlight = Boolean(searchQuery);

  const renderSelectedStatusIcon = () => {
    if (selected) {
      return (
        <div className="w-4 h-4 bg-brand-red rounded-full">
          <Circle size="16" className="text-white" />
        </div>
      );
    }

    return (
      <div className="w-4 h-4">
        <Circle size="16" className="text-neutral-grey-medium" />
      </div>
    );
  };

  return (
    <div
      className={cn(
        'radio-card',
        'flex flex-col bg-white hover:bg-neutral-grey-light border border-cold-grey-2 transition-colors duration-100',
        selected ? 'bg-neutral-grey-light border-brand-blue' : '',
        className
      )}
      {...props}
    >
      <label className="flex cursor-pointer relative">
        {thumbnail && (
          <span
            className="absolute left-0 top-0 h-full w-[40px] bg-no-repeat bg-cover bg-center"
            style={{ backgroundImage: `url(${thumbnail})` }}
          />
        )}
        <div className={cn('p-2', thumbnail ? 'ml-[50px] h-28' : '')}>
          <div className="flex items-start">
            <div className="grow text-base text-zinc-950 font-semibold leading-4 mr-4">
              {shouldHighlight ? (
                <HighlightedText text={title} searchTerm={searchQuery} />
              ) : (
                title
              )}
            </div>
            <input
              type="radio"
              name={radioGroup}
              value={value as string}
              checked={selected}
              onChange={onSelect}
              className="hidden"
            />
            {renderSelectedStatusIcon()}
          </div>
          {description && (
            <div className="line-clamp-3 text-sm text-neutral-grey-medium leading-5 my-2">
              {shouldHighlight ? (
                <HighlightedText text={description} searchTerm={searchQuery} />
              ) : (
                description
              )}
            </div>
          )}
        </div>
      </label>
      {children}
    </div>
  );
});
RadioCardWithHighlight.displayName = 'RadioCardWithHighlight';

export { RadioCardWithHighlight };
export { RadioCardFooter } from './ui/radio-card';
