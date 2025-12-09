require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
});

async function createCoachAccount() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', UserSchema);

    // Get coach details
    const firstName = await question('Coach First Name: ');
    const lastName = await question('Coach Last Name: ');
    const email = await question('Coach Email: ');
    const password = await question('Coach Password: ');

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User with this email already exists!');
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create coach user
    const coach = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'coach',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await coach.save();

    console.log('\n✅ Coach account created successfully!');
    console.log('Email:', email);
    console.log('Role: coach');
    console.log('\nYou can now login with these credentials.');

  } catch (error) {
    console.error('❌ Error creating coach account:', error.message);
  } finally {
    rl.close();
    mongoose.connection.close();
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

// Run the script
createCoachAccount();
