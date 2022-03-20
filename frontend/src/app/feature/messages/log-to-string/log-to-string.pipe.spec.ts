import { logToStringPipeTransform } from './log-to-string-pipe-transform';

describe('LogToStringPipe', () => {
    it('converts strings correctly', () => {
        const aString = 'abcdefg ghijklmn opqrstuvw';
        expect(logToStringPipeTransform(aString)).toEqual(aString);
    });

    it('converts numbers correctly', () => {
        const aNumber = 1234.45;
        expect(logToStringPipeTransform(aNumber)).toEqual('1234.45');
    });

    it('converts objects correctly', () => {
        const anObject = {
            a: 123,
            b: 'asde',
        };
        expect(logToStringPipeTransform(anObject)).toEqual(`{
  "a": 123,
  "b": "asde"
}`);
    });

    it('converts objects with functions correctly', () => {
        const anObject = {
            a: 123,
            b: 'asde',
            c: () => 223,
        };
        expect(logToStringPipeTransform(anObject)).toEqual(`{
  "a": 123,
  "b": "asde"
}`);
    });

    it('treats line breaks in strings correctly', () => {
        const aStringWithLineBreaks = `0
1\n2\n
3
4`;
        expect(logToStringPipeTransform(aStringWithLineBreaks)).toEqual(
            `0
1
2

3
4`
        );
        const anObjectWithLineBreaks = {
            b: aStringWithLineBreaks,
        };
        expect(logToStringPipeTransform(anObjectWithLineBreaks)).toEqual(
            `{
  "b": "0
1
2

3
4"
}`
        );
    });
});
