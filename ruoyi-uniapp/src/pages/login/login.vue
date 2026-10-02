<template>
  <view class="login-container">
    <view class="title">RuoYi-Cloud-Plus</view>
    <view class="subtitle">微服务后端 · 移动端登录</view>

    <view class="form">
      <input class="input" v-model="form.username" placeholder="用户名" />
      <input class="input" v-model="form.password" placeholder="密码" password />
      <view class="captcha-row">
        <input class="input captcha-input" v-model="form.code" placeholder="验证码" />
        <image
          v-if="codeImg"
          class="captcha-img"
          :src="'data:image/png;base64,' + codeImg"
          mode="aspectFit"
          @click="refreshCode"
        />
      </view>

      <button class="btn" :loading="loading" @click="handleLogin">登 录</button>
    </view>

    <view class="tip">默认账号 admin / admin123</view>
  </view>
</template>

<script>
import { getCode } from '@/api/auth.js'
import { useUserStore } from '@/store/user.js'

export default {
  data() {
    return {
      form: { username: 'admin', password: 'admin123', code: '', uuid: '' },
      codeImg: '',
      captchaEnabled: true,
      loading: false
    }
  },
  onLoad() {
    this.refreshCode()
  },
  methods: {
    async refreshCode() {
      try {
        const res = await getCode()
        const d = res.data || {}
        this.captchaEnabled = d.captchaEnabled !== false
        this.form.uuid = d.uuid
        this.codeImg = d.img
        if (!this.captchaEnabled) this.form.code = '0000'
      } catch (e) {
        uni.showToast({ title: '获取验证码失败', icon: 'none' })
      }
    },
    async handleLogin() {
      if (!this.form.username || !this.form.password) {
        uni.showToast({ title: '请输入账号密码', icon: 'none' })
        return
      }
      if (this.captchaEnabled && !this.form.code) {
        uni.showToast({ title: '请输入验证码', icon: 'none' })
        return
      }
      this.loading = true
      const store = useUserStore()
      try {
        await store.login(this.form)
        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/index/index' })
        }, 600)
      } catch (e) {
        uni.showToast({ title: (e && e.message) || '登录失败', icon: 'none' })
        if (this.captchaEnabled) this.refreshCode()
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  padding: 120rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.title {
  font-size: 48rpx;
  font-weight: 700;
  color: #409eff;
}
.subtitle {
  margin-top: 12rpx;
  color: #909399;
  font-size: 26rpx;
}
.form {
  width: 100%;
  margin-top: 80rpx;
}
.input {
  width: 100%;
  height: 88rpx;
  background: #fff;
  border-radius: 12rpx;
  padding: 0 24rpx;
  margin-bottom: 28rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}
.captcha-row {
  display: flex;
  align-items: center;
}
.captcha-input {
  flex: 1;
  margin-right: 20rpx;
}
.captcha-img {
  width: 220rpx;
  height: 88rpx;
  border-radius: 12rpx;
  background: #fff;
}
.btn {
  margin-top: 20rpx;
  background: #409eff;
  color: #fff;
  border-radius: 12rpx;
  font-size: 30rpx;
}
.tip {
  margin-top: 40rpx;
  color: #c0c4cc;
  font-size: 24rpx;
}
</style>
