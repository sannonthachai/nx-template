import * as dotenv from 'dotenv'
dotenv.config()

const {
    AWS_ACCESS_KEY,
    AWS_BUCKET,
    AWS_SECRET_ACCESS_KEY,
    AWS_URL_CLOUDFRONT,
    NODE_ENV
} = process.env

export {
    AWS_ACCESS_KEY,
    AWS_BUCKET,
    AWS_SECRET_ACCESS_KEY,
    AWS_URL_CLOUDFRONT,
    NODE_ENV
}