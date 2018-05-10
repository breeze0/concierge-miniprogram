var app = getApp()

Page({
  data:{
    setTimr: false,
    multiIndex: [0,0],
    buttonDisabled: true,
    code: '',
    phone:''
  },
  getData(res,id,multiIndex){
    this.setData({
      id: id,
      defaultName: res.data.tmp_name,
      name: res.data.tmp_name,
      defaultPhone: res.data.tmp_tel,
      phone: res.data.tmp_tel,
      need_sms: res.data.need_sms
    })
    var dayArr = [];
    var timeArr = [];
    var arr = [];
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
      dayArr.push(time_table.date + ' ' + WEEKDAY_MAP[time_table.wday])
      time_table.table.forEach(function(item){
        if(item.remain == null){
          timeArr.push(item.time+' ( 无限制 )')
        }else{
          timeArr.push(item.time+' (剩余 '+item.remain+' )')
        }
      })
      arr.push(timeArr);
      timeArr = [];
    })
    var requestDate = dayArr[0].slice(0,11);
    var requestTime = arr[0].toString().slice(0,11);
    this.setData({
      multiArray: [dayArr,arr[0]],
      dayArr: dayArr,
      arr: arr,
      requestDate: requestDate,
      requestTime: requestTime,
      selectValue: dayArr[multiIndex[0]]+','+arr[0][multiIndex[1]]
    })

    if(res.data.need_sms == true){
      this.setData({
        codeBox: false
      })
    }else if(res.data.need_sms == false){
      this.setData({
        codeBox: true,
        buttonDisabled: false
      })
    }
  },
  onLoad: function(option){
    app.globalData.flag = true;
    this.setData({
      projectId: option.id
    })
    wx.getStorage({
      key: 'project',
      success: (res) => {
        this.getData(res,option.id,this.data.multiIndex)
      }
    })
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
    if(this.data.code.length === 6 && (/^1[34578]\d{9}$/.test(this.data.phone))){
      return true;
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
    var remain = Number(this.getRemain(this.data.selectValue));
    if(name == ''|| name == null){
      wx.showToast({
        title:'用户名不为空',
        icon: 'none'
      })
      return;
    }else if(remain === 0){
      wx.showToast({
        title:'名额不足',
        icon: 'none',
        duration: 2000
      })
      return;
    }else if(app.globalData.flag == true){
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
                  wx.reLaunch({
                    url: "../projects/projects"
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
            app.globalData.flag = true
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
      })
    }
  },
  bindMultiPickerColumnChange: function(e){
    var multiIndex = this.data.multiIndex
    multiIndex[e.detail.column] = e.detail.value;
    this.setData({
      multiArray: [this.data.dayArr,this.data.arr[multiIndex[0]]]
    })
    var multiArray = this.data.multiArray;
    if(e.detail.column == 0){
      var multiIndex = [multiIndex[0],0];
    }else{
      var multiIndex = multiIndex;
    }
    var requestDate = multiArray[0][multiIndex[0]].slice(0,11);
    var requestTime = multiArray[1][multiIndex[1]].slice(0,11);
    this.setData({
      multiIndex: multiIndex,
      requestDate: requestDate,
      requestTime: requestTime
    })
  },
  bindMultiPickerChange: function (e) {
    var valueStr = this.data.multiArray[1][this.data.multiIndex[1]];
    var remain = Number(this.getRemain(valueStr));
    if(remain !=0){
      this.setData({
        multiIndex: e.detail.value,
        selectValue: this.data.multiArray[0][this.data.multiIndex[0]]+','+this.data.multiArray[1][this.data.multiIndex[1]]
      })
    }else if(remain === 0){
      wx.showToast({
        title: '名额不足',
        icon: 'none',
        duration: 2000
      })
      return
    }
  },
  getRemain(valueStr){
    var value = valueStr.substring(valueStr.indexOf("(")+1,valueStr.indexOf(")")).trim();
    if(value !="无限制"){
      var remain = value.slice(2,6)
    } else if(value == "无限制") {
      var remain = value;
    }
    return remain
  }
})