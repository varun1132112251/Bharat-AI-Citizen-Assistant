const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export function startListening(language, onResult) {
  if (!SpeechRecognition) {
    alert("Speech Recognition is not supported.");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = language;
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    console.log("🎤 Listening started...");
  };

  recognition.onresult = (event) => {
    console.log("Result received:", event.results);

    const transcript = event.results[0][0].transcript;
    console.log("Transcript:", transcript);

    onResult(transcript);
  };

  recognition.onerror = (event) => {
    console.error("Speech Error:", event.error);
  };

  recognition.onend = () => {
    console.log("🎤 Listening ended");
  };

  recognition.start();
}