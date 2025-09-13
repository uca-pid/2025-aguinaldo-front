import dayjs from "dayjs";
import type { RegisterMachineContext } from "../machines/registerMachine";

export const validateField = (key: string, value: any, context: RegisterMachineContext) => {
  if (!value || value === null || value === undefined || value === "") {
    return "Campo requerido";
  }

  if (key.includes("email")) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Email inválido";
  }

  if (key.includes("dni")) {
    return /^[0-9]{7,8}$/.test(value) ? "" : "DNI inválido (7 u 8 dígitos)";
  }

  if (key.includes("medicalLicense")) {
    return /^[0-9]{4,10}$/.test(value) ? "" : "Matrícula inválida";
  }

  if (key.includes("phone")) {
    return /^\+?[0-9]{8,15}$/.test(value)
      ? ""
      : "Número de teléfono inválido (solo números, 8-15 dígitos, opcional +)";
  }

  if (key.includes("password") && !key.includes("confirm")) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)
      ? ""
      : "Mínimo 8 caracteres, mayúscula, minúscula y número";
  }

  if (key.includes("password_confirm")) {
    return value === context.formValues?.["password"] ? "" : "Las contraseñas no coinciden";
  }

  if (key.includes("birthdate")) {
    return dayjs(value).isValid() ? "" : "Fecha inválida";
  }

  return "";
};

export const checkFormValidation = (context: RegisterMachineContext): boolean => {
  const { formErrors = {}, formValues, isPatient } = context;
  
  const hasErrors = Object.values(formErrors).some(error => error && error.length > 0);

  const requiredFields = isPatient
    ? ['name', 'surname', 'dni', 'gender', 'birthdate', 'phone', 'email', 'password', 'password_confirm']
    : ['name', 'surname', 'dni', 'gender', 'birthdate', 'phone', 'email', 'password', 'password_confirm', 'specialty', 'medical_license'];

  const hasEmptyFields = requiredFields.some(field => {
    const value = formValues[field as keyof typeof formValues];
    return !value || (typeof value === 'string' && value.trim() === '');
  });

  return hasErrors || hasEmptyFields;
};