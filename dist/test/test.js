import { isValid, parse, getAge, getValidationError } from '../index';
const sampleId = '001-030505-1234A';
console.log('Valid:', isValid(sampleId));
console.log('Parse:', parse(sampleId));
console.log('Age:', getAge(parse(sampleId)?.birthDate));
console.log('Error:', getValidationError('999-999999-9999Z'));
