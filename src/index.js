/* @flow */
'use strict'

import startServer from './server'

export default function () {
  const owner = 'dignifiedquire'
  const repo = 'realeaser'
  const secret = process.env.GH_SECRET
  if (!secret) {
    throw new Error('Missing $GH_SECRET')
  }
  const port = 5000
  const host = '0.0.0.0'

  const server = startServer(owner, repo, secret)
  server.listen(port, host)

  console.log('Listening on %s:%d/webhook', host, port)
}
