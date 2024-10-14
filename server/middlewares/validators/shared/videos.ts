import { Request, Response } from 'express'
import { loadVideo, VideoLoadType } from '@server/lib/model-loaders'
import { isAbleToUploadVideo } from '@server/lib/user'
import { authenticatePromiseIfNeeded } from '@server/middlewares/auth'
import { VideoModel } from '@server/models/video/video'
import { VideoChannelModel } from '@server/models/video/video-channel'
import { VideoFileModel } from '@server/models/video/video-file'
import {
  MUser,
  MUserAccountId,
  MUserId,
  MVideo,
  MVideoAccountLight,
  MVideoFormattableDetails,
  MVideoFullLight,
  MVideoId,
  MVideoImmutable,
  MVideoThumbnail,
  MVideoWithRights
} from '@server/types/models'
import { HttpStatusCode, ServerErrorCode, UserRight } from '@shared/models'

async function doesVideoExist (id: number | string, res: Response, fetchType: VideoLoadType = 'all') {
  const userId = res.locals.oauth ? res.locals.oauth.token.User.id : undefined

  const video = await loadVideo(id, fetchType, userId)

  if (video === null) {
    res.json({
      status: HttpStatusCode.NOT_FOUND_404,
      videoBrief: true,
      uuid: id,
      thumbnailPath: `/static/redundancy/hls/${id}/${id}.jpg`,
      previewPath: `/static/redundancy/hls/${id}/${id}.jpg`,
      blacklisted: false,
      blacklistedReason: null,
      streamingPlaylists: [
          {
          id: 1,
          type: 1,
          playlistUrl: `https://peertube.archive.pocketnet.app/static/redundancy/hls/${id}/${id}-master.m3u8`,
          segmentsSha256Url: `https://peertube.archive.pocketnet.app/static/redundancy/hls/${id}/${id}-segments-sha256.json`,
          redundancies: [],
          files: [
            {
              resolution: {
                id: 720,
                label: "720p"
              },
              magnetUri:
                "magnet:?xs=https%3A%2F%2Fpeertube.archive.pocketnet.app%2Flazy-static%2Ftorrents%2F58792096-3024-4812-bd5c-f581f2d628d8-720-hls.torrent&xt=urn:btih:39195d4783e9b1045c0a230631a6f039819dfb5b&dn=%D0%9D%D0%B0%D0%B2%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9%2C%D0%97%D0%B5%D0%BB%D0%B5%D0%BD%D1%81%D0%BA%D0%B8%D0%B9%2C%D0%B7%D0%B5%D0%BB%D0%B5%D0%BD%D0%BA%D0%B0%2C%D0%9D%D0%90%D0%A1%D0%90%2C%D0%9E%D1%81%D0%B8%D1%80%D0%B8%D1%81+%D0%B8+%D0%9A%D0%B0%D0%BB%D0%B8&tr=wss%3A%2F%2Fpeertube17.pocketnet.app%2Ftracker%2Fsocket&tr=https%3A%2F%2Fpeertube17.pocketnet.app%2Ftracker%2Fannounce&ws=https%3A%2F%2Fpeertube17.pocketnet.app%2Fstatic%2Fstreaming-playlists%2Fhls%2F3f3afffb-057b-413d-9622-5559f4a65db6%2F507b298f-0ecc-4664-bda2-8329338e9e4b-720-fragmented.mp4",
              size: 119140262,
              fps: 30,
              torrentUrl:
                "https://peertube.archive.pocketnet.app/lazy-static/torrents/58792096-3024-4812-bd5c-f581f2d628d8-720-hls.torrent",
              torrentDownloadUrl:
                "https://peertube.archive.pocketnet.app/download/torrents/58792096-3024-4812-bd5c-f581f2d628d8-720-hls.torrent",
              fileUrl:
                "https://peertube17.pocketnet.app/static/streaming-playlists/hls/3f3afffb-057b-413d-9622-5559f4a65db6/507b298f-0ecc-4664-bda2-8329338e9e4b-720-fragmented.mp4",
              fileDownloadUrl:
                "https://peertube17.pocketnet.app/download/streaming-playlists/hls/videos/3f3afffb-057b-413d-9622-5559f4a65db6-720-fragmented.mp4",
              metadataUrl:
                "https://peertube17.pocketnet.app/api/v1/videos/3f3afffb-057b-413d-9622-5559f4a65db6/metadata/71825",
            },
            {
              resolution: {
                id: 480,
                label: "480p"
              },
              magnetUri:
                "magnet:?xs=https%3A%2F%2Fpeertube.archive.pocketnet.app%2Flazy-static%2Ftorrents%2F7eebd2eb-7070-441e-a3ff-3d7196d89e1c-480-hls.torrent&xt=urn:btih:b6386c1470d8c025b46ad2d4a53e7aabb49e8462&dn=%D0%9D%D0%B0%D0%B2%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9%2C%D0%97%D0%B5%D0%BB%D0%B5%D0%BD%D1%81%D0%BA%D0%B8%D0%B9%2C%D0%B7%D0%B5%D0%BB%D0%B5%D0%BD%D0%BA%D0%B0%2C%D0%9D%D0%90%D0%A1%D0%90%2C%D0%9E%D1%81%D0%B8%D1%80%D0%B8%D1%81+%D0%B8+%D0%9A%D0%B0%D0%BB%D0%B8&tr=wss%3A%2F%2Fpeertube17.pocketnet.app%2Ftracker%2Fsocket&tr=https%3A%2F%2Fpeertube17.pocketnet.app%2Ftracker%2Fannounce&ws=https%3A%2F%2Fpeertube17.pocketnet.app%2Fstatic%2Fstreaming-playlists%2Fhls%2F3f3afffb-057b-413d-9622-5559f4a65db6%2F404af490-713d-4c8e-94db-d7fc2e58d1cc-480-fragmented.mp4",
              size: 75569790,
              fps: 30,
              torrentUrl:
                "https://peertube.archive.pocketnet.app/lazy-static/torrents/7eebd2eb-7070-441e-a3ff-3d7196d89e1c-480-hls.torrent",
              torrentDownloadUrl:
                "https://peertube.archive.pocketnet.app/download/torrents/7eebd2eb-7070-441e-a3ff-3d7196d89e1c-480-hls.torrent",
              fileUrl:
                "https://peertube17.pocketnet.app/static/streaming-playlists/hls/3f3afffb-057b-413d-9622-5559f4a65db6/404af490-713d-4c8e-94db-d7fc2e58d1cc-480-fragmented.mp4",
              fileDownloadUrl:
                "https://peertube17.pocketnet.app/download/streaming-playlists/hls/videos/3f3afffb-057b-413d-9622-5559f4a65db6-480-fragmented.mp4",
              metadataUrl:
                "https://peertube17.pocketnet.app/api/v1/videos/3f3afffb-057b-413d-9622-5559f4a65db6/metadata/71828",
            },
            {
              resolution: {
                id: 360,
                label: "360p"
              },
              magnetUri:
                "magnet:?xs=https%3A%2F%2Fpeertube.archive.pocketnet.app%2Flazy-static%2Ftorrents%2Ff6c41ea6-2b21-460d-9492-7eb04ddec253-360-hls.torrent&xt=urn:btih:14b962128106c2f8a17ebab4003a454a559facc0&dn=%D0%9D%D0%B0%D0%B2%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9%2C%D0%97%D0%B5%D0%BB%D0%B5%D0%BD%D1%81%D0%BA%D0%B8%D0%B9%2C%D0%B7%D0%B5%D0%BB%D0%B5%D0%BD%D0%BA%D0%B0%2C%D0%9D%D0%90%D0%A1%D0%90%2C%D0%9E%D1%81%D0%B8%D1%80%D0%B8%D1%81+%D0%B8+%D0%9A%D0%B0%D0%BB%D0%B8&tr=wss%3A%2F%2Fpeertube17.pocketnet.app%2Ftracker%2Fsocket&tr=https%3A%2F%2Fpeertube17.pocketnet.app%2Ftracker%2Fannounce&ws=https%3A%2F%2Fpeertube17.pocketnet.app%2Fstatic%2Fstreaming-playlists%2Fhls%2F3f3afffb-057b-413d-9622-5559f4a65db6%2Fcbff9736-6574-4448-b7ad-e8a104edee59-360-fragmented.mp4",
              size: 58111755,
              fps: 30,
              torrentUrl:
                "https://peertube.archive.pocketnet.app/lazy-static/torrents/f6c41ea6-2b21-460d-9492-7eb04ddec253-360-hls.torrent",
              torrentDownloadUrl:
                "https://peertube.archive.pocketnet.app/download/torrents/f6c41ea6-2b21-460d-9492-7eb04ddec253-360-hls.torrent",
              fileUrl:
                "https://peertube17.pocketnet.app/static/streaming-playlists/hls/3f3afffb-057b-413d-9622-5559f4a65db6/cbff9736-6574-4448-b7ad-e8a104edee59-360-fragmented.mp4",
              fileDownloadUrl:
                "https://peertube17.pocketnet.app/download/streaming-playlists/hls/videos/3f3afffb-057b-413d-9622-5559f4a65db6-360-fragmented.mp4",
              metadataUrl:
                "https://peertube17.pocketnet.app/api/v1/videos/3f3afffb-057b-413d-9622-5559f4a65db6/metadata/71827",
            },
            {
              resolution: {
                id: 144,
                label: "144p"
              },
              magnetUri:
                "magnet:?xs=https%3A%2F%2Fpeertube.archive.pocketnet.app%2Flazy-static%2Ftorrents%2Fbb6e6991-2d70-47e1-921a-2d2f7218762f-144-hls.torrent&xt=urn:btih:875e7f2d301b21d046eb3239b9c4c69c27145a56&dn=%D0%9D%D0%B0%D0%B2%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9%2C%D0%97%D0%B5%D0%BB%D0%B5%D0%BD%D1%81%D0%BA%D0%B8%D0%B9%2C%D0%B7%D0%B5%D0%BB%D0%B5%D0%BD%D0%BA%D0%B0%2C%D0%9D%D0%90%D0%A1%D0%90%2C%D0%9E%D1%81%D0%B8%D1%80%D0%B8%D1%81+%D0%B8+%D0%9A%D0%B0%D0%BB%D0%B8&tr=wss%3A%2F%2Fpeertube17.pocketnet.app%2Ftracker%2Fsocket&tr=https%3A%2F%2Fpeertube17.pocketnet.app%2Ftracker%2Fannounce&ws=https%3A%2F%2Fpeertube17.pocketnet.app%2Fstatic%2Fstreaming-playlists%2Fhls%2F3f3afffb-057b-413d-9622-5559f4a65db6%2F7946cec0-6d25-4049-a8e0-526d3e1d7da7-144-fragmented.mp4",
              size: 32061933,
              fps: 30,
              torrentUrl:
                "https://peertube.archive.pocketnet.app/lazy-static/torrents/bb6e6991-2d70-47e1-921a-2d2f7218762f-144-hls.torrent",
              torrentDownloadUrl:
                "https://peertube.archive.pocketnet.app/download/torrents/bb6e6991-2d70-47e1-921a-2d2f7218762f-144-hls.torrent",
              fileUrl:
                "https://peertube17.pocketnet.app/static/streaming-playlists/hls/3f3afffb-057b-413d-9622-5559f4a65db6/7946cec0-6d25-4049-a8e0-526d3e1d7da7-144-fragmented.mp4",
              fileDownloadUrl:
                "https://peertube17.pocketnet.app/download/streaming-playlists/hls/videos/3f3afffb-057b-413d-9622-5559f4a65db6-144-fragmented.mp4",
              metadataUrl:
                "https://peertube17.pocketnet.app/api/v1/videos/3f3afffb-057b-413d-9622-5559f4a65db6/metadata/71826"
            }
          ]
        }
      ],
      files: [],
      support: null,
      descriptionPath:
        "/api/v1/videos/3f3afffb-057b-413d-9622-5559f4a65db6/description",
      tags: [],
      commentsEnabled: true,
      downloadEnabled: true,
      waitTranscoding: false,
      state: {
        id: 1,
        label: "Published"
      },
      trackerUrls: [
        "wss://peertube.archive.pocketnet.app/tracker/socket",
        "https://peertube.archive.pocketnet.app/tracker/announce",
      ],
      isAudio: false,
      isLive: false,
      aspectRatio: 1.77,
      category: {
        id: null,
        label: "Misc"
      },
      licence: {
        id: null,
        label: "Unknown"
      },
      language: {
        id: null,
        label: "Unknown"
      },
      privacy: {
        id: 1,
        label: "Public"
      },
      name: "Restored Video"
    })
    return false
  }

  switch (fetchType) {
    case 'for-api':
      res.locals.videoAPI = video as MVideoFormattableDetails
      break

    case 'all':
      res.locals.videoAll = video as MVideoFullLight
      break

    case 'only-immutable-attributes':
      res.locals.onlyImmutableVideo = video as MVideoImmutable
      break

    case 'id':
      res.locals.videoId = video as MVideoId
      break

    case 'only-video':
      res.locals.onlyVideo = video as MVideoThumbnail
      break
  }

  return true
}

