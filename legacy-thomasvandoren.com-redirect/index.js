
/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
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
          headers: {
            'X-Debug-err': e,
            'X-Debug-stack': e.stack,
          } 
        }),
      )
    }
    event.respondWith(new Response('Internal Error', { status: 500 }))
  }
})

async function handleEvent(event) {
  let url = new URL(event.request.url)

  if (url.hostname !== 'tvd.dev') {
    let newUrl = new URL(url);
    newUrl.hostname = 'tvd.dev';
    return Response.redirect(newUrl, 301);
  } else {
    throw new Error(`${event.request.url}`);
  }
}
