import { updateReward, chooseNextMesh } from "../src/lib/rewardLoop.mjs";
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

if (process.env.SEED_MODE !== 'seed') {
    const main = async () => {
        const mesh = await prisma.mesh.findFirst({
            where: {
                id: 1
            }
        })
        //console.log("meshId:",mesh.id, "clusterId:", mesh.clusterId)

        const res = await updateReward(mesh.id, true)
        //console.log('done', res)

        const newPick = await chooseNextMesh()
        console.log('newPick', newPick)
    }
    


    main()
}

