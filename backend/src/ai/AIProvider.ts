export interface AIProvider {
  generateText(prompt: string): Promise<string>;
  generateJSON<T>(prompt: string): Promise<T>;
}
