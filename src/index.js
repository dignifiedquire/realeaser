/* @flow */
'use strict'

import startServer from './server'

export default function () {
  const owner = 'dignifiedquire'
  const repo = 'realeaser'
  const secret = 'a6d2987debf3cf4f5e59c2464c933ff47b6ba7301d21f516ea3826086ce6e49f'
  const port = 5000
  const host = '0.0.0.0'

  const server = startServer(owner, repo, secret)
  server.listen(port, host)

  console.log('Listening on %s:%d/webhook', host, port)
}
