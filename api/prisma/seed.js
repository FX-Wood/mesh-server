const { PrismaClient } = require('@prisma/client');
const csv = require('csv-parse')
const fs = require('fs')

const CLUSTER_2K_PATH = './data/2k-option-dataset/cluster_df_test.csv'
const CLUSTER_100_PATH = './data/100-option-dataset/cluster_df_test_cluster_data.csv'

const javascriptData = []

const prisma = new PrismaClient()

fs.createReadStream(CLUSTER_2K_PATH)
    .pipe(csv.parse({ delimiter: ',', from_line: 2}))
    .on("data", function (row) {
            const clusterId = Number(row[0])
            const meshes = JSON.parse(row[1])
            const reward = JSON.parse(row[2])
            const cluster = {
                id: clusterId,
                meshes,
                rewardValue: reward
            }
            javascriptData.push(cluster)
    })

setTimeout(async () => {
    console.log(javascriptData.length, 'length')
    fs.writeFileSync('./data/2k-cluster.json', JSON.stringify(javascriptData, undefined, 2))
    let clusterCount = 0;
    let meshCount = 0;
    for (let cluster of javascriptData) {
        clusterCount++
        meshCount += cluster.meshes.length

        const meshIds = cluster.meshes
        const meshes = meshIds.map(id => ({
            id,
            data: `mesh2k/${id}.obj`,
            p0: 0,
            p1: 0,
            p2: 0,
            p3: 0,
            p4: 0,
            p5: 0
        }))
        const res = await prisma.cluster.create({
                data: {
                id: cluster.id,
                meshes: {
                    create: meshes
                },
                rewardValue: cluster.rewardValue
            }
        })
        console.log({ clusterId: cluster.id, clusterCount, meshCount})
    }
}, 2 * 1000)
