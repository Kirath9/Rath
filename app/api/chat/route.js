export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!process.env.HF_TOKEN) {
      return Response.json(
        { error: "HF_TOKEN is not configured" },
        { status: 500 }
      );
    }

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
          messages: messages.map((m) => ({
            role: m.role,
            content: String(m.content),
          })),
          max_tokens: 500,
        }),
      }
    );

    const data = await response.json();
    console.log("HF status:", response.status);
    console.log("HF response:", data);

    if (!response.ok) {
      return Response.json(
        { error: data?.error || "Hugging Face request failed" },
        { status: response.status }
      );
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return Response.json(
        { error: "No reply was returned", details: data },
        { status: 502 }
      );
    }

    return Response.json({ reply });
  } catch (error) {
    console.error("Route error:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
        }