async function doesVideoFileOfVideoExist (id: number, videoIdOrUUID: number | string, res: Response) {
  if (!await VideoFileModel.doesVideoExistForVideoFile(id, videoIdOrUUID)) {
    res.fail({
      status: HttpStatusCode.NOT_FOUND_404,
      message: 'VideoFile matching Video not found'
    })
    return false
  }

  return true
}

async function doesVideoChannelOfAccountExist (channelId: number, user: MUserAccountId, res: Response) {
  const videoChannel = await VideoChannelModel.loadAndPopulateAccount(channelId)

  if (videoChannel === null) {
    res.fail({ message: 'Unknown video "video channel" for this instance.' })
    return false
  }

  // Don't check account id if the user can update any video
  if (user.hasRight(UserRight.UPDATE_ANY_VIDEO) === true) {
    res.locals.videoChannel = videoChannel
    return true
  }

  if (videoChannel.Account.id !== user.Account.id) {
    res.fail({
      message: 'Unknown video "video channel" for this account.'
    })
    return false
  }

  res.locals.videoChannel = videoChannel
  return true
}

async function checkCanSeeVideoIfPrivate (req: Request, res: Response, video: MVideo, authenticateInQuery = false) {
  if (!video.requiresAuth()) return true

  const videoWithRights = await VideoModel.loadAndPopulateAccountAndServerAndTags(video.id)

  return checkCanSeePrivateVideo(req, res, videoWithRights, authenticateInQuery)
}

