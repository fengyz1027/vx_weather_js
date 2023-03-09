const axios = require('axios');
const config = {
  "url": "https://api.weixin.qq.com/cgi-bin/message/template/send",
  "appId": "wxbc423459651363c0",
  "appSecret": "96c34ae4bf421875d74d0016be4a8a05",
  "templateId": "j4QFFpQcqrSSL970pevgy24Z5UsLIhKjgDOXG8e0nJs",
  "user": ["oaX246GIQpySf9uj5znkf4DnDxjk", "oaX246Oan42q76oiwiH9oMlLaed4"],
  "weatherKey": "4d23ff80a7504f6b803baa826244a0a3",
  "region": "济南市"
};

// 获取token
async function getAccessToken() {
  const {data: res} = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appId}&secret=${config.appSecret}`)
  return res
}

// 获取当天日期
function getDate() {
  const time2 = new Date();
  const date = `${time2.getFullYear() + '-' + (time2.getMonth() + 1) + '-' + time2.getDay()}`;
  const weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const day = new Date().getDay();
  const week = weeks[day];
  return `${date} ${week}`
}

// 计算恋爱时间
function computeLoveTime(loveStart) {
  const time2 = new Date()
  const love_time_start = time2.getTime() - new Date(loveStart).getTime()
  const love_time_day = Math.floor(new Date(love_time_start) / (1000 * 60 * 60 * 24))
  const love_time_hours = Math.floor(new Date(love_time_start) / (1000 * 60 * 60))
  const love_time_mins = Math.floor(new Date(love_time_start) / (1000 * 60))
  const love_time_second = love_time_start / 1000
  return {
    love_time_day,
    love_time_hours,
    love_time_mins,
    love_time_second
  }
}

// 获取天气
async function getWeather() {
  const weather = await axios.get("https://devapi.qweather.com/v7/weather/3d?key=4d23ff80a7504f6b803baa826244a0a3&location=101120101")
  return weather.data.daily[0]
}

// 生日倒计时
function computeBirthday() {
  const userList = [
    {
      name: "冯月正",
      birthday: "1997-10-27"
    },
    {
      name: "王培瑶",
      birthday: "1999-11-23"
    }
  ]
  let birthday_text = ''
  let rObj = {}
  userList.map((item, index) => {
    const time2 = new Date()
    let year = null
    let birTime = new Date(item.birthday)
    if (time2.getMonth() <= birTime.getMonth()) {
      year = time2.getFullYear()
    } else {
      year = time2.getFullYear() + 1
    }
    birTime.setFullYear(year)
    birthday_text = `距离${item.name}的生日还有${Math.ceil(((birTime.getTime() - time2.getTime()) / (1000 * 3600 * 24)))}天`
    rObj[`birthday${index+1}`] = {
      value: birthday_text, color: randomColor()
    }
  })
  return rObj
}

// 获取每日名句
async function getIciba() {
  const jinshan = await axios.get("http://open.iciba.com/dsapi/")
  return jinshan.data
}

// 随机生成颜色
function randomColor(){
  return  '#' + (function(color){
    return (color +=  '0123456789abcdef'[Math.floor(Math.random()*16)])
    && (color.length == 6) ?  color : arguments.callee(color);
  })('');
}

async function run(user) {
  const date = getDate()
  const {love_time_day} = computeLoveTime('2021-06-13')
  const birthdayObj = computeBirthday()
  const {textDay: text, tempMin, tempMax, windDirDay: windDir} = await getWeather()
  const {note, content} = await getIciba()
  const {access_token} = await getAccessToken()

  let data = {
    touser: user,
    template_id: config.templateId,
    url: "https://weixin.qq.com/download",
    data: {
      date: {
        value: date,
        color: randomColor()
      },
      region: {
        value: config.region,
        color: randomColor()
      },
      weather: {
        value: text,
        color: randomColor()
      },
      temp: {
        value: tempMin + '℃ ~ ' + tempMax + '℃',
        color: randomColor()
      },
      wind_dir: {
        value: windDir,
        color: randomColor()
      },
      love_day: {
        value: love_time_day,
        color: randomColor()
      },
      note_en: {
        value: note,
        color: randomColor()
      },
      note_ch: {
        value: content,
        color: randomColor()
      }
    }
  }
  data.data = Object.assign(data.data, birthdayObj)

  await axios.post(config.url+`?access_token=${access_token}`, data).then(res => {
    console.log(res.data);
  })
}

for (let userKey of config.user) {
  run(userKey)
}
// run()
