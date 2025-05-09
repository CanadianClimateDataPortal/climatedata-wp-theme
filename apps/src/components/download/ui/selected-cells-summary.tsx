import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { ControlTitle } from '@/components/ui/control-title';
import { cn } from '@/lib/utils';

/**
 * SelectedCellsSummary
 * -------------------
 * Shows a summary of the number of selected cells and a clear button.
 */
export interface SelectedCellsSummaryProps {
  selectedCells: number;
  onClear: () => void;
  __: (msg: string) => string;
  _n: (singular: string, plural: string, count: number) => string;
  showClearButton?: boolean;
}

const SelectedCellsSummary: React.FC<SelectedCellsSummaryProps> = ({ selectedCells, onClear, __, _n, showClearButton }) => {
  return (
    <>
      {showClearButton && (
        <Button
          variant="ghost"
          className="text-xs text-brand-red font-semibold leading-4 tracking-wider uppercase h-auto p-0"
          onClick={onClear}
        >
          <RefreshCw size={16} />
          {__("Clear")}
        </Button>
      )}
      <div>
        <ControlTitle
          title={__("You selected:")}
          className="my-0"
        />
        <div
          className={cn(
            'text-2xl font-semibold leading-7 text-right',
            selectedCells > 0 ? 'text-brand-blue' : 'text-neutral-grey-medium'
          )}
        >
          {_n('1 Cell', `${selectedCells} Cells`, selectedCells)}
        </div>
      </div>
    </>
  );
};

export default SelectedCellsSummary; 