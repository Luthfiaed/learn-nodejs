const mongoose = require('mongoose')
const validator = require('validator')

const reviewSchema = new mongoose.Schema({
    reviewee: {
        type: String
    },
    rate: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0 || value > 5) {
                throw new Error('Valid rating is 0 - 5')
            }
        }
    },
    review: {
        type: String,
        trim: true
    },
    reviewer: {
        type: String
    }
}, {
    timestamps: true
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review