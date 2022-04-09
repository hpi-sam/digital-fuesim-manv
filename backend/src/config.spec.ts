import type { ReporterOptions } from 'envalid';
import { cleanEnv } from 'envalid';
import { Config } from './config';

describe('Config', () => {
    describe('tcp port validator', () => {
        it.each(['0', '1', '100', '65535'])(
            'lets valid port %s pass',
            (port) => {
                const validator = (Config as any).createTCPPortValidator();
                let reported: ReporterOptions<{ port: unknown }> | undefined;
                cleanEnv(
                    { port },
                    { port: validator() },
                    {
                        reporter: (report) => {
                            reported = report;
                        },
                    }
                );
                expect(reported?.errors).toStrictEqual({});
            }
        );

        it.each(['-1', '65536', 'abc', (x: number) => x + 1])(
            'does not let invalid port %s pass',
            (port) => {
                const validator = (Config as any).createTCPPortValidator();
                let reported: ReporterOptions<{ port: unknown }> | undefined;
                cleanEnv(
                    { port },
                    { port: validator() },
                    {
                        reporter: (report) => {
                            reported = report;
                        },
                    }
                );
                expect(reported?.errors).not.toStrictEqual({});
            }
        );
    });
});
