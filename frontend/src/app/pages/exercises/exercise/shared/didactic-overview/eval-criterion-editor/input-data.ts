import type {
    ComparativeOperator,
    EvalCriterion,
    LogicalOperator,
    Patient,
    PatientStatus,
    StateMachineId,
    StateMachineStateId,
    TechnicalChallengeId,
    UUID,
} from 'fuesim-digital-shared';

export interface InputData {
    name: string;
    countInput: number;
    comparativeOperator: ComparativeOperator;
    logicalOperator: LogicalOperator;
    timestampInput: number;
    patientStatusInput: PatientStatus;
    targetMeasureTemplateId: UUID;
    technicalChallengeId: TechnicalChallengeId | '';
    targetStateMachineIds: StateMachineId[];
    targetStateMachineStateIds: {
        [targetStateMachineId: StateMachineId]: StateMachineStateId;
    };
    targetPatients: Patient[];
    targetPatientsStatusMap: { [id: UUID]: PatientStatus };
    targetScoutableId: UUID;
    subCriteria: EvalCriterion[];
    singleSubCriterion: UUID;
}
