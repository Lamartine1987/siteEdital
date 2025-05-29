const functions = require("firebase-functions/v2/https"); // V2
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

admin.initializeApp();

// Define o segredo
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

exports.gerarQuestoes = onRequest({ secrets: [OPENAI_API_KEY] }, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Método não permitido");
    }

    const { assunto, banca, quantidade } = req.body;

    if (!assunto || !banca || !quantidade) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios: assunto, banca, quantidade",
      });
    }

    const prompt = `Gere ${quantidade} questões objetivas sobre o tema "${assunto}" no estilo da banca ${banca}.
Formato:
1. Enunciado da questão
a) Alternativa A
b) Alternativa B
c) Alternativa C
d) Alternativa D
Resposta correta: [letra]`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // ← AQUI VEM DO SEGREDO
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const conteudo = data.choices?.[0]?.message?.content || "Não foi possível gerar questões.";
      res.json({ resultado: conteudo });
    } catch (error) {
      console.error("Erro ao consultar OpenAI:", error);
      res.status(500).json({ error: "Erro ao gerar questões." });
    }
  });
});
