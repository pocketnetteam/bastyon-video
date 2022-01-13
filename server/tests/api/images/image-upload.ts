/* eslint-disable @typescript-eslint/no-unused-expressions,@typescript-eslint/require-await */

import 'mocha'
import * as chai from 'chai'
import {
  buildAbsoluteFixturePath,
  cleanupTests,
  createMultipleServers,
  makeDeleteRequest,
  makeGetRequest,
  PeerTubeServer,
  setAccessTokensToServers
} from '@shared/extra-utils'
import request from 'supertest'
import { HttpStatusCode } from '@shared/models'
import { readdir } from 'fs-extra'
import { stat } from 'fs'
import { promisify } from 'util'
import { basename } from 'path'

const expect = chai.expect
const astat = promisify(stat);
const imagesApi = '/api/v1/images'

async function countFiles (server: PeerTubeServer, directory: string) {
  const files = await readdir(server.servers.buildDirectory(directory))
  return files.length
}

describe('Test image upload', function () {
  let servers: PeerTubeServer[]

  let image1: any;

  before(async function () {
    this.timeout(30000)

    servers = await createMultipleServers(1)

    await setAccessTokensToServers(servers)
  })

  describe('Check status before uploading', function () {

    it('Should get an empty list of images', async function () {
      const images = await makeGetRequest({
        url: servers[0].url,
        path: imagesApi,
        accept: 'text/html',
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(images).to.have.property('body');
      expect(images.body).to.be.an('array');
      expect(images.body).to.have.lengthOf(0);
    })

    it('Should contains no images in storage', async function () {
      const imagesCount = await countFiles(servers[0], 'images')
      expect(imagesCount).to.equal(0);
    })

  })

  describe('Check upload feature', function () {

    it('Should fail without correct authentication', async function () {
      await request(servers[0].url)
                  .post(imagesApi + '/upload')
                  .expect(HttpStatusCode.UNAUTHORIZED_401)
                  .attach('imagefile', buildAbsoluteFixturePath('avatar.png'));
    })

    it('Should fail without an image', async function () {
      await request(servers[0].url)
                  .post(imagesApi + '/upload')
                  .set('Authorization', 'Bearer ' + servers[0].accessToken)
                  .expect(HttpStatusCode.NOT_FOUND_404)
                  .send();
    })

    it('Should fail with an invalid type file', async function () {
      await request(servers[0].url)
                  .post(imagesApi + '/upload')
                  .set('Authorization', 'Bearer ' + servers[0].accessToken)
                  .expect(HttpStatusCode.UNSUPPORTED_MEDIA_TYPE_415)
                  .attach('imagefile', buildAbsoluteFixturePath('video_short.mp4'));
    })

    it('Should success with valid image (small)', async function () {
      const res = await request(servers[0].url)
                  .post(imagesApi + '/upload')
                  .set('Authorization', 'Bearer ' + servers[0].accessToken)
                  .expect(HttpStatusCode.OK_200)
                  .attach('imagefile', buildAbsoluteFixturePath('avatar.png'));

      expect(res).to.have.property('body');
      expect(res.body).to.have.property('status');
      expect(res.body.status).to.equal('success');
      expect(res.body).to.have.property('image');
      expect(res.body.image).to.have.property('id');
      expect(res.body.image).to.have.property('url');
      expect(res.body.image).to.have.property('thumbnailUrl');
      // Low resolution images have same url and thumbnail url
      expect(res.body.image.url).to.equal(res.body.image.thumbnailUrl);

      const imageId = res.body.image.id;

      // We expect only one folder inside the "images"
      expect(await readdir(servers[0].servers.buildDirectory('images'))).to.have.lengthOf(1);
      // We expect only one image inside folder (small image)
      expect(await readdir(servers[0].servers.buildDirectory('images/' + imageId))).to.have.lengthOf(1);

    })

    it('Should success with valid image (big)', async function () {
      const res = await request(servers[0].url)
                  .post(imagesApi + '/upload')
                  .set('Authorization', 'Bearer ' + servers[0].accessToken)
                  .expect(HttpStatusCode.OK_200)
                  .attach('imagefile', buildAbsoluteFixturePath('avatar-big.png'));

      expect(res).to.have.property('body');
      expect(res.body).to.have.property('status');
      expect(res.body.status).to.equal('success');
      expect(res.body).to.have.property('image');
      expect(res.body.image).to.have.property('id');
      expect(res.body.image).to.have.property('url');
      expect(res.body.image).to.have.property('thumbnailUrl');
      // High resolution images have different url and thumbnail url
      expect(res.body.image.url).to.not.equal(res.body.image.thumbnailUrl);

      // We expect 2 folders inside the "images" now
      expect(await readdir(servers[0].servers.buildDirectory('images'))).to.have.lengthOf(2);
      // We expect only 2 images inside folder (big images have an additional thumbnail image)
      expect(await readdir(servers[0].servers.buildDirectory('images/' + res.body.image.id))).to.have.lengthOf(2);

      // Save image for next tests
      image1 = res.body.image;

    })

  })

  describe('Check image sizing algorithm', function () {

    it('Thumbnail size should be less than image size', async function () {
        
      const { id, url, thumbnailUrl } = image1;

      const thumb = await astat(servers[0].servers.buildDirectory('images/' + id + '/' + basename(thumbnailUrl)));
      const img = await astat(servers[0].servers.buildDirectory('images/' + id + '/' + basename(url)));
      expect(thumb.size).lte(img.size);

    })

  })

  describe('Check status after uploading', function () {

    it('Should get a list of 2 images', async function () {
      const images = await makeGetRequest({
        url: servers[0].url,
        path: imagesApi,
        accept: 'text/html',
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(images).to.have.property('body');
      expect(images.body).to.be.an('array');
      expect(images.body).to.have.lengthOf(2);
    })

    it('Should contains 2 images in storage', async function () {
      const imagesCount = await countFiles(servers[0], 'images')
      expect(imagesCount).to.equal(2);
    })

  })

  describe('Check image deletion', function () {

    it('Should fail without correct authentication', async function () {
      await makeDeleteRequest({
        url: servers[0].url,
        path: imagesApi + '/' + image1.id,
        accept: 'text/html',
        expectedStatus: HttpStatusCode.UNAUTHORIZED_401
      })
    })

    it('Should fail when deleting a non-existing image', async function () {
      await makeDeleteRequest({
        url: servers[0].url,
        path: imagesApi + '/424242c422b5f6f64794d53b66264242',
        headers: {
          Authorization: 'Bearer ' + servers[0].accessToken
        },
        accept: 'text/html',
        expectedStatus: HttpStatusCode.NOT_FOUND_404
      })
    })

    it('Should success when deleting an existing image', async function () {
      const res = await makeDeleteRequest({
        url: servers[0].url,
        path: imagesApi + '/' + image1.id,
        headers: {
          Authorization: 'Bearer ' + servers[0].accessToken
        },
        accept: 'text/html',
        expectedStatus: HttpStatusCode.OK_200
      })
      expect(res).to.have.property('body');
      expect(res.body).to.have.property('status');
      expect(res.body.status).to.equal('success');
    })

  })

  describe('Check status after deleting', function () {

    it('Should get a list of 1 image', async function () {
      const images = await makeGetRequest({
        url: servers[0].url,
        path: imagesApi,
        accept: 'text/html',
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(images).to.have.property('body');
      expect(images.body).to.be.an('array');
      expect(images.body).to.have.lengthOf(1);
    })

    it('Should contains 1 image in storage', async function () {
      const imagesCount = await countFiles(servers[0], 'images')
      expect(imagesCount).to.equal(1);
    })

  })

  after(async function () {
    await cleanupTests(servers)
  })

})