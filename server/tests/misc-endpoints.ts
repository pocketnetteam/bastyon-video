/* eslint-disable @typescript-eslint/no-unused-expressions,@typescript-eslint/require-await */

import 'mocha'
import * as chai from 'chai'
import { cleanupTests, createSingleServer, makeGetRequest, PeerTubeServer, setAccessTokensToServers } from '@shared/server-commands'
import { HttpStatusCode } from '@shared/models'

const expect = chai.expect

describe('Test misc endpoints', function () {
  let server: PeerTubeServer

  before(async function () {
    this.timeout(120000)

    server = await createSingleServer(1)
    await setAccessTokensToServers([ server ])
  })

  describe('Test a well known endpoints', function () {

    it('Should get security.txt', async function () {
      const res = await makeGetRequest({
        url: server.url,
        path: '/.well-known/security.txt',
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(res.text).to.contain('security issue')
    })

    it('Should get nodeinfo', async function () {
      const res = await makeGetRequest({
        url: server.url,
        path: '/.well-known/nodeinfo',
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(res.body.links).to.be.an('array')
      expect(res.body.links).to.have.lengthOf(1)
      expect(res.body.links[0].rel).to.equal('http://nodeinfo.diaspora.software/ns/schema/2.0')
    })

    it('Should get dnt policy text', async function () {
      const res = await makeGetRequest({
        url: server.url,
        path: '/.well-known/dnt-policy.txt',
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(res.text).to.contain('http://www.w3.org/TR/tracking-dnt')
    })

    it('Should get dnt policy', async function () {
      const res = await makeGetRequest({
        url: server.url,
        path: '/.well-known/dnt',
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(res.body.tracking).to.equal('N')
    })

    it('Should get change-password location', async function () {
      const res = await makeGetRequest({
        url: server.url,
        path: '/.well-known/change-password',
        expectedStatus: HttpStatusCode.FOUND_302
      })

      expect(res.header.location).to.equal('/my-account/settings')
    })

    it('Should test webfinger', async function () {
      const resource = 'acct:peertube@' + server.host
      const accountUrl = server.url + '/accounts/peertube'

      const res = await makeGetRequest({
        url: server.url,
        path: '/.well-known/webfinger?resource=' + resource,
        expectedStatus: HttpStatusCode.OK_200
      })

      const data = res.body

      expect(data.subject).to.equal(resource)
      expect(data.aliases).to.contain(accountUrl)

      const self = data.links.find(l => l.rel === 'self')
      expect(self).to.exist
      expect(self.type).to.equal('application/activity+json')
      expect(self.href).to.equal(accountUrl)

      const remoteInteract = data.links.find(l => l.rel === 'http://ostatus.org/schema/1.0/subscribe')
      expect(remoteInteract).to.exist
      expect(remoteInteract.template).to.equal(server.url + '/remote-interaction?uri={uri}')
    })
  })

  describe('Test classic static endpoints', function () {

    it('Should get robots.txt', async function () {
      const res = await makeGetRequest({
        url: server.url,
        path: '/robots.txt',
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(res.text).to.contain('User-agent')
    })

    it('Should get security.txt', async function () {
      await makeGetRequest({
        url: server.url,
        path: '/security.txt',
        expectedStatus: HttpStatusCode.MOVED_PERMANENTLY_301
      })
    })

    it('Should get nodeinfo', async function () {
      const res = await makeGetRequest({
        url: server.url,
        path: '/nodeinfo/2.0.json',
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(res.body.software.name).to.equal('peertube')
      expect(res.body.usage.users.activeMonth).to.equal(1)
      expect(res.body.usage.users.activeHalfyear).to.equal(1)
    })
  })

  describe('Test bots endpoints', function () {

    it('Should not serve a sitemap', async function () {
      await makeGetRequest({
        url: server.url,
        path: '/sitemap.xml',
        expectedStatus: HttpStatusCode.NOT_FOUND_404
      })
    })
  })

  after(async function () {
    await cleanupTests([ server ])
  })
})
