# AllFit Backend API

RESTful API for the AllFit fitness center mobile application.

## API Endpoints

### Authentication (`/api/auth`)

#### POST /api/auth/login
Login with email and password
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "role": "client"
  }
}
```

#### GET /api/auth/me
Get current user (requires authentication)

#### POST /api/auth/change-password
Change user password (requires authentication)
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### Users (`/api/users`)

#### GET /api/users
Get all users (Admin/Coach only)
Query params: `role`, `search`

#### GET /api/users/:id
Get user by ID

#### POST /api/users
Create new user (Admin/Coach only)
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+213123456789",
  "role": "client",
  "height": 175,
  "weight": 75,
  "goals": ["Weight loss", "Muscle gain"]
}
```

#### PUT /api/users/:id
Update user

#### DELETE /api/users/:id
Delete user (Coach only)

### Workouts (`/api/workouts`)

#### GET /api/workouts
Get workouts (filtered by user role)
Query params: `userId`, `startDate`, `endDate`

#### GET /api/workouts/:id
Get workout by ID

#### POST /api/workouts
Create new workout
```json
{
  "userId": "user_id",
  "title": "Upper Body Workout",
  "description": "Focus on chest and back",
  "date": "2024-12-09",
  "exercises": [
    {
      "name": "Bench Press",
      "sets": 4,
      "reps": 12,
      "weight": 60
    }
  ],
  "duration": 60,
  "caloriesBurned": 400
}
```

#### PUT /api/workouts/:id
Update workout

#### DELETE /api/workouts/:id
Delete workout

### Appointments (`/api/appointments`)

#### GET /api/appointments
Get appointments
Query params: `startDate`, `endDate`, `status`, `clientId`, `coachId`

#### GET /api/appointments/:id
Get appointment by ID

#### POST /api/appointments
Create new appointment
```json
{
  "clientId": "client_id",
  "coachId": "coach_id",
  "title": "Initial Consultation",
  "description": "First assessment",
  "appointmentDate": "2024-12-15T10:00:00",
  "duration": 60,
  "type": "consultation"
}
```

#### PUT /api/appointments/:id
Update appointment

#### DELETE /api/appointments/:id
Delete appointment (Admin/Coach only)

### Analytics (`/api/analytics`)

#### GET /api/analytics/dashboard/:userId
Get user dashboard analytics

#### GET /api/analytics/progress/:userId
Get user progress data
Query params: `startDate`, `endDate`

#### POST /api/analytics/body-metrics
Add body metrics entry
```json
{
  "userId": "user_id",
  "weight": 75,
  "bodyFat": 18,
  "muscleMass": 35,
  "measurements": {
    "chest": 95,
    "waist": 80,
    "arms": 35
  }
}
```

#### GET /api/analytics/body-metrics/:userId
Get body metrics history
Query params: `limit`

## Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

## Role-Based Access

- **Client**: Access own data only
- **Admin**: Create/manage clients and workouts
- **Coach**: Full system access

## Error Responses

```json
{
  "error": "Error message here"
}
```

Status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Environment Variables

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/allfit
JWT_SECRET=your_secret_key
NODE_ENV=development
```
