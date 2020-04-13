// components/swiperefreshlayout/swiperefreshlayout.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    threshold: { // 下拉刷新阈值，下拉距离超过该值触发刷新
      type: Number,
      value: 20
    },
    color: { // 下拉刷新进度条颜色
      type: String,
      value: 'black'
    },
    backgroundColor: { // 下拉刷新圆圈背景颜色
      type: String,
      value: 'white'
    },
    loadMoreEnable: { // 是否开启上拉加载
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    progressBarHeight: '', // 下拉刷新圆圈高度
    rotate: '',
    scrollTop: true, // 当前是否处于顶部
    triggered: false // 当前下拉刷新状态，true表示下拉刷新已经被触发，false表示下拉刷新未被触发
  },

  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
      this.setData({
        progressBarHeight: this.rpx2px(80)
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _scroll: function(e) {
      // console.log(e);
      if (e.detail.scrollTop <= 50) {
        // 滚动到顶部
        this.setData({
          scrollTop: true
        });
      } else {
        this.setData({
          scrollTop: false
        });
      }
    },

    /**
     * 滚动到底部
     */
    _scrollToLower: function(e) {
      if (this.properties.loadMoreEnable) {
        this.triggerEvent('loadmore');
      }
    },

    /**
     * 设置刷新状态
     */
    setRefresh: function(refreshing) {
      if (this.data.triggered != refreshing) {
        if (refreshing) {
          // 触发刷新
          this.triggerEvent('refresh');
        }
        this.setData({
          triggered: refreshing
        });
      }
    },

    /**
     * rpx转px
     */
    rpx2px: function(rpx) {
      return rpx / 750 * wx.getSystemInfoSync().windowWidth;
    }
  }
})