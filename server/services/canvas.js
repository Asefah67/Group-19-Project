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


const fakeDatabase = {
  groups: [],
  users: [],
};

let groupIdCounter = 1;

export function fakeFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const { method = 'GET' } = options;
        const path = new URL(url, 'http://localhost').pathname;
        const body = options.body ? JSON.parse(options.body) : {};

        // GET /api/groups
        if (method === 'GET' && path === '/api/groups') {
          return resolve(
            new Response(JSON.stringify(fakeDatabase.groups), { status: 200 })
          );
        }

        // POST /api/groups
        if (method === 'POST' && path === '/api/groups') {
          const newGroup = { id: groupIdCounter++, ...body, members: [] };
          fakeDatabase.groups.push(newGroup);
          return resolve(
            new Response(JSON.stringify(newGroup), { status: 201 })
          );
        }

        throw new Error('Not Found');
      } catch (err) {
        return resolve(
          new Response(JSON.stringify({ error: err.message }), {
            status: 500,
          })
        );
      }
    }, 400); 
  });
}

window.fetch = fakeFetch;