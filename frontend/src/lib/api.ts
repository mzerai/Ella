/**
 * ELLA API client — communicates with the FastAPI backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Generic fetch wrapper with error handling.
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// ============================================
// ELLA Chat API
// ============================================

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  context: {
    page_id: string;
    page_title: string;
    algorithm: string;
    lab_name: string;
    environment?: { name: string; is_slippery: boolean };
    hyperparameters?: Record<string, number>;
    policy_mode?: string;
    evaluation_status?: string;
    metrics?: {
      iterations_to_converge: number;
      final_delta: number;
      is_mathematically_valid: boolean;
    };
    extra?: Record<string, unknown>;
  };
  conversation_history: ChatMessage[];
}

export interface ChatResponse {
  answer: string;
  connection_to_page?: string;
  intuition?: string;
  misconception?: string;
  latex_blocks?: string[];
  suggested_resources?: string;
  mode?: string;
  chunks_used?: number;
  response_time_ms?: number;
}

export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("/api/ella/chat", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// ============================================
// PE Labs API
// ============================================

export interface PELab {
  lab_id: string;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  mission_count: number;
}

export interface PEMission {
  mission_id: string;
  title: { fr: string; en: string };
  audience: string;
  difficulty: string;
  instructions: { fr: string; en: string };
  input_text?: { fr: string; en: string };
  hints: Array<{ fr: string; en: string }>;
}

export interface PELabDetail {
  lab_id: string;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  concept: { fr: string; en: string };
  missions: PEMission[];
}

export interface CriterionScore {
  score: number;
  feedback: string;
}

export interface PEEvaluation {
  criteria_scores: Record<string, CriterionScore>;
  total_score: number;
  max_score: number;
  strengths: string[];
  improvements: string[];
  improved_prompt_hint: string;
  pedagogical_note: string;
}

export interface PELabRunRequest {
  lab_id: string;
  mission_id: string;
  student_prompt: string;
  language?: string;
  system_prompt?: string;
}

export interface PELabRunResponse {
  lab_id: string;
  mission_id: string;
  llm_output: string;
  evaluation: PEEvaluation;
  execution_time_ms: number;
}

export async function listPELabs(): Promise<{ labs: PELab[] }> {
  return apiFetch<{ labs: PELab[] }>("/api/labs/pe/labs");
}

export async function getPELabDetail(
  labId: string
): Promise<PELabDetail> {
  return apiFetch<PELabDetail>(`/api/labs/pe/labs/${labId}`);
}

export async function runPELab(
  request: PELabRunRequest
): Promise<PELabRunResponse> {
  return apiFetch<PELabRunResponse>("/api/labs/pe/run", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// ============================================
// Module Cells API
// ============================================

export interface ContentCell {
  id: string;
  type: "content";
  title: { fr: string; en: string };
  content: { fr: string; en: string };
}

export interface EllaCheckpointCell {
  id: string;
  type: "ella_checkpoint";
  question: { fr: string; en: string };
  ella_system_hint: string;
  mode: "free" | "rewrite" | "quiz";
  checkpoint_config?: {
      topic: string;
      section_context: string;
      question_type: string;
      difficulty: string;
      hint: string;
      anti_gpt_instructions?: string;
  };
}

export interface EllaGateCell {
  id: string;
  type: "ella_gate";
  message: { fr: string; en: string };
  next_url: string;
}

export interface DiagramCell {
  id: string;
  type: "diagram";
  title: { fr: string; en: string };
  svg: string; // Raw SVG markup
}

export type NotebookCell = ContentCell | EllaCheckpointCell | EllaGateCell | DiagramCell;

export interface ModuleData {
  module_id: string;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  cells: NotebookCell[];
}

export async function getModuleCells(moduleId: string): Promise<ModuleData> {
  return apiFetch<ModuleData>(`/api/labs/pe/modules/${moduleId}`);
}

// ============================================
// RL Modules API
// ============================================

export async function listRLModules(): Promise<{
  modules: Array<{
    module_id: string;
    title: { fr: string; en: string };
    description: { fr: string; en: string };
    cell_count: number;
  }>;
}> {
  return apiFetch("/api/labs/rl/modules");
}

export async function getRLModuleCells(moduleId: string): Promise<ModuleData> {
  return apiFetch<ModuleData>(`/api/labs/rl/modules/${moduleId}`);
}

// ============================================
// AILE (Executive AI Leadership) API
// ============================================

export async function getAILEModuleCells(moduleId: string): Promise<ModuleData> {
  return apiFetch<ModuleData>(`/api/labs/aile/modules/${moduleId}`);
}

export async function getAILELabDetail(labId: string): Promise<PELabDetail> {
  return apiFetch<PELabDetail>(`/api/labs/aile/labs/${labId}`);
}

export interface AILEEvalResponse {
  feedback: string;
  score_qualitative: "excellent" | "good" | "needs_improvement";
}

export async function evaluateAILEResponse(params: {
  lab_id: string;
  mission_id: string;
  student_response: string;
  language: string;
}): Promise<AILEEvalResponse> {
  return apiFetch<AILEEvalResponse>("/api/labs/aile/evaluate", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ---- AILE Lab 06: Maturity Diagnostic ----

export interface DimensionScore {
  dimension_id: string;
  dimension_name: string;
  score: number;
  level: number;
  level_name: string;
}

export interface MaturityDiagnosticResponse {
  company_profile: Record<string, string>;
  dimension_scores: DimensionScore[];
  global_score: number;
  global_level: number;
  global_level_name: string;
  prudence_applied: boolean;
  prudence_details: string;
  ella_analysis: string;
  transition_plan_key: string;
}

export async function runMaturityDiagnostic(params: {
  company_profile: Record<string, string>;
  answers: Record<string, number>;
  language: string;
}): Promise<MaturityDiagnosticResponse> {
  return apiFetch<MaturityDiagnosticResponse>("/api/labs/aile/maturity-diagnostic", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function downloadMaturityPDF(params: {
  company_profile: Record<string, string>;
  answers: Record<string, number>;
  language: string;
}): Promise<Blob> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
  const response = await fetch(`${API_BASE}/api/labs/aile/maturity-diagnostic/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    throw new Error(`PDF generation failed: ${response.status}`);
  }
  return response.blob();
}

// ============================================
// RL Labs Execution API
// ============================================

export interface RLLabRunRequest {
  algorithm: string;
  gamma: number;
  theta: number;
  max_iterations: number;
  is_slippery: boolean;
  map_name: string;
  policy_mode: string;
  manual_policy?: Record<number, number>;
}

export interface RLLabPIStep {
  V: number[];
  Q: number[][];
  policy: number[][];
  eval_iters: number;
}

export interface RLLabRunResponse {
  algorithm: string;
  grid: string[][];
  grid_size: number;
  V: number[];
  Q: number[][];
  policy: number[][];
  iterations: number;
  final_delta: number;
  goal_reachable: boolean;
  v_history: number[][];
  delta_history: number[];
  pi_steps: RLLabPIStep[] | null;
}

export async function runRLLab(
  request: RLLabRunRequest
): Promise<RLLabRunResponse> {
  return apiFetch<RLLabRunResponse>("/api/labs/rl/run", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// ============================================
// RL Labs Training API (Model-Free)
// ============================================

export interface RLLabTrainRequest {
  algorithm: string;
  n_episodes: number;
  alpha: number;
  gamma: number;
  epsilon: number;
  epsilon_min: number;
  epsilon_decay: number;
  is_slippery: boolean;
  map_name: string;
}

export interface RLLabTrainResponse {
  algorithm: string;
  grid: string[][];
  grid_size: number;
  n_episodes: number;
  success_rate: number;
  avg_reward: number;
  avg_steps: number;
  reward_history: number[];
  success_rate_history: number[];
  V: number[];
  Q: number[][];
  policy: number[][];
  q_snapshots: Array<{ episode: number; q_table: number[][] }> | null;
  v_snapshots: Array<{ episode: number; V: number[] }> | null;
}

export async function trainRLLab(
  request: RLLabTrainRequest
): Promise<RLLabTrainResponse> {
  return apiFetch<RLLabTrainResponse>("/api/labs/rl/train", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// ============================================
// Health Check
// ============================================

export async function healthCheck(): Promise<{
  status: string;
  version: string;
  environment: string;
}> {
  return apiFetch("/health");
}

// ============================================
// Checkpoint Progress API (authenticated)
// ============================================

import { createClient } from "@/lib/supabase";

export interface CheckpointProgressItem {
  checkpoint_id: string;
  dynamic_question: string;
  student_response: string;
  ella_feedback: string;
  passed: boolean;
  attempts: number;
}

export interface CheckpointSavePayload {
  course_id: string;
  module_id: string;
  checkpoint_id: string;
  dynamic_question?: string;
  student_response?: string;
  ella_feedback?: string;
  passed?: boolean;
  attempts?: number;
}

/**
 * Authenticated fetch — injects Supabase JWT.
 * Degrades gracefully: returns fallback if user is not logged in.
 */
