<template>
    <div class="user">
      <el-row>
        <el-col :span="24">
          <el-breadcrumb separator=">">
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
          </el-breadcrumb>
        </el-col>
      </el-row>

      <el-row class="search-row">
        <el-col :span="8">
          <el-input placeholder="请输入关键字" v-model="keyword" @keydown.native.enter="initList">
            <el-button type="primary" slot="append" class="el-icon-search" @click="initList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4" class="add-user">
          <el-button type="success" class="el-icon-circle-plus-outline" plain @click="addUserFormVisible=true">添加用户</el-button>
        </el-col>
      </el-row>

      <el-table class="user-table" v-loading="loading" :data="userList" border style="width: 100%">
        <el-table-column prop="userCode" label="编号" width="100"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="deptName" label="部门" width="180"></el-table-column>
        <el-table-column prop="roleName" label="角色" width="180"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" plain icon="el-icon-edit" @click="showEditDialog(scope.row)"></el-button>
            <el-button size="mini" type="danger" plain icon="el-icon-delete" @click="showDeleteDialog(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="page">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page="pageNum" :page-sizes="[10, 20, 30, 40]" :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>
      <!-- 添加用户对话框 -->
      <el-dialog title="添加用户" :visible.sync="addUserFormVisible">
        <el-form :model="addForm" label-width="80px" :rules="rules" ref="addUserForm">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="addForm.mobile" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="部门" prop="deptId">
            <el-input v-model="addForm.deptId" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="角色" prop="roleId">
            <el-input v-model="addForm.roleId" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="addDialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUserSubmit('addUserForm')">确 定</el-button>
        </div>
      </el-dialog>
      <!-- 编辑用户对话框 -->
      <el-dialog title="编辑用户" :visible.sync="editDialogFormVisible">
        <el-form :model="editForm" label-width="80px" :rules="rules" ref="editUserForm">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username" auto-complete="off" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="editForm.mobile" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="部门" prop="deptName">
            <el-input v-model="editForm.deptName" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="角色" prop="roleName">
            <el-input v-model="editForm.roleName" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserSubmit('editUserForm')">确 定</el-button>
        </div>
      </el-dialog>
    </div>
</template>

<script>
const userInfo = JSON.parse(localStorage.getItem('UserInfo'))
export default {
  name: 'userList',
  data: function () {
    return {
      keyword: '',
      addUserFormVisible: false,
      editDialogFormVisible: false,
      loading: true,
      userList: [],
      total: 0,
      pageSize: 10,
      pageNum: 1,
      addForm: {
        username: '',
        password: '',
        mobile: '',
        deptId: '',
        roleId: ''
      },
      editForm: {
        id: '',
        mobile: '',
        deptName: '',
        roleName: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '电话不能为空', trigger: 'blur' }
        ],
        deptId: [
          { required: true, message: '请选择部门', trigger: 'blur' }
        ],
        roleId: [
          { required: true, message: '请选择角色', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.initList()
  },
  methods: {
    handleSizeChange (val) {
      this.pageSize = val
      this.initList()
    },
    handleCurrentChange (val) {
      this.pageNum = val
      this.initList()
    },
    initList () {
      this.loading = true
      this.$axios({
        method: 'GET',
        url: '/api/user/list',
        data: {
          keyword: this.keyword,
          pageSize: this.pageSize,
          pageNum: this.pageNum
        },
        headers: {
          'Authorization': userInfo['token']
        }
      }).then(res => {
        let data = res.data
        if (data && data['code'] === 200) {
          this.userList = data['data']['list']
          this.total = data['data']['total']
          this.loading = false
        } else {
          this.$message.warn('无数据')
          this.loading = false
        }
      }).catch(() => {
        this.$message.error('系统错误')
        this.loading = false
      })
    },
    addUserSubmit (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$axios({
            method: 'POST',
            url: '/api/user/save',
            data: this.addForm,
            headers: {
              'Authorization': userInfo['token']
            }
          }).then(res => {
            let data = res.data
            if (data && data['code'] === 200) {
              this.$message.success('创建用户成功')
              this.addUserFormVisible = false
              this.initList()
            } else {
              this.$message.error('创建用户失败')
            }
          })
        }
      })
    },
    showEditDialog (row) {
      this.editDialogFormVisible = true
      this.$axios({
        method: 'GET',
        url: '/api/user/getUserInfoById/' + row.id,
        headers: {
          'Authorization': userInfo['token']
        }
      }).then(res => {
        let data = res.data
        if (data['code'] === 200) {
          let userInfo = data['data']
          this.editForm.username = userInfo['username']
          this.editForm.mobile = userInfo['mobile']
          this.editForm.deptName = userInfo['deptName']
          this.editForm.roleName = userInfo['roleName']
        }
      }).catch(() => {
        this.$message.error('获取用户信息失败')
      })
    },
    editUserSubmit (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$axios({
            method: 'POST',
            url: '/api/user/save',
            data: this.editForm,
            headers: {
              'Authorization': userInfo['token']
            }
          }).then(res => {
            let data = res.data
            if (data && data['code'] === 200) {
              this.$message.success('编辑用户成功')
              this.editDialogFormVisible = false
              this.initList()
            } else {
              this.$message.error('编辑用户失败')
            }
          })
        }
      })
    },
    showDeleteDialog (row) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 执行删除用户操作
        this.$axios({
          method: 'DELETE',
          url: '/api/user/delete/' + row.id,
          headers: {
            'Authorization': userInfo['token']
          }
        }).then(res => {
          if (res.meta.status === 200) {
            this.$message.success('删除成功')
            this.initList()
          } else {
            this.$message.error('删除失败')
          }
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .user {
    .search-row {
      margin: 20px 0;
      .add-user {
        margin-left: 20px;
      }
    }
    .user-table {
      margin: 20px 0;
    }
    .page {
      padding: 5px 0;
      background-color: #D3DCE6;
    }
  }
</style>
