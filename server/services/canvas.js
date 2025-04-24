import 'dotenv/config';
import { getSelf } from 'node-canvas-api';

export async function fetchSelf() {
  try {
    return await getSelf();
  } catch (err) {
    console.error('Canvas API error:', err);
    throw err;
  }
}
