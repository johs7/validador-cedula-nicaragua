import { describe, it, expect } from 'vitest';
import { isValid, parse, getAge, isMinor, getValidationError, getLocation, getBirthDate, } from './index';
describe('Nicaraguan ID Utils', () => {
    describe('✅ Validaciones positivas', () => {
        it('valida una cédula correcta', () => {
            expect(isValid('001-030505-1234A')).toBe(true);
        });
        it('acepta cédulas sin guiones', () => {
            expect(isValid('0010305051234A')).toBe(true);
        });
        it('parsea correctamente una cédula válida', () => {
            const parsed = parse('001-030505-1234A');
            expect(parsed?.department).toBe('Managua');
            expect(parsed?.municipality).toBe('Managua');
            expect(getAge(parsed.birthDate)).toBeGreaterThan(18);
        });
        it('detecta correctamente si una persona es menor de edad', () => {
            const year = new Date().getFullYear() - 15;
            const id = `001-${String(`0101${String(year).slice(-2)}`)}-1234A`;
            expect(isMinor(id)).toBe(true);
        });
        it('detecta si una persona tiene edad suficiente para tener cédula (16+)', () => {
            const year = new Date().getFullYear() - 17;
            const id = `001-0101${String(year).slice(-2)}-1234A`;
            const parsed = parse(id);
            expect(parsed?.isEligibleForId).toBe(true);
        });
        it('cédula con año 1999 (99) debe ser válida', () => {
            const id = `002-151299-5678B`; // 15-12-1999
            expect(isValid(id)).toBe(true);
            const parsed = parse(id);
            expect(parsed.birthDate.getFullYear()).toBe(1999);
            expect(parsed.isEligibleForId).toBe(true);
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
        it('obtiene correctamente la ubicación', () => {
            const loc = getLocation('001-030505-1234A');
            expect(loc?.department).toBe('Managua');
            expect(loc?.municipality).toBe('Managua');
        });
        it('getBirthDate devuelve una fecha válida', () => {
            const date = getBirthDate('001-030505-1234A');
            expect(date).toBeInstanceOf(Date);
        });
    });
    describe('❌ Validaciones negativas', () => {
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
        it('detecta correctamente si no tiene edad para cédula (<16)', () => {
            const year = new Date().getFullYear() - 14;
            const id = `001-0101${String(year).slice(-2)}-1234A`;
            expect(parse(id)).toBeNull(); // ✅
        });
    });
});
