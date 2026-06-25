import { normalizeCompanyName } from './normalize-company-name';

describe('normalizeCompanyName', () => {
  it('should trim, lowercase and collapse spaces', () => {
    expect(normalizeCompanyName('  Open   AI  ')).toBe('open ai');
  });
  it('should preserve already normalized names', () => {
    expect(normalizeCompanyName('doctolib')).toBe('doctolib');
  });
  it('should lowercase upperCase names', () => {
    expect(normalizeCompanyName('Company NAME')).toBe('company name');
  });
});
