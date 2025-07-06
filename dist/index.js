import { municipalityMap } from './interfaces/municipality-data';
export function isValid(id) {
    return validate(id).valid;
}
export function validate(id) {
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
    if (!isEligibleForId(birthDate)) {
        return { valid: false, error: 'Edad insuficiente para tener cédula (mínimo 16 años)' };
    }
    return { valid: true };
}
export function format(raw) {
    const cleaned = raw.replace(/\D/g, '').toUpperCase();
    if (cleaned.length !== 14)
        return raw;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 9)}-${cleaned.slice(9, 13)}${cleaned[13]}`;
}
export function normalize(id) {
    return format(id);
}
export function parse(id) {
    const result = validate(id);
    if (!result.valid)
        return null;
    const match = id.match(/^(\d{3})-(\d{2})(\d{2})(\d{2})-(\d{4})([A-Z])$/);
    if (!match)
        return null;
    const [, code, yy, mm, dd, serial, verifier] = match;
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
function resolveBirthYear(yy) {
    return yy < 30 ? 2000 + yy : 1900 + yy;
}
function isOver18(date) {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const hasBirthdayPassed = today.getMonth() > date.getMonth() ||
        (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());
    return age > 18 || (age === 18 && hasBirthdayPassed);
}
export function getAge(date) {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const birthdayNotReached = today.getMonth() < date.getMonth() ||
        (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());
    if (birthdayNotReached)
        age--;
    return age;
}
export function isMinor(id) {
    const data = parse(id);
    return data ? getAge(data.birthDate) < 18 : false;
}
export function isEligibleForId(date) {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const birthdayNotReached = today.getMonth() < date.getMonth() ||
        (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());
    if (birthdayNotReached)
        age--;
    return age >= 16;
}
export function getBirthDate(id) {
    return parse(id)?.birthDate ?? null;
}
export function getLocation(id) {
    const data = parse(id);
    return data
        ? { department: data.department, municipality: data.municipality }
        : null;
}
export function getDepartment(code) {
    return municipalityMap[code]?.department;
}
export function getMunicipality(code) {
    return municipalityMap[code]?.municipality;
}
export function getAllDepartments() {
    const all = Object.values(municipalityMap).map(r => r.department);
    return [...new Set(all)];
}
export function getMunicipalitiesByDepartment(dept) {
    return Object.values(municipalityMap)
        .filter(r => r.department.toLowerCase() === dept.toLowerCase())
        .map(r => r.municipality);
}
export function getValidationError(id) {
    const result = validate(id);
    return result.valid ? null : result.error;
}
function formatDateDDMMYYYY(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}
