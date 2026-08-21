import hashlib


def article_id_to_point_id(article_id):
    return int(
        hashlib.md5(article_id.encode()).hexdigest()[:15],
        16,
    )