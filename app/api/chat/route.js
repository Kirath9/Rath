export async function POST(req) {
  const { messages } = await req.json();

  const response = await fetch(
    "https://router.huggingface.co/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.2-3B-Instruct",
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    }
  );

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content || "…";

  return Response.json({ reply });
}
