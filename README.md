# AllFit Fitness Center - Mobile Application

A comprehensive mobile application for AllFit fitness center, designed for personalized coaching, workout tracking, and client management.

## 🎯 Project Overview

AllFit is a modern fitness center focused on **metamorphose** and **personalized coaching**. This application connects clients with AllFit services, enabling:

- **Client Management**: Admin-created accounts with secure access
- **Personalized Workouts**: Custom workout plans created by coaches
- **Progress Tracking**: Body metrics, workout history, and analytics
- **Appointment Booking**: Calendar-based appointment scheduling
- **Role-Based Access**: Different permissions for Clients, Admins, and Coach

## 📱 Features

### For Clients
- 📊 **Dashboard**: Overview of progress, upcoming appointments, and statistics
- 💪 **Workout Tracking**: View and complete personalized workouts
- 📅 **Appointment Calendar**: Book and manage consultation appointments
- 📈 **Progress Analytics**: Track body measurements, weight, and fitness goals
- 👤 **Profile Management**: Update personal information and preferences

### For Admins/Staff
- 👥 **Client Management**: Create and manage client accounts
- 🏋️ **Workout Creation**: Design personalized workout plans
- 📝 **Consultation Records**: Document client assessments and progress
- 📊 **Analytics Access**: View client progress and performance

### For Coach (Azzedine - Full Access)
- 🔐 **Full System Access**: Complete control over all features
- 👥 **User Management**: Create admin and client accounts
- 📊 **Comprehensive Analytics**: View all clients' data and progress
- ⚙️ **System Configuration**: Manage app settings and permissions

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for database
- **JWT** for authentication
- **bcrypt** for password hashing

### Mobile App
- **React Native** with Expo
- **React Navigation** for routing
- **AsyncStorage** for local data
- **Axios** for API calls
- **React Native Calendars** for appointment booking

## 🎨 Design

- **Color Scheme**: White and Dark Blue (#003366)
- **Style**: Modern, minimalist, and clean
- **Branding**: AllFit logo with metamorphose theme

## 📂 Project Structure

```
allfit/
├── allfit-backend/          # Backend API
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── middleware/          # Auth middleware
│   ├── config/              # Configuration
│   └── server.js            # Main server file
│
└── allfit-mobile/           # React Native App
    ├── src/
    │   ├── screens/         # App screens
    │   ├── components/      # Reusable components
    │   ├── navigation/      # Navigation setup
    │   ├── services/        # API services
    │   ├── context/         # React context (Auth)
    │   ├── constants/       # Colors, config
    │   └── utils/           # Helper functions
    ├── assets/              # Images, fonts
    ├── App.js               # Main app component
    └── package.json         # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app)

### Backend Setup

1. Navigate to backend directory:
```bash
cd allfit-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy .env.example to .env and update values
cp .env.example .env
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

Backend will run on `http://localhost:5000`

### Mobile App Setup

1. Navigate to mobile directory:
```bash
cd allfit-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/services/api.js`:
```javascript
const API_URL = 'http://YOUR_BACKEND_IP:5000/api';
```

4. Start Expo:
```bash
npm start
```

5. Run on device:
- Scan QR code with Expo Go app (iOS/Android)
- Press `a` for Android emulator
- Press `i` for iOS simulator

## 🔐 Default Credentials

### Coach Account (Full Access)
The first coach account should be created directly in MongoDB or via a setup script.

```javascript
// Example coach user
{
  firstName: "Azzedine",
  lastName: "Coach",
  email: "azzedine@allfit.com",
  password: "secure_password",  // Will be hashed
  role: "coach"
}
```

### Creating Client Accounts
Clients cannot register themselves. Accounts are created by admins/coaches through:
1. Admin panel in the app
2. POST request to `/api/users` endpoint

## 📱 Platform Support

- ✅ **Android**: Full support (API 21+)
- ✅ **iOS**: Full support (iOS 11+)

## 🧪 Testing

### Backend Testing
```bash
cd allfit-backend
# Add test commands
npm test
```

### Mobile App Testing
```bash
cd allfit-mobile
expo start --android  # Test on Android
expo start --ios      # Test on iOS
```

## 📦 Building for Production

### Backend Deployment
1. Set `NODE_ENV=production` in environment
2. Update `JWT_SECRET` with strong secret
3. Configure production MongoDB URI
4. Deploy to hosting service (Heroku, AWS, etc.)

### Mobile App Build

**Android APK:**
```bash
expo build:android
```

**iOS IPA:**
```bash
expo build:ios
```

## 💰 Budget

- Estimated Development Cost: ~$200 USD (40,000 DZD)
- Deployment costs additional based on hosting choice

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Secure API endpoints
- Input validation and sanitization

## 📞 Support & Contact

For assistance with the application:
- Contact AllFit staff
- Email: support@allfit.com
- Phone: [Your phone number]

## 📄 License

Proprietary - AllFit Fitness Center

## 🤝 Contributing

This is a private project for AllFit. For feature requests or bug reports, contact the development team.

---

**Built with ❤️ for AllFit Fitness Center**

*Metamorphose Your Body - Transform Your Life*
