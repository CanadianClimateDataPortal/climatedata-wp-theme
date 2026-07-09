import StepDataset from './step-dataset';
import StepVariable from './step-variable';
import StepVariableOptions from './step-variable-options';
import StepLocation from './step-location';
import StepAdditionalDetails from './step-additional-details';
import StepSendRequest from './step-send-request';
import StepResult from './step-result';

/**
 * @remarks
 * Instead of looking back at the JSDoc comment of each item and
 * hard-coding the step numbers elsewhere, let's use {@link DOWNLOAD_STEPS}.
 */
export const STEPS = [
    StepDataset,
    StepVariable,
    StepVariableOptions,
    StepLocation,
    StepAdditionalDetails,
    StepSendRequest,
    StepResult,
] as const;
