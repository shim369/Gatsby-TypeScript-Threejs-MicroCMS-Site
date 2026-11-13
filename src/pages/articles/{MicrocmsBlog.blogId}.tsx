import * as React from "react";
import { useRef } from "react";
import { graphql, Link, HeadFC, PageProps } from "gatsby";
import { Queries } from "../../types/graphql";
import HeaderInner from "../../components/HeaderInner";
import Contact from "../../components/Contact";
import Footer from "../../components/Footer";
import { useScrollAnimations } from "../../hooks/useScrollAnimations";
import { formatDate } from "../../utils/formatDate";
import "../../styles/style.scss";

const ArticlePage = ({ data }: PageProps<Queries.ArticlePageQuery>) => {
  const root = useRef<HTMLDivElement>(null);
  useScrollAnimations(root);
  const post = data.microcmsBlog;

  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="wrapper" ref={root}>
        <header className="blog-header">
          <HeaderInner />
          <div className="main-read">
            <h1>
              <span>Tech Blog</span>
            </h1>
          </div>
        </header>
        <main>
          <section className="article-section">
            <div className="container">
              <article className="blog-detail">
                {post?.category?.name && (
                  <span className="category-chip">{post.category.name}</span>
                )}
                <h1 data-reveal>{post?.title}</h1>
                <div className="date" data-reveal>
                  <i className="material-icons">schedule</i>
                  {formatDate(post?.publishedAt)}
                </div>
                {post?.eyecatch?.url && (
                  <div className="eyecatch" data-reveal>
                    <img src={post.eyecatch.url} alt="" />
                  </div>
                )}
                <div
                  className="blog-detail-area"
                  dangerouslySetInnerHTML={{ __html: post?.content ?? "" }}
                />
                <Link to="/#a03" className="back-link">
                  ← Back to Blog
                </Link>
              </article>
            </div>
          </section>
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ArticlePage;

export const Head: HeadFC<Queries.ArticlePageQuery> = ({ data }) => (
  <title>{data.microcmsBlog?.title ?? "GATSBY BASE"} | GATSBY BASE</title>
);

export const query = graphql`
  query ArticlePage($id: String) {
    microcmsBlog(id: { eq: $id }) {
      title
      content
      publishedAt
      eyecatch {
        url
      }
      category {
        name
      }
    }
  }
`;
