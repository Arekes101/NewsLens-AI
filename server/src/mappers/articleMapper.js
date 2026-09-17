export const mapArticle = (article) => ({
  id: article.article_id,

  title: article.title ?? "No Title",

  description:
    article.description ?? "No description available.",

  image:
    article.image_url ??
    "https://placehold.co/600x400?text=No+Image",

  url: article.link,

  source: article.source_name,

  publishedAt: article.pubDate,

  category:
    Array.isArray(article.category)
      ? article.category[0] ?? ""
      : article.category ?? "",

  country:
    Array.isArray(article.country)
      ? article.country[0] ?? ""
      : article.country ?? "",

  language: article.language ?? "",
});