// nicaraguan-id-utils/src/index.ts
import { municipalityMap } from './interfaces/municipality-data';
export function isValid(id) {
    return validate(id).valid;
}
export function validate(id) {
    const pattern = /^\d{3}-\d{6}-\d{4}[A-Z]$/;
    if (!pattern.test(id))
        return { valid: false, error: 'Invalid format. Expected NNN-DDMMYY-NNNNL' };
    const match = id.match(/^(\d{3})-(\d{2})(\d{2})(\d{2})-(\d{4})([A-Z])$/);
    if (!match)
        return { valid: false, error: 'Pattern match failed' };
    const [, circCode, yy, mm, dd] = match;
    if (!municipalityMap[circCode]) {
        return { valid: false, error: 'Unknown municipality code' };
    }
    const birthYear = getFullBirthYear(parseInt(yy));
    const date = new Date(birthYear, parseInt(mm) - 1, parseInt(dd));
    if (isNaN(date.getTime()))
        return { valid: false, error: 'Invalid birth date' };
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
    const validation = validate(id);
    if (!validation.valid)
        return null;
    const match = id.match(/^(\d{3})-(\d{2})(\d{2})(\d{2})-(\d{4})([A-Z])$/);
    if (!match)
        return null;
    const [, circCode, yy, mm, dd, serial, verifier] = match;
    const birthYear = getFullBirthYear(parseInt(yy));
    const birthDate = new Date(birthYear, parseInt(mm) - 1, parseInt(dd));
    const record = municipalityMap[circCode];
    return {
        department: record?.department ?? 'Unknown',
        municipality: record?.municipality ?? 'Unknown',
        birthDate,
        serial,
        verifier,
        isAdult: isOver18(birthDate),
    };
}
function getFullBirthYear(yy) {
    // Rule: If under 30 → assume 2000s; otherwise, 1900s
    return yy < 30 ? 2000 + yy : 1900 + yy;
}
function isOver18(date) {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const hasHadBirthday = today.getMonth() > date.getMonth() ||
        (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());
    return age > 18 || (age === 18 && hasHadBirthday);
}
export function getDepartment(code) {
    return municipalityMap[code]?.department;
}
export function getMunicipality(code) {
    return municipalityMap[code]?.municipality;
}
export function getAllDepartments() {
    return [...new Set(Object.values(municipalityMap).map(r => r.department))];
}
export function getMunicipalitiesByDepartment(department) {
    return Object.values(municipalityMap)
        .filter(r => r.department.toLowerCase() === department.toLowerCase())
        .map(r => r.municipality);
}
/** Returns the exact age in years */
export function getAge(date) {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const beforeBirthday = today.getMonth() < date.getMonth() ||
        (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());
    if (beforeBirthday)
        age--;
    return age;
}
/** Returns true if person is under 18 */
export function isMinor(id) {
    const data = parse(id);
    if (!data)
        return false;
    return getAge(data.birthDate) < 18;
}
/** Returns department and municipality directly from ID */
export function getLocation(id) {
    const data = parse(id);
    if (!data)
        return null;
    return {
        department: data.department,
        municipality: data.municipality,
    };
}
/** Returns birthDate if ID is valid */
export function getBirthDate(id) {
    const data = parse(id);
    return data?.birthDate ?? null;
}
/** Returns the error message if ID is invalid, or null if valid */
export function getValidationError(id) {
    const result = validate(id);
    return result.valid ? null : result.error;
}
