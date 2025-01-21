Page({
  data: {
    previewUrl: '',
    greetingText: ''
  },
  onLoad(options) {
    if (options.url) {
      this.setData({
        previewUrl: decodeURIComponent(options.url),
        greetingText: decodeURIComponent(options.text || '')
      })
    }
  }
}) 