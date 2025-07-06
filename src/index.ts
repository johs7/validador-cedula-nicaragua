import { municipalityMap } from './interfaces/municipality-data';

export interface NicaraguanIdData {
    department: string;
    municipality: string;
    birthDate: Date;
    serial: string;
    verifier: string;
    isAdult: boolean;
}

export type ValidationResult =
    | { valid: true }
    | { valid: false; error: string };

export function isValid(id: string): boolean {
    return validate(id).valid;
}

export function validate(id: string): ValidationResult {
    const pattern = /^\d{3}-\d{6}-\d{4}[A-Z]$/;
    if (!pattern.test(id)) {
        return { valid: false, error: 'Formato inválido. Esperado: NNN-DDMMYY-NNNNL' };
    }

    const match = id.match(/^(\d{3})-(\d{2})(\d{2})(\d{2})-(\d{4})([A-Z])$/);
    if (!match) {
        return { valid: false, error: 'No coincide con el patrón esperado' };
    }

    const [, code, yy, mm, dd] = match;

    if (!municipalityMap[code]) {
        return { valid: false, error: 'Código de municipio desconocido' };
    }

    const year = resolveBirthYear(Number(yy));
    const birthDate = new Date(year, Number(mm) - 1, Number(dd));

    if (Number.isNaN(birthDate.getTime())) {
        return { valid: false, error: 'Fecha de nacimiento inválida' };
    }

    return { valid: true };
}

export function format(raw: string): string {
    const cleaned = raw.replace(/\D/g, '').toUpperCase();
    if (cleaned.length !== 14) return raw;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 9)}-${cleaned.slice(9, 13)}${cleaned[13]}`;
}

export function normalize(id: string): string {
    return format(id);
}

export function parse(id: string): NicaraguanIdData | null {
    const result = validate(id);
    if (!result.valid) return null;

    const match = id.match(/^(\d{3})-(\d{2})(\d{2})(\d{2})-(\d{4})([A-Z])$/);
    if (!match) return null;

    const [, code, yy, mm, dd, serial, verifier] = match;

    const year = resolveBirthYear(Number(yy));
    const birthDate = new Date(year, Number(mm) - 1, Number(dd));
    const region = municipalityMap[code];

    return {
        department: region?.department ?? 'Desconocido',
        municipality: region?.municipality ?? 'Desconocido',
        birthDate,
        serial,
        verifier,
        isAdult: isOver18(birthDate),
    };
}

function resolveBirthYear(yy: number): number {
    return yy < 30 ? 2000 + yy : 1900 + yy;
}

function isOver18(date: Date): boolean {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const hasBirthdayPassed =
        today.getMonth() > date.getMonth() ||
        (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());

    return age > 18 || (age === 18 && hasBirthdayPassed);
}

export function getAge(date: Date): number {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();

    const birthdayNotReached =
        today.getMonth() < date.getMonth() ||
        (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());

    if (birthdayNotReached) age--;
    return age;
}

export function isMinor(id: string): boolean {
    const data = parse(id);
    return data ? getAge(data.birthDate) < 18 : false;
}

export function getBirthDate(id: string): Date | null {
    return parse(id)?.birthDate ?? null;
}

export function getLocation(id: string): { department: string; municipality: string } | null {
    const data = parse(id);
    return data
        ? { department: data.department, municipality: data.municipality }
        : null;
}

export function getDepartment(code: string): string | undefined {
    return municipalityMap[code]?.department;
}

export function getMunicipality(code: string): string | undefined {
    return municipalityMap[code]?.municipality;
}

export function getAllDepartments(): string[] {
    const all = Object.values(municipalityMap).map(r => r.department);
    return [...new Set(all)];
}

export function getMunicipalitiesByDepartment(dept: string): string[] {
    return Object.values(municipalityMap)
        .filter(r => r.department.toLowerCase() === dept.toLowerCase())
        .map(r => r.municipality);
}

export function getValidationError(id: string): string | null {
    const result = validate(id);
    return result.valid ? null : result.error;
}
