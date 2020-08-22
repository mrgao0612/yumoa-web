<template>
  <div class="app-container">
    <el-row style="margin: 20px 0;">
      <el-col :span="24">
        <el-breadcrumb separator=">">
          <el-breadcrumb-item>流程管理</el-breadcrumb-item>
          <el-breadcrumb-item>流程列表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-col>
    </el-row>
    <el-card>
      <div class="filter-container">
        <el-input v-model="keyword" placeholder="模型名称" style="width: 200px;" class="filter-item"/>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="initList">搜索</el-button>
        <el-button class="filter-item" style="margin-left: 10px;" type="success" icon="el-icon-plus" @click="handleCreate">添加</el-button>
      </div>
      <el-table :key="tableKey" v-loading="loading" :data="workList" fit stripe highlight-current-row style="width: 100%; margin: 20px 0;" :header-cell-style="{background:'#eef1f6',color:'#606266'}">
        <el-table-column label="ID" prop="id" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="模型名称" prop="name" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="KEY" prop="key" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.key }}</span>
          </template>
        </el-table-column>
        <el-table-column label="版本" prop="version" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.version }}</span>
          </template>
        </el-table-column>
        <el-table-column label="部署ID" prop="deploymentId" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.deploymentId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-tooltip content="流程定义" placement="top">
              <i class="el-icon-s-marketing operate-edit" @click="handleDraw(row)" />
            </el-tooltip>
            <el-tooltip content="部署" placement="top">
              <i class="el-icon-s-promotion operate-edit" @click="handleDeploy(row)" />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <i class="el-icon-edit-outline operate-edit" @click="handleUpdate(row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <i class="el-icon-delete-solid operate-delete" @click="handleDelete(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div class="page">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                       :current-page="pageNum" :page-sizes="[10, 20, 30, 40]" :page-size="pageSize"
                       layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>

      <el-dialog :title="title" width="35%" top="5vh" :visible.sync="showDialog" :rules="rules" :close-on-click-modal="false" @close="cancel">
        <el-form :model="modelForm" label-width="80px" ref="modelForm">
          <el-form-item label="模型名称" prop="name" hidden>
            <el-input v-model="modelForm.id" />
          </el-form-item>
          <el-form-item label="模型名称" prop="name">
            <el-input v-model="modelForm.name" placeholder="请输入模型名称" />
          </el-form-item>
          <el-form-item label="模型标识" prop="key">
            <el-input v-model="modelForm.key" placeholder="请输入模型标识" />
          </el-form-item>
          <el-form-item label="流程描述" prop="desc">
            <el-input v-model="modelForm.desc" type="textarea" :rows="2" placeholder="请输入流程描述" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submit('modelForm')">确定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { MessageBox } from 'element-ui'
let userInfo = JSON.parse(localStorage.getItem('UserInfo'))
export default {
  name: 'WorkFlow',
  data () {
    return {
      workList: [],
      title: '创建模型',
      loading: false,
      showDialog: false,
      tableKey: 1,
      total: 0,
      pageSize: 10,
      pageNum: 1,
      keyword: '',
      modelId: '',
      actUrl: 'http://127.0.0.1:8999/static/modeler.html?',
      modelForm: {
        id: '',
        name: '',
        key: '',
        desc: ''
      },
      rules: {
        name: [
          { required: true, message: '模型名称不能为空', trigger: 'change' }
        ],
        key: [
          { required: true, message: '模型标识不能为空', trigger: 'change' }
        ]
      }
    }
  },
  mounted () {
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
        url: '/api/activiti/modelList?name=' + this.keyword + '&pageSize=' + this.pageSize + '&pageNum=' + this.pageNum,
        headers: {
          'Authorization': userInfo['token']
        }
      }).then(res => {
        let data = res.data
        if (data && data['code'] === 200) {
          this.workList = data['data']['list']
          this.total = data['data']['total']
          this.loading = false
        } else {
          this.$message.warning('无数据')
        }
      }).catch(() => {
        this.loading = false
        this.$message.error('查询失败')
      })
    },
    handleDraw (row) {
      window.open(this.actUrl + 'modelId=' + row.id)
    },
    handleDeploy (row) {
      MessageBox.confirm('您确定要部署该模型吗？', '确认部署', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$axios({
          method: 'GET',
          url: '/api/activiti/' + row.id + '/deployment',
          headers: {
            'Authorization': userInfo['token']
          }
        }).then(res => {
          if (res.data['code'] === 200) {
            this.$message.success('部署成功')
            this.loading = true
            this.initList()
          } else {
            this.$message.warning(res.data['msg'])
            this.loading = false
          }
        })
      }).catch(() => {
        this.$message.warning('取消部署')
      })
    },
    handleCreate () {
      this.title = '创建模型'
      this.showDialog = true
    },
    handleUpdate (row) {
      this.title = '修改模型'
      this.showDialog = true
      this.$axios({
        method: 'GET',
        url: '/api/activiti/' + row.id,
        headers: {
          'Authorization': userInfo['token']
        }
      }).then(res => {
        let data = res.data
        if (data && data['code'] === 200) {
          this.modelForm.id = data['data']['id']
          this.modelForm.name = data['data']['name']
          this.modelForm.key = data['data']['key']
          this.modelForm.desc = JSON.parse(data['data']['metaInfo'])['description']
        } else {
          this.$message.warning('模型不存在')
          this.showDialog = false
        }
      })
    },
    handleDelete (row) {
      MessageBox.confirm('您确定要删除该模型吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$axios({
          method: 'DELETE',
          url: '/api/activiti/' + row.id,
          headers: {
            'Authorization': userInfo['token']
          }
        }).then(res => {
          if (res.data['code'] === 200) {
            this.$message.success('删除成功')
            this.initList()
          }
        })
      }).catch(() => {
        this.$message.warning('取消删除')
      })
    },
    cancel () {
      this.modelId = ''
      this.showDialog = false
      this.modelForm = {
        id: '',
        name: '',
        key: '',
        desc: ''
      }
    },
    submit (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$axios({
            method: 'POST',
            url: '/api/activiti/save',
            data: this.modelForm,
            headers: {
              'Authorization': userInfo['token']
            }
          }).then(res => {
            let data = res.data
            if (data && data['code'] === 200) {
              this.$message.success('创建模型成功')
              this.showDialog = false
              this.initList()
            } else {
              this.$message.warning('创建模型失败')
            }
          }).catch(() => {})
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-container {
    margin: 20px 0;
  }
</style>
