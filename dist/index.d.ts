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
export declare function getAge(date: Date): number;
export declare function isMinor(id: string): boolean;
export declare function getBirthDate(id: string): Date | null;
export declare function getLocation(id: string): {
    department: string;
    municipality: string;
} | null;
export declare function getDepartment(code: string): string | undefined;
export declare function getMunicipality(code: string): string | undefined;
export declare function getAllDepartments(): string[];
export declare function getMunicipalitiesByDepartment(dept: string): string[];
export declare function getValidationError(id: string): string | null;
