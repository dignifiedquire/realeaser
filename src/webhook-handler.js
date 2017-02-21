'use strict'
/* @flow */
// adapted from https://github.com/rvagg/github-webhook-handler/blob/master/github-webhook-handler.js

import EventEmitter from 'events'
import crypto from 'crypto'
import bl from 'bl'
import bufferEq from 'buffer-equal-constant-time'
import http from 'http'
import qs from 'qs'

function signBlob (key: string, blob: Buffer): string {
  return 'sha1=' + crypto.createHmac('sha1', key).update(blob).digest('hex')
}

type Config = {
  path: string,
  secret: string,
  events: Array<string>
}

type Event = {
  event: string,
  id: number,
  payload: Object,
  protocol: string,
  host: string,
  url: string
}

class Handler extends EventEmitter {
  events: Array<string>
  path: string
  secret: string

  constructor (options: Config) {
    super()

    if (options.events.indexOf('*') === -1) {
      this.events = options.events
    }

    this.path = options.path
    this.secret = options.secret
  }

  handle (req: http.IncomingMessage, res: http.ServerResponse, callback: (err?: Error, ev?: Event) => void): void {
    if (req.url.split('?').shift() !== this.path) {
      return callback()
    }

    const hasError = (msg: string) => {
      res.writeHead(400, {
        'content-type': 'application/json'
      })

      res.end(JSON.stringify({
        error: msg
      }))

      const err = new Error(msg)
      console.error(err, req.headers, req.url)
      this.emit('error', err, req)
      callback(err)
    }

    const sig = req.headers['x-hub-signature']
    const event = req.headers['x-github-event']
    const id = req.headers['x-github-delivery']

    if (!sig) {
      return hasError('No X-Hub-Signature found on request')
    }

    if (!event) {
      return hasError('No X-Github-Event found on request')
    }

    if (!id) {
      return hasError('No X-Github-Delivery found on request')
    }

    if (this.events && this.events.indexOf(event) === -1) {
      return hasError('X-Github-Event is not acceptable')
    }

    req.pipe(bl((err, data) => {
      if (err) {
        return hasError(err.message)
      }

      const computedSig = new Buffer(signBlob(this.secret, data))

      if (!bufferEq(new Buffer(sig), computedSig)) {
        return hasError('X-Hub-Signature does not match blob signature')
      }

      let payload
      try {
        payload = qs.parse(data.toString()).payload
      } catch (e) {
        return hasError(e)
      }

      let obj
      try {
        obj = JSON.parse(payload)
      } catch (e) {
        console.error('failed to parse', payload)
        return hasError(e)
      }

      res.writeHead(200, {
        'content-type': 'application/json'
      })

      res.end('{"ok":true}')

      const emitData = {
        event: event,
        id: id,
        payload: obj,
        host: req.headers['host'],
        url: req.url
      }

      this.emit(event, emitData)
      this.emit('*', emitData)
    }))
  }
}

export default Handler
