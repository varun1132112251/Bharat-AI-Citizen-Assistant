export function speak(text, language) {
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = language;
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}