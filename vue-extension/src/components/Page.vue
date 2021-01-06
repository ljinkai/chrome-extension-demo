<template>
  <div v-bind:style="styeImg">
    <div class="page-widget">
      <div class="poem-content">
        <div>{{this.poemData.content}}</div>
        <div class="poem-content-sub">《{{this.poemData.origin}}》{{this.poemData.author}}</div> 
        <p class="page-date">{{weekDay}}</p>
        <p>hot refresh local:8080</p>
      </div>
    </div>
    <div class="page-author"><a href="http://liujinkai.com">by liujinkai.com</a></div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'Page',
  mounted () {
  },
  computed: {
    weekDay () {
      var week = new Date().getDay(), arr = ['日', '一', '二','三','四','五','六'],
      str = '星期' + arr[week];
      return str
    }
  },
  created () {
    this.loadImage()
    this.loadPoem()
  },
  data () {
    return {
      styeImg: {
        backgroundImage: '',
        width: '100%',
        height: '100%',
        backgroundSize: 'cover'
      },
      poemData: {}
    }
  },
  methods: {
    /**
     * 获取背景图片
     * https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1
     */
    loadImage () {
      axios.get('https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1')
      .then(response => {
        this.styeImg.height = `${window.innerHeight}px`
        this.styeImg.backgroundImage = `url(http://s.cn.bing.net${response.data.images[0].url})`
      }).catch(error => {
        console.log(error)
      })
    },
    /**
     * 获取古诗数据
     * https://v1.jinrishici.com/all.json
     */
    loadPoem () {
      axios.get('https://v1.jinrishici.com/all.json')
      .then(response => {
        this.poemData = response.data
      }).catch(error => {
        console.log(error)
      })
      
    }
  }
}
</script>

<style scoped>
p {
  font-size: 20px;
}
.page-widget {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%);
    transform: translate(-50%,-50%);
    line-height: 46px;
    font-size: 26px;
    color: white;
    background-color: rgba(0,0,0,0.5);
    padding: 40px 20px;
    border-radius: 10px;
}
.poem-content-sub {
  font-size: 20px;
}
.page-author {
  font-size: 13px;
  color: white;
  position: absolute;
  right: 15px;
  bottom: 20px;
}
.page-author a {
  color: white;
  text-decoration: none;
}
</style>
