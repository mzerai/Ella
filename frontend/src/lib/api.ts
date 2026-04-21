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
// Health Check
// ============================================

export async function healthCheck(): Promise<{
  status: string;
  version: string;
  environment: string;
}> {
  return apiFetch("/health");
}
