import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default error.html page.
 */
const DEBUG = false

addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event))
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      )
    }
    event.respondWith(new Response('Internal Error', { status: 500 }))
  }
})

async function handleEvent(event) {
  const url = new URL(event.request.url)

  if (url.hostname !== 'tvd.dev') {
    let newUrl = new URL(url);
    newUrl.hostname = 'tvd.dev';
    return Response.redirect(newUrl, 301);
  }

  let options = {}

  try {
    if (DEBUG) {
      // customize caching
      options.cacheControl = {
        bypassCache: true,
      }
    }
    return addSecHeaders(await getAssetFromKV(event, options))
  } catch (e) {
    // if an error is thrown try to serve the asset at 404.html
    if (!DEBUG) {
      try {
        let notFoundResponse = await getAssetFromKV(event, {
          mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/error.html`, req),
        })

        return addSecHeaders(new Response(notFoundResponse.body, { ...notFoundResponse, status: 404 }))
      } catch (e) {}
    }

    return addSecHeaders(new Response(e.message || e.toString(), { status: 500 }))
  }
}

function addSecHeaders(resp) {
  resp.headers.set('Content-Security-Policy', `script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js https://gist.github.com/thomasvandoren/ https://static.cloudflareinsights.com 'sha256-DnOkNPnjiNaUwdRbHUnxD3E2v2Tbb4V2nIYg/YvRKdw='; object-src 'none'; frame-ancestors 'none';`);
  resp.headers.set('X-Frame-Options', 'DENY');
  return resp;
}