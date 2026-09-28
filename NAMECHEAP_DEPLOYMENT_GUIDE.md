# 🚀 Namecheap Deployment Guide — Hafiz Clinic & Healthcare System

This step-by-step guide explains how to deploy the **Hafiz Clinic Healthcare System** to **Namecheap Hosting** (Shared Hosting with cPanel, CloudLinux Node.js, or VPS).

---

## 📋 Pre-Deployment Summary

The production build has already been generated:
- **Frontend SPA Files:** `/dist/` (includes `index.html`, `/assets/`, and `.htaccess`)
- **Backend Server Bundle:** `/dist/server.cjs`
- **cPanel Startup Script:** `/app.js`
- **Apache Rewrite & Compression Config:** `/dist/.htaccess`

---

## 🌐 Method 1: Namecheap cPanel Shared Hosting (Fastest & Simplest)

*Ideal for Namecheap Stellar, Stellar Plus, or Stellar Business plans.*

### Step 1: Prepare the Files
1. Open the project directory on your computer or download the `/dist/` folder.
2. Inside `/dist/`, select all items:
   - `index.html`
   - `.htaccess` *(Make sure hidden dot-files are shown in your file explorer)*
   - `assets/` folder
3. Compress these files into a single `.zip` file (e.g. `dist.zip`).

### Step 2: Upload to Namecheap cPanel
1. Log into your **Namecheap Dashboard** → Go to **Hosting List** → Click **Go to cPanel**.
2. Under the **Files** section, click **File Manager**.
3. Navigate to:
   - For your primary domain: `public_html/`
   - For an addon domain / subdomain: `public_html/your-subdomain/`
4. If there is a default `index.php` or `default.html` placeholder from Namecheap, delete it.
5. Click **Upload** in the top menu and select your `dist.zip`.
6. Once uploaded (progress bar turns green), return to File Manager, right-click `dist.zip`, and click **Extract**.
7. Confirm that `index.html`, `.htaccess`, and `assets/` are directly inside `public_html/`.

### Step 3: Enable Free SSL (HTTPS)
1. In cPanel, search for **SSL/TLS Status**.
2. Click **Run AutoSSL** to install Namecheap's free Sectigo / cPanel SSL certificate.
3. The `.htaccess` file we provided will automatically force all visitors to `https://`.

---

## ⚡ Method 2: Namecheap cPanel Full-Stack Node.js (with Backend & Database)

*Use this method if you are running the Express API backend (`/api/*`) on Namecheap cPanel.*

### Step 1: Upload Project Files
1. In **cPanel File Manager**, create a folder outside `public_html` named `hafiz-clinic/` (e.g., `/home/username/hafiz-clinic/`).
2. Upload the project files:
   - `package.json`
   - `app.js`
   - `dist/` directory
   - `.env` (contains your `MONGODB_URI`, `JWT_SECRET`, etc.)
3. Do **not** upload `node_modules` (they will be installed automatically by cPanel).

### Step 2: Configure "Setup Node.js App" in cPanel
1. In cPanel, find **Software** → click **Setup Node.js App**.
2. Click **Create Application**:
   - **Node.js version:** Select `20.x` or `22.x` (Recommended: `20.x LTS`).
   - **Application mode:** `Production`.
   - **Application root:** `hafiz-clinic` (the folder you created).
   - **Application URL:** Select your domain (e.g., `hafizclinic.com`).
   - **Application startup file:** `app.js`.
3. Click **Create**.

### Step 3: Install Dependencies & Set Environment
1. In the Node.js application screen, click **Run NPM Install** (or copy the virtual environment terminal command provided at the top and run `npm install --omit=dev`).
2. Under **Environment variables**, click **Add Variable**:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `mongodb+srv://...` (Your MongoDB Atlas connection string)
   - `JWT_SECRET` = `your_secure_secret_key`
3. Click **Save** and then click **Restart**.
4. Visit your domain — the site and APIs are now live!

---

## 🖥️ Method 3: Namecheap VPS or Dedicated Server (Ubuntu 22.04 / 24.04)

*Ideal for high-traffic clinics or dedicated infrastructure.*

### 1. Connect to VPS via SSH
```bash
ssh root@YOUR_SERVER_IP
```

### 2. Install Node.js, PM2, and Nginx
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt update && apt install -y nodejs nginx git
npm install -g pm2
```

### 3. Deploy App
```bash
mkdir -p /var/www/hafizclinic
cd /var/www/hafizclinic
# Upload or clone repository
npm install --omit=dev
npm run build
```

### 4. Start with PM2 Process Manager
```bash
pm2 start app.js --name "hafiz-clinic"
pm2 save
pm2 startup
```

### 5. Configure Nginx Reverse Proxy
Edit `/etc/nginx/sites-available/hafizclinic`:
```nginx
server {
    listen 80;
    server_name hafizclinic.com www.hafizclinic.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable the site and install free Let's Encrypt SSL:
```bash
ln -s /etc/nginx/sites-available/hafizclinic /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
apt install -y certbot python3-certbot-nginx
certbot --nginx -d hafizclinic.com -d www.hafizclinic.com
```

---

## 🏷️ Namecheap Domain DNS Configuration

In your **Namecheap Account** → **Domain List** → Click **Manage** next to your domain:

1. Click the **Advanced DNS** tab.
2. In **Host Records**, set:
   - **Type:** `A Record` | **Host:** `@` | **Value:** `YOUR_NAMECHEAP_HOSTING_IP` | **TTL:** `Automatic`
   - **Type:** `CNAME Record` | **Host:** `www` | **Value:** `hafizclinic.com.` | **TTL:** `Automatic`
3. Click **Save all changes**. DNS propagation typically takes 5–30 minutes.

---

## ✅ Post-Deployment Verification Checklist
- [ ] Visit `https://yourdomain.com` and ensure the lock icon (SSL) is active.
- [ ] Test client-side navigation (e.g. `https://yourdomain.com/patient-portal` or `/pharmacy-pos`) to confirm `.htaccess` handles page reloads without 404s.
- [ ] Test the Camera QR Scanner and Print Invoice features.
- [ ] Verify Google Rich Snippets using Google's Rich Results Test tool.
