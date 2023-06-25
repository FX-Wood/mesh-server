import { PrismaClient } from '@prisma/client';
import * as csv from 'csv-parse'
import fs from 'fs'

if (process.env.SEED_MODE !== 'seed') {
    const csv_data = []
    const javascriptData = []
    
    const prisma = new PrismaClient()
    const buf = fs.createReadStream('./data/cluster_df_test_cluster_data.csv')
        .pipe(csv.parse({ delimiter: ',', from_line: 2}))
        .on("data", function (row) {
                const clusterId = Number(row[0])
                const meshes = JSON.parse(row[1])
                const reward = 0
                const cluster = {
                    id: clusterId,
                    meshes,
                    reward
                }
                javascriptData.push(cluster)
        })
        
    setTimeout(async () => {
        fs.writeFileSync('./data/cluster-df-test.json', JSON.stringify(javascriptData, undefined, 2))
        let count = 0;
        for (let cluster of javascriptData) {
            count++
            const meshIds = cluster.meshes
            const id = cluster.id
            const meshes = meshIds.map(id => ({
                id,
                data: JSON.stringify({ 'model': 'asdfasdfasdfasdfasdfasdfasdf' }),
                p0: 0,
                p1: 0,
                p2: 0,
                p3: 0,
                p4: 0,
                p5: 0
            }))
            const res = await prisma.cluster.create({
                    data: {
                    meshes: {
                        create: meshes
                    },
                    rewardValue: 0
                }
            })
            console.log(res)
            console.log(count, 'count')
        }
    }, 2000)    
}
