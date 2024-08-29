const { updateReward, chooseNextMesh } = require("../src/lib/rewardLoop.mjs");
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()


const main = async () => {
    const mesh = await prisma.mesh.findFirst({
        where: {
            id: 1
        }
    })
    //console.log("meshId:",mesh.id, "clusterId:", mesh.clusterId)

    await updateReward(mesh.id, true)
    //console.log('done', res)

    const newPick = await chooseNextMesh()
    console.log('newPick', newPick)
}

main()


