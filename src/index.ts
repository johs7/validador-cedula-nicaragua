import { municipalityMap } from './interfaces/municipality-data';

export interface NicaraguanIdData {
    department: string;
    municipality: string;
    birthDate: Date;
    birthDateFormatted: string;
    serial: string;
    verifier: string;
    isAdult: boolean;
    isEligibleForId?: boolean;
}

export type ValidationResult =
    | { valid: true }
    | { valid: false; error: string };

export function isValid(id: string): boolean {
    return validate(id).valid;
}

export function validate(id: string): ValidationResult {
    const raw = id.trim();

    // Acepta con o sin guiones, mayúsculas y minúsculas
    const match = raw.match(/^(\d{3})-?(\d{2})(\d{2})(\d{2})-?(\d{4})([A-Za-z])$/);
    if (!match) {
        return { valid: false, error: 'Formato inválido. Esperado: NNN-DDMMYY-NNNNL' };
    }

    const [_, code, dd, mm, yy, serial, letter] = match;

    // Letra debe ser mayúscula
    if (letter !== letter.toUpperCase()) {
        return { valid: false, error: 'La letra verificador debe ser mayúscula' };
    }

    // Validar código municipal
    if (!municipalityMap[code]) {
        return { valid: false, error: 'Código de municipio desconocido' };
    }

    const year = resolveBirthYear(Number(yy));
    const birthDate = new Date(year, Number(mm) - 1, Number(dd));

    // Verificar fecha válida real (no 32-01-2020, por ejemplo)
    if (
        birthDate.getFullYear() !== year ||
        birthDate.getMonth() !== Number(mm) - 1 ||
        birthDate.getDate() !== Number(dd)
    ) {
        return { valid: false, error: 'Fecha de nacimiento inválida' };
    }

    if (birthDate > new Date()) {
        return { valid: false, error: 'Fecha de nacimiento en el futuro no válida' };
    }

    if (!isEligibleForId(birthDate)) {
        return { valid: false, error: 'Edad insuficiente para tener cédula (mínimo 16 años)' };
    }

    return { valid: true };
}

export function format(raw: string): string {
    const cleaned = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length !== 14) return raw;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 9)}-${cleaned.slice(9, 13)}${cleaned[13]}`;
}

export function normalize(id: string): string {
    return format(id);
}

export function parse(id: string): NicaraguanIdData | null {
    const result = validate(id);
    if (!result.valid) return null;

    const formatted = format(id);
    const match = formatted.match(/^(\d{3})-(\d{2})(\d{2})(\d{2})-(\d{4})([A-Z])$/);
    if (!match) return null;

    const [, code, dd, mm, yy, serial, verifier] = match;
    const year = resolveBirthYear(Number(yy));
    const birthDate = new Date(year, Number(mm) - 1, Number(dd));
    const region = municipalityMap[code];

    return {
        department: region?.department ?? 'Desconocido',
        municipality: region?.municipality ?? 'Desconocido',
        birthDate,
        birthDateFormatted: formatDateDDMMYYYY(birthDate),
        serial,
        verifier,
        isAdult: isOver18(birthDate),
        isEligibleForId: isEligibleForId(birthDate),
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
    const cleaned = format(id);
    const match = cleaned.match(/^(\d{3})-(\d{2})(\d{2})(\d{2})-(\d{4})([A-Z])$/);
    if (!match) return false;

    const [, , dd, mm, yy] = match;
    const year = resolveBirthYear(Number(yy));
    const birthDate = new Date(year, Number(mm) - 1, Number(dd));
    return getAge(birthDate) < 18;
}

export function isEligibleForId(date: Date): boolean {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const birthdayNotReached =
        today.getMonth() < date.getMonth() ||
        (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());

    if (birthdayNotReached) age--;
    return age >= 16;
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

function formatDateDDMMYYYY(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}
