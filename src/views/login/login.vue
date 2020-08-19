<template>
    <div class="login-container">
        <el-form ref="loginForm" status-icon :rules="rules" :model="loginForm" label-width="80px" class="login-form">
            <h2 class="login-title">YumOA</h2>
            <el-form-item prop="mobile">
                <el-input v-model="loginForm.mobile" prefix-icon="el-icon-user" placeholder="账号/手机号" autocomplete="false" clearable></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password" placeholder="密码" autocomplete="false" clearable></el-input>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" v-on:click="submitForm('loginForm')">登录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  data () {
    let checkMobile = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入手机号'))
      } else if (!this.isMobile(value)) {
        callback(new Error('请输入正确手机号'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        mobile: '',
        password: ''
      },
      rules: {
        mobile: [
          {required: true, validator: checkMobile, trigger: 'blur'}
        ],
        password: [
          {required: true, message: '密码不能为空', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    ...mapMutations(['setUserInfo']),
    submitForm (formName) {
      let _this = this
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$axios({
            method: 'post',
            url: '/api/login',
            data: this.loginForm,
            headers: {
              'Authorization': ''
            }
          }).then(res => {
            let data = res.data
            if (data['code'] === 200) {
              if (data['data']['token']) {
                _this.setUserInfo([{UserInfo: data['data']}])
                this.$message.success('登录成功')
                this.$router.push('/index')
              } else {
                this.$router.replace('/login')
              }
            } else {
              this.$message.error('账号或密码错误')
            }
          }).catch(err => {
            console.log(err)
            this.$message.error('账号或密码错误')
          })
        } else {
          return false
        }
      })
    },
    isMobile (mobile) {
      return /^1([345678])\d{9}$/.test(mobile)
    }
  }
}
</script>

<style scoped>
.login-form {
    width: 350px;
    margin: 180px auto;
    background-color: rgb(255, 255, 255, 0.6);
    padding: 30px;
    border-radius: 20px;
}

.login-container {
    position: absolute;
    width: 100%;
    height: 100%;
    background: url("../../assets/login.jpg");
    background-size: cover;
}

.login-title {
    color: #303133;
    text-align: center;
}

</style>
