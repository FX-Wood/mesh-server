const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()


const main = async () => {
    const meshes = await prisma.mesh.findMany()
}

main()

