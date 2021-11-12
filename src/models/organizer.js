const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const organizerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    role: {
        type: String,
        required:true,
        trim: true
    },
    avatar: {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

organizerSchema.virtual('events', {
    ref: 'Event',
    localField: '_id',
    foreignField: 'owner'
})

organizerSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'reviewee'
})

organizerSchema.methods.generateAuthToken = async function () {
    const organizer = this
    const token = jwt.sign({ _id: organizer._id.toString(), role: organizer.role }, 'secret')

    organizer.tokens = organizer.tokens.concat({ token })
    await organizer.save()

    return token
}

organizerSchema.methods.toJSON = function () {
    const organizer = this

    const organizerObject = organizer.toObject()
    delete organizerObject.password
    delete organizerObject.tokens
    delete organizerObject.avatar

    return organizerObject
}

organizerSchema.statics.findByCredentials = async (email, password) => {
    const organizer = await Organizer.findOne({ email })

    if (!organizer) {
        throw new Error('email or password is incorrect')
    }

    const isMatch = await bcrypt.compare(password, organizer.password)

    if (!isMatch) {
        throw new Error('email or password is incorrect')
    }

    return organizer
}

organizerSchema.pre('save', async function (next) {
    const organizer = this

    if (organizer.isModified('password')) {
        organizer.password = await bcrypt.hash(organizer.password, 8)
    }

    next()
})

const Organizer = mongoose.model('Organizer', organizerSchema)

module.exports = Organizer