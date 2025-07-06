import { describe, it, expect } from 'vitest';
import { isValid, parse, getAge, getValidationError, isMinor, getLocation, } from './index';
describe('Nicaraguan ID Utils', () => {
    describe('Validaciones positivas', () => {
        it('valida una cédula correcta', () => {
            expect(isValid('001-030505-1234A')).toBe(true);
        });
        it('parsea correctamente una cédula válida', () => {
            const parsed = parse('001-030505-1234A');
            expect(parsed?.department).toBe('Managua');
            expect(getAge(parsed.birthDate)).toBeGreaterThan(18);
        });
        it('acepta cédulas sin guiones', () => {
            const parsed = parse('0010305051234A');
            expect(parsed?.department).toBe('Managua');
        });
        it('detecta correctamente si una persona es menor de edad', () => {
            const year = new Date().getFullYear() - 15;
            const shortYear = String(year).slice(-2);
            const id = `001-010101-${shortYear}01A`;
            expect(isMinor(id)).toBe(true);
        });
        it('detecta si una persona tiene edad suficiente para tener cédula (16+)', () => {
            const year = new Date().getFullYear() - 17;
            const shortYear = String(year).slice(-2);
            const id = `001-010101-${shortYear}01A`;
            const { isEligibleForId } = parse(id);
            expect(isEligibleForId).toBe(true);
        });
        it('detecta correctamente si no tiene edad para cédula (<16)', () => {
            const year = new Date().getFullYear() - 14;
            const shortYear = String(year).slice(-2);
            const id = `001-010101-${shortYear}01A`;
            const { isEligibleForId } = parse(id);
            expect(isEligibleForId).toBe(false);
        });
        it('obtiene correctamente la ubicación', () => {
            const loc = getLocation('001-030505-1234A');
            expect(loc?.department).toBe('Managua');
            expect(loc?.municipality).toBe('Managua');
        });
        it('calcula correctamente la edad', () => {
            const parsed = parse('001-030505-1234A');
            const age = getAge(parsed.birthDate);
            expect(typeof age).toBe('number');
            expect(age).toBeGreaterThan(0);
        });
        it('formatea correctamente la fecha como dd-mm-yyyy', () => {
            const parsed = parse('001-030505-1234A');
            expect(parsed?.birthDateFormatted).toBe('03-05-2005');
        });
    });
    describe('Validaciones negativas', () => {
        it('rechaza formato inválido', () => {
            expect(isValid('bad-id')).toBe(false);
        });
        it('rechaza código de municipio desconocido', () => {
            expect(isValid('999-010101-1234A')).toBe(false);
            expect(getValidationError('999-010101-1234A')).toMatch(/municipio desconocido/i);
        });
        it('rechaza fechas inválidas', () => {
            expect(isValid('001-991332-1234A')).toBe(false);
            expect(getValidationError('001-991332-1234A')).toMatch(/fecha de nacimiento inválida/i);
        });
        it('rechaza letra minúscula como verificador', () => {
            expect(isValid('001-030505-1234a')).toBe(false);
        });
        it('rechaza cédulas con dígitos faltantes', () => {
            expect(isValid('001-030505-123A')).toBe(false);
        });
    });
});
