# 西南交大教务网成绩查询爬虫
这是一整套完整的西南交大教务网自动查询成绩和自动通过邮件来通知新成绩的系统，可以和小伙伴们一起用
### 如何运行
```javascript
node app.js
```
如果你想使用我的系统，请访问 http://vin94.cn/grades
## 功能
在网页端录入你的教务账号、密码，自动查询成绩，在成绩发生更新时，1分钟之内通过邮件将分数和科目告知你。
## 文件

## 为什么要做这个
每到期末季，我校学子总是少不了不断地登录教务网，一遍又一遍输入枯燥无味的验证码，不断地刷新成绩查询页面，期盼着老师快点出分。
奈何我校没有别人学校的公众号成绩通知，只能自己想一个解决方案来实现最新成绩的通知了。
## 实现方法
### 模拟登录
首先要模拟登录，获取Cookie。
在此之前，我的亲朋好友们会在网页端录入他们的教务账号、密码以及我提供的兑换码到数据库中（服务器资源有限，若用户过多会导致请求过于频繁，会封锁IP，但是这个功能我还没做，因为不是那么重要）。
稍微看了下教务网登录页的代码，再用Chrome的开发者工具查看网络请求，再借助Cookie插件，研究了一下发现是在请求验证码的时候，响应头带上了‘Set-Cookie’字段，因此第一步应该是发送获取验证码的请求以获取一个SESSIONID，再想办法把这个SESSIONID认证。
可以通过百度提供的API识别验证码（幸好教务网的验证码图案简单，不然就难办了），再加上账号和密码发送`POST`请求，获取`SESSIONID`。
教务网的SESSION有效期很短，但是只要不断地发新请求，它就能保持有效。
### 获取成绩查询页
经过研究后发现，只要访问
`http://jwc.swjtu.edu.cn/vatuu/StudentScoreInfoAction?setAction=studentScoreQuery&viewType=studentScore&orderType=submitDate&orderValue=desc`
就可以直接进入成绩查询页，而不需要经过点击再发起新的请求，因此只要在Cookie中带上SESSIONID发一个GET请求就可以获得包含你成绩信息的页面。
```javascript
axios.get(url, {
        headers: {//设置请求头
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Cookie': `JSESSIONID=${Sid}; username=${username}`,//SESSIONID和学号
            'Host': 'jwc.swjtu.edu.cn',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
        }
    }).then((result) => {
        let data = result.data;
        console.log(data);
        getDataFromHTML(data);
    }).catch((err) => {
        console.log(err);
    });
```
### 解析页面，抓取最新成绩
现在思路就非常清晰了，接下来只要在获取到的页面中，将其中的成绩信息提取出来即可。
下面用到一个叫`cheerio`的模块，用法参照[官方文档](https://www.npmjs.com/package/cheerio)
```javascript
    function getDataFromHTML(data) {
        const $ = cheerio.load(data);
        $('table#table3 tbody tr:nth-child(2) td:nth-child(3)').each((i, elem) => {
            let className = elem.children[0].data;//课程名
            console.log(`yes`);
            console.log(className);
        });
    }
```

