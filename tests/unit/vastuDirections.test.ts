import {
  degreesTo4Cardinal,
  degreesTo16Zone,
  degreesTo32Pada,
  degreesTo45FieldIndex,
  degreesTo45FieldLabel,
} from '@/lib/vastuDirections';

describe('degreesTo4Cardinal', () => {
  it('maps North around 0°', () => {
    expect(degreesTo4Cardinal(0)).toBe('North');
    expect(degreesTo4Cardinal(359)).toBe('North');
    expect(degreesTo4Cardinal(44)).toBe('North');
  });
  it('maps quadrants', () => {
    expect(degreesTo4Cardinal(90)).toBe('East');
    expect(degreesTo4Cardinal(180)).toBe('South');
    expect(degreesTo4Cardinal(270)).toBe('West');
  });
  it('normalizes negative angles', () => {
    expect(degreesTo4Cardinal(-90)).toBe('West');
  });
});

describe('degreesTo16Zone', () => {
  it('centers North at 0°', () => {
    expect(degreesTo16Zone(0)).toBe('North');
  });
  it('boundary at 11.25°', () => {
    expect(degreesTo16Zone(11.24)).toBe('North');
    expect(degreesTo16Zone(11.25)).toBe('North-North-East');
  });
});

describe('degreesTo32Pada', () => {
  it('returns N1 near North', () => {
    expect(degreesTo32Pada(0)).toBe('N1');
  });
  it('steps every 11.25°', () => {
    expect(degreesTo32Pada(11.25)).toBe('N2');
  });
});

describe('degreesTo45FieldIndex', () => {
  it('has 45 sectors of 8° (North-centered slice spans 356°–4°)', () => {
    expect(degreesTo45FieldIndex(0)).toBe(0);
    expect(degreesTo45FieldIndex(3.99)).toBe(0);
    expect(degreesTo45FieldIndex(4)).toBe(1);
    expect(degreesTo45FieldIndex(8)).toBe(1);
    expect(degreesTo45FieldIndex(360)).toBe(0);
  });
});

describe('degreesTo45FieldLabel', () => {
  it('returns a string for any angle', () => {
    expect(typeof degreesTo45FieldLabel(33.3)).toBe('string');
    expect(degreesTo45FieldLabel(33.3).length).toBeGreaterThan(0);
  });
});
