const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require("../../src/models/user");
const Task = require("../../src/models/task");

const mockUserId = new mongoose.Types.ObjectId();
const mockUser = {
    _id: mockUserId,
    name: 'mock',
    email: 'mockmock@example.com',
    password: 'dummyP@ssw0rd1',
    tokens: [{
        token: jwt.sign({ _id: mockUserId }, process.env.JSWT_SECRET),
    }],
};

const anotherMockUserId = new mongoose.Types.ObjectId();
const anotherMockUser = {
    _id: anotherMockUserId,
    name: 'another mock',
    email: 'anothermockmock@example.com',
    password: 'dummyP@ssw0rd1a1',
    tokens: [{
        token: jwt.sign({ _id: anotherMockUserId }, process.env.JSWT_SECRET),
    }],
};

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First task',
    completed: false,
    owner: mockUser._id,
};

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second task',
    completed: true,
    owner: mockUser._id,
};

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Third task',
    completed: true,
    owner: anotherMockUserId._id,
};

const setupDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
    await new User(mockUser).save();
    await new User(anotherMockUser).save();
}


module.exports = {
    mockUserId,
    mockUser,
    anotherMockUserId,
    anotherMockUser,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase,
}
