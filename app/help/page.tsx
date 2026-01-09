import { getPublicArticles } from "@/lib/data";

export default async function HelpPage() {
  const articles = await getPublicArticles();

  return (
    <div>
      <section className="card">
        <p className="eyebrow">Help Center</p>
        <h2>Search the knowledge base</h2>
        <input placeholder="Search articles, FAQs, and how-tos" />
      </section>

      <section>
        <h3>Featured Articles</h3>
        <ul className="list">
          {articles.map((article) => (
            <li key={article.id}>
              <strong>{article.title}</strong>
              <p>{article.summary}</p>
              <small>{article.departmentName ?? "Global"}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
