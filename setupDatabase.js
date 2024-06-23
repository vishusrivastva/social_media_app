// setupDatabase.js

const mongoose = require('mongoose');
const User = require('./models/userModel');
const Status = require('./models/statusModel');
const Comment = require('./models/commentModel');
const { hashPassword } = require('./utils/hashPassword');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createUsers = async (count) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const hashedPassword = await hashPassword('password123');
    users.push({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      password: hashedPassword,
    });
  }
  return User.create(users);
};

const setupFollows = async (users) => {
  for (let i = 0; i < users.length; i++) {
    const followingUsers = users.slice(i + 1, i + 6);
    users[i].following = followingUsers.map(user => user._id);
    for (let j = 0; j < followingUsers.length; j++) {
      followingUsers[j].followers.push(users[i]._id);
      await followingUsers[j].save();
    }
    await users[i].save();
  }
};

const createStatuses = async (users) => {
  const statuses = [];
  for (let user of users) {
    for (let i = 0; i < 5; i++) {
      statuses.push({
        user: user._id,
        text: `Status ${i + 1} from ${user.name}`,
      });
    }
  }
  return Status.create(statuses);
};

const addCommentsAndLikes = async (users, statuses) => {
  for (let status of statuses) {
    const potentialInteractors = users.filter(user => 
      user._id.toString() === status.user.toString() || user.following.includes(status.user)
    );
    const commenters = potentialInteractors.sort(() => 0.5 - Math.random()).slice(0, 5);
    const likers = potentialInteractors.sort(() => 0.5 - Math.random()).slice(0, 5);

    for (let commenter of commenters) {
      const comment = await Comment.create({
        user: commenter._id,
        status: status._id,
        text: `Comment from ${commenter.name} on status ${status._id}`,
      });
      status.comments.push(comment._id);
    }

    for (let liker of likers) {
      status.likes.push(liker._id);
    }

    await status.save();
  }
};

const setupDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Status.deleteMany({});
    await Comment.deleteMany({});

    console.log('Creating users...');
    const users = await createUsers(1000);

    console.log('Setting up follows...');
    await setupFollows(users);

    console.log('Creating statuses...');
    const statuses = await createStatuses(users);

    console.log('Adding comments and likes...');
    await addCommentsAndLikes(users, statuses);

    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    mongoose.disconnect();
  }
};

setupDatabase();