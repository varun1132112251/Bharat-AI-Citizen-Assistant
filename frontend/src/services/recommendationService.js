export async function getRecommendations(message) {
  const response = await fetch("http://127.0.0.1:8000/recommend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
    }),
  });

  return await response.json();
}