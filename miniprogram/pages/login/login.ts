// pages/login/login.ts
import {Client} from "../../core/client"

const client = new Client()

Page({

    /**
     * 页面的初始数据
     */
    data: {},
    login() {
        wx.login().then(data => {
            client.post('login', {code: data.code}, {verify: false}).then((res: any) => {
                if (res && res.token) {
                    wx.setStorageSync('token', res.token)
                    wx.navigateBack()
                }
            })
        })
    },
    test() {
        client.get('test')
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})