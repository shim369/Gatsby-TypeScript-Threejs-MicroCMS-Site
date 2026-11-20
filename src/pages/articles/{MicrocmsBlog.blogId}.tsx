import { graphql, Link, type HeadProps, type PageProps } from "gatsby";
import Contact from "../../components/Contact";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import PostCover from "../../components/PostCover";
import { Seo } from "../../components/Seo";
import { useReveal } from "../../hooks/useReveal";
import { formatDate } from "../../utils/formatDate";
import { delay } from "../../utils/style";

export default function ArticlePage({ data }: PageProps<Queries.ArticlePageQuery>) {
  useReveal();
  const post = data.microcmsBlog;

  return (
    <>
      <div className="progress" aria-hidden="true" />
      <Header />
      <main>
        <article className="article">
          <div className="wrap article__in">
            <div className="article__meta intro" style={delay(0.05)}>
              {post?.category?.name && <span className="article__cat">{post.category.name}</span>}
              <time dateTime={post?.publishedAt ?? undefined}>{formatDate(post?.publishedAt)}</time>
            </div>
            <h1 className="intro" style={delay(0.15)}>
              {post?.title}
            </h1>
            <div className="article__cover intro" style={delay(0.3)}>
              <PostCover eyecatch={post?.eyecatch} seed={0} width={1520} eager />
            </div>
            <div className="prose" dangerouslySetInnerHTML={{ __html: post?.content ?? "" }} />
            <Link to="/#blog" className="btn btn--ghost article__back">
              ← Back to Blog
            </Link>
          </div>
        </article>
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export const Head = ({ data }: HeadProps<Queries.ArticlePageQuery>) => (
  <Seo
    title={data.microcmsBlog?.title ?? undefined}
    image={data.microcmsBlog?.eyecatch?.url ?? undefined}
    article
  />
);

export const query = graphql`
  query ArticlePage($id: String!) {
    microcmsBlog(id: { eq: $id }) {
      title
      content
      publishedAt
      category {
        name
      }
      eyecatch {
        url
        width
        height
      }
    }
  }
`;
