/* @flow */
'use strict'

import http from 'http'
import createHandler from 'github-webhook-handler'

export default function (owner: string, repo: string, secret: string): http.Server {
  const handler = createHandler({
    path: '/webhook',
    secret
  })

  const server = http.createServer((req, res) => {
    handler(req, res, () => {
      res.statusCode = 404
      res.end('no such location')
    })
  })

  handler.on('error', (err) => {
    console.error('Error:', err.message)
  })

  handler.on('milestone', (event) => {
    console.log('Received a milestone event')
    console.log(JSON.stringify(event))
  })

  return server
}
