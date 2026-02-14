# 🌾 AgroBit Forum - Farmers Discussion Platform

A production-ready farmers discussion forum built with vanilla HTML, CSS, JavaScript, and Supabase backend. Farmers can share experiences, ask questions about crops, and get help from the community.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Supabase Setup](#supabase-setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [Database Schema](#database-schema)
- [Security](#security)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- 🔐 **User Authentication** - Secure signup/login with email and password
- 📝 **Create Posts** - Share farming questions and experiences with images
- 💬 **Reply System** - Community members can reply to posts
- 🏆 **Best Answer** - Post owners can mark the best reply
- 🏷️ **Categories** - Organize posts by farming topics
- 🔍 **Category Filter** - Filter posts by category
- 📸 **Image Upload** - Upload crop images to Supabase Storage
- 👤 **User Profiles** - View and edit profile, track activity stats
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop
- 🎨 **Modern UI** - Clean, professional interface with Tailwind-inspired styling
- 🔒 **Row Level Security** - Secure data access with Supabase RLS
- ⬆️ **Upvote System** - Vote on helpful posts
- 🔔 **Notifications** - Get notified when someone replies to your posts
- 💰 **Market Prices** - View and report crop market prices by district

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Hosting**: Any static host (Netlify, Vercel, GitHub Pages, etc.)
- **CDN**: Supabase JS Client v2

## 📁 Project Structure

```
farmercomm/
├── index.html              # Homepage - displays all posts
├── login.html              # Login/Signup page
├── create.html             # Create new post (protected)
├── post.html               # Single post view with replies
├── market.html             # Market prices page
├── profile.html            # User profile page (protected)
├── README.md               # This file
├── css/
│   └── style.css           # All styling (modern, responsive)
└── js/
    ├── supabase-config.js  # Supabase client initialization
    ├── auth.js             # Authentication utilities & notifications
    ├── app.js              # Homepage functionality
    ├── login.js            # Login/Signup logic
    ├── create.js           # Post creation logic
    ├── post.js             # Single post & replies functionality
    ├── market.js           # Market prices functionality
    └── profile.js          # User profile functionality
```

## 📦 Prerequisites

Before you begin, ensure you have:

- A [Supabase](https://supabase.com) account (free tier works fine)
- A web browser
- A local web server (Python's `http.server`, Live Server, etc.)

## 🚀 Installation

### 1. Clone or Download

```bash
git clone https://github.com/yourusername/agrobit-forum.git
cd agrobit-forum
```

Or simply download and extract the ZIP file.

### 2. Start Local Server

**Using Python:**
```bash
python -m http.server 8080
```

**Using Node.js (http-server):**
```bash
npx http-server -p 8080
```

**Using VS Code:**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

### 3. Open in Browser

Navigate to `http://localhost:8080`

## 🗄️ Supabase Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Create a new project with a secure database password

### Step 2: Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  district TEXT,
  state TEXT,
  crops TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  issue_type TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  ai_suggestion TEXT,
  best_reply_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Replies table
CREATE TABLE replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for best_reply_id after replies table exists
ALTER TABLE posts ADD CONSTRAINT fk_best_reply 
  FOREIGN KEY (best_reply_id) REFERENCES replies(id) ON DELETE SET NULL;

-- Post Votes table (for upvote system)
CREATE TABLE post_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)  -- Prevent duplicate votes
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Prices table
CREATE TABLE market_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_name TEXT NOT NULL,
  district TEXT NOT NULL,
  price INTEGER NOT NULL,
  reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
  ('Crop Diseases', 'Identify and treat crop diseases'),
  ('Pest Control', 'Pest management and prevention'),
  ('Irrigation', 'Water management and irrigation systems'),
  ('Soil Health', 'Soil testing and fertilization'),
  ('Seeds & Varieties', 'Seed selection and crop varieties'),
  ('Weather & Climate', 'Weather patterns and climate adaptation'),
  ('Market Prices', 'Crop pricing and market information'),
  ('Government Schemes', 'Agricultural subsidies and programs'),
  ('General Discussion', 'General farming topics');
```

### Step 3: Enable Row Level Security (RLS)

Run the following SQL to set up security policies:

```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read posts" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read replies" ON replies
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read post_votes" ON post_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read market_prices" ON market_prices
  FOR SELECT USING (true);

-- Authenticated users can create
CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create replies" ON replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can vote" ON post_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can report prices" ON market_prices
  FOR INSERT WITH CHECK (auth.uid() = reported_by);

-- Users can update their own content
CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own content
CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies" ON replies
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their own votes" ON post_votes
  FOR DELETE USING (auth.uid() = user_id);
```

### Step 4: Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click "Create a new bucket"
3. Name it: `crop-images`
4. Make it **Public**
5. Click "Create bucket"

Set storage policies:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'crop-images');

-- Anyone can view images
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'crop-images');
```

### Step 5: Get API Credentials

1. Go to **Settings** → **API**
2. Copy your **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy your **anon public** key

## ⚙️ Configuration

Edit `js/supabase-config.js` with your Supabase credentials:

```javascript
// Supabase Configuration
const SUPABASE_URL = 'YOUR_PROJECT_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';

// Initialize Supabase client using the global supabase object from CDN
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Also expose globally for other scripts
window.supabaseClient = supabaseClient;
```

**Replace:**
- `YOUR_PROJECT_URL_HERE` with your Supabase project URL
- `YOUR_ANON_KEY_HERE` with your anon/public key

## 🎯 Usage

### For Farmers (Users)

1. **Sign Up**: Click "Login" → Switch to "Sign Up" tab → Fill in details
2. **Create Post**: After login, click "Create Post" → Fill form → Upload image (optional)
3. **Browse Posts**: View all posts on homepage, filter by category
4. **Reply**: Click on any post → Add your reply at the bottom
5. **Logout**: Click "Logout" in navbar

### For Developers

#### Adding New Features

**Add a new page:**
1. Create HTML file (e.g., `profile.html`)
2. Include CSS and JS: `<link rel="stylesheet" href="css/style.css">`
3. Include Supabase: `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`
4. Include scripts: `<script src="js/supabase-config.js"></script>`

**Add new database table:**
1. Create table in Supabase SQL Editor
2. Set up RLS policies
3. Create JS functions to interact with the table

## 📊 Database Schema

### profiles
- `id` (UUID, PK) - References auth.users
- `name` (TEXT) - User's full name
- `district` (TEXT) - User's district
- `state` (TEXT) - User's state
- `crops` (TEXT[]) - Array of crops grown
- `created_at` (TIMESTAMPTZ) - Account creation date

### categories
- `id` (UUID, PK) - Category ID
- `name` (TEXT) - Category name
- `description` (TEXT) - Category description
- `created_at` (TIMESTAMPTZ) - Creation date

### posts
- `id` (UUID, PK) - Post ID
- `user_id` (UUID, FK) - References profiles
- `category_id` (UUID, FK) - References categories
- `issue_type` (TEXT) - Type of issue (optional)
- `title` (TEXT) - Post title
- `description` (TEXT) - Post content
- `image_url` (TEXT) - Uploaded image URL
- `ai_suggestion` (TEXT) - AI-generated suggestion (optional)
- `best_reply_id` (UUID, FK) - References replies (best answer)
- `created_at` (TIMESTAMPTZ) - Creation date

### replies
- `id` (UUID, PK) - Reply ID
- `post_id` (UUID, FK) - References posts
- `user_id` (UUID, FK) - References profiles
- `message` (TEXT) - Reply content
- `created_at` (TIMESTAMPTZ) - Creation date

### post_votes
- `id` (UUID, PK) - Vote ID
- `post_id` (UUID, FK) - References posts
- `user_id` (UUID, FK) - References profiles
- `created_at` (TIMESTAMPTZ) - Vote timestamp
- **UNIQUE(post_id, user_id)** - Prevents duplicate votes

### notifications
- `id` (UUID, PK) - Notification ID
- `user_id` (UUID, FK) - References profiles (recipient)
- `message` (TEXT) - Notification message
- `post_id` (UUID, FK) - References posts
- `is_read` (BOOLEAN) - Read status (default: false)
- `created_at` (TIMESTAMPTZ) - Creation timestamp

### market_prices
- `id` (UUID, PK) - Price entry ID
- `crop_name` (TEXT) - Name of the crop
- `district` (TEXT) - District/location
- `price` (INTEGER) - Price in rupees per quintal
- `reported_by` (UUID, FK) - References profiles
- `created_at` (TIMESTAMPTZ) - Report timestamp

## 🔒 Security

### Authentication
- Email/password authentication via Supabase Auth
- Session management handled by Supabase
- Protected routes redirect to login

### Row Level Security (RLS)
- Public read access for posts, profiles, categories, replies
- Users can only create/update/delete their own content
- Storage bucket has proper access policies

### Data Validation
- Client-side validation for forms
- Server-side validation via RLS policies
- XSS prevention through HTML escaping

### Best Practices
- Never commit API keys to version control
- Use environment variables for production
- Keep Supabase client updated
- Regular security audits

## 📸 Screenshots

### Homepage
![Homepage](docs/screenshot-home.png)

### Create Post
![Create Post](docs/screenshot-create.png)

### Post Details
![Post Details](docs/screenshot-post.png)

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers
- Ensure responsive design works
- Update README for new features

## 🐛 Troubleshooting

### "Error loading posts"
- Check browser console (F12) for specific error
- Verify Supabase URL and API key are correct
- Ensure RLS policies are set up correctly
- Check if categories table has data

### "Authentication failed"
- Verify Supabase project is active
- Check email confirmation settings in Supabase Auth
- Ensure auth policies are configured

### "Image upload failed"
- Verify `crop-images` bucket exists and is public
- Check storage policies are set correctly
- Ensure file size is under 5MB

### "Can't create post"
- Make sure you're logged in
- Check if categories exist in database
- Verify INSERT policy on posts table

## 📝 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2026 AgroBit Forum

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/agrobit-forum/issues)
- **Email**: support@agrobit.com
- **Website**: https://agrobit.com

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- Farming community for inspiration and feedback
- Contributors and testers

## 🗺️ Roadmap

### Version 1.1 (Upcoming)
- [ ] User profile pages
- [ ] Edit/delete own posts
- [ ] Search functionality
- [ ] Like/vote system
- [ ] Notifications

### Version 2.0 (Future)
- [ ] AI-powered crop disease detection
- [ ] Weather integration
- [ ] Market price tracking
- [ ] Mobile app (React Native)
- [ ] Multi-language support

---

**Made with ❤️ for farmers** 🌾

Star ⭐ this repository if you find it helpful!
