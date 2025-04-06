import { Type } from 'class-transformer';
import { radiogramStatusTypeOptions } from '../../models/radiogram/status/exercise-radiogram-status.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const IsRadiogramStatus = () => Type(...radiogramStatusTypeOptions);
