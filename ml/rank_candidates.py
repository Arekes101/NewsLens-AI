def get_interest_score(category, interests):
    """
    Convert user's interest profile into a 0-1 score.
    """

    if not category:
        return 0

    for interest in interests:
        if interest["topic"].lower() == category.lower():
            return interest["percentage"] / 100

    return 0


def recency_score(published_at):
    from datetime import datetime, timezone

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

        return max(
            0,
            min(
                1,
                1 / (1 + age_hours / 24)
            )
        )

    except Exception:
        return 0


def calculate_final_score(
    semantic_score,
    interest_score,
    recency
):
    return (
        0.60 * semantic_score
        + 0.25 * interest_score
        + 0.15 * recency
    )


# -----------------------------
# TEST DATA
# -----------------------------

interests = [
    {
        "topic": "health",
        "score": 7.0674,
        "percentage": 100
    }
]

candidates = [
    {
        "title": "Health News",
        "category": "health",
        "publishedAt": "2026-08-25 08:00:00",
        "score": 0.70
    },
    {
        "title": "Politics News",
        "category": "politics",
        "publishedAt": "2026-08-25 08:00:00",
        "score": 0.75
    }
]

# -----------------------------
# RANK
# -----------------------------

ranked = []

for article in candidates:

    interest = get_interest_score(
        article["category"],
        interests
    )

    recency = recency_score(
        article["publishedAt"]
    )

    final = calculate_final_score(
        article["score"],
        interest,
        recency
    )

    article["interestScore"] = interest
    article["recencyScore"] = recency
    article["finalScore"] = final

    ranked.append(article)


ranked.sort(
    key=lambda x: x["finalScore"],
    reverse=True
)


print("\nRanked articles:\n")

for article in ranked:
    print(
        f"Final: {article['finalScore']:.4f} | "
        f"Semantic: {article['score']:.4f} | "
        f"Interest: {article['interestScore']:.4f} | "
        f"Recency: {article['recencyScore']:.4f} | "
        f"{article['title']}"
    )