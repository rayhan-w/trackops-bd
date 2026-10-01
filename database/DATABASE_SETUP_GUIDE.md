# TrackOps BD - Database Setup & Client Handover Guide
**Platform:** Lawful Link Management & Intelligence Hub  
**Database Engine:** PostgreSQL (Version 12+)  

---

## 🚀 দুইভাবে ডেটাবেস সেটআপ করা যায়:

### পদ্ধতি ১: ক্লাউড ডেটাবেস (সবচেয়ে সহজ ও রিকমেন্ডেড - ২ মিনিটে হয়ে যায়)
কোনো সফটওয়্যার ইনস্টল করা ছাড়াই **Neon.tech** অথবা **Supabase**-এ সম্পূর্ণ ফ্রি PostgreSQL ডেটাবেস তৈরি করে লিংক বসিয়ে দেওয়া যায়:

1. [Neon.tech](https://neon.tech/) অথবা [Supabase.com](https://supabase.com/)-এ গিয়ে একটি ফ্রি অ্যাকাউন্ট তৈরি করুন।
2. **Create Project**-এ ক্লিক করে প্রোজেক্টের নাম দিন (যেমন: `trackops-bd`)।
3. প্রজেক্ট তৈরি হলে সাথে সাথে একটি **Connection String / Database URL** পাবেন। দেখতে এমন হবে:
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_xxxx@ep-cool-fog-12345.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. এই লিংকটি ক্লায়েন্টের সার্ভার বা Vercel / Render-এর `.env` ফাইলে বসিয়ে দিলেই কাজ শেষ:
   ```env
   DATABASE_URL=আপনার_ক্লাউড_পোস্টগ্রেস_লিংক
   ```
> **ম্যাজিক সুবিধা:** প্রজেক্ট চালু হওয়ামাত্রই অ্যাপ স্বয়ংক্রিয়ভাবে সমস্ত টেবিল তৈরি করে এবং ডিফল্ট সুপার অ্যাডমিন অ্যাকাউন্ট সিড করে নেয়। আলাদা করে কোনো কোড বা কুয়েরি রান করতে হবে না!

---

### পদ্ধতি ২: লোকাল বা নিজস্ব VPS সার্ভারে PostgreSQL সেটআপ (pgAdmin / cPanel)

যদি ক্লায়েন্ট নিজের লোকাল পিসিতে বা নিজস্ব লিনাক্স VPS সার্ভারে ডেটাবেস রাখতে চায়:

#### ধাপ ১: PostgreSQL ইনস্টল ও ডেটাবেস তৈরি
1. PostgreSQL ইনস্টল করুন এবং pgAdmin অথবা Terminal ওপেন করুন।
2. একটি নতুন ডেটাবেস তৈরি করুন:
   ```sql
   CREATE DATABASE trackops_bd;
   ```

#### ধাপ ২: স্কিমা ও সিড ডেটা ইমপোর্ট (SQL রান)
প্রোজেক্টের `database/trackops_bd.sql` ফাইলটি ওপেন করুন অথবা pgAdmin Query Tool-এ পেস্ট করে **Execute (F5)** চাপুন।

অথবা টার্মিনাল থেকে এক লাইনে ইমপোর্ট করুন:
```bash
psql -U postgres -d trackops_bd -f database/trackops_bd.sql
```

#### ধাপ ৩: `.env` ফাইলে কানেকশন স্ট্রিং দিন
`server/.env` ফাইলে ডেটাবেসের তথ্য সেট করুন:
```env
DATABASE_URL=postgresql://postgres:আপনার_পাসওয়ার্ড@localhost:5432/trackops_bd
PORT=5000
JWT_SECRET=trackops_super_secret_jwt_key_2026_bd_secure_hash
JWT_EXPIRES_IN=30d
NODE_ENV=production
CLIENT_ORIGIN=https://আপনার-ডোমেইন.com
```

---

## 🔑 ডিফল্ট অ্যাডমিন ক্রেডেনশিয়াল (ইমপোর্টের পর সাথে সাথে লগইন করার জন্য)

| Role | Email | Password | Allowed Devices |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@trackops.local` | `DemoSuperAdmin@2026` | আনলিমিটেড (Bypass) |
| **Admin** | `admin@trackops.local` | `DemoAdmin@2026` | ৩টি ডিভাইস |
| **Case Officer** | `officer@trackops.local` | `DemoOfficer@2026` | ১টি ডিভাইস |

---

## 📊 ডেটাবেসে কোন কোন টেবিল রয়েছে:
1. `users` — অফিসার, অ্যাডমিন ও সুপার অ্যাডমিনের প্রোফাইল, র‍্যাংক, পোস্টিং, এক্সপায়ারি ও লগইন সেশন।
2. `links` — কেস রেফারেন্স যুক্ত জেনারেটেড শর্ট লিংকসমূহ।
3. `link_visits` — ভিজিটরের আইপি, ডিভাইস ব্র্যান্ড, মডেল, ওএস, ব্রাউজার ও কনসেন্ট রেকর্ড।
4. `consent_records` — ক্যামেরা, লোকেশন ও ব্রাউজার তথ্যের ভলান্টারি কনসেন্ট লগ।
5. `notifications` — সিস্টেম নোটিফিকেশন ও অ্যালার্ট।
6. `audit_logs` — অ্যাডমিনিস্ট্রেটিভ অডিট ট্রেইল ও সিকিউরিটি লগ।
7. `telecom_integrations` — বিটিআরসি / টেলিকম গেটওয়ে ইন্টারফেস।
