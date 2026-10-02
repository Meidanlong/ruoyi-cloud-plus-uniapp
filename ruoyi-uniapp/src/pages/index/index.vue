<template>
  <view class="page">
    <view class="card">
      <view class="card-title">当前用户</view>
      <view class="kv"><text>用户名</text><text>{{ userInfo.userName || userInfo.nickName || '-' }}</text></view>
      <view class="kv"><text>昵称</text><text>{{ userInfo.nickName || '-' }}</text></view>
      <view class="kv"><text>角色</text><text>{{ roles.join('、') || '-' }}</text></view>
    </view>

    <view class="card">
      <view class="card-title">角色列表（GET /system/role/list 鉴权链路验证）</view>
      <view v-if="roleLoading" class="empty">加载中...</view>
      <view v-else-if="rolesList.length === 0" class="empty">无数据</view>
      <view v-for="r in rolesList" :key="r.roleId" class="role-item">
        <text>{{ r.roleName }}</text>
        <text class="role-key">{{ r.roleKey }}</text>
      </view>
    </view>

    <button class="logout" @click="handleLogout">退出登录</button>
  </view>
</template>

<script>
import { useUserStore } from '@/store/user.js'
import { roleList } from '@/api/system.js'

export default {
  data() {
    return {
      userInfo: {},
      roles: [],
      rolesList: [],
      roleLoading: true
    }
  },
  async onLoad() {
    const store = useUserStore()
    if (!store.token) {
      uni.reLaunch({ url: '/pages/login/login' })
      return
    }
    try {
      this.userInfo = await store.fetchInfo()
      this.roles = store.roles
    } catch (e) {
      uni.showToast({ title: '获取用户信息失败', icon: 'none' })
    }
    await this.loadRoles()
  },
  methods: {
    async loadRoles() {
      this.roleLoading = true
      try {
        const res = await roleList()
        this.rolesList = (res.data && res.data.rows) || []
      } catch (e) {
        uni.showToast({ title: '获取角色列表失败', icon: 'none' })
      } finally {
        this.roleLoading = false
      }
    },
    async handleLogout() {
      const store = useUserStore()
      await store.logout()
      uni.reLaunch({ url: '/pages/login/login' })
    }
  }
}
</script>

<style scoped>
.page {
  padding: 30rpx;
}
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}
.card-title {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  color: #303133;
}
.kv {
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
  color: #606266;
  padding: 10rpx 0;
}
.role-item {
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.role-key {
  color: #909399;
  font-size: 24rpx;
}
.empty {
  color: #c0c4cc;
  font-size: 26rpx;
  padding: 20rpx 0;
}
.logout {
  margin-top: 20rpx;
  background: #f56c6c;
  color: #fff;
  border-radius: 12rpx;
}
</style>
