import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

// x402 discoverability audit — server-side probe so browser CORS never blocks it.
// Replays the conformance recipe from Echolonius/the-penniless-agent.

interface Check { label: string; ok: boolean; detail: string }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { url } = await req.json()
    const base = String(url || '').trim().replace(/\/$/, '')
    if (!base || !/^https?:\/\//.test(base)) {
      return new Response(JSON.stringify({ error: 'Enter a valid http(s) service URL' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
      })
    }

    const checks: Check[] = []
    const get = async (u: string) => {
      const ctl = new AbortController()
      const t = setTimeout(() => ctl.abort(), 10000)
      try { return await fetch(u, { signal: ctl.signal, redirect: 'follow' }) }
      finally { clearTimeout(t) }
    }

    try {
      const res = await get(base)
      const text = await res.text()
      let body: any = null
      try { body = JSON.parse(text) } catch {}
      checks.push({
        label: 'Bare probe answers 402 (never 400)',
        ok: res.status === 402,
        detail: `HTTP ${res.status}`,
      })
      const payHeader = res.headers.get('payment-required')
      checks.push({
        label: 'PAYMENT-REQUIRED header present',
        ok: !!payHeader,
        detail: payHeader ? 'present' : 'missing',
      })
      checks.push({
        label: 'x402 document in the 402 body',
        ok: !!(body && (body.accepts || body.x402Version)),
        detail: body ? (Object.keys(body).slice(0, 6).join(', ') || 'empty') : 'not JSON',
      })
      const ext = body?.accepts?.[0]?.extensions ?? body?.extensions
      checks.push({
        label: 'bazaar input/output schema in extensions',
        ok: !!ext?.bazaar?.schema?.properties,
        detail: ext?.bazaar ? 'declared' : 'missing',
      })
      checks.push({
        label: 'sign-in-with-x challenge (SIWX)',
        ok: !!ext?.['sign-in-with-x'],
        detail: ext?.['sign-in-with-x'] ? 'challenge offered' : 'none',
      })
    } catch (e: any) {
      checks.push({ label: 'Service reachable', ok: false, detail: String(e?.message || e) })
    }

    try {
      const res = await get(`${base}/openapi.json`)
      const spec = res.ok ? await res.json() : null
      checks.push({ label: '/openapi.json served', ok: !!spec, detail: res.ok ? (spec?.info?.title || 'ok') : `HTTP ${res.status}` })
      const pay = spec?.info?.['x-payment-info'] ?? spec?.['x-payment-info']
      checks.push({
        label: 'x-payment-info declared (flat shape)',
        ok: !!pay?.protocols,
        detail: pay ? `${pay.pricingMode ?? '?'} ${pay.price ?? '?'} ${pay.currency ?? ''}`.trim() : 'missing',
      })
      checks.push({
        label: 'info.contact + info.x-guidance',
        ok: !!(spec?.info?.contact && spec?.info?.['x-guidance']),
        detail: spec?.info?.contact ? 'contact set' : 'missing',
      })
    } catch (e: any) {
      checks.push({ label: '/openapi.json served', ok: false, detail: String(e?.message || e) })
    }

    try {
      const res = await get(`${base}/.well-known/x402`)
      checks.push({ label: '/.well-known/x402 fallback', ok: res.ok, detail: `HTTP ${res.status}` })
    } catch {
      checks.push({ label: '/.well-known/x402 fallback', ok: false, detail: 'unreachable' })
    }

    return new Response(JSON.stringify({ checks, probed: base }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    })
  }
})
