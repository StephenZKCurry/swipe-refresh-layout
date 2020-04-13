// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    page: 1,
    pageSize: 10,
    isRequesting: false, // 是否正在请求数据，防止数据的重复加载
    hasMore: true, // 是否还有更多数据
    isEmpty: false // 是否为空数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.swipeRefresh = this.selectComponent('#refresh');
    this.swipeRefresh.setRefresh(true);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  /**
   * 下拉刷新
   */
  refresh: function() {
    if (!this.data.isRequesting) {
      this.setData({
        page: 1,
        isRequesting: true,
        hasMore: true,
        isEmpty: false
      });
      this.getData();
    }
  },

  /**
   * 上拉加载
   */
  loadMore: function() {
    if (this.data.hasMore && !this.data.isRequesting) {
      this.setData({
        page: this.data.page + 1,
        isRequesting: true
      });
      this.getData();
    }
  },

  /**
   * 获取数据
   */
  getData: function() {
    setTimeout(() => {
      if (this.data.page == 1) {
        // 刷新数据
        this.setData({
          list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          isRequesting: false
        });
      } else {
        // 上拉加载数据
        this.setData({
          list: this.data.list.concat(10),
          isRequesting: false,
          hasMore: false
        });
      }
      this.swipeRefresh.setRefresh(false);
    }, 3000);
  }
})