const User = require("../models/user");
const Comment = require("../models/comment");
const client = require("../redisClient");

const findUserById = async (userId) => {
  const cacheKey = `user:${userId}`;
  const cachedUser = await client.get(cacheKey);
  if (cachedUser) {
    return JSON.parse(cachedUser);
  }
  const user = await User.findById(userId);
  if (user) {
    await client.set(cacheKey, JSON.stringify(user), { EX: 3600 });
  }
  return user;
};

const createUser = async (data) => {
  const user = new User(data);
  const newUser = await user.save();
  const cacheKey = `user:${newUser._id}`;
  await client.set(cacheKey, JSON.stringify(newUser), { EX: 3600 });
  return newUser;
};

const updateUser = async (data) => {
  const { id, name, email, age } = data;
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { name, email, age },
    { new: true },
  );
  if (updatedUser) {
    const cacheKey = `user:${id}`;
    await client.set(cacheKey, JSON.stringify(updatedUser), { EX: 3600 });
  }
  return updatedUser;
};

const createComment = async (data) => {
  const comment = new Comment(data);
  const newComment = await comment.save();
  const userCommentsCacheKey = `user_comments:${newComment.userId}`;
  const comments = await Comment.find({ userId: newComment.userId }).populate(
    "userId",
  );
  await client.set(userCommentsCacheKey, JSON.stringify(comments), {
    EX: 3600,
  });
  return newComment;
};

const createManyComments = async (commentsData) => {
  return await Comment.insertMany(commentsData);
};

const updateManyComments = async (updateData) => {
  const bulkOperations = updateData.map((data) => ({
    updateOne: {
      filter: { _id: data._id },
      update: { $set: { content: data.content } },
    },
  }));
  return await Comment.bulkWrite(bulkOperations);
};

const getUserComments = async (userId) => {
  const cacheKey = `user_comments:${userId}`;
  const cachedComments = await client.get(cacheKey);
  if (cachedComments) {
    return JSON.parse(cachedComments);
  }
  const comments = await Comment.find({ userId }).populate("userId");
  await client.set(cacheKey, JSON.stringify(comments), { EX: 3600 });
  return comments;
};

const getUsers = async () => {
  const cacheKey = "users:all";
  const cachedUsers = await client.get(cacheKey);
  if (cachedUsers) {
    return JSON.parse(cachedUsers);
  }
  const users = await User.find();
  await client.set(cacheKey, JSON.stringify(users), { EX: 2 * 60 });
  return users;
};

module.exports = {
  findUserById,
  createUser,
  updateUser,
  createManyComments,
  updateManyComments,
  createComment,
  getUserComments,
  getUsers
};
