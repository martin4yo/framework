import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string) {
    if (!password) return false;

    // Al menos 8 caracteres
    if (password.length < 8) return false;

    // Al menos una letra minúscula
    if (!/[a-z]/.test(password)) return false;

    // Al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) return false;

    // Al menos un número
    if (!/[0-9]/.test(password)) return false;

    // Al menos un carácter especial
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

    return true;
  }

  defaultMessage() {
    return 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}
