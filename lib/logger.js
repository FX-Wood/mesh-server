// shamelessly stolen from: https://javascript.plainenglish.io/set-up-a-logger-for-your-node-app-with-winston-and-cloudwatch-in-5-minutes-dec0c6c0d5b8
const winston = require('winston')
const WinstonCloudWatch = require('winston-cloudwatch')
const os = require('os')
const customFormatter = ({ level, message, data }) =>    `[${level}] : ${message} \nData: ${JSON.stringify(data)}}`
const logger = new winston.createLogger({
    format: winston.format.json(),
    transports: [
        new (winston.transports.Console)({
            timestamp: true,
            colorize: true,
            messageFormatter: customFormatter
        })
   ]
});
if (process.env.NODE_ENV === 'production' && process.env.HOSTING_ENV !== 'heroku') {
    const hostname = os.hostname()
    const cloudwatchConfig = {
        logGroupName: process.env.CLOUDWATCH_GROUP_NAME,
        logStreamName: `${process.env.CLOUDWATCH_GROUP_NAME}-${hostname}`,
        awsOptions: {
            credentials: {
                accessKeyId: process.env.CLOUDWATCH_ACCESS_KEY,
                secretAccessKey: process.env.CLOUDWATCH_SECRET_ACCESS_KEY,
            },
            region: process.env.CLOUDWATCH_REGION,
        },
        messageFormatter: customFormatter
    }
    logger.add(new WinstonCloudWatch(cloudwatchConfig))
}

const logCluster = (cluster) => {
    cluster.meshes = cluster.meshes.map(mesh => mesh.id)
    return cluster
}
module.exports.logCluster = logCluster
module.exports.logger = logger;