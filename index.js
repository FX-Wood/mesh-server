const dotenv = require('dotenv')
const express = require('express')
const { PrismaClient } = require('@prisma/client')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000

dotenv.config()

const { chooseNextMesh, updateReward } = require('./lib/rewardLoop.js')
const logger = require('./lib/logger.js')

const prisma = new PrismaClient()

app.use((req, res, next) => {
    const additionalInfo = {
        body: req.body,
        headers: req.headers
    }
    logger.log('info', `Requesting ${req.method} ${req.originalUrl}`, {tags: 'http', additionalInfo});
    next()      
})
app.use(cors())
app.use(express.json())
// need all four parameters for express to detect
// an error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    const additionalInfo = {
        body: req.body,
        headers: req.headers,
        error: err.message,
        stack: err.stack,
    }
    logger.log('error', `Requesting ${req.method} ${req.originalUrl}`, {tags: 'http', additionalInfo})
    res.status(500).end()
})

app.get('/', (req, res) => {
  res.send('Mesh Server')
})

app.get('/mesh', async (req, res) => {
    const nextMesh = await chooseNextMesh()
    const hydratedMesh = await prisma.mesh.findFirst({
        where: {
            id: nextMesh
        }
    })
    res.json(hydratedMesh)
})

app.get('/cluster', async (req, res) => {
    const clusters = await prisma.cluster.findMany()
    res.json(clusters)
})

app.post('/cluster', async (req, res) => {
    const meshId = req.body.meshId
    const liked = req.body.liked
    await updateReward(meshId, liked)
    res.status(200).send('yay')
})

app.listen(port, () => {
  logger.log('info',`mesh-server listening on ${port}`)
})
