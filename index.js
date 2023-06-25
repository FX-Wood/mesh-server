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
        const hydratedMesh = await prisma.mesh.findFirst({
            where: {
                id: nextMesh
            }
        })
        res.json(hydratedMesh)
    } catch(err) {
        console.error(err)
    }

})

app.get('/cluster', async (req, res) => {
    try {
        const clusters = await prisma.cluster.findMany()
        res.json(clusters)
    } catch(err) {
        console.error(err)
    }
})

app.post('/cluster', async (req, res) => {
    try {
        console.log('req body', req.body)
        const meshId = req.body.meshId
        const liked = req.body.liked
        const update = await updateReward(meshId, liked)
        res.status(200).send('yay')
    } catch(err) {
        console.error(err)
    }
})

app.listen(port, () => {
  console.log(`mesh-server listening on ${port}`)
})
