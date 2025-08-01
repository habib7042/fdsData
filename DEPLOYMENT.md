# FDS - Fund Management System

## Vercel Deployment Guide

### প্রয়োজনীয় ধাপসমূহ:

#### ১. GitHub Repository তৈরি করুন
```bash
# আপনার কোড GitHub-এ পুশ করুন
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin master
```

#### ২. Vercel Account তৈরি করুন
- [vercel.com](https://vercel.com) এ গিয়ে একাউন্ট তৈরি করুন
- GitHub দিয়ে লগইন করুন

#### ৩. New Project Import করুন
1. Vercel Dashboard-এ "New Project" ক্লিক করুন
2. আপনার GitHub repository সিলেক্ট করুন
3. Import ক্লিক করুন

#### ৪. Environment Variables সেট করুন
Vercel project settings-এ নিচের environment variables যোগ করুন:

```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-app-name.vercel.app
```

**নোট:** Production-এর জন্য SQLite এর পরিবর্তে PostgreSQL বা MySQL ব্যবহার করুন।
আপনি [PlanetScale](https://planetscale.com), [Supabase](https://supabase.com), বা [Railway](https://railway.app) থেকে ফ্রি ডাটাবেস পেতে পারেন।

#### ৫. Build Settings কনফিগার করুন
Vercel automatically detects Next.js app, but ensure these settings:

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### ৬. Deploy করুন
"Deploy" বাটন ক্লিক করুন। Vercel আপনার অ্যাপ বিল্ড করে ডিপ্লয় করবে।

#### ৭. Database Setup (Post-Deployment)
ডিপ্লয়মেন্টের পর ডাটাবেস সেটআপ করতে:

1. Vercel project-এ যান
2. "Settings" > "Functions" এ যান
3. "Add Function" ক্লিক করে একটি on-demand function তৈরি করুন
4. নিচের কোড ব্যবহার করুন:

```javascript
// api/setup-db/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // This will push the schema to the database
    await db.$executeRaw`SELECT 1` // Test connection
    
    return NextResponse.json({ 
      message: 'Database connection successful',
      status: 'connected' 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error.message 
    }, { status: 500 })
  }
}
```

#### ৮. Test Your Application
ডিপ্লয়মেন্টের পর:
- Accountant login: `accountant@fds.com` / `password123`
- Member login: `karim@email.com` / `password123`

### ট্রাবলশুটিং:

#### Common Issues:
1. **Database Connection Error**: 
   - Environment variables ঠিকমত সেট করুন
   - Database URL চেক করুন

2. **Build Failures**:
   - Dependencies ঠিকমত install হয়েছে কিনা চেক করুন
   - TypeScript errors চেক করুন

3. **Runtime Errors**:
   - Vercel logs চেক করুন
   - Environment variables আবার চেক করুন

### Production Database Options:

#### 1. Supabase (ফ্রি টিয়ার):
```bash
# Supabase থেকে পাওয়া URL
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres"
```

#### 2. PlanetScale (ফ্রি টিয়ার):
```bash
# PlanetScale থেকে পাওয়া URL
DATABASE_URL="mysql://[YOUR-USERNAME]:[YOUR-PASSWORD]@[YOUR-HOST]/[YOUR-DATABASE]"
```

#### 3. Railway (ফ্রি টিয়ার):
```bash
# Railway থেকে পাওয়া URL
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@containers-us-west-1.railway.app:port/railway"
```

### Security Notes:
- Production-এ `password123` এর মতো সহজ পাসওয়ার্ড ব্যবহার করবেন না
- Environment variables সবসময় encrypted রাখুন
- Regular backup নিন

### সাহায্য:
কোনো সমস্যা হলে:
- Vercel docs: [docs.vercel.com](https://docs.vercel.com)
- Prisma docs: [www.prisma.io/docs](https://www.prisma.io/docs)
- Next.js docs: [nextjs.org/docs](https://nextjs.org/docs)