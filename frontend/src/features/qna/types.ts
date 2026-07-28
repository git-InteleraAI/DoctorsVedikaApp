/**
 * src/features/qna/types.ts
 * Types for Ask Doctor Q&A threads and submissions.
 */
import type { QuestionsRow, DoctorsRow } from '../../types/database';

export type QuestionWithDoctor = QuestionsRow & {
  doctors: DoctorsRow | null;
};

export interface SubmitQuestionPayload {
  patient_id: string;
  doctor_id: string;
  question_text: string;
  report_url?: string | null;
}
