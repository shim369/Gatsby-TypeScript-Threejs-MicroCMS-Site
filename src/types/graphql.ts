export namespace Queries {
  export type IndexPageQuery = {
    allMicrocmsBlog: {
      edges: Array<{
        node: {
          blogId: string;
          title: string;
          publishedAt: string;
          category: { name: string } | null;
          eyecatch: { url: string } | null;
        };
      }>;
    };
  };
  export type ArticlePageQuery = {
    microcmsBlog: {
      title: string;
      content: string;
      publishedAt: string;
      eyecatch: { url: string } | null;
      category: { name: string } | null;
    } | null;
  };
}
