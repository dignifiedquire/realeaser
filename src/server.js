/* @flow */
'use strict'

import http from 'http'
import Handler from './webhook-handler'
import createMilestone from './create-milestone'

export default function (owner: string, repo: string, secret: string): http.Server {
  const handler = new Handler({
    path: '/webhook',
    secret,
    events: ['milestone', 'ping']
  })

  const server = http.createServer((req, res) => {
    handler.handle(req, res, () => {
      res.statusCode = 404
      res.end('no such location')
    })
  })

  handler.on('error', (err) => {
    console.error('Error:', err.message)
  })

  handler.on('milestone', (event) => {
    console.log('Received a milestone event')

    const {payload} = event
    const {action, milestone} = payload
    if (action !== 'closed') {
      return
    }

    const version = milestone.title
    createMilestone(owner, repo, version)
      .then(() => {
        console.log('Crated follow up milestone')
      })
      .catch((err) => {
        console.error(err)
      })
  })

  return server
}
