const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()


const main = async () => {
    // const mesh = await prisma.mesh.findFirst({
    //     where: {
    //         id: 1999
    //     }
    // })
    // console.log(mesh)
    const clusters = await prisma.cluster.findMany()
    console.log(clusters)
}

main()

