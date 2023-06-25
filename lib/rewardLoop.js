const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const LIKED_REWARD = 5
const DISLIKED_PENALTY = -5
const ALPHA = 0.01
// exploration vs exploitation tradeoff
const EPSILON = 0.5

// (1 - alpha) * q + alpha * (r + q)
const rewardFunction = (previousReward, newReward) => (1 - ALPHA) * previousReward + ALPHA * (newReward + previousReward)

/**
 * 
 * @param {Number} meshId 
 * @param {boolean} liked 
 * @returns {void}
 */
module.exports.updateReward = async (meshId,liked) => {
    // get the relevant cluster from the meshID
    const mesh = await prisma.mesh.findFirst({
        where: {
            id: meshId
        },
        include: {
            cluster: true
        }
    })
    const cluster = await prisma.cluster.findFirst({
        where: {
            id: mesh.clusterId
        }
    })
    const previousReward = cluster.rewardValue
    const newReward = liked ? LIKED_REWARD : DISLIKED_PENALTY
    const newRewardValue = rewardFunction(previousReward, newReward)
    console.log(newRewardValue)
    const res = await prisma.cluster.update({
        where: {
            id: cluster.id
        },
        data: {
            rewardValue: newRewardValue
        }
    })
    console.log('finished with update')
}

/**
 * gets the next mesh to display to the user
 * @returns {Number}
 */
module.exports.chooseNextMesh = async () => {
    // get all the clusters, just in case.
    // this is actively terrible, especially 
    // as the number of clusters and users grows
    const clusterCount = await prisma.cluster.count()
    let nextCluster;
    const rand = Math.random()
    if (rand > EPSILON) {
        // explore
        const rand = Math.random()
        // choose a random cluster from all clusters
        const nextClusterId = Math.floor(Math.random()*clusterCount)
        nextCluster = await prisma.cluster.findFirst({
        where: {
                id: nextClusterId
            },
            include: {
                meshes: true
            }
        })
    } else {
        // exploit (prefer user's preference)
        // get cluster with highest reward
        const nextClusterArr = await prisma.cluster.findMany({
            orderBy: {
                rewardValue: 'desc'
            },
            take: 1,
            include: {
                meshes: true
            }
        })
        nextCluster = nextClusterArr[0]
    }
    // pick random from highest reward cluster
    let nextMeshOptions;
    if (nextCluster) {
        const nextMeshOptions = nextCluster.meshes
        const nextMeshId = Math.floor(Math.random()*nextMeshOptions.length)
        return nextMeshId
    } else {
        return await chooseNextMesh()
    }

}
