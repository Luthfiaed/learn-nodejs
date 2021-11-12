const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const skillSchema = new mongoose.Schema({
    skill_name: {
        type: String,
        trim: true
    },
    link_portfolios: [{
        link_portfolio: {
            type: String,
            trim: true
        }
    }],
    file_portfolios: [{
        file_portfolio: {
            type: String,
            trim:true
        }
    }]
})

const workerSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true,
        trim: true
    },
    phone_number: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validator(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    nik: {
        type: Number,
        required: true
    },
    bank_code: {
        type: String,
        trim: true
    },
    bank_acc_name: {
        type: String,
        trim: true
    },
    bank_acc_number: {
        type: String,
        trim: true
    },
    skills: [
        skillSchema
    ],
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    },
    role: {
        type: String,
        trim: true,
        required:true
    }
}, {
    timestamps: true
})

workerSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'reviewee'
})

workerSchema.methods.generateAuthToken = async function () {
    const worker = this
    const token = jwt.sign({ _id: worker._id.toString(), role: worker.role }, 'secret')

    worker.tokens = worker.tokens.concat({ token })
    await worker.save()

    return token
}

workerSchema.methods.toJSON = function () {
    const worker = this

    const workerObject = worker.toObject()
    delete workerObject.password
    delete workerObject.tokens
    delete workerObject.avatar

    return workerObject
}

workerSchema.statics.findByCredentials = async (email, password) => {
    const worker = await Worker.findOne({ email })

    if (!worker) {
        throw new Error('email or password is incorrect')
    }

    const isMatch = await bcrypt.compare(password, worker.password)

    if (!isMatch) {
        throw new Error('email or password is incorrect')
    }

    return worker
}

workerSchema.pre('save', async function (next) {
    const worker = this

    if (worker.isModified('password')) {
        worker.password = await bcrypt.hash(worker.password, 8)
    }

    next()
})

const Worker = mongoose.model('Worker', workerSchema)

module.exports = Worker