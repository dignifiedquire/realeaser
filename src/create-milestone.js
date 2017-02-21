/* @flow */
'use strict'

import GithubApi from 'github'
import Listr from 'listr'
import semver from 'semver'

const githubConfig = {
  protocol: 'https',
  Promise: Promise,
  timeout: 5000
}

function checklist (version: string): string {
  return `
## Release v${version} :1st_place_medal:

- [ ] first
- [ ] second
- [ ] third

:tada: Benefit
`.trim()
}

function fetchOauthToken (): string {
  const token = process.env.GH_TOKEN || ''

  if (token === '') {
    throw new Error('Missing $GH_TOKEN to login with github')
  }

  return token
}

export default async function async (owner: string, repo: string, latest: string): Promise<void> {
  const github = new GithubApi(githubConfig)
  const version = semver.inc(latest, 'patch')

  const tasks = new Listr([{
    title: 'Authenticate',
    task (ctx) {
      return github.authenticate({
        type: 'oauth',
        token: fetchOauthToken()
      })
    }
  }, {
    title: 'Create Milestone',
    async task (ctx, task) {
      const milestone = await github.issues.createMilestone({
        owner,
        repo,
        title: version
      })
      console.log('Created milestone %s', milestone.data.html_url)
      ctx.milestone = milestone.data
      task.title = `Created ${milestone.data.html_url}`
    }
  }, {
    title: 'Create Issue',
    async task (ctx, task) {
      const {milestone} = ctx
      const issue = await github.issues.create({
        owner,
        repo,
        milestone: milestone.number,
        title: `Checklist for v${version}`,
        body: checklist(version)
      })
      task.title = `Created ${issue.data.html_url}`
    }
  }])

  tasks.run()
}
