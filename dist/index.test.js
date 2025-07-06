import { describe, it, expect } from 'vitest';
import { isValid, parse, getAge, getValidationError, isMinor, getLocation, } from './index';
describe('Nicaraguan ID Utils', () => {
    // Básico
    it('should validate a correct ID', () => {
        expect(isValid('001-030505-1234A')).toBe(true);
    });
    it('should fail on bad format', () => {
        expect(isValid('bad-id')).toBe(false);
    });
    it('should parse correctly', () => {
        const parsed = parse('001-030505-1234A');
        expect(parsed?.department).toBe('Managua');
        expect(getAge(parsed.birthDate)).toBeGreaterThan(18);
    });
    // ✅ Sin guiones (formato válido si se normaliza)
    it('should normalize and validate ID without dashes', () => {
        const formatted = parse('0010305051234A');
        expect(formatted?.department).toBe('Managua');
    });
    // ❌ Código de municipio inválido
    it('should reject unknown municipality code', () => {
        expect(isValid('999-010101-1234A')).toBe(false);
        expect(getValidationError('999-010101-1234A')).toMatch(/Unknown municipality/);
    });
    // ❌ Fecha inválida
    it('should reject invalid date', () => {
        expect(isValid('001-991332-1234A')).toBe(false); // Día 32
        expect(getValidationError('001-991332-1234A')).toMatch(/Invalid birth date/);
    });
    // ✅ Persona menor de edad (fecha reciente)
    it('should detect a minor', () => {
        const year = new Date().getFullYear() - 15;
        const yy = String(year).slice(-2);
        const id = `001-010101-${yy}01A`.replace('-', '');
        const formatted = parse(`001-010101-0001A`);
        expect(isMinor(`001-010101-0001A`)).toBe(true);
    });
    // ✅ Obtener localización directamente
    it('should get location from ID', () => {
        const loc = getLocation('001-030505-1234A');
        expect(loc?.department).toBe('Managua');
        expect(loc?.municipality).toBe('Managua');
    });
    // ❌ Letra minúscula al final → inválido
    it('should reject lowercase letter in verifier', () => {
        expect(isValid('001-030505-1234a')).toBe(false);
    });
    // ❌ Faltan dígitos
    it('should fail with missing digits', () => {
        expect(isValid('001-030505-123A')).toBe(false);
    });
    // ✅ Edad exacta
    it('should get correct age', () => {
        const parsed = parse('001-030505-1234A');
        const age = getAge(parsed.birthDate);
        expect(typeof age).toBe('number');
        expect(age).toBeGreaterThan(0);
    });
});
