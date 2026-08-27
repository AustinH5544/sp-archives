# Image Storage Research — SP-ARCHIVES (June 2026)

## Decision
**Cloudflare R2** (storage) + **ImageKit** (transformation proxy) — two free tiers stacked.

- R2 holds the original high-res photos (10 GB free, $0 egress always)
- ImageKit sits in front of R2 and handles on-the-fly resizing, WebP/AVIF conversion, and watermarking (20 GB bandwidth/month free, unlimited transformations free)
- Neither service charges egress between them (Cloudflare never charges egress)
- Effective free storage: **10 GB** (~200–500 photos at typical JPEG sizes)
- ImageKit free bandwidth note: 20 GB/month = ~1,000 full-res photo loads or ~20,000 thumbnail loads per month

---

## Full Comparison

### Cloudflare R2
- **Free:** 10 GB storage, 1M writes/month, 10M reads/month, $0 egress always
- **Paid:** $0.015/GB/month storage — 50 GB costs $0.75/month
- **Transformations:** None built-in; add Cloudflare Images ($0.50/1K transforms, first 5K free)
- **Next.js:** Needs a custom loader or Cloudflare Images `/cdn-cgi/image/` prefix
- **Best for:** Storage backbone; native to Cloudflare ecosystem

### ImageKit
- **Free:** 3 GB storage, 20 GB bandwidth/month, unlimited transformations, WebP/AVIF, watermarking
- **Paid Lite:** $9/month — 10 GB storage, 40 GB bandwidth
- **Proxy mode:** Can point at any URL/R2 bucket as origin — doesn't use its own storage quota
- **Next.js:** Official SDK (`@imagekit/next`) with `<IKImage>` component
- **Best for:** Transformation layer on top of R2; watermarking; official Next.js integration

### Cloudinary
- **Free:** ~25 credits/month (roughly 5 GB storage + 10 GB bandwidth + 10K transformations)
- **Paid:** $99/month (big jump — no mid-tier)
- **Features:** Best-in-class transformations, watermarking, signed URLs, official Next.js SDK (`@cloudinary/next`)
- **Gotcha:** Account suspended (not just throttled) when free credits are exhausted
- **Best for:** If budget allows and advanced transformations/watermarking are critical

### Backblaze B2 + Cloudflare (Bandwidth Alliance)
- **Free:** 10 GB storage, free egress via Cloudflare (Bandwidth Alliance)
- **Paid:** $6.95/TB/month storage — cheaper than R2 at large scale
- **Setup:** Requires routing B2 through a Cloudflare zone as a CDN proxy to get free egress
- **Best for:** Multi-TB scale where storage cost matters more than integration simplicity; more complex than R2

### Bunny.net
- **Free:** None
- **Paid:** $0.01/GB/month storage + $0.01/GB CDN delivery (NA/EU)
- **Realistic cost:** ~$1.50/month for a small portfolio
- **Image optimizer add-on:** $9.50/month (WebP, resize — no AVIF)
- **Best for:** Cheapest paid CDN option with no free tier requirement

### Imgix
- **Free:** 30-day trial only
- **Paid:** $25/month minimum (100 credits)
- **Features:** 200+ transformation parameters, excellent quality
- **Best for:** Media companies with budget; no justification over ImageKit for a portfolio

### AWS S3 + CloudFront
- **Free:** 12-month trial only (5 GB S3, 100 GB CloudFront)
- **Realistic cost:** ~$1–16/month depending on traffic
- **Complexity:** IAM, bucket policies, CORS, CloudFront distributions — overkill for solo portfolio
- **Best for:** Teams already on AWS

### Supabase Storage
- **Free:** 1 GB storage, 5 GB bandwidth — inadequate for a photo portfolio
- **Paid:** $25/month base (Pro plan required for image transformations)
- **Best for:** Projects already using Supabase for a database

### Vercel Blob
- **Free:** 1 GB storage, 10 GB bandwidth
- **Paid:** $0.023/GB storage, $0.05/GB transfer
- **Gotcha:** Designed for Vercel deployments — off-label use from Cloudflare Pages
- **Best for:** Vercel-hosted projects only

### GitHub + jsDelivr
- **Free:** Technically free; practical storage ~1 GB before Git performance degrades
- **Gotcha:** jsDelivr TOS explicitly prohibits using it as an image hosting service; risk of cutoff
- **Best for:** A handful of small images only; not viable for a real portfolio

---

## Cost Projections at Scale

| Scenario | R2 + ImageKit | Cloudinary | Bunny.net |
|----------|--------------|------------|-----------|
| Launch (< 10 GB, < 20 GB/mo traffic) | **$0/month** | $0/month | ~$1.50/month |
| Growing (50 GB storage, 100 GB/mo traffic) | ~$0.75/month + $9 ImageKit = **~$10/month** | $99/month | ~$1.50/month + $9.50 optimizer = ~$11/month |
| Large (200 GB storage, 500 GB/mo traffic) | ~$2.85/month + $9 ImageKit = **~$12/month** | $249/month | ~$7/month |

---

## Sources
- Cloudflare R2 Pricing: https://developers.cloudflare.com/r2/pricing/
- Cloudflare Images Pricing: https://developers.cloudflare.com/images/pricing/
- ImageKit Plans: https://imagekit.io/plans/
- Cloudinary Pricing: https://cloudinary.com/pricing
- Backblaze B2 + Cloudflare Alliance: https://www.backblaze.com/blog/backblaze-and-cloudflare-partner-to-provide-free-data-transfer/
- Bunny.net Pricing: https://bunny.net/pricing/
- Imgix Pricing: https://www.imgix.com/pricing
- Research conducted June 2026
