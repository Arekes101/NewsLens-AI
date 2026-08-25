from datetime import datetime, timezone


def recency_score(published_at):
    if not published_at:
        return 0

    try:
        published = datetime.strptime(
            published_at,
            "%Y-%m-%d %H:%M:%S"
        ).replace(tzinfo=timezone.utc)

        now = datetime.now(timezone.utc)

        age_hours = (
            now - published
        ).total_seconds() / 3600

        # Simple decay:
        # newer article → higher score
        score = 1 / (1 + age_hours / 24)

        return max(0, min(1, score))

    except Exception:
        return 0


def calculate_final_score(
    semantic_score,
    interest_score,
    recency
):
    return (
        0.6 * semantic_score
        + 0.25 * interest_score
        + 0.15 * recency
    )


# -----------------------------
# Test
# -----------------------------

articles = [
    {
        "title": "Health Article",
        "category": "health",
        "semantic_score": 0.8,
        "publishedAt": "2026-08-25 08:00:00",
    },
    {
        "title": "Politics Article",
        "category": "politics",
        "semantic_score": 0.75,
        "publishedAt": "2026-08-20 08:00:00",
    },
]

user_interests = {
    "health": 1.0,
    "politics": 0.2,
}

for article in articles:

    interest_score = user_interests.get(
        article["category"],
        0
    )

    recent_score = recency_score(
        article["publishedAt"]
    )

    final_score = calculate_final_score(
        article["semantic_score"],
        interest_score,
        recent_score
    )

    print(
        article["title"],
        "| semantic:",
        round(article["semantic_score"], 3),
        "| interest:",
        round(interest_score, 3),
        "| recency:",
        round(recent_score, 3),
        "| final:",
        round(final_score, 3)
    )