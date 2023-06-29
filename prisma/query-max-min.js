const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const highest = await prisma.cluster.findMany({
    orderBy: {
        rewardValue: 'desc'
    },
    include: {
        meshes: true
    }
})
const lowest = await prisma.cluster.findMany({
    orderBy: {
        rewardValue: 'asc'
    },
    include: {
        meshes: true
    }
})

let total = 0
let nonZeroCount = 0
for (let cluster of highest) {
    total++
    if (cluster.rewardValue) {
        nonZeroCount++
    }
    cluster.meshes = cluster.meshes.map(mesh => mesh.id)
}

for (let cluster of lowest) {
    cluster.meshes = cluster.meshes.map(mesh => mesh.id)
}

console.log('highest', highest.map(c => ({ id: c.id, rewardValue: c.rewardValue })))
//console.log('lowest', lowest.slice(0,3))
console.log('nonzero', nonZeroCount, 'total', total)
