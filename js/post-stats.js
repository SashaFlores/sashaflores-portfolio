(() => {
  const API_BASE = '/.netlify/functions';
  const SLUG_MAP = window.POST_SLUGS || {};

  const resolveSlugFromPath = (path) => {
    if (!path) return '';
    if (SLUG_MAP[path]) return SLUG_MAP[path];
    const parts = path.split('/').filter(Boolean);
    const file = parts[parts.length - 1] || '';
    return file.replace(/\.html$/, '');
  };

  const getCount = async (endpoint, slug) => {
    try {
      const res = await fetch(`${API_BASE}/${endpoint}?post=${encodeURIComponent(slug)}`, {
        headers: { 'Cache-Control': 'no-store' }
      });
      if (!res.ok) throw new Error(`Failed to fetch ${endpoint} for ${slug}`);
      const data = await res.json();
      return Number(data?.total) || 0;
    } catch (error) {
      console.error(error);
      return 0;
    }
  };

  const postCount = async (endpoint, slug) => {
    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post: slug })
      });
      if (!res.ok) throw new Error(`Failed to post ${endpoint} for ${slug}`);
      const data = await res.json();
      return Number(data?.total) || 0;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const updateContainerCounts = (container, likes, views) => {
    const likeNumberEl = container.querySelector('[data-role="like"] .stat-number');
    const viewNumberEl = container.querySelector('.stat-view .stat-number');
    if (likeNumberEl) likeNumberEl.textContent = Number(likes || 0).toLocaleString();
    if (viewNumberEl) viewNumberEl.textContent = Number(views || 0).toLocaleString();
  };

  const initBlogCards = async () => {
    const containers = document.querySelectorAll('.blog-stats');
    const tasks = Array.from(containers).map(async (container) => {
      let slug = container.dataset.postId;
      if (!slug) {
        const anchor = container.closest('a');
        if (anchor) {
          const path = new URL(anchor.href, window.location.origin).pathname;
          slug = resolveSlugFromPath(path);
          if (slug) {
            container.dataset.postId = slug;
          }
        }
      }
      if (!slug) return;
      if (!slug) return;
      const [likes, views] = await Promise.all([
        getCount('likes', slug),
        getCount('views', slug)
      ]);
      let currentViews = views;
      updateContainerCounts(container, likes, currentViews);

      const likeButton = container.querySelector('[data-role="like"]');
      if (likeButton && !likeButton.dataset.handlerAttached) {
        likeButton.dataset.handlerAttached = 'true';
        likeButton.addEventListener('click', async (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (likeButton.dataset.clicked === 'true') return;
          const result = await postCount('likes', slug);
          if (result !== null) {
            updateContainerCounts(container, result, currentViews);
            likeButton.dataset.clicked = 'true';
            likeButton.classList.add('stat-like--active');
          }
        });
      }
    });

    await Promise.allSettled(tasks);
  };

  const initArticleStats = async () => {
    const articleStats = document.querySelector('.article-stats');
    if (!articleStats) return;

    let slug = articleStats.dataset.postId;
    if (!slug) {
      slug = resolveSlugFromPath(window.location.pathname);
      if (slug) {
        articleStats.dataset.postId = slug;
      }
    }
    if (!slug) return;

    const [likes, viewsAfterIncrement] = await Promise.all([
      getCount('likes', slug),
      postCount('views', slug)
    ]);

    let resolvedViews = viewsAfterIncrement !== null ? viewsAfterIncrement : await getCount('views', slug);
    updateContainerCounts(articleStats, likes, resolvedViews);

    const likeButton = articleStats.querySelector('[data-role="like"]');
    if (likeButton && !likeButton.dataset.handlerAttached) {
      likeButton.dataset.handlerAttached = 'true';
      likeButton.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (likeButton.dataset.clicked === 'true') return;
        const result = await postCount('likes', slug);
        if (result !== null) {
          updateContainerCounts(articleStats, result, resolvedViews);
          likeButton.dataset.clicked = 'true';
          likeButton.classList.add('stat-like--active');
        }
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initBlogCards();
      initArticleStats();
    });
  } else {
    initBlogCards();
    initArticleStats();
  }
})();
