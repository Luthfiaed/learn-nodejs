const express = require('express')
require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const eventRouter = require('./routers/event')
const organizerRouter = require('./routers/organizer')
// const reviewRouter = require('./routers/review')
const workerRouter = require('./routers/worker')

const app = express()
const port = process.env.PORT || 9001

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
app.use(eventRouter)
app.use(organizerRouter)
// app.use(reviewRouter) 
app.use(workerRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port);
})