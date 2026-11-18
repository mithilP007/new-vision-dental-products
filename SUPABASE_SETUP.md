# New Vision Dental Products — Supabase Production Setup Guide

This document outlines the Supabase configuration for **New Vision Dental Products**, covering Authentication, Storage Buckets, Row Level Security (RLS) policies, and bulk image management.

---

## 1. Project Credentials Configured

The website is connected to your Supabase project:
- **Project URL:** `https://tcrkavwcbklvnbzorjnz.supabase.co`
- **Publishable Key:** `sb_publishable_l1xUodZaI3mrpio4ZFEujA_jF0IVtjB`

These are saved in `.env.local` and documented in `.env.example`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://tcrkavwcbklvnbzorjnz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_l1xUodZaI3mrpio4ZFEujA_jF0IVtjB
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 2. Supabase Storage Bucket Setup (`product-images`)

Product images must be stored in a dedicated Supabase Storage bucket named `product-images`.

### Option A: Via Supabase SQL Editor (Recommended — Takes 10 Seconds)
1. Open your Supabase project dashboard: [https://supabase.com/dashboard/project/tcrkavwcbklvnbzorjnz/sql](https://supabase.com/dashboard/project/tcrkavwcbklvnbzorjnz/sql)
2. Paste and run this SQL script:

```sql
-- 1. Create the product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10MB per image file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];

-- 2. Allow PUBLIC viewing of all product images (CDN Delivery)
CREATE POLICY "Public Access for Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 3. Allow Authenticated users to upload product images
CREATE POLICY "Authenticated Users Can Upload Product Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- 4. Allow Authenticated users to update product images
CREATE POLICY "Authenticated Users Can Update Product Images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- 5. Allow Authenticated users to delete product images
CREATE POLICY "Authenticated Users Can Delete Product Images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

### Option B: Via Supabase Dashboard UI
1. Navigate to **Storage** -> **Buckets** in your Supabase Dashboard.
2. Click **New bucket**.
3. Name: `product-images`.
4. Enable **Public bucket** (so clinicians can view dental equipment photographs without signed URLs).
5. Click **Save bucket**.

---

## 3. Row Level Security (RLS) & Access Rules

The security rules enforce:
- **Public Browsing:** Unauthenticated doctors and visitors can view all product images via the Supabase global CDN.
- **Admin Upload/Modification:** Only authenticated accounts can upload, overwrite, or delete product images.
- **No Private Keys in Client:** `SUPABASE_SERVICE_ROLE_KEY` is never exposed in the browser bundle.

---

## 4. Bulk Image Upload Features (Up to 10,000 Images)

The Admin Product Management interface (`/admin`) includes a **Bulk Image Uploader**:
- **Batching & Controlled Concurrency:** Uploads in parallel chunks (4 concurrent requests) to prevent browser network starvation and API rate limiting.
- **Client-Side Image Compression:** Automatically resizes high-resolution clinical photographs down to max 2000px and converts to WebP (0.85 quality), reducing upload time and bandwidth by 50–80%.
- **Resilience & Retry:** Automatically retries up to 3 times on transient network interruptions with exponential backoff.
- **Live Progress:** Shows exact percentage, file counters (`Completed X / Total Y`), and a list of failed files with single-click retry.
- **Storage Reference:** Images are stored under `product-images/catalogue/...`. Only the clean public URL path is stored in the database — **NEVER as Base64 strings**.

---

## 5. Storage Quotas & Performance Considerations

| Metric | Supabase Free Tier | Supabase Pro Tier | New Vision Implementation |
| :--- | :--- | :--- | :--- |
| **Storage Capacity** | 1 GB | 100 GB (expandable) | With our WebP compression (~80KB/image), 1 GB accommodates **~12,000 product images**. |
| **Max File Size** | 50 MB | 50 GB | Configured to 10 MB per image. |
| **Bandwidth (Egress)**| 5 GB / month | 250 GB / month | WebP images minimize bandwidth egress significantly. |

> **Recommendation for 10,000+ images:**
> When uploading large catalogs (> 5,000 files in a single session), use the batch upload tool in batches of 500–1,000 images to maintain browser responsiveness and monitor Supabase storage quotas.

---

## 6. Authentication Settings in Supabase Dashboard

1. Go to **Authentication** -> **Providers** -> **Email**:
   - Ensure **Enable Email provider** is turned **ON**.
   - If you want clinicians to be able to sign in immediately without waiting for a confirmation email during testing, turn **Confirm email** **OFF** (or leave ON for production email verification).
2. Go to **Authentication** -> **URL Configuration**:
   - **Site URL:** `http://localhost:3000` (or your live production domain).
   - **Redirect URLs:** Add `http://localhost:3000/**`.
