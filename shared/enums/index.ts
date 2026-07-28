/**
 * shared/enums/index.ts
 */

export enum UserRoleEnum {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  ASSISTANT = 'assistant',
}

export enum AppointmentStatusEnum {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum NotificationTypeEnum {
  BOOKING = 'booking',
  REMINDER = 'reminder',
  REPLY = 'reply',
  SYSTEM = 'system',
}
