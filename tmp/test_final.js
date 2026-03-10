const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No GEMINI_API_KEY found");
    return;
  }

  const client = new GoogleGenAI({ apiKey });

  try {
    const interaction = await client.interactions.create({
      model: 'gemini-1.5-flash',
      input: 'Say hello',
    });
    
    const text = interaction.outputs[interaction.outputs.length - 1].text;
    console.log("Success:", text);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
