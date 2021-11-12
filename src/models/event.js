const mongoose = require('mongoose')
const validator = require('validator')

const eventSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Organizer'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        trim: true
    },
    pic_name: {
        type: String,
        required: true,
        trim: true
    },
    pic_phone_number: {
        type: String,
        trim: true
    },
    pic_email: {
        type: String,
        trim: true,
        required: true
    },
    quota: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 1) {
                throw new Error('Quota must be more than zero')
            }
        }
    },
    fee_rate: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 10000) {
                throw new Error('Minimum fee is IDR 10,000')
            }
        }
    },
    max_cancellation: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Valid input is > 0')
            }
        }
    },
    applicants: [String]
}, {
    timestamps: true
})

const Event = mongoose.model('Event', eventSchema)

module.exports = Event