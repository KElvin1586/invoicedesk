import { describe, it, expect } from 'vitest';
import { toCsv, csvEscape } from '../src/domain/csvCodec';

describe('csvEscape', () => {
  it('passes normal values through', () => {
    expect(csvEscape('hello')).toBe('hello');
  });

  it('quotes values containing commas, quotes, or newlines', () => {
    expect(csvEscape('a,b')).toBe('"a,b"');
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
  });
});

describe('toCsv', () => {
  it('joins rows with CRLF', () => {
    const out = toCsv(['a', 'b'], [['1', '2'], ['3', '4']]);
    expect(out).toBe('a,b\r\n1,2\r\n3,4');
  });

  it('escapes per cell', () => {
    const out = toCsv(['note'], [['hello, world']]);
    expect(out).toBe('note\r\n"hello, world"');
  });
});
