const dotenv = require('dotenv')
const express = require('express')
const { PrismaClient } = require('@prisma/client')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000

dotenv.config()

const { chooseNextMesh, updateReward } = require('./lib/rewardLoop.js')

const prisma = new PrismaClient()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Mesh Server')
})

app.get('/mesh', async (req, res) => {
    try {
        const nextMesh = await chooseNextMesh()
    } catch {
        console.error()
    }
    res.json(nextMesh)
})

app.post('/cluster', async (req, res) => {
    const clusterId = body.clusterId
    const liked = body.liked
    try {
        const update = await updateReward(clusterId, liked)
    } catch(err) {
        console.error(err)
    }
})

app.listen(port, () => {
  console.log(`mesh-server listening on ${port}`)
})
