const mongoose = require('mongoose');
const Validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    avatar: {
        type: Buffer,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        // trim: true,
        validate: (value) => {
            if (!Validator.isEmail(value)) {
                throw new Error('Email validation error');
            }
        },
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate: (value) => {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password validation error');
            }
        },
    },
    age: {
        type: Number,
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }]
}, {
    timestamps: true,
});

userSchema.virtual('tasks', {
    ref: 'Task', // not stored in db, its for mongoose to figure out who is the owner of task and how it is related
    localField: '_id',
    foreignField: 'owner', // we have an 'owner' field in task where users _id
});

// Static methods apply to the entire model on which they are defined whereas instance
// methods apply only to a specific document within the collection

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JSWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.__v;
    delete userObject.avatar;

    return userObject;
}

userSchema.statics.findByCredentials = async function(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('unable to login');
    }
    const passwordCorrect = await bcryptjs.compare(password, user.password);

    if (!passwordCorrect) {
        throw new Error('unable to login');
    }
    return user;
};

userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcryptjs.hash(user.password, 8);
    }
    return next();
});

userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    return next();
});


const User = mongoose.model('User', userSchema);


module.exports = User;
