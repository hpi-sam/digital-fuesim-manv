import type { ReporterOptions } from 'envalid';
import { cleanEnv } from 'envalid';
import { Config } from './config';

type Report = ReporterOptions<{ port: unknown }> | undefined;

function getReport(port: any): Report {
    // This is a workaround to call a private method
    const validator = (Config as any).createTCPPortValidator();
    let reported: Report;
    cleanEnv(
        { port },
        { port: validator() },
        {
            reporter: (report) => {
                reported = report;
            },
        }
    );
    return reported;
}

describe('Config', () => {
    describe('tcp port validator', () => {
        it.each(['0', '1', '100', '65535'])(
            'lets valid port %s pass',
            (port) => {
                const reported = getReport(port);

                expect(reported?.errors).toStrictEqual({});
            }
        );

        it.each(['-1', '65536', 'abc', (x: number) => x + 1])(
            'does not let invalid port %s pass',
            (port) => {
                const reported = getReport(port);

                expect(reported?.errors).not.toStrictEqual({});
            }
        );
    });
});