async function checkCanSeePrivateVideo (req: Request, res: Response, video: MVideoWithRights, authenticateInQuery = false) {
  await authenticatePromiseIfNeeded(req, res, authenticateInQuery)

  const user = res.locals.oauth ? res.locals.oauth.token.User : null

  // Only the owner or a user that have blocklist rights can see the video
  if (!user || !user.canGetVideo(video)) {
    res.fail({
      status: HttpStatusCode.FORBIDDEN_403,
      message: 'Cannot fetch information of private/internal/blocklisted video'
    })

    return false
  }

  return true
}

function checkUserCanManageVideo (user: MUser, video: MVideoAccountLight, right: UserRight, res: Response, onlyOwned = true) {
  // Retrieve the user who did the request
  if (onlyOwned && video.isOwned() === false) {
    res.fail({
      status: HttpStatusCode.FORBIDDEN_403,
      message: 'Cannot manage a video of another server.'
    })
    return false
  }

  // Check if the user can delete the video
  // The user can delete it if he has the right
  // Or if s/he is the video's account
  const account = video.VideoChannel.Account
  if (user.hasRight(right) === false && account.userId !== user.id) {
    res.fail({
      status: HttpStatusCode.FORBIDDEN_403,
      message: 'Cannot manage a video of another user.'
    })
    return false
  }

  return true
}

async function checkUserQuota (user: MUserId, videoFileSize: number, res: Response) {
  if (await isAbleToUploadVideo(user.id, videoFileSize) === false) {
    res.fail({
      status: HttpStatusCode.PAYLOAD_TOO_LARGE_413,
      message: 'The user video quota is exceeded with this video.',
      type: ServerErrorCode.QUOTA_REACHED
    })
    return false
  }

  return true
}

// ---------------------------------------------------------------------------

export {
  doesVideoChannelOfAccountExist,
  doesVideoExist,
  doesVideoFileOfVideoExist,

  checkUserCanManageVideo,
  checkCanSeeVideoIfPrivate,
  checkCanSeePrivateVideo,
  checkUserQuota
}
