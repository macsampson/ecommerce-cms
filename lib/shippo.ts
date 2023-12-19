import shippo from "shippo"

const shippoClient = shippo(process.env.SHIPPO_API_KEY as string)
// const shippoClient = shippo(process.env.SHIPPO_LIVE_API_KEY as string)

export default shippoClient
