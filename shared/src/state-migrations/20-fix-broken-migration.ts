import type { UUID } from '../utils';
import type { Migration } from './migration-functions';

export const fixBrokenMigration20: Migration = {
    actions: (_initialState, actions) => {
        actions.forEach((action) => {
            if (
                (action as { type: string } | null)?.type ===
                '[Vehicle] Add vehicle'
            ) {
                const typedAction = action as {
                    vehicle: {
                        position?: { x: number; y: number };
                        transfer?: any;
                        metaPosition?: any;
                    };
                    materials: {
                        position?: { x: number; y: number };
                        vehicleId?: UUID;
                        metaPosition?: any;
                    }[];
                    personnel: {
                        position?: { x: number; y: number };
                        transfer?: any;
                        vehicleId?: UUID;
                        metaPosition?: any;
                    }[];
                };
                if (typedAction.vehicle.position) {
                    typedAction.vehicle.metaPosition = {
                        type: 'coordinates',
                        position: {
                            x: typedAction.vehicle.position.x,
                            y: typedAction.vehicle.position.y,
                        },
                    };
                } else if (typedAction.vehicle.transfer) {
                    typedAction.vehicle.metaPosition = {
                        type: 'transfer',
                        transfer: typedAction.vehicle.transfer,
                    };
                } else {
                    typedAction.vehicle.metaPosition = {
                        type: 'coordinates',
                        position: {
                            x: 0,
                            y: 0,
                        },
                    };
                }
                for (const personnel of typedAction.personnel) {
                    if (personnel.position) {
                        personnel.metaPosition = {
                            type: 'coordinates',
                            position: {
                                x: personnel.position.x,
                                y: personnel.position.y,
                            },
                        };
                    } else if (personnel.transfer) {
                        personnel.metaPosition = {
                            type: 'transfer',
                            transfer: personnel.transfer,
                        };
                    } else if (personnel.vehicleId) {
                        personnel.metaPosition = {
                            type: 'vehicle',
                            vehicleId: personnel.vehicleId,
                        };
                    } else {
                        personnel.metaPosition = {
                            type: 'coordinates',
                            position: {
                                x: 0,
                                y: 0,
                            },
                        };
                    }
                }

                for (const material of typedAction.materials) {
                    if (material.position) {
                        material.metaPosition = {
                            type: 'coordinates',
                            position: {
                                x: material.position.x,
                                y: material.position.y,
                            },
                        };
                    } else if (material.vehicleId) {
                        material.metaPosition = {
                            type: 'vehicle',
                            vehicleId: material.vehicleId,
                        };
                    } else {
                        material.metaPosition = {
                            type: 'coordinates',
                            position: {
                                x: 0,
                                y: 0,
                            },
                        };
                    }
                }
                for (const material of typedAction.materials) {
                    if (material.metaPosition?.type === 'coordinates') {
                        material.metaPosition.coordinates =
                            material.metaPosition.position;
                        delete material.metaPosition.position;
                    }
                    material.position = material.metaPosition;
                    delete material.metaPosition;
                }

                for (const personnel of typedAction.personnel) {
                    delete personnel.transfer;
                    if (personnel.metaPosition?.type === 'coordinates') {
                        personnel.metaPosition.coordinates =
                            personnel.metaPosition.position;
                        delete personnel.metaPosition.position;
                    }
                    personnel.position = personnel.metaPosition;
                    delete personnel.metaPosition;
                }

                if (typedAction.vehicle.metaPosition?.type === 'coordinates') {
                    typedAction.vehicle.metaPosition.coordinates =
                        typedAction.vehicle.metaPosition.position;
                    delete typedAction.vehicle.metaPosition.position;
                }
                typedAction.vehicle.position = typedAction.vehicle.metaPosition;
                delete typedAction.vehicle.metaPosition;
            }
        });
    },
    state: null,
};
