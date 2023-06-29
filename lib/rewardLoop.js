const { logger, logCluster } = require('./logger.js')
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
    try {
        logger.log('info', 'updateReward-inputs', { meshId, liked })
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
        await prisma.cluster.update({
            where: {
                id: cluster.id
            },
            data: {
                rewardValue: newRewardValue
            }
        })
        const logData = {
            clusterId: cluster.id,
            previousReward,
            newReward,
            newRewardValue
        }
        logger.log('info', 'updateReward-outputs', ...logData)
    } catch(err) {
        logger.log('error', 'updateReward-error', {error: err.message, stack: err.stack})
    }
}

/**
 * gets the next mesh to display to the user
 * @returns {Number | undefined}
 */
const chooseNextMesh = async () => {
    // get all the clusters, just in case.
    // this is actively terrible, especially 
    // as the number of clusters and users grows
    const clusterCount = await prisma.cluster.count()
    let nextCluster;
    const rand = Math.random()
    if (rand > EPSILON) {
        // explore
        // choose a random cluster from all clusters
        // need to add 1 to clustercount because the clusters are 1-indexed
        const nextClusterId = Math.floor(Math.random()*clusterCount + 1)
        nextCluster = await prisma.cluster.findFirst({
        where: {
                id: nextClusterId
            },
        include: {
            meshes: true
        }
        })
        const logData = {
            epsilon: EPSILON,
            exploreValue: rand,
            nextClusterId,
            nextClusterFound: Boolean(nextCluster),
        }
        logger.log('info', 'chooseNextMesh explore', { ...logData })
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
        const logData = {
            epsilon: EPSILON,
            exploreValue: rand,
            nextClusterId: nextCluster?.id,
            nextClusterFound: Boolean(nextCluster),
        }
        logger.log('info', 'chooseNextMesh exploit', { ...logData })
    }
    // pick random mesh from the cluster we chose
    if (nextCluster) {
        const nextMeshOptions = nextCluster.meshes
        const meshRand = Math.floor(Math.random()*nextMeshOptions.length)
        const nextMesh = nextMeshOptions[meshRand]
        const logData = {
            epsilon: EPSILON,
            exploreValue: rand,
            nextCluster: logCluster(nextCluster),
            nextMesh 
        }
        logger.log('info', 'chooseNextMesh success', { ...logData })
        return nextMesh
    } else {
        const logData = {
            epsilon: EPSILON,
            exploreValue: rand,
        }
        logger.log('info', 'chooseNextMesh failure', { ...logData })
        return undefined
    }
}

module.exports.chooseNextMesh = chooseNextMesh