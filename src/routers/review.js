const express = require('express')
const Review = require('../models/review')
const router = new express.Router()
const { auth } = require('../middlewares/auth')

router.post('/reviews/:id', auth, async (req, res) => {
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