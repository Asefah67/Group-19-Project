import 'dotenv/config'
import { getSelf } from 'node-canvas-api'

try {
  const user = await getSelf()
  console.log(user)
} catch (err) {
  console.error(err)
}