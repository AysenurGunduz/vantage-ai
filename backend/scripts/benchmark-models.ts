const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODELS = ["qwen2.5:3b-instruct-q4_K_M", "llama3.2:3b"];

interface Subtask {
  title: string;
  estimated_hours: number;
}

function isValidSubtaskPlan(value: unknown): value is { subtasks: Subtask[] } {
  if (typeof value !== "object" || value === null) return false;
  const subtasks = (value as { subtasks?: unknown }).subtasks;
  if (!Array.isArray(subtasks) || subtasks.length === 0) return false;
  return subtasks.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Subtask).title === "string" &&
      typeof (item as Subtask).estimated_hours === "number",
  );
}

async function generate(model: string, prompt: string, jsonMode: boolean) {
  const start = performance.now();
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      ...(jsonMode ? { format: "json" } : {}),
    }),
  });
  const data = (await response.json()) as { response: string };
  const elapsedMs = performance.now() - start;
  return { text: data.response, elapsedMs };
}

const TASK_SPLIT_PROMPT = `Sen bir proje yönetimi asistanısın. Aşağıdaki görevi mantıklı alt görevlere böl.
Görev: "Kullanıcı profil sayfasını yeniden tasarla: avatar yükleme, bildirim tercihleri ve şifre değiştirme bölümlerini içersin."
SADECE şu JSON şemasına uyan bir çıktı ver, başka hiçbir açıklama ekleme:
{"subtasks": [{"title": "string", "estimated_hours": number}]}`;

const RISK_EXPLANATION_PROMPT = `Bir proje yönetimi uygulamasında şu görev var:
- Başlık: "API entegrasyon testleri"
- Son tarih: 2 gün sonra
- Durum: "in_progress"
- İlerleme notu: Geliştirici son 5 gündür bu görevde herhangi bir güncelleme yapmadı, alt görevlerin sadece %20'si tamamlandı.

Bu görevin neden gecikme riski taşıdığını, proje yöneticisine sunulacak şekilde, akıcı ve kısa (2-3 cümle) bir Türkçe açıklama olarak yaz.`;

async function main() {
  for (const model of MODELS) {
    console.log(`\n=== ${model} ===`);

    const split = await generate(model, TASK_SPLIT_PROMPT, true);
    console.log(`[Görev bölme] ${split.elapsedMs.toFixed(0)}ms`);
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(split.text);
    } catch {
      // ignore, reported below
    }
    console.log(`  JSON şemaya uygun: ${isValidSubtaskPlan(parsed) ? "EVET" : "HAYIR"}`);
    console.log(`  Ham çıktı: ${split.text}`);

    const risk = await generate(model, RISK_EXPLANATION_PROMPT, false);
    console.log(`[Gecikme riski açıklaması] ${risk.elapsedMs.toFixed(0)}ms`);
    console.log(`  Çıktı: ${risk.text.trim()}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
