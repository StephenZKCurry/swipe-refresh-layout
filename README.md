# swipe-refresh-layout
微信小程序仿Material Design风格的下拉刷新组件

## 1.效果图
![](https://upload-images.jianshu.io/upload_images/12169089-d01e3513396c0e70.gif?imageMogr2/auto-orient/strip)
## 2.使用方法
将组件拷贝到项目中，在页面的json文件中引入，这里就不展示了。组件可设置的属性如下：
| 属性              | 类型          | 默认值   | 说明                         |
| --------------- | ----------- | ----- | -------------------------- |
| color           | string      | black | 下拉刷新进度条颜色，默认值为黑色           |
| backgroundColor | string      | white | 下拉刷新圆圈背景颜色，默认值为白色          |
| threshold       | number      | 20    | 下拉刷新阈值（单位px），下拉距离超过该值时触发刷新 |
| loadMoreEnable  | boolean     | false | 是否开启上拉加载                   |
| bindrefresh     | eventhandle |       | 下拉刷新回调函数                   |
| bindloadmore    | eventhandle |       | 上拉加载回调函数                   |

此外，组件还定义了一个`setRefresh()`函数，用于设置刷新状态，参数传入一个布尔值，true表示开始刷新，显示下拉刷新圆圈；false表示结束刷新，隐藏下拉刷新圆圈。

示例代码如下：

**index.wxml**
```html
<swipe-refresh-layout id='refresh' style='width:100vw;height:200rpx;' loadMoreEnable bindrefresh='refresh' bindloadmore='loadMore'>
  <!-- 要刷新的内容 -->
</swipe-refresh-layout>
```
**index.js**
```javascript
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.swipeRefresh = this.selectComponent('#refresh');
  },

  /**
   * 下拉刷新
   */
  refresh: function() {
    // 模拟获取数据
    setTimeout(() => {
      // 结束下拉刷新
      this.swipeRefresh.setRefresh(false);
    }, 3000);
  },

  /**
   * 上拉加载
   */
  loadMore: function() {
    // ...
  }
})
```
需要注意，**使用时必须给swipe-refresh-layout一个固定的宽度和高度**。
## 3.实现原理
实现原理还是比较简单的，大体上就是通过监听触摸事件，在`touchstart`事件回调中记录手指按下的坐标；在`touchmove`事件回调中计算手指在竖直方向上的滑动距离，通过css的**transform**属性实现下拉刷新圆圈的移动；在`touchend`事件回调中计算手指抬起时的滑动距离，如果向下的滑动距离超过阈值就触发下拉刷新事件，否则将下拉刷新圆圈归位。由于在滑动的过程中需要频繁地进行用户交互，出于性能方面的考虑，我使用了[WXS](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxs/)函数用来响应触摸事件，将事件定义在视图层，解决视图层和逻辑层间通信耗时的问题。
虽然整体的实现逻辑不难理解，但是在开发过程中我还是遇到了几个问题，这里简单介绍一下。
* **touchmove导致的卡顿问题**

一开始我使用的是`bindtouchmove`属性监听手指滑动事件，在开发工具上测试时没有什么问题，后来运行在安卓真机上才发现手指触摸屏幕下拉时刷新圆圈的移动比较卡顿，不流畅。在微信开放社区查了一下这个问题，发现也有人遇到过，目前的解决方案就是将`bindtouchmove`改为`catchtouchmove`。具体原因还不清楚，可能是官方的bug吧，又或者小程序本身就是这样设计的。改为`catchtouchmove`后确实是解决了下拉卡顿的问题，但是同时会导致页面内容无法滑动，如何解决这个问题呢，我们不妨考虑一下具体的使用场景，正常情况下只有在页面内容处于顶部时才可以下拉刷新，可以利用这个条件来判断是否需要我们自己处理touchmove事件。具体的做法是这样的，首先在组件最外层使用**scroll-view**，通过`bindscroll`监听滑动事件：
```javascript
_scroll: function(e) {
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
}
```
使用一个变量**scrollTop**来记录是否滑动到了顶部，这里的判断条件为什么是`e.detail.scrollTop <= 50`而不是`e.detail.scrollTop <= 0`呢，因为通过测试我发现有时页面滑动到顶部时e.detail.scrollTop的值并不是0，而是一个接近0的整数，为了保证每次页面滑动到顶部都能改变scrollTop的状态，这里就给了一个默认值，取50是因为官方文档上给出的默认阈值就是50。

![](https://upload-images.jianshu.io/upload_images/12169089-37b557c9893852f1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

之后在`catchtouchmove`回调函数中根据scrollTop的值判断是否需要处理滑动事件，如果scrollTop的值为false（页面内容不处位于顶部）就直接return。
```javascript
touchmove: function(e) {
  if (!this.data.scrollTop) {
    return;
  }
  // 处理滑动事件
  
}
```
这样就解决了页面内容始终无法滚动的问题，当然上面的代码只是简单地说明解决方法，详细内容可以参考组件的源码。
* **下拉刷新圆圈的显示层级问题**

正常情况下下拉刷新圆圈是位于要刷新的内容之上的，并且不会随着内容的滑动而移动，我们很容易就想到使用**position:fixed**属性，通过**z-index**属性来设置元素的层叠顺序。但是如果下拉刷新圆圈的z-index指定一个大于0的数，而刷新组件又不是位于页面的顶部，就会导致下拉刷新圆圈始终会显示出来，如下图所示：

![](https://upload-images.jianshu.io/upload_images/12169089-86ded52cb914d8ac.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我这里采取的解决方案就是将下拉刷新圆圈的z-index指定为-1，而刷新内容的z-index指定为-2（取值不是固定的，只要比下拉刷新圆圈的小就可以），这样就可以解决下拉刷新圆圈覆盖在页面普通视图之上的问题。当然我的解决方案可能不是最好的，或者存在一些问题，如果大家有自己的想法欢迎提出，一起交流。
[我的博客地址](https://www.jianshu.com/p/4f24928c7ca8)
## 4.参考项目
[极致的scroll-view的下拉刷新扩展组件](https://developers.weixin.qq.com/community/develop/article/doc/000604512940a02b7099273195bc13)