/**
 * Ember Lane — Instagram feed worker
 *
 * KV binding  : INSTAGRAM_KV  (stores token + expiry)
 * Secrets     : IG_APP_ID, IG_APP_SECRET  (set via `wrangler secret put`)
 *
 * Initial seed: after deploying, run once:
 *   wrangler kv:key put --binding INSTAGRAM_KV token_data '{"token":"LONG_LIVED_TOKEN","expires_at":UNIX_MS}'
 */

const ALLOWED_ORIGINS = [
  'https://shopemberlane.com',
  'https://www.shopemberlane.com',
]

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || ''
    const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    // ── Cache check ──────────────────────────────────────────────────────────
    const cache = caches.default
    const cacheKey = new Request('https://internal/ig-feed-v1', { method: 'GET' })
    const cached = await cache.match(cacheKey)
    if (cached) {
      const r = new Response(cached.body, cached)
      r.headers.set('Access-Control-Allow-Origin', allowOrigin)
      r.headers.set('X-Cache', 'HIT')
      return r
    }

    // ── Token management ─────────────────────────────────────────────────────
    let tokenData = await env.INSTAGRAM_KV.get('token_data', 'json')
    let { token, expires_at } = tokenData || {}

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token not seeded. Run the wrangler seed command.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Refresh when < 10 days remaining
    const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000
    if (!expires_at || Date.now() > expires_at - TEN_DAYS_MS) {
      try {
        const res = await fetch(
          `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`
        )
        const data = await res.json()
        if (data.access_token) {
          token = data.access_token
          expires_at = Date.now() + data.expires_in * 1000
          ctx.waitUntil(
            env.INSTAGRAM_KV.put('token_data', JSON.stringify({ token, expires_at }))
          )
        }
      } catch (_) {
        // Proceed with existing token if refresh fails
      }
    }

    // ── Fetch media ──────────────────────────────────────────────────────────
    const fields = 'id,media_type,media_url,thumbnail_url,permalink'
    const igRes = await fetch(
      `https://graph.instagram.com/me/media?fields=${fields}&limit=18&access_token=${token}`
    )
    const igData = await igRes.json()

    if (igData.error) {
      return new Response(JSON.stringify({ error: igData.error.message }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const posts = (igData.data || [])
      .filter(p => p.media_type === 'IMAGE' || p.media_type === 'CAROUSEL_ALBUM')
      .slice(0, 6)
      .map(p => ({
        url:  p.media_url,
        link: p.permalink,
      }))

    const body = JSON.stringify({ posts })
    const response = new Response(body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'X-Cache': 'MISS',
      },
    })

    ctx.waitUntil(cache.put(cacheKey, response.clone()))
    return response
  },
}
