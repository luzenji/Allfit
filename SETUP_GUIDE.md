# AllFit Setup Guide

Complete step-by-step guide to set up and run the AllFit application.

## 🎯 Quick Start (For Local Development)

### Prerequisites Installation

1. **Install Node.js** (v14 or higher)
   - Download from: https://nodejs.org
   - Verify: `node --version` and `npm --version`

2. **Install MongoDB**
   
   **Windows:**
   - Download from: https://www.mongodb.com/try/download/community
   - Install and run MongoDB as a service
   
   **macOS:**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```
   
   **Linux:**
   ```bash
   sudo apt-get install -y mongodb
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

3. **Install Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

### Backend Setup (5 minutes)

1. **Navigate to backend directory:**
   ```bash
   cd allfit-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   # The .env file is already created, but verify it
   cat .env
   ```
   
   Should contain:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/allfit
   JWT_SECRET=allfit_secret_key_2024_metamorphose_coaching
   NODE_ENV=development
   ```

4. **Start the backend server:**
   ```bash
   npm start
   ```
   
   You should see:
   ```
   ✅ MongoDB Connected Successfully
   🚀 AllFit Server running on port 5000
   ```

5. **Create first coach account (in a new terminal):**
   ```bash
   cd allfit-backend
   node scripts/createCoach.js
   ```
   
   Enter details:
   - First Name: Azzedine
   - Last Name: Coach
   - Email: azzedine@allfit.com
   - Password: [choose a secure password]

### Mobile App Setup (5 minutes)

1. **Open a new terminal and navigate to mobile directory:**
   ```bash
   cd allfit-mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update API URL (if needed):**
   
   Edit `src/services/api.js`:
   ```javascript
   // For iOS simulator use localhost
   // For Android emulator use 10.0.2.2
   // For physical device use your computer's IP
   
   const API_URL = 'http://localhost:5000/api';  // iOS
   // const API_URL = 'http://10.0.2.2:5000/api';  // Android
   // const API_URL = 'http://192.168.1.x:5000/api';  // Physical device
   ```

4. **Start Expo:**
   ```bash
   npm start
   ```

5. **Run on device/simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## 📱 Testing the Application

### Login as Coach

1. Open the app
2. Use credentials created earlier:
   - Email: azzedine@allfit.com
   - Password: [your password]

### Create a Test Client

1. After logging in as coach
2. Navigate to Users/Clients section (you'll need to add this screen)
3. Or use the API directly:

```bash
# Get the auth token first by logging in
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "azzedine@allfit.com",
    "password": "your_password"
  }'

# Use the token to create a client
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "client123",
    "phone": "+213555123456",
    "role": "client",
    "height": 175,
    "weight": 75,
    "goals": ["Weight loss", "Muscle gain"]
  }'
```

## 🔧 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
```
❌ MongoDB Connection Error
```
Solution:
- Ensure MongoDB is running: `sudo systemctl status mongodb`
- Check connection string in .env
- Try restarting MongoDB: `sudo systemctl restart mongodb`

**Port Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
Solution:
- Change PORT in .env to another port (e.g., 5001)
- Or kill the process using port 5000:
  ```bash
  # Find process
  lsof -i :5000
  # Kill process
  kill -9 <PID>
  ```

### Mobile App Issues

**Cannot Connect to Backend:**
- Make sure backend is running
- Check API_URL in `src/services/api.js`
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical device, use your computer's IP address
- Ensure firewall allows connections on port 5000

**Expo CLI Not Found:**
```bash
npm install -g expo-cli
```

**Build/Bundle Errors:**
```bash
# Clear cache
expo start -c

# Or reinstall dependencies
rm -rf node_modules
npm install
```

## 🎨 Customization

### Change Colors

Edit `allfit-mobile/src/constants/colors.js`:
```javascript
export const COLORS = {
  primary: '#003366',    // Your primary color
  secondary: '#0055AA',  // Your secondary color
  // ... other colors
};
```

### Add Logo

1. Place logo in `allfit-mobile/assets/`
2. Update references in:
   - `app.json` (icon, splash)
   - Login screen
   - App header

### Update App Name

Edit `allfit-mobile/app.json`:
```json
{
  "expo": {
    "name": "AllFit",  // Change this
    "slug": "allfit-mobile"
  }
}
```

## 📚 API Testing with Postman

1. **Import Postman Collection:**

Create a new collection with these endpoints:

**Base URL:** `http://localhost:5000/api`

**Endpoints:**
```
POST   /auth/login
GET    /auth/me
POST   /auth/change-password
GET    /users
POST   /users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id
GET    /workouts
POST   /workouts
GET    /appointments
POST   /appointments
GET    /analytics/dashboard/:userId
POST   /analytics/body-metrics
```

2. **Set Authorization:**
   - Type: Bearer Token
   - Token: [paste your JWT token from login response]

## 🚀 Next Steps

### For Development:
1. ✅ Complete all screens (Workout detail, Appointment detail, etc.)
2. ✅ Add admin panel for user management
3. ✅ Implement push notifications
4. ✅ Add progress photos feature
5. ✅ Implement exercise library
6. ✅ Add workout timer

### For Production:
1. ✅ Deploy backend to cloud server
2. ✅ Setup MongoDB Atlas
3. ✅ Configure SSL/HTTPS
4. ✅ Build mobile app for stores
5. ✅ Setup analytics
6. ✅ Configure push notifications
7. ✅ Setup error monitoring (Sentry)

## 💡 Development Tips

### Hot Reload
Both backend and mobile app support hot reload:
- Backend: Use `npm run dev` with nodemon
- Mobile: Expo automatically reloads on save

### Debugging
- Backend: Use `console.log()` or Node.js debugger
- Mobile: Use React Native Debugger or Chrome DevTools
- Expo: Shake device to open developer menu

### Database Management
Use MongoDB Compass for GUI:
- Download from: https://www.mongodb.com/products/compass
- Connect to: `mongodb://localhost:27017`
- Database: `allfit`

## 📞 Getting Help

If you encounter issues:

1. Check console/terminal for error messages
2. Review this guide's troubleshooting section
3. Check the main README.md for more details
4. Review API documentation in backend/README.md
5. Search for error messages online

## ✅ Verification Checklist

Before considering setup complete:

**Backend:**
- [ ] MongoDB is running
- [ ] Backend server starts without errors
- [ ] Can create coach account
- [ ] Can login via API
- [ ] Can create client account

**Mobile App:**
- [ ] Expo starts successfully
- [ ] App loads on simulator/device
- [ ] Can login with coach credentials
- [ ] Dashboard displays correctly
- [ ] Navigation works

**Integration:**
- [ ] Mobile app connects to backend
- [ ] Can fetch data from API
- [ ] Authentication works
- [ ] Data updates reflect in app

---

**Congratulations! 🎉**

You've successfully set up the AllFit application. Start building amazing features for your fitness center!

*For production deployment, see DEPLOYMENT.md*
