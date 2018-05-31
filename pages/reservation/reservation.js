var app = getApp()

Page({
  data:{
    setTimr: false,
    value: [0,0],
    selList: [],
    buttonDisabled: true,
    code: '',
    phone:'',
    selValue:[],
    multiHidden: true,
    dateShow: "",
    initTimeList: [],
    initValue: [0,0],
    requestTime:[],
    requestDate: []
  },
  WEEKDAY_MAP: {
    "Sun":"周日",
    "Mon":"周一",
    "Tues":"周二",
    "Wed":"周三",
    "Thur":"周四",
    "Fri":"周五",
    "Sat":"周六",
    "Special":"特殊",
    "Holiday":"节假日"
  },
  dataInit(){
    var times = this.data.times;
    times.forEach((time) => {
      var id=0
      time.forEach((item) => {
        item.selStatus = false;
        item.id = id;
        id+=1;
      })
    })
    this.setData({
      times: times,
    })
  },
  getData(res,id,multiIndex){
    this.setData({
      id: id,
      defaultName: res.data.tmp_name,
      name: res.data.tmp_name,
      defaultPhone: res.data.tmp_tel,
      phone: res.data.tmp_tel,
      need_sms: res.data.need_sms,
      multi_time: res.data.multi_time
    })
    var multi_time = res.data.multi_time;
    var dayArr = [];
    var timeArr = [];
    var arr = [];
    var times = [];
    var multiArray= [];
    var WEEKDAY_MAP = {
      0:"周日",
      1:"周一",
      2:"周二",
      3:"周三",
      4:"周四",
      5:"周五",
      6:"周六"
    }
    multiArray = JSON.parse(res.data.time_table);
    multiArray.forEach(function(time_table){
      dayArr.push(time_table.date + '   ' + WEEKDAY_MAP[time_table.wday])
      time_table.table.forEach(function(item){
        if(item.remain == null){
          timeArr.push(item.time+' ( 无限制 )');
          item.remain = "无限制"
        }else{
          timeArr.push(item.time+' (剩余 '+item.remain+' )')
        }
      })
      arr.push(timeArr);
      times.push(time_table.table);
      timeArr = [];
    })
    var requestDate = dayArr[0].slice(0,11);
    var requestTime = [arr[0].toString().slice(0,11)];
    times.forEach((time) => {
      var id=0
      time.forEach((item) => {
        item.selStatus = false;
        item.id = id;
        id+=1;
      })
    })
    this.setData({
      times: times,
      dates: dayArr,
      date: dayArr[0],
      timeList: times[0],
    })
    if(res.data.need_sms == true){
      this.setData({
        codeBox: false
      })
    }else if(res.data.need_sms == false){
      if(multi_time == true){
        this.setData({
          codeBox: true,
          buttonDisabled: true
        })
      } else {
        this.setData({
          codeBox: true,
          buttonDisabled: false
        })
      }
    }
    if(multi_time == true){
      this.setData({
        multiPicker: true,
        requestDate: [],
        requestTime: []
      })
    } else {
      this.setData({
        multiPicker: false,
      })
    }
  },
  onLoad: function(option){
    app.globalData.flag = true;
    this.setData({
      projectId: option.id,
      mask: false
    })
    var project_id;
    if(option.id) project_id = option.id;
    else if(decodeURIComponent(option.scene)) project_id = decodeURIComponent(option.scene);
    if(app.globalData.token) {
      wx.request({
        method: "GET",
        url: app.globalData.server + '/miniprogram/projects/' + project_id,
        header: {
          'Authorization': app.globalData.token
        },
        success: (res) => {
          var json = res.data.time_state;
          var keyArr = [];
          var keyValue = [];
          var n;
          Object.keys(json).forEach(key => {
            if(json[key].length > 0 ){
              keyArr.push([key, json[key]])
            }
          })
          keyArr.forEach(item => {
            item[0] = this.WEEKDAY_MAP[item[0]]
          })
          var reservation_per_user = res.data.reservation_per_user
          if(reservation_per_user === null){
            reservation_per_user = ''
          }
          this.setData({
            imageUrl: app.globalData.server + res.data.cover,
            title: res.data.name,
            id: project_id,
            isFull: res.data.full,
            address: res.data.address,
            description: res.data.description,
            bookingTime: keyArr,
            aheadTime: res.data.ahead_time,
            perCount: reservation_per_user,
            reservable: res.data.reservable,
            longitude:res.data.longitude,
            latitude: res.data.latitude,
            address: res.data.address,
            mask: true,
            state: res.data.state
          })
          this.getData(res,option.id,this.data.multiIndex)
        }
      })
    }
    else {
      wx.login({
        success: resCode => {
          wx.request({
            url: app.globalData.server + '/miniprogram/login',
            method: 'POST',
            data: {
              'code': resCode.code 
            },
            success: response => {
              app.globalData.token = response.data.token;
              app.globalData.role = response.data.role;
              wx.request({
                method: "GET",
                url: app.globalData.server + '/miniprogram/projects/' + project_id,
                header: {
                  'Authorization': app.globalData.token
                },
                success: (res) => {
                  var json = res.data.time_state;
                  var keyArr = [];
                  var keyValue = [];
                  var n;
                  Object.keys(json).forEach(key => {
                    if(json[key].length > 0 ){
                      keyArr.push([key, json[key]])
                    }
                  })
                  keyArr.forEach(item => {
                    item[0] = this.WEEKDAY_MAP[item[0]]
                  })
                  this.setData({
                    imageUrl: app.globalData.server + res.data.cover,
                    title: res.data.name,
                    id: project_id,
                    isFull: res.data.full,
                    address: res.data.address,
                    description: res.data.description,
                    bookingTime: keyArr,
                    aheadTime: res.data.ahead_time,
                    perCount: res.data.reservation_per_user,
                    reservable: res.data.reservable,
                    longitude:res.data.longitude,
                    latitude: res.data.latitude,
                    address: res.data.address,
                    mask: true,
                    state: res.data.state
                  })
                  this.getData(res,option.id,this.data.multiIndex)
                }
              })
            }
          })
        }
      })
    }
  },
  getCode: function(){
    var phone = this.data.phone;
    var count = 60;
    if(!(/^1[34578]\d{9}$/.test(phone))){
      wx.showToast({
        title:'手机号格式错误',
        icon:'none'
      })
      return
    }else{
      if(0 < count && count <= 60){
        var timr = setInterval(() => {
          if(count == 0){
          this.setData({
            count: 60,
            setTimr: false
          })
          clearInterval(timr)
          return count
          }else{
            count -=1;
            this.setData({
              count: count,
              setTimr: true
            })
          }
        },1000);
      }
      wx.request({
        url: app.globalData.server + '/miniprogram/projects/'+ this.data.id +'/code',
        method:'POST',
        header: {
          'Authorization': app.globalData.token
        },
        data: {
          tel: this.data.phone
        },
        success :(res) => {
          if(res.statusCode == 400 || res.statusCode == 422){
            wx.showToast({
              title:'发送验证码失败',
              icon:'none',
              duration: 1000
            })
            return
          }
        }
      })
    }
  },
  validate(){
    if(this.data.need_sms == false){
      if((/^1[34578]\d{9}$/.test(this.data.phone)) && this.data.requestTime != ""){
        return true;
      }
    }else if(this.data.need_sms == true){
      if(this.data.code.length === 6 && (/^1[34578]\d{9}$/.test(this.data.phone)) && this.data.requestTime != ""){
        return true;
      }
    }else{
      return false
    }
  },
  bindNameChange: function(e){
    this.setData({
      name: e.detail.value
    })
  },
  bindPhoneChange: function(e){
    this.setData({
      phone:e.detail.value
    })
    if(this.data.need_sms){
      this.setData({
        buttonDisabled: !this.validate()
      })
    } else {
      if(this.data.phone === this.data.defaultPhone) {
        this.setData({
          buttonDisabled: false,
          codeBox: true
        })
      } else {
        this.setData({
          codeBox: false
        })
        this.setData({
          buttonDisabled: !this.validate()
        })
      }
    }
  },
  bindCodeChange: function(e){
    this.setData({
      code: e.detail.value
    })
    this.setData({
      buttonDisabled: !this.validate()      
    })
  },
  reservation: function(){
    var name = this.data.name;
    var code = this.data.code;
    if(name == ''|| name == null){
      wx.showToast({
        title:'用户名不为空',
        icon: 'none'
      })
      return;
    }
    else if(app.globalData.flag == true){
      app.globalData.flag = false
      wx.request({
        url: app.globalData.server + '/miniprogram/reservations',
        method: 'POST',
        header: {
          'Authorization': app.globalData.token
        },
        data:{
          code: this.data.code,
          project_id: this.data.id,
          name: this.data.name,
          tel: this.data.phone,
          date: this.data.requestDate,
          time: this.data.requestTime
        },
        success: (res) =>{
          if(res.statusCode == 201){
            wx.showToast({
              title:'预约成功',
              duration: 1000,
              success: () => {
                setTimeout(function() {
                  wx.switchTab({
                    url: "../userInfo/userInfo"
                  })
                }, 1000)
              }
            })
          }else if(res.statusCode == 422){
            wx.showToast({
              title: '验证码错误',
              icon: 'none',
              duration: 2000
            })
          }else if(res.statusCode == 400 ){
            wx.showToast({
              title: '发送验证码失败',
              icon: 'none',
              duration: 2000
            })
          }else if(res.statusCode == 403 ){
            wx.showToast({
              title: '名额不足',
              icon: 'none',
              duration: 2000
            })
            wx.request({
              url: app.globalData.server + '/miniprogram/projects/' + this.data.projectId,
              method: 'GET',
              header: {
                'Authorization': app.globalData.token
              },
              success: res => {
                this.getData(res,this.data.projectId,this.data.multiIndex)
              }
            })
          }
        },
        complete(){
          app.globalData.flag = true
        }
      })
    }
  },
  bindChange(e) {
    const val = e.detail.value;
    var timeVal = [];
    timeVal[0] = 0;
    this.dataInit();
    this.setData({
      value: [val[0],val[0]],
      selList:[],
      timeValue: timeVal,
      selValue: []
    })
    this.setData({
      date: this.data.dates[this.data.value[0]],
      timeList: this.data.times[this.data.value[1]],
    })
  },
  select(e){
    var selArr = this.data.selArr;
    var dataList = this.data.times[this.data.value[1]];
    var selIndex = e.currentTarget.dataset.selectIndex;
    var index = this.data.selArr.indexOf(selIndex);
    if(index === -1){
      if(this.data.multiPicker == false){
        selArr = [];
        selArr.push(e.currentTarget.dataset.selectIndex);
        dataList.forEach((item) => {
          item.selStatus = false;
          if(item.id == selIndex){
            item.selStatus = true
          } 
        })
      } else {
        selArr.push(e.currentTarget.dataset.selectIndex);
        dataList.forEach((item) => {
          if(item.id == selIndex){
            item.selStatus = true
          } 
        })
      }
    } else {
      dataList.forEach((item) => {
        if(item.id === selIndex){
          item.selStatus = false
        }
      })
      selArr.splice(index,1)
    }
    this.setData({
      selArr: selArr,
      timeList: dataList
    })
  },
  cancel(){
    this.setData({
      multiHidden: true
    })
  },
  confirm(){
    var selRemain = [];
    var selValue = []
    this.data.selArr.forEach((item)=>{
      selValue.push(this.data.timeList[item].time),
      selRemain.push(this.data.timeList[item].remain)
    })
    if(selValue.length){
      var notZero = selRemain.every((value)=>{
        return value != 0;
      })
      if(notZero == false){
        wx.showToast({
          title: '名额不足',
          icon: 'none',
          duration: 2000
        })
        this.setData({
          dateShow: "",
          selValueShow: [],
          requestDate: [],
          requestTime: [],
          buttonDisabled: true
        })
      }else{
        this.setData({
          selList: this.data.selArr
        })
        this.setData({
          dateShow: this.data.date,
          selValueShow: selValue,
          requestDate: this.data.date.slice(0,10),
          requestTime: selValue,
          buttonDisabled: false,
          initTimeList: this.data.selList,
          initValue: this.data.value
        })
      }
    }else{
      this.setData({
        dateShow: "",
        selValueShow: selValue,
        requestDate: [],
        requestTime: [],
        buttonDisabled: true,
        initTimeList: [],
        initValue: [0,0]
      })
    }
    this.setData({
      multiHidden: true,
      buttonDisabled: !this.validate()
    })
  },
  multiShow(){
    this.data.times[this.data.initValue[1]].forEach((item,valueIndex) => {
      item.selStatus = false
    })
    this.data.initTimeList.forEach((index)=>{
      this.data.times[this.data.initValue[1]].forEach((item,valueIndex) => {
        if(valueIndex == index){
          item.selStatus = true
        } 
      })
    })
    this.setData({
      multiHidden: false,
      value: this.data.initValue,
      timeList: this.data.times[this.data.initValue[1]],
      selArr: this.data.initTimeList
    })
  },
  getRemain(valueStr){
    var value = valueStr.substring(valueStr.indexOf("(")+1,valueStr.indexOf(")")).trim();
    if(value !="无限制"){
      var remain = value.slice(2,6)
    } else if(value == "无限制") {
      var remain = value;
    }
    return remain
  },
  openMap: function () {
    if(this.data.latitude && this.data.longitude){
      wx.openLocation({
        latitude : this.data.latitude,
        longitude : this.data.longitude,
        name: this.data.title,
        address: this.data.address
      })
    }
  },
})