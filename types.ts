export interface GenerationOptions {
  numberOfProblems: number;
  difficultyLevel: string;
  problemType: string;
  includeSolutions: boolean;
  specificRequirements: string;
  subject: string;
}

export interface ApiResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export type TabType = 'similar' | 'solution';

export interface SnippetMap {
  [key: string]: string;
}