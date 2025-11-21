/**
 * Bilibili视频封面加载器
 * 动态尝试多个CDN域名和URL格式以获取视频封面
 */
document.addEventListener('DOMContentLoaded', function() {
  // 全局缓存已加载成功的BV号对应的封面URL，避免重复尝试
  window.bilibiliCoverCache = window.bilibiliCoverCache || {};
  
  // 获取所有带有data-bv属性的图片元素
  const bilibiliThumbs = document.querySelectorAll('img[data-bv]');
  
  bilibiliThumbs.forEach(img => {
    const bv = img.getAttribute('data-bv');
    if (!bv) return;
    
    // 如果缓存中有该BV号的封面URL，直接使用
    if (window.bilibiliCoverCache[bv]) {
      img.src = window.bilibiliCoverCache[bv];
      img.removeAttribute('data-bv');
      return;
    }
    
    // 尝试多个CDN域名
    const cdnDomains = [
      'i0.hdslb.com',
      'i1.hdslb.com',
      'i2.hdslb.com',
      'i3.hdslb.com',
      'i4.hdslb.com'
    ];
    
    // 尝试加载封面图片的函数
    function tryLoadCover(domainIndex = 0, formatIndex = 0) {
      if (domainIndex >= cdnDomains.length) {
        // 所有域名都尝试失败，保持默认图片
        console.log(`无法获取BV号 ${bv} 的封面图片`);
        return;
      }
      
      const domain = cdnDomains[domainIndex];
      let coverUrl = '';
      
      // 根据格式索引生成不同的封面URL
      switch(formatIndex) {
        case 0:
          coverUrl = `https://${domain}/bfs/archive/${bv}.jpg`;
          break;
        case 1:
          coverUrl = `https://${domain}/bfs/archive/${bv}@640w_360h_1c_!web-archive-video-cover.webp`;
          break;
        case 2:
          coverUrl = `https://${domain}/bfs/archive/${bv}@320w_180h_1c.jpg`;
          break;
        case 3:
          // 如果当前域名的所有格式都尝试失败，尝试下一个域名
          tryLoadCover(domainIndex + 1, 0);
          return;
      }
      
      // 创建一个新的图片对象来测试加载
      const testImg = new Image();
      
      // 设置加载超时
      const timeoutId = setTimeout(() => {
        testImg.onerror();
      }, 3000);
      
      testImg.onload = function() {
        // 清除超时
        clearTimeout(timeoutId);
        
        // 图片加载成功，设置到原img元素并缓存
        img.src = coverUrl;
        window.bilibiliCoverCache[bv] = coverUrl;
        img.removeAttribute('data-bv');
        console.log(`成功加载BV号 ${bv} 的封面图片`);
      };
      
      testImg.onerror = function() {
        // 清除超时
        clearTimeout(timeoutId);
        
        // 当前格式加载失败，尝试下一个格式
        tryLoadCover(domainIndex, formatIndex + 1);
      };
      
      // 开始加载图片
      testImg.src = coverUrl;
    }
    
    // 开始尝试加载封面
    tryLoadCover();
  });
});

// 添加错误处理函数，确保即使JavaScript执行出错也不会影响页面正常显示
window.onerror = function(message, source, lineno, colno, error) {
  console.error('B站封面加载脚本错误:', message, '在', source, '第', lineno, '行');
  return true; // 阻止默认的错误处理行为
};