// import { consumer } from "."
import { createWallet } from "./util.js"

const data = {
    "Records": [
        {
            "messageId": "ab6d2db3-3bf2-4f23-94eb-1ea2e7b9aee4",
            "receiptHandle": "AQEBgNUj4V4qNMvaCaz0CnuzK4JL4ai5ryyNmGLzLzFOBpCCMGD+VFMjdlfImvUeX8IyexRw+1NyaWVG2uciHm929hEq2X8+K1g5oXeYr16nAdHPIVx4DEpulSQqYay7iwM6iGuFAq5Hv6DDDofje0ioxHXDNVhsOImZprcq0dgrfWKevdd0CWbaXZFghNEALXJSh+3yT3kNkaLH2Qo6FqfNbrSp5zS3nAVYdEKjV5WtZDLozZ73gjOgXB+N2JmerS6KcP8UvhNCCxJ5ZdNLsiTKblSJ2KLeCvJY0J6RWYKDlUFRmtdcQokMTX0lHQB9RcX2I4y+UY4JoiyPwW6TSqZx6NbedkHLe4FppZdL3adGT3dGE8Xnxis+LekKM+HzW/ba02SQSdFMXm4bos4dj/WiGdHwQ+8ow+iBOhQc3QNe4wE=",
            "body": JSON.stringify({
                "hello": "world"
            }),
            "attributes": {
                "ApproximateReceiveCount": "1",
                "AWSTraceHeader": "Root=1-67a4847a-3c84f85b25163b1d2509dd8b;Parent=79883c022efdc8cf;Sampled=0;Lineage=1:a484993a:0",
                "SentTimestamp": "1738835067812",
                "SenderId": "AROAVFUCWL6N6MPNLP2UL:payphone-queue-dev-producer",
                "ApproximateFirstReceiveTimestamp": "1738835067821"
            },
            "messageAttributes": {},
            "md5OfBody": "31d3a8830dfb4dd8009700b6a2c379d5",
            "eventSource": "aws:sqs",
            "eventSourceARN": "arn:aws:sqs:ap-southeast-1:355682639771:payphone-queue-dev-jobs",
            "awsRegion": "ap-southeast-1"
        }
    ]
}

// createWallet()
//     .then(process.exit)
//     .catch(console.error)


import * as index from './index.js'

// console.log(await index.api)
index.app.listen(3000, () => {
    console.log('Server is running on port 3000')
})