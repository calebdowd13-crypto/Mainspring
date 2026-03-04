import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

async function fetchListings() {
  const response = await fetch(
    'https://www.reddit.com/r/Watchexchange/new.json?limit=25',
    { headers: { 'User-Agent': 'Mainspring/1.0' } }
  )
  const data = await response.json()
  const posts = data.data.children

  for (const post of posts) {
    const p = post.data
    if (!p.title.includes('[WTS]') && !p.title.includes('[WTS/WTT]')) continue
    if (p.link_flair_css_class === 'sold') continue

    // Fetch comments to get price
    let price = null
    try {
      const commentsRes = await fetch(
        `https://www.reddit.com/r/Watchexchange/comments/${p.id}.json?limit=5`,
        { headers: { 'User-Agent': 'Mainspring/1.0' } }
      )
      const commentsData = await commentsRes.json()
      const comments = commentsData[1]?.data?.children || []
      for (const comment of comments) {
        const body = comment.data?.body || ''
        const match = body.match(/\$[\d,]+/)
        if (match) {
          price = Number(match[0].replace(/[$,]/g, ''))
          break
        }
      }
    } catch (e) {
      console.log('Error fetching comments:', e)
    }

    const listing = {
      id: p.id,
      title: p.title.replace('[WTS]', '').replace('[WTS/WTT]', '').trim(),
      price,
      seller: p.author,
      url: `https://reddit.com${p.permalink}`,
      source: 'reddit',
      sold: false,
      posted_at: new Date(p.created_utc * 1000).toISOString(),
    }

    await supabase.from('listings').upsert(listing, { onConflict: 'id' })
  }

  console.log(`Processed ${posts.length} posts`)
}

Deno.serve(async () => {
  await fetchListings()
  return new Response('OK', { status: 200 })
})
