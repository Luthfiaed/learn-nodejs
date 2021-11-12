const express = require('express')
const Event = require('../models/event')
const router = new express.Router()
const { auth, authWorkersOnly, authOrganizersOnly } = require('../middlewares/auth')

router.post('/events', auth, authOrganizersOnly, async (req, res) => {
    const event = new Event({
        ...req.body,
        owner: req.user._id
    })

    try {
        await event.save()

        res.status(201).send(event)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/events', auth, async (req, res) => {
    try {
        const events = await Event.find({}).populate('applicants')
        res.send({ events })
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.get('/events/:id/register', auth, authWorkersOnly, async (req, res) => {
    try {
        var event = await Event.findById(req.params.id)
        if (!event.applicants.includes(req.user._id)) {
            event.applicants.push(req.user._id)
            event = await event.save()
        }

        res.send(event)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

module.exports = router