const express = require('express')
const Organizer = require('../models/organizer')
const Event = require('../models/event')
const Review = require('../models/review')
const router = new express.Router()
const { auth, authWorkersOnly } = require('../middlewares/auth')
const multer = require('multer')

const upload = multer({
    limits: {
        fileSize: 300000000
    },
    fileFilter(req, file, callbackFunc) {
        const acceptedFormats = ['.jpg', '.jpeg', '.png']

        if (!acceptedFormats.some((format) => file.originalname.endsWith(format))) {
            return callbackFunc(new Error('file format not supported'))
        }

        callbackFunc(undefined, true)
    }
})

router.post('/organizers/signup', upload.single('avatar'), async (req, res) => {
    req.body.avatar = req.file.buffer
    req.body.role = 'organizer'

    const newOrganizer = new Organizer(req.body)
    try {
        await newOrganizer.save()
        res.status(201).send(newOrganizer)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/organizers/login', async (req, res) => {
    try {
        const organizer = await Organizer.findByCredentials(req.body.email, req.body.password)
        const token = await organizer.generateAuthToken()
        res.send({ organizer, token })
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

router.get('/organizers/me', auth, async (req, res) => {
    res.send(req.user)
})

router.get('/organizers/me/reviews', auth, async (req, res) => {
    try {
        await req.user.populate('reviews')

        res.send(req.user.reviews)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.get('/organizers/me/events', auth, async (req, res) => {
    try {
        const events = await Event.find({ owner: req.user._id })
        res.send({ events })
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.post('/organizers/:id/reviews', auth, authWorkersOnly, async (req, res) => {
    const review = new Review({
        ...req.body,
        reviewee: req.params.id,
        reviewer: req.user._id
    })

    try {
        await review.save()
        res.status(201).send(review)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

module.exports = router