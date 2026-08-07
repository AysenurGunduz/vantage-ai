import type { AIProvider } from "./AIProvider.js";

export class OllamaProvider implements AIProvider {
  constructor(
    private readonly host: string,
    private readonly model: string,
    private readonly temperature: number = 0.3,
  ) {}

  private async generate(prompt: string, jsonMode: boolean): Promise<string> {
    const response = await fetch(`${this.host}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
        options: { temperature: this.temperature },
        ...(jsonMode ? { format: "json" } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { response: string };
    return data.response;
  }

  generateText(prompt: string): Promise<string> {
    return this.generate(prompt, false);
  }

  async generateJSON<T>(prompt: string): Promise<T> {
    const text = await this.generate(prompt, true);
    return JSON.parse(text) as T;
  }
}
