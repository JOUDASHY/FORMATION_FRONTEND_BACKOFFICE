import axios from 'axios';

const OLLAMA_API_URL = "http://localhost:11434/api/chat";

export const chatWithOllama = async (message, setResponseText) => {
  try {
    const response = await axios({
      method: 'post',
      url: OLLAMA_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        model: "mistral",
        messages: [{ role: "user", content: message }],
      },
      responseType: 'stream', // Pour écouter les fragments de réponse
    });

    let completeResponse = "";

    response.data.on('data', (chunk) => {
      const data = JSON.parse(chunk.toString());
      if (data.message?.content) {
        completeResponse += data.message.content;
        setResponseText(completeResponse); // Met à jour la réponse partielle
      }
    });

    response.data.on('end', () => {
      console.log("Réponse complète : ", completeResponse);
    });

  } catch (error) {
    console.error("Erreur avec Ollama API:", error);
    setResponseText("Erreur de communication avec le modèle.");
  }
};
