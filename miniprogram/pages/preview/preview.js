Page({
  data: {
    previewUrl: ''
  },
  onLoad(options) {
    if (options.url) {
      this.setData({
        previewUrl: decodeURIComponent(options.url)
      })
    }
  }
}) 