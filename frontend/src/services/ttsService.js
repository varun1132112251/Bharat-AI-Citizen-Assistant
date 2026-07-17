export async function speak(text, language) {

  try {

    const response = await fetch(
      "http://127.0.0.1:8000/text-to-speech",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text,
          language: language
        })
      }
    );

    if (!response.ok) {
      throw new Error("TTS request failed");
    }

    const audioBlob = await response.blob();

    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

    await audio.play();

  } catch (err) {

    console.error("Gnani TTS Error:", err);

  }

}