const mongoose = require('mongoose');

const columnSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        default: 0,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{
    timestamps: true
});

module.exports = mongoose.model('Column', columnSchema);