const PAGES_URL = 'https://flatfree.pages.dev';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/FlatFree') || url.pathname.startsWith('/flatfree')) {
      const target = new URL(PAGES_URL);
      target.pathname = url.pathname.replace(/^\/[Ff]lat[Ff]ree/, '') || '/';
      target.search = url.search;
      return fetch(new Request(target, request));
    }

    const target = new URL(PAGES_URL);
    target.pathname = url.pathname;
    target.search = url.search;
    return fetch(new Request(target, request));
  }
};
