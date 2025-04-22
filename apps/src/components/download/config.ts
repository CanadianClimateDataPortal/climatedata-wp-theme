import StepDataset from './step-dataset';
import StepVariable from './step-variable';
import StepVariableOptions from './step-variable-options';
import StepLocation from './step-location';
import StepAdditionalDetails from './step-additional-details';
import StepSendRequest from './step-send-request';

export const STEPS = [
    StepDataset,
    StepVariable,
    StepVariableOptions,
    StepLocation,
    StepAdditionalDetails,
    StepSendRequest,
] as const;
