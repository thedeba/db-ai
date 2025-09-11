// constants/models.ts
export interface Model {
  id?: string;           // AI Gateway models
  endpoint?: string;     // Hugging Face models
  name: string;
  description?: string;
  useAIClient?: boolean;
}

export const MODELS: Model[] = [
  { name: "db 1.5", endpoint: "https://thedeba-debai.hf.space/generate", description: "Fast & lightweight model", useAIClient: false },
  { name: "NightOWL", endpoint: "https://thedeba-deb.hf.space/generate", description: "Responsive & lightweight model", useAIClient: false },
  { name: "Friday", endpoint: "https://thedeba-friday.hf.space/generate", description: "More accurate, better capabilities", useAIClient: false },
  //{ name: "Gemini", id: "gemini", description: "GPT-5 AI", useAIClient: true },
];
