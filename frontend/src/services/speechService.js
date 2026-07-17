import RecordRTC from "recordrtc";

let recorder = null;
let stream = null;
let callback = null;
let statusCallback = null;
let selectedLanguage = "en-IN";

export async function startListening(language, onResult, onStatus) {
  try {
    callback = onResult;
    statusCallback = onStatus;
    selectedLanguage = language;

    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    recorder = new RecordRTC(stream, {
      type: "audio",
      mimeType: "audio/wav",
      recorderType: RecordRTC.StereoAudioRecorder,
      desiredSampRate: 16000,
      numberOfAudioChannels: 1,
    });
    statusCallback("🎤 Listening...");
    recorder.startRecording();

    console.log("🎤 Recording started...");
  } catch (err) {
    console.error("Speech Error:", err);

    alert(
        err.message ||
        JSON.stringify(err) ||
        "Microphone error"
    );
}
}

export async function stopListening() {
  if (!recorder) return;

  recorder.stopRecording(async () => {
    const blob = recorder.getBlob();
    statusCallback?.("☁️ Uploading audio...");

    const formData = new FormData();
    formData.append("audio_file", blob, "recording.wav");
    formData.append("language", selectedLanguage);
    try {
      statusCallback?.("📝 Transcribing...");
      const response = await fetch(
        "http://127.0.0.1:8000/speech-to-text",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        callback(data.transcript);
      } else {
        alert(data.error?.message || "Speech recognition failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Backend connection failed.");
    }

    stream.getTracks().forEach((track) => track.stop());

    recorder = null;
    stream = null;
    callback = null;
    statusCallback = null;
  });
}