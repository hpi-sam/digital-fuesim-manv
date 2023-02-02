import type { UUID } from '../utils';
import type { Migration } from './migration-functions';

export const renameStartPointTypes19: Migration = {
    actions: (_initialState, actions) => {
        actions.forEach((action) => {
            if (
                (action as { type: string } | null)?.type ===
                '[Transfer] Add to transfer'
            ) {
                const typedAction = action as {
                    startPoint: {
                        type:
                            | 'alarmGroup'
                            | 'alarmGroupStartPoint'
                            | 'transferPoint'
                            | 'transferStartPoint';
                    };
                };
                if (typedAction.startPoint.type === 'alarmGroup') {
                    typedAction.startPoint.type = 'alarmGroupStartPoint';
                } else if (typedAction.startPoint.type === 'transferPoint') {
                    typedAction.startPoint.type = 'transferStartPoint';
                }
            }
        });
    },
    state: (state) => {
        const typedState = state as {
            materials: {
                [materialId: UUID]: {
                    position: {
                        type: 'transfer';
                        transfer: {
                            startPoint: {
                                type:
                                    | 'alarmGroup'
                                    | 'alarmGroupStartPoint'
                                    | 'transferPoint'
                                    | 'transferStartPoint';
                            };
                        };
                    };
                };
            };
            vehicles: {
                [vehicleId: UUID]: {
                    position: {
                        type: 'transfer';
                        transfer: {
                            startPoint: {
                                type:
                                    | 'alarmGroup'
                                    | 'alarmGroupStartPoint'
                                    | 'transferPoint'
                                    | 'transferStartPoint';
                            };
                        };
                    };
                };
            };
            personnel: {
                [personnelId: UUID]: {
                    position: {
                        type: 'transfer';
                        transfer: {
                            startPoint: {
                                type:
                                    | 'alarmGroup'
                                    | 'alarmGroupStartPoint'
                                    | 'transferPoint'
                                    | 'transferStartPoint';
                            };
                        };
                    };
                };
            };
        };

        Object.values(typedState.materials).forEach((material) => {
            if (material.position.type === 'transfer') {
                if (
                    material.position.transfer.startPoint.type === 'alarmGroup'
                ) {
                    material.position.transfer.startPoint.type =
                        'alarmGroupStartPoint';
                } else if (
                    material.position.transfer.startPoint.type ===
                    'transferPoint'
                ) {
                    material.position.transfer.startPoint.type =
                        'transferStartPoint';
                }
            }
        });

        Object.values(typedState.vehicles).forEach((vehicle) => {
            if (vehicle.position.type === 'transfer') {
                if (
                    vehicle.position.transfer.startPoint.type === 'alarmGroup'
                ) {
                    vehicle.position.transfer.startPoint.type =
                        'alarmGroupStartPoint';
                } else if (
                    vehicle.position.transfer.startPoint.type ===
                    'transferPoint'
                ) {
                    vehicle.position.transfer.startPoint.type =
                        'transferStartPoint';
                }
            }
        });

        Object.values(typedState.personnel).forEach((personnel) => {
            if (personnel.position.type === 'transfer') {
                if (
                    personnel.position.transfer.startPoint.type === 'alarmGroup'
                ) {
                    personnel.position.transfer.startPoint.type =
                        'alarmGroupStartPoint';
                } else if (
                    personnel.position.transfer.startPoint.type ===
                    'transferPoint'
                ) {
                    personnel.position.transfer.startPoint.type =
                        'transferStartPoint';
                }
            }
        });
    },
};
