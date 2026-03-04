import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

Deno.serve(async (req) => {
  try {
    const body = await req.json()
    const items = body.items || []

    console.log(`Received ${items.length} items from Apify`)

    for (const item of items) {
      if (!item.title) continue
      if (!item.title.includes('[WTS]') && !item.title.includes('[WTS/WTT]')) continue

      // Try to extract price from title
      let price = null
      const match = item.title.match(/\$[\d,]+/)
      if (match) {
        price = Number(match[0].replace(/[$,]/g, ''))
      }

      const id = item.permalink.split('/comments/')[1]?.split('/')[0]
      if (!id) continue

      const listing = {
        id,
        title: item.title.replace('[WTS]', '').replace('[WTS/WTT]', '').trim(),
        price,
        seller: item.author,
        url: item.permalink,
        source: 'reddit',
        sold: false,
        posted_at: item.created_utc_iso,
      }

      await supabase.from('listings').upsert(listing, { onConflict: 'id' })
    }

    return new Response('OK', { status: 200 })
  } catch (e) {
    console.log('Error:', e.message)
    return new Response('Error: ' + e.message, { status: 500 })
  }
})
