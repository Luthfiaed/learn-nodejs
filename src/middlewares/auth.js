const jwt = require('jsonwebtoken')
const Worker = require('../models/worker')
const Organizer = require('../models/organizer')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')
        const decoded = jwt.verify(token, 'secret')

        var user
        if (decoded.role === 'worker') {
            user = await Worker.findOne({ _id: decoded._id, 'tokens.token': token })
        }

        if (decoded.role === 'organizer') {
            user = await Organizer.findOne({ _id: decoded._id, 'tokens.token': token }) 
        }
    
        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Unauthorized' })
    }
}

const authWorkersOnly = (req, res, next) => {
    if (req.user.role !== 'worker') {
        return res.status(401).send({ error: 'Not allowed to perform this action' })
    }

    next()
}

const authOrganizersOnly = (req, res, next) => {
    if (req.user.role !== 'organizer') {
        return res.status(401).send({ error: 'Not allowed to perform this action'})
    }

    next()
}

module.exports = { auth, authWorkersOnly, authOrganizersOnly }