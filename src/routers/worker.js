const express = require('express')
const Worker = require('../models/worker')
const Event = require('../models/event')
const Review = require('../models/review')
const router = new express.Router()
const { auth, authOrganizersOnly } = require('../middlewares/auth')
const multer = require('multer')

const upload = multer({
    limits: {
        // 300MB max
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

router.post('/workers/signup', upload.single('avatar'), async (req, res) => {
    req.body.avatar = req.file.buffer
    req.body.role = 'worker'

    const newWorker = new Worker(req.body)
    try {
        await newWorker.save()
        res.status(201).send(newWorker)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/workers/login', async (req, res) => {
    try {
        const worker = await Worker.findByCredentials(req.body.email, req.body.password)
        const token = await worker.generateAuthToken()
        res.send({ worker, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/workers/me', auth, async (req, res) => {
    res.send(req.user)
})

router.get('/workers/me/reviews', auth, async (req, res) => {
    try {
        const reviews = await Review.find({ reviewee: req.user._id })

        res.send({ reviews })
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.get('/workers/me/events', auth, async (req, res) => {
    try {
        const events = await Event.find({ applicants: req.user._id })
        res.send({ events })
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.post('/workers/:id/reviews', auth, authOrganizersOnly, async (req, res) => {
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