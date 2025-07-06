# Nicaraguan ID Utils 🇳🇮 / Utilidades para Cédula Nicaragüense

Pequeña librería sin dependencias para validar, analizar y formatear cédulas de identidad nicaragüenses.

---

## 🚀 Instalación

```bash
npm install nicaraguan-id-utils
```

## 🔮 Ejemplo rápido

```ts
import {
  isValid,
  parse,
  getAge,
  getLocation,
  getValidationError,
} from "nicaraguan-id-utils";

const id = "001-030505-1234A";

console.log(isValid(id)); // true

const data = parse(id);
console.log(data?.department); // 'Managua'
console.log(data?.birthDate); // 2005-05-03
console.log(getAge(data!.birthDate));

console.log(getLocation(id));
console.log(getValidationError("999-999999-1234Z"));
```

---

## 🔠 Formato soportado

El formato es `NNN-DDMMYY-NNNNL`:

- `NNN`: Circunscripción (municipio).
- `DDMMYY`: Fecha de nacimiento.
- `NNNNL`: Correlativo más letra verificadora.

Los guiones son opcionales y la letra final debe ser mayúscula.

---

## 🤖 Funciones disponibles

| Función                                | Descripción                          |
| -------------------------------------- | ------------------------------------ |
| `isValid(id)`                          | `true` si la cédula es válida        |
| `validate(id)`                         | Resultado detallado de validación    |
| `format(raw)`                          | Formatea al estilo oficial           |
| `normalize(id)`                        | Alias de `format()`                  |
| `parse(id)`                            | Devuelve `NicaraguanIdData` o `null` |
| `getAge(date)`                         | Edad exacta desde una fecha          |
| `isMinor(id)`                          | `true` si es menor de edad           |
| `getLocation(id)`                      | `{ department, municipality }`       |
| `getBirthDate(id)`                     | `Date` de nacimiento                 |
| `getValidationError(id)`               | Mensaje si es inválida               |
| `getDepartment(code)`                  | Nombre del departamento              |
| `getMunicipality(code)`                | Nombre del municipio                 |
| `getAllDepartments()`                  | Lista de todos los departamentos     |
| `getMunicipalitiesByDepartment(depto)` | Municipios por departamento          |

---

## 📊 Resultado de `parse()`

```ts
{
  department: 'Managua',
  municipality: 'Managua',
  birthDate: 2005-05-03T00:00:00.000Z,
  serial: '1234',
  verifier: 'A',
  isAdult: true
}
```

---

## 🔖 Tipos

```ts
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
```

---

## 📅 Casos de prueba

Este proyecto usa [Vitest](https://vitest.dev/). Ejecuta:

```bash
npm run test
```

---

## 📢 Créditos

Desarrollado con ❤️ por [Johanssen Roque](https://github.com/Johs7)

## 📄 Licencia

MIT © 2025 Johanssen Roque

---

## 📚 Documentación completa

Consulta la guía completa de instalación, funciones y casos de uso en el sitio oficial:

👉 [https://validador-cedula-docs.netlify.app](https://validador-cedula-docs.netlify.app)

Incluye ejemplos detallados, referencia de API, formato oficial, y preguntas frecuentes.