async function authFetch<T>(
  endpoint: string,
  options?: RequestInit,
  fallback?: T
): Promise<T> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    // Not logged in — return empty fallback, no crash
    return (fallback ?? {}) as T;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function fetchLessonProgress(
  courseId: string,
  moduleId: string
): Promise<{ checkpoints: CheckpointProgressItem[] }> {
  return authFetch<{ checkpoints: CheckpointProgressItem[] }>(
    `/api/progress/checkpoints/${courseId}/${moduleId}`,
    undefined,
    { checkpoints: [] }
  );
}

export async function saveCheckpointProgress(
  data: CheckpointSavePayload
): Promise<void> {
  try {
    await authFetch("/api/progress/checkpoints", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (err) {
    // Fire-and-forget: don't block the UI if save fails
    console.warn("Failed to save checkpoint progress:", err);
  }
}

// ============================================
// Course Access Codes
// ============================================

export interface CourseAccessResponse {
  has_access: boolean;
  unlocked_at: string | null;
}

export interface VerifyCodeResponse {
  success: boolean;
  message: string;
}

export async function checkCourseAccess(courseId: string): Promise<CourseAccessResponse> {
  return authFetch<CourseAccessResponse>(`/api/courses/access/${courseId}`, undefined, { has_access: false, unlocked_at: null });
}

export async function verifyAccessCode(code: string, courseId: string): Promise<VerifyCodeResponse> {
  return authFetch<VerifyCodeResponse>("/api/courses/verify-code", {
    method: "POST",
    body: JSON.stringify({ code, course_id: courseId }),
  });
}
// ============================================
// Agentic AI API
// ============================================

export async function getAgenticModuleCells(moduleId: string): Promise<ModuleData> {
  return apiFetch<ModuleData>(`/api/labs/agentic/modules/${moduleId}`);
}

export async function getAgenticLabDetail(labId: string): Promise<PELabDetail> {
  return apiFetch<PELabDetail>(`/api/labs/agentic/labs/${labId}`);
}

export interface AgenticEvalResponse {
  feedback: string;
  score_qualitative: "excellent" | "good" | "needs_improvement";
}

export async function evaluateAgenticResponse(params: {
  lab_id: string;
  mission_id: string;
  student_response: string;
  language: string;
}): Promise<AgenticEvalResponse> {
  return apiFetch<AgenticEvalResponse>("/api/labs/agentic/evaluate", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ============================================
// AI Finance & Banking API
// ============================================

export async function getFinanceModuleCells(moduleId: string): Promise<ModuleData> {
  return apiFetch<ModuleData>(`/api/labs/finance/modules/${moduleId}`);
}

export async function getFinanceLabDetail(labId: string): Promise<PELabDetail> {
  return apiFetch<PELabDetail>(`/api/labs/finance/labs/${labId}`);
}

export interface FinanceEvalResponse {
  feedback: string;
  score_qualitative: "excellent" | "good" | "needs_improvement";
}

export async function evaluateFinanceResponse(params: {
  lab_id: string;
  mission_id: string;
  student_response: string;
  language: string;
}): Promise<FinanceEvalResponse> {
  return apiFetch<FinanceEvalResponse>("/api/labs/finance/evaluate", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
// ============================================
// AI Healthcare API
// ============================================

export async function getHealthcareSequenceCells(sequenceId: string): Promise<ModuleData> {
  return apiFetch<ModuleData>(`/api/labs/healthcare/sequences/${sequenceId}`);
}

export async function getHealthcareWorkshopDetail(workshopId: string): Promise<PELabDetail> {
  return apiFetch<PELabDetail>(`/api/labs/healthcare/workshops/${workshopId}`);
}

export interface HealthcareEvalResponse {
  feedback: string;
  score_qualitative: "excellent" | "good" | "needs_improvement";
}

export async function evaluateHealthcareResponse(params: {
  workshop_id: string;
  mission_id: string;
  student_response: string;
  language: string;
}): Promise<HealthcareEvalResponse> {
  return apiFetch<HealthcareEvalResponse>("/api/labs/healthcare/evaluate", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
// ============================================
// AI Manufacturing & Industry 4.0 API
// ============================================

export async function getManufacturingModuleCells(moduleId: string): Promise<ModuleData> {
  return apiFetch<ModuleData>(`/api/labs/manufacturing/modules/${moduleId}`);
}

export async function getManufacturingLabDetail(labId: string): Promise<PELabDetail> {
  return apiFetch<PELabDetail>(`/api/labs/manufacturing/labs/${labId}`);
}

export interface ManufacturingEvalResponse {
  feedback: string;
  score_qualitative: "excellent" | "good" | "needs_improvement";
}

export async function evaluateManufacturingResponse(params: {
  lab_id: string;
  mission_id: string;
  student_response: string;
  language: string;
}): Promise<ManufacturingEvalResponse> {
  return apiFetch<ManufacturingEvalResponse>("/api/labs/manufacturing/evaluate", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
