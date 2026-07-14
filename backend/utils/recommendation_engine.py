def recommend_schemes(user_query: str, schemes: list):

    stop_words = {
        "i",
        "am",
        "a",
        "an",
        "the",
        "is",
        "are",
        "need",
        "want",
        "for",
        "to",
        "of",
        "my"
    }

    words = [
        word
        for word in user_query.lower().split()
        if word not in stop_words
    ]
    recommendations = []

    for scheme in schemes:

        score = 0

        searchable_text = " ".join([
            scheme.get("name", ""),
            scheme.get("category", ""),
            scheme.get("subcategory", ""),
            scheme.get("description", ""),
            " ".join(scheme.get("keywords", [])),
            " ".join(scheme.get("benefits", [])),
            " ".join(scheme.get("eligibility", [])),
            " ".join(scheme.get("documents", [])),
            " ".join(scheme.get("target_groups", []))
        ]).lower()

        for word in words:

            if len(word) < 3:
                continue

            if word in searchable_text:
                score += 2

        if score > 0:

            recommendations.append({
                "score": score,
                "scheme": scheme
            })

    recommendations.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return recommendations[:5]