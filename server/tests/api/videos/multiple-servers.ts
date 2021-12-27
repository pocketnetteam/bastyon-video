/* eslint-disable @typescript-eslint/no-unused-expressions,@typescript-eslint/require-await */

import 'mocha'
import * as chai from 'chai'
import request from 'supertest'
import {
  buildAbsoluteFixturePath,
  checkTmpIsEmpty,
  checkVideoFilesWereRemoved,
  cleanupTests,
  completeVideoCheck,
  createMultipleServers,
  dateIsValid,
  doubleFollow,
  PeerTubeServer,
  saveVideoInServers,
  setAccessTokensToServers,
  testImage,
  wait,
  waitJobs,
  webtorrentAdd
} from '@shared/extra-utils'
import { HttpStatusCode, VideoCommentThreadTree, VideoPrivacy } from '@shared/models'

const expect = chai.expect

describe('Test multiple servers', function () {
  let servers: PeerTubeServer[] = []
  const toRemove = []
  let videoUUID = ''
  let videoChannelId: number

  before(async function () {
    this.timeout(120000)

    servers = await createMultipleServers(3)

    // Get the access tokens
    await setAccessTokensToServers(servers)

    {
      const videoChannel = {
        name: 'super_channel_name',
        displayName: 'my channel',
        description: 'super channel'
      }
      await servers[0].channels.create({ attributes: videoChannel })
      const { data } = await servers[0].channels.list({ start: 0, count: 1 })
      videoChannelId = data[0].id
    }

    // Server 1 and server 2 follow each other
    await doubleFollow(servers[0], servers[1])
    // Server 1 and server 3 follow each other
    await doubleFollow(servers[0], servers[2])
    // Server 2 and server 3 follow each other
    await doubleFollow(servers[1], servers[2])
  })

  it('Should not have videos for all servers', async function () {
    for (const server of servers) {
      const { data } = await server.videos.list()
      expect(data).to.be.an('array')
      expect(data.length).to.equal(0)
    }
  })

  describe('Should upload the video and propagate on each server', function () {
    it('Should upload the video on server 1 and propagate on each server', async function () {
      this.timeout(25000)

      const attributes = {
        name: 'my super name for server 1',
        category: 5,
        licence: 4,
        language: 'ja',
        nsfw: true,
        description: 'my super description for server 1',
        support: 'my super support text for server 1',
        originallyPublishedAt: '2019-02-10T13:38:14.449Z',
        tags: [ 'tag1p1', 'tag2p1' ],
        channelId: videoChannelId,
        fixture: 'video_short1.webm'
      }
      await servers[0].videos.upload({ attributes })

      await waitJobs(servers)

      // All servers should have this video
      let publishedAt: string = null
      for (const server of servers) {
        const isLocal = server.port === servers[0].port
        const checkAttributes = {
          name: 'my super name for server 1',
          category: 5,
          licence: 4,
          language: 'ja',
          nsfw: true,
          description: 'my super description for server 1',
          support: 'my super support text for server 1',
          originallyPublishedAt: '2019-02-10T13:38:14.449Z',
          account: {
            name: 'root',
            host: 'localhost:' + servers[0].port
          },
          isLocal,
          publishedAt,
          duration: 10,
          tags: [ 'tag1p1', 'tag2p1' ],
          privacy: VideoPrivacy.PUBLIC,
          commentsEnabled: true,
          downloadEnabled: true,
          channel: {
            displayName: 'my channel',
            name: 'super_channel_name',
            description: 'super channel',
            isLocal
          },
          fixture: 'video_short1.webm',
          files: [
            {
              resolution: 720,
              size: 572456
            }
          ]
        }

        const { data } = await server.videos.list()
        expect(data).to.be.an('array')
        expect(data.length).to.equal(1)
        const video = data[0]

        await completeVideoCheck(server, video, checkAttributes)
        publishedAt = video.publishedAt as string
      }
    })

    it('Should upload the video on server 2 and propagate on each server', async function () {
      this.timeout(100000)

      const user = {
        username: 'user1',
        password: 'super_password'
      }
      await servers[1].users.create({ username: user.username, password: user.password })
      const userAccessToken = await servers[1].login.getAccessToken(user)

      const attributes = {
        name: 'my super name for server 2',
        category: 4,
        licence: 3,
        language: 'de',
        nsfw: true,
        description: 'my super description for server 2',
        support: 'my super support text for server 2',
        tags: [ 'tag1p2', 'tag2p2', 'tag3p2' ],
        fixture: 'video_short2.webm',
        thumbnailfile: 'thumbnail.jpg',
        previewfile: 'preview.jpg'
      }
      await servers[1].videos.upload({ token: userAccessToken, attributes, mode: 'resumable' })

      // Transcoding
      await waitJobs(servers)

      // All servers should have this video
      for (const server of servers) {
        const isLocal = server.url === 'http://localhost:' + servers[1].port
        const checkAttributes = {
          name: 'my super name for server 2',
          category: 4,
          licence: 3,
          language: 'de',
          nsfw: true,
          description: 'my super description for server 2',
          support: 'my super support text for server 2',
          account: {
            name: 'user1',
            host: 'localhost:' + servers[1].port
          },
          isLocal,
          commentsEnabled: true,
          downloadEnabled: true,
          duration: 5,
          tags: [ 'tag1p2', 'tag2p2', 'tag3p2' ],
          privacy: VideoPrivacy.PUBLIC,
          channel: {
            displayName: 'Main user1 channel',
            name: 'user1_channel',
            description: 'super channel',
            isLocal
          },
          fixture: 'video_short2.webm',
          files: [
            {
              resolution: 240,
              size: 270000
            },
            {
              resolution: 360,
              size: 359000
            },
            {
              resolution: 480,
              size: 465000
            },
            {
              resolution: 720,
              size: 788000
            }
          ],
          thumbnailfile: 'thumbnail',
          previewfile: 'preview'
        }

        const { data } = await server.videos.list()
        expect(data).to.be.an('array')
        expect(data.length).to.equal(2)
        const video = data[1]

        await completeVideoCheck(server, video, checkAttributes)
      }
    })

    it('Should upload two videos on server 3 and propagate on each server', async function () {
      this.timeout(45000)

      {
        const attributes = {
          name: 'my super name for server 3',
          category: 6,
          licence: 5,
          language: 'de',
          nsfw: true,
          description: 'my super description for server 3',
          support: 'my super support text for server 3',
          tags: [ 'tag1p3' ],
          fixture: 'video_short3.webm'
        }
        await servers[2].videos.upload({ attributes })
      }

      {
        const attributes = {
          name: 'my super name for server 3-2',
          category: 7,
          licence: 6,
          language: 'ko',
          nsfw: false,
          description: 'my super description for server 3-2',
          support: 'my super support text for server 3-2',
          tags: [ 'tag2p3', 'tag3p3', 'tag4p3' ],
          fixture: 'video_short.webm'
        }
        await servers[2].videos.upload({ attributes })
      }

      await waitJobs(servers)

      // All servers should have this video
      for (const server of servers) {
        const isLocal = server.url === 'http://localhost:' + servers[2].port
        const { data } = await server.videos.list()

        expect(data).to.be.an('array')
        expect(data.length).to.equal(4)

        // We not sure about the order of the two last uploads
        let video1 = null
        let video2 = null
        if (data[2].name === 'my super name for server 3') {
          video1 = data[2]
          video2 = data[3]
        } else {
          video1 = data[3]
          video2 = data[2]
        }

        const checkAttributesVideo1 = {
          name: 'my super name for server 3',
          category: 6,
          licence: 5,
          language: 'de',
          nsfw: true,
          description: 'my super description for server 3',
          support: 'my super support text for server 3',
          account: {
            name: 'root',
            host: 'localhost:' + servers[2].port
          },
          isLocal,
          duration: 5,
          commentsEnabled: true,
          downloadEnabled: true,
          tags: [ 'tag1p3' ],
          privacy: VideoPrivacy.PUBLIC,
          channel: {
            displayName: 'Main root channel',
            name: 'root_channel',
            description: '',
            isLocal
          },
          fixture: 'video_short3.webm',
          files: [
            {
              resolution: 720,
              size: 292677
            }
          ]
        }
        await completeVideoCheck(server, video1, checkAttributesVideo1)

        const checkAttributesVideo2 = {
          name: 'my super name for server 3-2',
          category: 7,
          licence: 6,
          language: 'ko',
          nsfw: false,
          description: 'my super description for server 3-2',
          support: 'my super support text for server 3-2',
          account: {
            name: 'root',
            host: 'localhost:' + servers[2].port
          },
          commentsEnabled: true,
          downloadEnabled: true,
          isLocal,
          duration: 5,
          tags: [ 'tag2p3', 'tag3p3', 'tag4p3' ],
          privacy: VideoPrivacy.PUBLIC,
          channel: {
            displayName: 'Main root channel',
            name: 'root_channel',
            description: '',
            isLocal
          },
          fixture: 'video_short.webm',
          files: [
            {
              resolution: 720,
              size: 218910
            }
          ]
        }
        await completeVideoCheck(server, video2, checkAttributesVideo2)
      }
    })
  })

  describe('It should list local videos', function () {
    it('Should list only local videos on server 1', async function () {
      const { data, total } = await servers[0].videos.list({ filter: 'local' })

      expect(total).to.equal(1)
      expect(data).to.be.an('array')
      expect(data.length).to.equal(1)
      expect(data[0].name).to.equal('my super name for server 1')
    })

    it('Should list only local videos on server 2', async function () {
      const { data, total } = await servers[1].videos.list({ filter: 'local' })

      expect(total).to.equal(1)
      expect(data).to.be.an('array')
      expect(data.length).to.equal(1)
      expect(data[0].name).to.equal('my super name for server 2')
    })

    it('Should list only local videos on server 3', async function () {
      const { data, total } = await servers[2].videos.list({ filter: 'local' })

      expect(total).to.equal(2)
      expect(data).to.be.an('array')
      expect(data.length).to.equal(2)
      expect(data[0].name).to.equal('my super name for server 3')
      expect(data[1].name).to.equal('my super name for server 3-2')
    })
  })

  describe('Should seed the uploaded video', function () {
    it('Should add the file 1 by asking server 3', async function () {
      this.timeout(10000)

      const { data } = await servers[2].videos.list()

      const video = data[0]
      toRemove.push(data[2])
      toRemove.push(data[3])

      const videoDetails = await servers[2].videos.get({ id: video.id })
      const torrent = await webtorrentAdd(videoDetails.files[0].magnetUri, true)
      expect(torrent.files).to.be.an('array')
      expect(torrent.files.length).to.equal(1)
      expect(torrent.files[0].path).to.exist.and.to.not.equal('')
    })

    it('Should add the file 2 by asking server 1', async function () {
      this.timeout(10000)

      const { data } = await servers[0].videos.list()

      const video = data[1]
      const videoDetails = await servers[0].videos.get({ id: video.id })

      const torrent = await webtorrentAdd(videoDetails.files[0].magnetUri, true)
      expect(torrent.files).to.be.an('array')
      expect(torrent.files.length).to.equal(1)
      expect(torrent.files[0].path).to.exist.and.to.not.equal('')
    })

    it('Should add the file 3 by asking server 2', async function () {
      this.timeout(10000)

      const { data } = await servers[1].videos.list()

      const video = data[2]
      const videoDetails = await servers[1].videos.get({ id: video.id })

      const torrent = await webtorrentAdd(videoDetails.files[0].magnetUri, true)
      expect(torrent.files).to.be.an('array')
      expect(torrent.files.length).to.equal(1)
      expect(torrent.files[0].path).to.exist.and.to.not.equal('')
    })

    it('Should add the file 3-2 by asking server 1', async function () {
      this.timeout(10000)

      const { data } = await servers[0].videos.list()

      const video = data[3]
      const videoDetails = await servers[0].videos.get({ id: video.id })

      const torrent = await webtorrentAdd(videoDetails.files[0].magnetUri)
      expect(torrent.files).to.be.an('array')
      expect(torrent.files.length).to.equal(1)
      expect(torrent.files[0].path).to.exist.and.to.not.equal('')
    })

    it('Should add the file 2 in 360p by asking server 1', async function () {
      this.timeout(10000)

      const { data } = await servers[0].videos.list()

      const video = data.find(v => v.name === 'my super name for server 2')
      const videoDetails = await servers[0].videos.get({ id: video.id })

      const file = videoDetails.files.find(f => f.resolution.id === 360)
      expect(file).not.to.be.undefined

      const torrent = await webtorrentAdd(file.magnetUri)
      expect(torrent.files).to.be.an('array')
      expect(torrent.files.length).to.equal(1)
      expect(torrent.files[0].path).to.exist.and.to.not.equal('')
    })
  })

  describe('Should update video views, likes and dislikes', function () {
    let localVideosServer3 = []
    let remoteVideosServer1 = []
    let remoteVideosServer2 = []
    let remoteVideosServer3 = []

    before(async function () {
      {
        const { data } = await servers[0].videos.list()
        remoteVideosServer1 = data.filter(video => video.isLocal === false).map(video => video.uuid)
      }

      {
        const { data } = await servers[1].videos.list()
        remoteVideosServer2 = data.filter(video => video.isLocal === false).map(video => video.uuid)
      }

      {
        const { data } = await servers[2].videos.list()
        localVideosServer3 = data.filter(video => video.isLocal === true).map(video => video.uuid)
        remoteVideosServer3 = data.filter(video => video.isLocal === false).map(video => video.uuid)
      }
    })

    it('Should view multiple videos on owned servers', async function () {
      this.timeout(30000)

      await servers[2].videos.view({ id: localVideosServer3[0] })
      await wait(1000)

      await servers[2].videos.view({ id: localVideosServer3[0] })
      await servers[2].videos.view({ id: localVideosServer3[1] })

      await wait(1000)

      await servers[2].videos.view({ id: localVideosServer3[0] })
      await servers[2].videos.view({ id: localVideosServer3[0] })

      await waitJobs(servers)

      // Wait the repeatable job
      await wait(6000)

      await waitJobs(servers)

      for (const server of servers) {
        const { data } = await server.videos.list()

        const video0 = data.find(v => v.uuid === localVideosServer3[0])
        const video1 = data.find(v => v.uuid === localVideosServer3[1])

        expect(video0.views).to.equal(3)
        expect(video1.views).to.equal(1)
      }
    })

    it('Should view multiple videos on each servers', async function () {
      this.timeout(45000)

      const tasks: Promise<any>[] = []
      tasks.push(servers[0].videos.view({ id: remoteVideosServer1[0] }))
      tasks.push(servers[1].videos.view({ id: remoteVideosServer2[0] }))
      tasks.push(servers[1].videos.view({ id: remoteVideosServer2[0] }))
      tasks.push(servers[2].videos.view({ id: remoteVideosServer3[0] }))
      tasks.push(servers[2].videos.view({ id: remoteVideosServer3[1] }))
      tasks.push(servers[2].videos.view({ id: remoteVideosServer3[1] }))
      tasks.push(servers[2].videos.view({ id: remoteVideosServer3[1] }))
      tasks.push(servers[2].videos.view({ id: localVideosServer3[1] }))
      tasks.push(servers[2].videos.view({ id: localVideosServer3[1] }))
      tasks.push(servers[2].videos.view({ id: localVideosServer3[1] }))

      await Promise.all(tasks)

      await waitJobs(servers)

      // Wait the repeatable job
      await wait(16000)

      await waitJobs(servers)

      let baseVideos = null

      for (const server of servers) {
        const { data } = await server.videos.list()

        // Initialize base videos for future comparisons
        if (baseVideos === null) {
          baseVideos = data
          continue
        }

        for (const baseVideo of baseVideos) {
          const sameVideo = data.find(video => video.name === baseVideo.name)
          expect(baseVideo.views).to.equal(sameVideo.views)
        }
      }
    })

    it('Should like and dislikes videos on different services', async function () {
      this.timeout(50000)

      await servers[0].videos.rate({ id: remoteVideosServer1[0], rating: 'like' })
      await wait(500)
      await servers[0].videos.rate({ id: remoteVideosServer1[0], rating: 'dislike' })
      await wait(500)
      await servers[0].videos.rate({ id: remoteVideosServer1[0], rating: 'like' })
      await servers[2].videos.rate({ id: localVideosServer3[1], rating: 'like' })
      await wait(500)
      await servers[2].videos.rate({ id: localVideosServer3[1], rating: 'dislike' })
      await servers[2].videos.rate({ id: remoteVideosServer3[1], rating: 'dislike' })
      await wait(500)
      await servers[2].videos.rate({ id: remoteVideosServer3[0], rating: 'like' })

      await waitJobs(servers)
      await wait(5000)
      await waitJobs(servers)

      let baseVideos = null
      for (const server of servers) {
        const { data } = await server.videos.list()

        // Initialize base videos for future comparisons
        if (baseVideos === null) {
          baseVideos = data
          continue
        }

        for (const baseVideo of baseVideos) {
          const sameVideo = data.find(video => video.name === baseVideo.name)
          expect(baseVideo.likes).to.equal(sameVideo.likes)
          expect(baseVideo.dislikes).to.equal(sameVideo.dislikes)
        }
      }
    })
  })

  describe('Should manipulate these videos', function () {
    it('Should update the video 3 by asking server 3', async function () {
      this.timeout(10000)

      const attributes = {
        name: 'my super video updated',
        category: 10,
        licence: 7,
        language: 'fr',
        nsfw: true,
        description: 'my super description updated',
        support: 'my super support text updated',
        tags: [ 'tag_up_1', 'tag_up_2' ],
        thumbnailfile: 'thumbnail.jpg',
        originallyPublishedAt: '2019-02-11T13:38:14.449Z',
        previewfile: 'preview.jpg'
      }

      await servers[2].videos.update({ id: toRemove[0].id, attributes })

      await waitJobs(servers)
    })

    it('Should have the video 3 updated on each server', async function () {
      this.timeout(10000)

      for (const server of servers) {
        const { data } = await server.videos.list()

        const videoUpdated = data.find(video => video.name === 'my super video updated')
        expect(!!videoUpdated).to.be.true

        const isLocal = server.url === 'http://localhost:' + servers[2].port
        const checkAttributes = {
          name: 'my super video updated',
          category: 10,
          licence: 7,
          language: 'fr',
          nsfw: true,
          description: 'my super description updated',
          support: 'my super support text updated',
          originallyPublishedAt: '2019-02-11T13:38:14.449Z',
          account: {
            name: 'root',
            host: 'localhost:' + servers[2].port
          },
          isLocal,
          duration: 5,
          commentsEnabled: true,
          downloadEnabled: true,
          tags: [ 'tag_up_1', 'tag_up_2' ],
          privacy: VideoPrivacy.PUBLIC,
          channel: {
            displayName: 'Main root channel',
            name: 'root_channel',
            description: '',
            isLocal
          },
          fixture: 'video_short3.webm',
          files: [
            {
              resolution: 720,
              size: 292677
            }
          ],
          thumbnailfile: 'thumbnail',
          previewfile: 'preview'
        }
        await completeVideoCheck(server, videoUpdated, checkAttributes)
      }
    })

    it('Should remove the videos 3 and 3-2 by asking server 3 and correctly delete files', async function () {
      this.timeout(30000)

      for (const id of [ toRemove[0].id, toRemove[1].id ]) {
        await saveVideoInServers(servers, id)

        await servers[2].videos.remove({ id })

        await waitJobs(servers)

        for (const server of servers) {
          await checkVideoFilesWereRemoved({ server, video: server.store.videoDetails })
        }
      }
    })

    it('Should have videos 1 and 3 on each server', async function () {
      for (const server of servers) {
        const { data } = await server.videos.list()

        expect(data).to.be.an('array')
        expect(data.length).to.equal(2)
        expect(data[0].name).not.to.equal(data[1].name)
        expect(data[0].name).not.to.equal(toRemove[0].name)
        expect(data[1].name).not.to.equal(toRemove[0].name)
        expect(data[0].name).not.to.equal(toRemove[1].name)
        expect(data[1].name).not.to.equal(toRemove[1].name)

        videoUUID = data.find(video => video.name === 'my super name for server 1').uuid
      }
    })

    it('Should get the same video by UUID on each server', async function () {
      let baseVideo = null
      for (const server of servers) {
        const video = await server.videos.get({ id: videoUUID })

        if (baseVideo === null) {
          baseVideo = video
          continue
        }

        expect(baseVideo.name).to.equal(video.name)
        expect(baseVideo.uuid).to.equal(video.uuid)
        expect(baseVideo.category.id).to.equal(video.category.id)
        expect(baseVideo.language.id).to.equal(video.language.id)
        expect(baseVideo.licence.id).to.equal(video.licence.id)
        expect(baseVideo.nsfw).to.equal(video.nsfw)
        expect(baseVideo.account.name).to.equal(video.account.name)
        expect(baseVideo.account.displayName).to.equal(video.account.displayName)
        expect(baseVideo.account.url).to.equal(video.account.url)
        expect(baseVideo.account.host).to.equal(video.account.host)
        expect(baseVideo.tags).to.deep.equal(video.tags)
      }
    })

    it('Should get the preview from each server', async function () {
      for (const server of servers) {
        const video = await server.videos.get({ id: videoUUID })

        await testImage(server.url, 'video_short1-preview.webm', video.previewPath)
      }
    })
  })

  describe('Should comment these videos', function () {
    let childOfFirstChild: VideoCommentThreadTree

    it('Should add comment (threads and replies)', async function () {
      this.timeout(25000)

      {
        const text = 'my super first comment'
        await servers[0].comments.createThread({ videoId: videoUUID, text })
      }

      {
        const text = 'my super second comment'
        await servers[2].comments.createThread({ videoId: videoUUID, text })
      }

      await waitJobs(servers)

      {
        const threadId = await servers[1].comments.findCommentId({ videoId: videoUUID, text: 'my super first comment' })

        const text = 'my super answer to thread 1'
        await servers[1].comments.addReply({ videoId: videoUUID, toCommentId: threadId, text })
      }

      await waitJobs(servers)

      {
        const threadId = await servers[2].comments.findCommentId({ videoId: videoUUID, text: 'my super first comment' })

        const body = await servers[2].comments.getThread({ videoId: videoUUID, threadId })
        const childCommentId = body.children[0].comment.id

        const text3 = 'my second answer to thread 1'
        await servers[2].comments.addReply({ videoId: videoUUID, toCommentId: threadId, text: text3 })

        const text2 = 'my super answer to answer of thread 1'
        await servers[2].comments.addReply({ videoId: videoUUID, toCommentId: childCommentId, text: text2 })
      }

      await waitJobs(servers)
    })

    it('Should have these threads', async function () {
      for (const server of servers) {
        const body = await server.comments.listThreads({ videoId: videoUUID })

        expect(body.total).to.equal(2)
        expect(body.data).to.be.an('array')
        expect(body.data).to.have.lengthOf(2)

        {
          const comment = body.data.find(c => c.text === 'my super first comment')
          expect(comment).to.not.be.undefined
          expect(comment.inReplyToCommentId).to.be.null
          expect(comment.account.name).to.equal('root')
          expect(comment.account.host).to.equal('localhost:' + servers[0].port)
          expect(comment.totalReplies).to.equal(3)
          expect(dateIsValid(comment.createdAt as string)).to.be.true
          expect(dateIsValid(comment.updatedAt as string)).to.be.true
        }

        {
          const comment = body.data.find(c => c.text === 'my super second comment')
          expect(comment).to.not.be.undefined
          expect(comment.inReplyToCommentId).to.be.null
          expect(comment.account.name).to.equal('root')
          expect(comment.account.host).to.equal('localhost:' + servers[2].port)
          expect(comment.totalReplies).to.equal(0)
          expect(dateIsValid(comment.createdAt as string)).to.be.true
          expect(dateIsValid(comment.updatedAt as string)).to.be.true
        }
      }
    })

    it('Should have these comments', async function () {
      for (const server of servers) {
        const body = await server.comments.listThreads({ videoId: videoUUID })
        const threadId = body.data.find(c => c.text === 'my super first comment').id

        const tree = await server.comments.getThread({ videoId: videoUUID, threadId })

        expect(tree.comment.text).equal('my super first comment')
        expect(tree.comment.account.name).equal('root')
        expect(tree.comment.account.host).equal('localhost:' + servers[0].port)
        expect(tree.children).to.have.lengthOf(2)

        const firstChild = tree.children[0]
        expect(firstChild.comment.text).to.equal('my super answer to thread 1')
        expect(firstChild.comment.account.name).equal('root')
        expect(firstChild.comment.account.host).equal('localhost:' + servers[1].port)
        expect(firstChild.children).to.have.lengthOf(1)

        childOfFirstChild = firstChild.children[0]
        expect(childOfFirstChild.comment.text).to.equal('my super answer to answer of thread 1')
        expect(childOfFirstChild.comment.account.name).equal('root')
        expect(childOfFirstChild.comment.account.host).equal('localhost:' + servers[2].port)
        expect(childOfFirstChild.children).to.have.lengthOf(0)

        const secondChild = tree.children[1]
        expect(secondChild.comment.text).to.equal('my second answer to thread 1')
        expect(secondChild.comment.account.name).equal('root')
        expect(secondChild.comment.account.host).equal('localhost:' + servers[2].port)
        expect(secondChild.children).to.have.lengthOf(0)
      }
    })

    it('Should delete a reply', async function () {
      this.timeout(10000)

      await servers[2].comments.delete({ videoId: videoUUID, commentId: childOfFirstChild.comment.id })

      await waitJobs(servers)
    })

    it('Should have this comment marked as deleted', async function () {
      for (const server of servers) {
        const { data } = await server.comments.listThreads({ videoId: videoUUID })
        const threadId = data.find(c => c.text === 'my super first comment').id

        const tree = await server.comments.getThread({ videoId: videoUUID, threadId })
        expect(tree.comment.text).equal('my super first comment')

        const firstChild = tree.children[0]
        expect(firstChild.comment.text).to.equal('my super answer to thread 1')
        expect(firstChild.children).to.have.lengthOf(1)

        const deletedComment = firstChild.children[0].comment
        expect(deletedComment.isDeleted).to.be.true
        expect(deletedComment.deletedAt).to.not.be.null
        expect(deletedComment.account).to.be.null
        expect(deletedComment.text).to.equal('')

        const secondChild = tree.children[1]
        expect(secondChild.comment.text).to.equal('my second answer to thread 1')
      }
    })

    it('Should delete the thread comments', async function () {
      this.timeout(10000)

      const { data } = await servers[0].comments.listThreads({ videoId: videoUUID })
      const commentId = data.find(c => c.text === 'my super first comment').id
      await servers[0].comments.delete({ videoId: videoUUID, commentId })

      await waitJobs(servers)
    })

    it('Should have the threads marked as deleted on other servers too', async function () {
      for (const server of servers) {
        const body = await server.comments.listThreads({ videoId: videoUUID })

        expect(body.total).to.equal(2)
        expect(body.data).to.be.an('array')
        expect(body.data).to.have.lengthOf(2)

        {
          const comment = body.data[0]
          expect(comment).to.not.be.undefined
          expect(comment.inReplyToCommentId).to.be.null
          expect(comment.account.name).to.equal('root')
          expect(comment.account.host).to.equal('localhost:' + servers[2].port)
          expect(comment.totalReplies).to.equal(0)
          expect(dateIsValid(comment.createdAt as string)).to.be.true
          expect(dateIsValid(comment.updatedAt as string)).to.be.true
        }

        {
          const deletedComment = body.data[1]
          expect(deletedComment).to.not.be.undefined
          expect(deletedComment.isDeleted).to.be.true
          expect(deletedComment.deletedAt).to.not.be.null
          expect(deletedComment.text).to.equal('')
          expect(deletedComment.inReplyToCommentId).to.be.null
          expect(deletedComment.account).to.be.null
          expect(deletedComment.totalReplies).to.equal(2)
          expect(dateIsValid(deletedComment.createdAt as string)).to.be.true
          expect(dateIsValid(deletedComment.updatedAt as string)).to.be.true
          expect(dateIsValid(deletedComment.deletedAt as string)).to.be.true
        }
      }
    })

    it('Should delete a remote thread by the origin server', async function () {
      this.timeout(5000)

      const { data } = await servers[0].comments.listThreads({ videoId: videoUUID })
      const commentId = data.find(c => c.text === 'my super second comment').id
      await servers[0].comments.delete({ videoId: videoUUID, commentId })

      await waitJobs(servers)
    })

    it('Should have the threads marked as deleted on other servers too', async function () {
      for (const server of servers) {
        const body = await server.comments.listThreads({ videoId: videoUUID })

        expect(body.total).to.equal(2)
        expect(body.data).to.have.lengthOf(2)

        {
          const comment = body.data[0]
          expect(comment.text).to.equal('')
          expect(comment.isDeleted).to.be.true
          expect(comment.createdAt).to.not.be.null
          expect(comment.deletedAt).to.not.be.null
          expect(comment.account).to.be.null
          expect(comment.totalReplies).to.equal(0)
        }

        {
          const comment = body.data[1]
          expect(comment.text).to.equal('')
          expect(comment.isDeleted).to.be.true
          expect(comment.createdAt).to.not.be.null
          expect(comment.deletedAt).to.not.be.null
          expect(comment.account).to.be.null
          expect(comment.totalReplies).to.equal(2)
        }
      }
    })

    it('Should disable comments and download', async function () {
      this.timeout(20000)

      const attributes = {
        commentsEnabled: false,
        downloadEnabled: false
      }

      await servers[0].videos.update({ id: videoUUID, attributes })

      await waitJobs(servers)

      for (const server of servers) {
        const video = await server.videos.get({ id: videoUUID })
        expect(video.commentsEnabled).to.be.false
        expect(video.downloadEnabled).to.be.false

        const text = 'my super forbidden comment'
        await server.comments.createThread({ videoId: videoUUID, text, expectedStatus: HttpStatusCode.CONFLICT_409 })
      }
    })
  })

  describe('With minimum parameters', function () {
    it('Should upload and propagate the video', async function () {
      this.timeout(60000)

      const path = '/api/v1/videos/upload'

      const req = request(servers[1].url)
        .post(path)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + servers[1].accessToken)
        .field('name', 'minimum parameters')
        .field('privacy', '1')
        .field('channelId', '1')

      await req.attach('videofile', buildAbsoluteFixturePath('video_short.webm'))
               .expect(HttpStatusCode.OK_200)

      await waitJobs(servers)

      for (const server of servers) {
        const { data } = await server.videos.list()
        const video = data.find(v => v.name === 'minimum parameters')

        const isLocal = server.url === 'http://localhost:' + servers[1].port
        const checkAttributes = {
          name: 'minimum parameters',
          category: null,
          licence: null,
          language: null,
          nsfw: false,
          description: null,
          support: null,
          account: {
            name: 'root',
            host: 'localhost:' + servers[1].port
          },
          isLocal,
          duration: 5,
          commentsEnabled: true,
          downloadEnabled: true,
          tags: [],
          privacy: VideoPrivacy.PUBLIC,
          channel: {
            displayName: 'Main root channel',
            name: 'root_channel',
            description: '',
            isLocal
          },
          fixture: 'video_short.webm',
          files: [
            {
              resolution: 720,
              size: 59000
            },
            {
              resolution: 480,
              size: 34000
            },
            {
              resolution: 360,
              size: 31000
            },
            {
              resolution: 240,
              size: 23000
            }
          ]
        }
        await completeVideoCheck(server, video, checkAttributes)
      }
    })
  })

  describe('TMP directory', function () {
    it('Should have an empty tmp directory', async function () {
      for (const server of servers) {
        await checkTmpIsEmpty(server)
      }
    })
  })

  after(async function () {
    await cleanupTests(servers)
  })
})