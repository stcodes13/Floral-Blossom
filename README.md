# Floral Blossom - Complete Full-Stack E-Commerce

Full-featured flower shop with admin panel, email receipts, and global database.

## Features

✅ Product search functionality
✅ Admin panel with password protection (default: admin/admin123)
✅ Product management (add/edit/delete with image upload)
✅ Order history and analytics
✅ Email receipts (HTML format sent to customers)
✅ Responsive design (mobile, tablet, desktop)
✅ Form validation
✅ Cart persistence
✅ Toast notifications

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Database: Supabase (PostgreSQL)
- Storage: Supabase Storage
- Email: Resend API
- Hosting: Vercel
- Cost: 100% FREE

## Quick Setup (10 minutes)

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → Create account
2. Create new project: `floral-blossom`
3. Go to **SQL Editor** → Run this:

```sql
-- Products table
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  notes TEXT,
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE admin_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Anyone can insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete products" ON products FOR DELETE USING (true);
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Anyone can read admin" ON admin_users FOR SELECT USING (true);

-- Insert default admin (username: admin, password: admin123)
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- Sample products
INSERT INTO products (title, price, image_url) VALUES
('The Poetry Haven', 599, 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&h=800'),
('Classic Elegance', 899, 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&h=800'),
('Snow Wildflower', 749, 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=600&h=800');
```

4. Go to **Storage** → Create bucket: `products` (make it PUBLIC)
5. Run storage policies:

```sql
CREATE POLICY "Anyone can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');
CREATE POLICY "Anyone can read" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Anyone can delete" ON storage.objects FOR DELETE USING (bucket_id = 'products');
```

6. Get API keys: **Settings** → **API**
   - Copy **Project URL**
   - Copy **anon public key**

### 2. Resend Setup (Email)

1. Go to [resend.com](https://resend.com) → Sign up (FREE: 100 emails/day)
2. Go to **API Keys** → Create new key
3. Copy the key: `re_xxxxx`

### 3. Update config.js

Open `config.js` and replace:

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 4. Deploy to Vercel

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

On Vercel:
1. Import GitHub repo
2. Add environment variable:
   - Name: `RESEND_API_KEY`
   - Value: Your Resend key (`re_xxxxx`)
3. Deploy

Done! Your site is live.

## URLs

- **Main Site:** `https://your-site.vercel.app`
- **Admin Panel:** `https://your-site.vercel.app/admin.html`

## Admin Access

- Username: `admin`
- Password: `admin123`

### Change Password

1. Generate hash at [bcrypt-generator.com](https://bcrypt-generator.com/) (rounds: 10)
2. Run in Supabase SQL Editor:

```sql
UPDATE admin_users 
SET password_hash = 'NEW_HASH_HERE' 
WHERE username = 'admin';
```

## File Structure

```
floral-blossom/
├── index.html          # Main store
├── admin.html          # Admin panel
├── styles.css          # All styles
├── script.js           # Store functionality
├── admin.js            # Admin functionality
├── config.js           # Supabase config (UPDATE THIS)
├── vercel.json         # Vercel config
├── package.json        # Dependencies
├── api/
│   └── send-receipt.js # Email API endpoint
└── README.md
```

## Features in Detail

### Customer Features
- Product search (real-time)
- Shopping cart with persistence
- Form validation
- Email receipt with order details
- Mobile responsive

### Admin Features
- Dashboard with stats
- Product management (CRUD)
- Image upload to Supabase
- Order history
- Revenue tracking

## Troubleshooting

**Products not loading?**
- Check `config.js` has correct Supabase URL/key
- Check browser console for errors

**Images not uploading?**
- Verify storage bucket is public
- Check storage policies exist

**Emails not sending?**
- Check `RESEND_API_KEY` in Vercel environment variables
- Check Vercel function logs

**Admin login fails?**
- Default: admin / admin123
- Check `admin_users` table exists

## Costs

100% FREE:
- Vercel: Unlimited deploys
- Supabase: 500MB DB + 1GB storage
- Resend: 100 emails/day

## Support

Contact details in footer:
- Phone: 9973729290
- Email: floralblossom@gmail.com
- Address: Lokmanya Nagar, Parbhani, 431401

---

Built with 🌸 for academic excellence
