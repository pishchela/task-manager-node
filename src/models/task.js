const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // to create relationship with User model
    }
}, {
    timestamps: true,
})

taskSchema.pre('save', function (next) {
    // this.description = 'from middleware: )';
    next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
