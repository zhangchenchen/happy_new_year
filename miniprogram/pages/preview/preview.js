Page({
  data: {
    url: '',
    loading: true
  },

  onLoad(options) {
    console.log('预览页面接收到的完整参数:', options);
    
    if (!options.url) {
      console.error('未获取到图片地址');
      this.setData({ loading: false });
      wx.showToast({
        title: '未获取到图片地址',
        icon: 'error'
      });
      return;
    }

    try {
      // 解码URL
      const decodedUrl = decodeURIComponent(options.url);
      console.log('解码后的URL:', decodedUrl);
      
      if (!decodedUrl) {
        throw new Error('解码后的URL为空');
      }

      this.setData({
        url: decodedUrl,
        loading: false
      });
    } catch (error) {
      console.error('URL解码失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: 'URL格式错误',
        icon: 'error'
      });
    }
  },

  // 保存图片
  saveImage() {
    if (!this.data.url) {
      wx.showToast({
        title: '图片地址无效',
        icon: 'error'
      });
      return;
    }

    wx.showLoading({
      title: '保存中...'
    });

    wx.downloadFile({
      url: this.data.url,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.showToast({
                title: '保存成功',
                icon: 'success'
              });
            },
            fail: (err) => {
              console.error('保存失败:', err);
              wx.showToast({
                title: '保存失败',
                icon: 'error'
              });
            }
          });
        } else {
          throw new Error(`下载失败: ${res.statusCode}`);
        }
      },
      fail: (err) => {
        console.error('下载失败:', err);
        wx.showToast({
          title: '下载失败',
          icon: 'error'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  handleImageError(e) {
    console.error('图片加载失败:', e.detail);
    console.log('当前URL:', this.data.url);
    
    wx.showToast({
      title: '图片加载失败',
      icon: 'error'
    });
  }
}); 