import dayjs from "dayjs";
import type { RegisterMachineContext } from "../machines/registerMachine";

export const validateField = (key: string, value: any, context: RegisterMachineContext) => {
  if (!value || value === null || value === undefined || value === "") {
    return "Campo requerido";
  }

  if (key.includes("Email")) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Email inválido";
  }

  if (key.includes("Dni")) {
    return /^[0-9]{7,8}$/.test(value) ? "" : "DNI inválido (7 u 8 dígitos)";
  }

  if (key.includes("Matricula")) {
    return /^[0-9]{4,10}$/.test(value) ? "" : "Matrícula inválida";
  }

  if (key.includes("Telefono")) {
    return /^\+?[0-9]{8,15}$/.test(value)
      ? ""
      : "Número de teléfono inválido (solo números, 8-15 dígitos, opcional +)";
  }

  if (key.includes("Password") && !key.includes("Confirm")) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)
      ? ""
      : "Mínimo 8 caracteres, mayúscula, minúscula y número";
  }

  if (key.includes("PasswordConfirm")) {
    const passwordKey = key.includes("patient") ? "patientPassword" : "doctorPassword";
    return value === context.formValues?.[passwordKey] ? "" : "Las contraseñas no coinciden";
  }

  if (key.includes("FechaNacimiento")) {
    return dayjs(value).isValid() ? "" : "Fecha inválida";
  }

  return "";
};