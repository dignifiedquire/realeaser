/* @flow */
'use strict'

import startServer from './server'

export default function () {
  const owner = 'dignifiedquire'
  const repo = 'realeaser'
  const secret = 'a6d2987debf3cf4f5e59c2464c933ff47b6ba7301d21f516ea3826086ce6e49f'
  const addr = '0.0.0.0:7777'

  const server = startServer(owner, repo, secret)
  server.listen(addr)

  console.log('Listening on %s/webhook', addr)
}
