export interface NicaraguanIdData {
    department: string;
    municipality: string;
    birthDate: Date;
    serial: string;
    verifier: string;
    isAdult: boolean;
}
export type ValidationResult = {
    valid: true;
} | {
    valid: false;
    error: string;
};
export declare function isValid(id: string): boolean;
export declare function validate(id: string): ValidationResult;
export declare function format(raw: string): string;
export declare function normalize(id: string): string;
export declare function parse(id: string): NicaraguanIdData | null;
export declare function getDepartment(code: string): string | undefined;
export declare function getMunicipality(code: string): string | undefined;
export declare function getAllDepartments(): string[];
export declare function getMunicipalitiesByDepartment(department: string): string[];
/** Returns the exact age in years */
export declare function getAge(date: Date): number;
/** Returns true if person is under 18 */
export declare function isMinor(id: string): boolean;
/** Returns department and municipality directly from ID */
export declare function getLocation(id: string): {
    department: string;
    municipality: string;
} | null;
/** Returns birthDate if ID is valid */
export declare function getBirthDate(id: string): Date | null;
/** Returns the error message if ID is invalid, or null if valid */
export declare function getValidationError(id: string): string | null;
