import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { ControlTitle } from '@/components/ui/control-title';
import { cn } from '@/lib/utils';
import { sprintf } from '@wordpress/i18n';

/**
 * SelectedCellsSummary
 * -------------------
 * Shows a summary of the number of selected cells and a clear button.
 */
export interface SelectedCellsSummaryProps {
  selectedCells: number;
  isEstimate: boolean;
  onClear: () => void;
  __: (msg: string) => string;
  _n: (singular: string, plural: string, count: number) => string;
  showClearButton?: boolean;
}

const SelectedCellsSummary: React.FC<SelectedCellsSummaryProps> = (
    { selectedCells, isEstimate, onClear, __, _n, showClearButton }
) => {
  return (
    <>
      <div className="flex flex-col items-end">
        <div className="flex gap-4 items-center">
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
          <ControlTitle
            title={__("You selected:")}
            className="my-0"
          />
        </div>
        <div className="flex gap-2 items-baseline">
          {isEstimate &&
            <div className="font-semibold text-xs text-neutral-grey-medium">
              {__('around')}
            </div>
          }
          <div
            className={cn(
              'text-2xl font-semibold leading-7 text-right',
              selectedCells > 0 ? 'text-brand-blue' : 'text-neutral-grey-medium'
            )}
          >
            {sprintf(_n('%d Cell', `%d Cells`, selectedCells), selectedCells)}
          </div>
        </div>
      </div>
    </>
  );
};

export default SelectedCellsSummary;
