(() => {
  const API_BASE = (window.POST_STATS_API_BASE || '').replace(/\/$/, '');
  const API_ENDPOINT = `${API_BASE}/api/counter`;
  const SLUG_MAP = window.POST_SLUGS || {};

  const resolveSlugFromPath = (path) => {
    if (!path) return '';
    if (SLUG_MAP[path]) return SLUG_MAP[path];
    const parts = path.split('/').filter(Boolean);
    const file = parts[parts.length - 1] || '';
    return file.replace(/\.html$/, '');
  };

  const safeNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const fetchCounts = async (slug) => {
    try {
      const params = new URLSearchParams({ slug });
      const res = await fetch(`${API_ENDPOINT}?${params.toString()}`, {
        headers: { 'Cache-Control': 'no-store' }
      });
      if (!res.ok) throw new Error(`Failed to fetch counts for ${slug}`);
      const data = await res.json();
      return {
        likes: safeNumber(data?.likes),
        views: safeNumber(data?.views)
      };
    } catch (error) {
      console.error(error);
      return { likes: 0, views: 0 };
    }
  };

  const mutateCount = async (slug, metric) => {
    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, metric, action: 'up' })
      });
      if (!res.ok) throw new Error(`Failed to update ${metric} for ${slug}`);
      const data = await res.json();
      return {
        likes: safeNumber(data?.likes),
        views: safeNumber(data?.views)
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const updateContainerCounts = (container, counts) => {
    const likeNumberEl = container.querySelector('[data-role="like"] .stat-number');
    const viewNumberEl = container.querySelector('.stat-view .stat-number');
    if (likeNumberEl) likeNumberEl.textContent = counts.likes.toLocaleString();
    if (viewNumberEl) viewNumberEl.textContent = counts.views.toLocaleString();
  };

  const ensureSlugForContainer = (container) => {
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
    return slug;
  };

  const initBlogCards = async () => {
    const containers = document.querySelectorAll('.blog-stats');
    await Promise.allSettled(Array.from(containers, async (container) => {
      const slug = ensureSlugForContainer(container);
      if (!slug) return;

      let counts = await fetchCounts(slug);
      updateContainerCounts(container, counts);

      const likeButton = container.querySelector('[data-role="like"]');
      if (likeButton && !likeButton.dataset.handlerAttached) {
        likeButton.dataset.handlerAttached = 'true';
        likeButton.addEventListener('click', async (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (likeButton.dataset.clicked === 'true') return;

          const result = await mutateCount(slug, 'likes');
          if (result) {
            counts = result;
            updateContainerCounts(container, counts);
            likeButton.dataset.clicked = 'true';
            likeButton.classList.add('stat-like--active');
          }
        });
      }
    }));
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

    let counts = await mutateCount(slug, 'views');
    if (!counts) {
      counts = await fetchCounts(slug);
    }
    updateContainerCounts(articleStats, counts);

    const likeButton = articleStats.querySelector('[data-role="like"]');
    if (likeButton && !likeButton.dataset.handlerAttached) {
      likeButton.dataset.handlerAttached = 'true';
      likeButton.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (likeButton.dataset.clicked === 'true') return;

        const result = await mutateCount(slug, 'likes');
        if (result) {
          counts = result;
          updateContainerCounts(articleStats, counts);
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
