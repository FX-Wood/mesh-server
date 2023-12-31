const dotenv = require('dotenv')
const express = require('express')
const { PrismaClient } = require('@prisma/client')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000

dotenv.config()

const { chooseNextMesh, updateReward } = require('./lib/rewardLoop.js')
const { logger } = require('./lib/logger.js')

const prisma = new PrismaClient()

app.use((req, res, next) => {
    const logData = {
        body: req.body,
        headers: req.headers
    }
    logger.log('info', `Requesting ${req.method} ${req.originalUrl}`, { tags: 'http', data: logData });
    next()      
})
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Mesh Server')
})

app.get('/mesh', async (req, res, next) => {
    try {
        const nextMesh = await chooseNextMesh()
        if (nextMesh) {
            res.json(nextMesh)
        } else {
            throw "there was an error"
        }
    } catch (err) {
        next(err)
    }

})

app.get('/cluster', async (req, res, next) => {
    try {
        const clusters = await prisma.cluster.findMany()
        res.json(clusters)
    } catch (err) {
        next(err)
    }
})

app.post('/cluster', async (req, res, next) => {
    try {
        const meshId = req.body.meshId
        const liked = req.body.liked
        await updateReward(meshId, liked)
        res.status(200).send('yay')
    } catch (err) {
        next(err)
    }
})

// catch all routes
app.all('*', (req, res) => {
    res.status(404).send('endpoint not found')
  })

// need all four parameters for express to detect
// an error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    const logData = {
        body: req.body,
        headers: req.headers,
        error: err.message,
        stack: err.stack,
    }
    logger.log('error', `Requesting ${req.method} ${req.originalUrl}`, { tags: 'http', data: logData })
    res.status(500).send("there was an error")
})

app.listen(port, () => {
  logger.log('info',`mesh-server listening on ${port}`)
})
