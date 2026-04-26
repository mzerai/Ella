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
    hyperparameters?: { gamma: number; theta: number };
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
