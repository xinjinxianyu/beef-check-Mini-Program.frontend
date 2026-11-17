function choosePhoto(sourceType) {
  return new Promise((resolve, reject) => {
    if (wx.chooseMedia) {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: [sourceType],
        sizeType: ['compressed'],
        success(result) {
          const file = result.tempFiles && result.tempFiles[0]
          if (!file || !file.tempFilePath) {
            reject(new Error('没有读取到图片'))
            return
          }
          resolve({
            path: file.tempFilePath,
            width: file.width || 0,
            height: file.height || 0,
            size: file.size || 0
          })
        },
        fail(error) {
          reject(error)
        }
      })
      return
    }

    wx.chooseImage({
      count: 1,
      sourceType: [sourceType],
      sizeType: ['compressed'],
      success(result) {
        resolve({
          path: result.tempFilePaths[0],
          width: 0,
          height: 0,
          size: 0
        })
      },
      fail(error) {
        reject(error)
      }
    })
  })
}

function getImageInfo(path) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: path,
      success: resolve,
      fail: reject
    })
  })
}

function persistImage(tempPath) {
  return new Promise((resolve) => {
    if (!tempPath || !wx.getFileSystemManager || !wx.env || !wx.env.USER_DATA_PATH) {
      resolve(tempPath)
      return
    }

    const extension = (tempPath.match(/\.(png|jpe?g|webp)$/i) || ['.jpg'])[0]
    const target = `${wx.env.USER_DATA_PATH}/beef-${Date.now()}${extension}`
    wx.getFileSystemManager().copyFile({
      srcPath: tempPath,
      destPath: target,
      success() {
        resolve(target)
      },
      fail() {
        resolve(tempPath)
      }
    })
  })
}

function removePersistedImage(imagePath) {
  return new Promise((resolve) => {
    if (
      !imagePath ||
      !wx.getFileSystemManager ||
      !wx.env ||
      !wx.env.USER_DATA_PATH ||
      !String(imagePath).startsWith(`${wx.env.USER_DATA_PATH}/beef-`)
    ) {
      resolve()
      return
    }

    wx.getFileSystemManager().unlink({
      filePath: imagePath,
      success() {
        resolve()
      },
      fail() {
        resolve()
      }
    })
  })
}

module.exports = {
  choosePhoto,
  getImageInfo,
  persistImage,
  removePersistedImage
}
