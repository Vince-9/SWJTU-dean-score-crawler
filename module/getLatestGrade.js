/**
 * 获取最新成绩
 */
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('./logger');
// const login = require('./loginToDean');

//查询成绩页
const url = 'http://jwc.swjtu.edu.cn/vatuu/StudentScoreInfoAction?setAction=studentScoreQuery&viewType=studentScore&orderType=submitDate&orderValue=desc';

exports.getGradeBySid = function (sid) {
    return getGradePage(sid)
        .then((results) => {
            return new Promise((resolve, reject) => {
                let html = results.data;
                if (html.indexOf('课程名称') >= 0) {
                    //查询成功的页面的数据
                    resolve(getDataFromHTML(html));
                } else if (html.indexOf('还没有完成评价') >= 0) {
                    console.log('还没有完成评价');
                }
                else if (html.indexOf('您还未登陆') >= 0) {
                    console.log(`getLatestGrade.js:登录已失效`);
                    reject('未登录');
                } else if (html.indexOf('权限') >= 0) {
                    console.log(html);
                    logger.logErr('返回的页面是无权限，开始尝试登录');
                    reject('未登录');
                }
                else {
                    console.log(`getLatestGrade.js:未知错误`);
                    reject('未知错误');
                    console.log(html);
                }
            })

        })
}

function getGradePage(sid) {
    return axios.get(url, {
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Cookie': `${sid}`,
            'Host': 'jwc.swjtu.edu.cn',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
        }
    })
}

function getDataFromHTML(data) {
    const $ = cheerio.load(data);
    let results = {};
    $('table#table3 tbody tr:nth-child(2) td:nth-child(3)').each((i, elem) => {
        let className = elem.children[0].data; //最新课程的课程名
        results.className = className;
    });

    $('table#table3 tbody tr:nth-child(2) td:nth-child(7)').each((i, elem) => {
        let finalGrade = elem.children[0].data; //最终成绩
        let pat = /[0-9]+\.[0-9]+/;

        //由于数据格式很奇怪,必须从中清洗出最终成绩
        results.finalGrade = parseFloat(finalGrade.substr(finalGrade.search(pat), 5));
    });

    $('table#table3 tbody tr:nth-child(2) td:nth-child(8)').each((i, elem) => {
        let paperGrade = elem.children[0].data; //期末成绩
        results.paperGrade = paperGrade;
    });

    $('table#table3 tbody tr:nth-child(2) td:nth-child(9)').each((i, elem) => {
        let regularGrade = elem.children[0].data; //平时成绩
        results.regularGrade = regularGrade;
    });

    //console.log(new Date(Date.now() + 8 * 60 * 60 * 1000),results);
    return results;
    //$.html()  this line is using.
}