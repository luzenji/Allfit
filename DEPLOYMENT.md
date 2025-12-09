# AllFit Deployment Guide

## Prerequisites

Before deploying the AllFit application, ensure you have:

- MongoDB database (local or cloud - MongoDB Atlas recommended)
- Node.js hosting (Heroku, AWS, DigitalOcean, or similar)
- Domain name (optional)
- SSL certificate (for production)

## Backend Deployment

### Option 1: Heroku Deployment

1. **Create Heroku Account**
   - Sign up at https://heroku.com

2. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

3. **Login to Heroku**
   ```bash
   heroku login
   ```

4. **Create Heroku App**
   ```bash
   cd allfit-backend
   heroku create allfit-backend
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_connection_string
   heroku config:set JWT_SECRET=your_secure_jwt_secret
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 2: VPS Deployment (DigitalOcean, AWS EC2, etc.)

1. **Setup Server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MongoDB
   # Follow MongoDB installation guide for your OS
   ```

2. **Clone Repository**
   ```bash
   cd /var/www
   git clone your-repo-url allfit
   cd allfit/allfit-backend
   ```

3. **Install Dependencies**
   ```bash
   npm install --production
   ```

4. **Configure Environment**
   ```bash
   nano .env
   # Add production environment variables
   ```

5. **Setup PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name allfit-api
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx (Reverse Proxy)**
   ```bash
   sudo apt install nginx
   
   # Create Nginx config
   sudo nano /etc/nginx/sites-available/allfit
   ```

   ```nginx
   server {
       listen 80;
       server_name api.allfit.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/allfit /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.allfit.com
   ```

### MongoDB Atlas Setup (Recommended)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster**
   - Choose cloud provider and region
   - Select M0 (Free tier) or appropriate size

3. **Create Database User**
   - Database Access → Add New User
   - Set username and password
   - Grant read/write permissions

4. **Whitelist IP Addresses**
   - Network Access → Add IP Address
   - For development: Allow from anywhere (0.0.0.0/0)
   - For production: Add specific IPs

5. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace <password> with your database password

## Mobile App Deployment

### iOS Deployment (App Store)

1. **Enroll in Apple Developer Program** ($99/year)
   - https://developer.apple.com

2. **Configure App**
   ```bash
   cd allfit-mobile
   expo build:ios
   ```

3. **Submit to App Store**
   - Follow Apple's submission guidelines
   - Use App Store Connect

### Android Deployment (Google Play)

1. **Create Google Play Developer Account** ($25 one-time fee)
   - https://play.google.com/console

2. **Build APK**
   ```bash
   cd allfit-mobile
   expo build:android
   ```

3. **Upload to Google Play Console**
   - Create app listing
   - Upload APK
   - Complete store listing
   - Submit for review

### Alternative: Expo Publishing

For quick deployment without app stores:

```bash
cd allfit-mobile
expo publish
```

Users can access via Expo Go app using the published URL.

## Post-Deployment Checklist

### Backend
- [ ] Environment variables set correctly
- [ ] Database connection working
- [ ] API endpoints accessible
- [ ] SSL certificate installed
- [ ] CORS configured for mobile app
- [ ] Error logging setup (e.g., Sentry)
- [ ] Backup strategy in place

### Mobile App
- [ ] API URL updated to production
- [ ] App tested on both iOS and Android
- [ ] Icons and splash screens configured
- [ ] App permissions requested properly
- [ ] Store listings completed
- [ ] Analytics integrated (optional)

## Initial Setup

### Create First Coach Account

After deployment, create the first coach account via MongoDB:

```javascript
// Connect to MongoDB
use allfit

// Insert coach user
db.users.insertOne({
  firstName: "Azzedine",
  lastName: "Coach",
  email: "azzedine@allfit.com",
  password: "$2a$10$...", // Use bcrypt to hash password
  role: "coach",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use this script:
```bash
node allfit-backend/scripts/createCoach.js
```

## Monitoring

### Backend Monitoring
- Use PM2 monitoring: `pm2 monit`
- Setup alerts for server downtime
- Monitor database performance

### Mobile App Monitoring
- Use Expo Analytics or Firebase Analytics
- Track crash reports
- Monitor API response times

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Backup database weekly
- Review error logs daily
- Update SSL certificates before expiry

### Scaling Considerations
- Consider load balancing for high traffic
- Setup database replication
- Implement caching (Redis)
- Use CDN for static assets

## Budget Breakdown

### Initial Costs
- Development: $200 USD (40,000 DZD) ✓
- Domain: ~$10-15/year
- SSL: Free (Let's Encrypt)

### Monthly Costs
- Hosting VPS: $5-10/month (Basic DigitalOcean droplet)
- MongoDB Atlas: Free (M0 tier) or $9/month (M10)
- Total: ~$5-20/month

### One-Time Costs
- Apple Developer: $99/year
- Google Play Developer: $25 one-time

## Support

For deployment assistance:
- Email: support@allfit.com
- Technical support: Contact development team

---

**Note**: Update all placeholder URLs, emails, and credentials with actual values during deployment.
