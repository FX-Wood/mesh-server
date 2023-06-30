const { PrismaClient } = require('@prisma/client');
const csv = require('csv-parse')
const fs = require('fs')

const javascriptData = []
fs.createReadStream('./data/100-option-dataset/final_df_test_mesh_data.csv')
        .pipe(csv.parse({ delimiter: ',', from_line: 2}))
        .on("data", function (row) {
            const mesh = {
                id: JSON.parse(row[0]),
                p0: JSON.parse(row[1]),
                p1: JSON.parse(row[2]),
                p2: JSON.parse(row[3]),
                p3: JSON.parse(row[4]),
                p4: JSON.parse(row[5]),
                p5: JSON.parse(row[6])
            }
            javascriptData.push(mesh)
        })

setTimeout(async () => {
    fs.writeFileSync('./data/cluster-df-test-mesh.json', JSON.stringify(javascriptData, undefined, 2))
    const prisma = new PrismaClient()

        for (let mesh of javascriptData) {
            console.log('working on ')
            try {
                const res = await prisma.mesh.update({
                    where: {
                        id: mesh.id
                    },
                    data: {
                        ...mesh
                    }
                })
                console.log(res)
            } catch(err) {
                console.error(err)
            }

    }
}, 10 * 1000)