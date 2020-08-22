<template>
  <div style="margin: 20px 0;">
    <el-row style="margin: 20px 20px;">
      <el-col :span="24">
        <el-breadcrumb separator=">">
          <el-breadcrumb-item>我的工作台</el-breadcrumb-item>
          <el-breadcrumb-item>我的申请</el-breadcrumb-item>
        </el-breadcrumb>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="4" style="margin-left: 20px;">
        <el-button type="success" class="el-icon-circle-plus-outline" plain @click="applyFormVisible = true">发起申请</el-button>
      </el-col>
    </el-row>
    <el-table v-loading="loading" :data="applyList" border style="width: 100%;margin: 20px">
      <el-table-column prop="leaveCode" label="编号" width="100"></el-table-column>
      <el-table-column prop="leaveType" label="请假类型" :formatter="typeFormat" width="100"></el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="180"></el-table-column>
      <el-table-column prop="endTime" label="结束时间" width="180"></el-table-column>
      <el-table-column prop="totalHours" label="总时长" width="180"></el-table-column>
      <el-table-column prop="approver" label="审批人" width="180"></el-table-column>
      <el-table-column prop="approveStatus" label="审批状态" :formatter="statusFormat" width="180"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" plain icon="el-icon-edit" @click="showEditDialog(scope.row)"></el-button>
          <el-button size="mini" type="info" plain icon="el-icon-search" @click="showProcessDialog(scope.row)"></el-button>
          <el-button size="mini" type="danger" plain icon="el-icon-delete" @click="showDeleteDialog(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 20px;padding: 5px 0;background-color: #D3DCE6;width: 100%;">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="pageNum" :page-sizes="[10, 20, 30, 40]" :page-size="pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <el-dialog :title="title" :visible.sync="applyFormVisible" width="33%" top="5vh">
      <el-form :model="applyForm" label-width="80px" :rules="rules" ref="applyForm">
        <el-form-item label="请假类型" prop="leaveType">
          <el-select v-model="applyForm.leaveType" placeholder="请选择">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="applyForm.startTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="applyForm.endTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
        </el-form-item>
        <el-form-item label="总时长" prop="totalHours" style="width: 51%;">
          <el-input v-model="applyForm.totalHours" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="请假事由" prop="reason"  style="width: 51%;">
          <el-input type="textarea" v-model="applyForm.reason" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="审批人Id" hidden prop="approverId">
          <el-input v-model="applyForm.approverId" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="审批人" prop="approver" style="width: 51%;">
          <el-input v-model="applyForm.approver" disabled auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="applyFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="applySubmit('applyForm')">提 交</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible="processFormVisible" @modal="false" @close="closeProcessDialog">
        <img :src="imageUrl" />
    </el-dialog>
  </div>
</template>

<script>
let userInfo = JSON.parse(localStorage.getItem('UserInfo'))
export default {
  name: 'applyList',
  data () {
    return {
      applyFormVisible: false,
      loading: false,
      applyList: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      title: '',
      applyForm: {
        leaveCode: 70002,
        leaveType: '',
        reason: '',
        startTime: '',
        endTime: '',
        totalHours: '',
        approverId: 2,
        approver: '部门经理'
      },
      typeOptions: [
        {
          value: 0,
          label: '事假'
        },
        {
          value: 1,
          label: '病假'
        }
      ],
      rules: {
        leaveType: [
          { required: true, message: '请选择请假事由', trigger: 'blur' }
        ],
        reason: [
          { required: true, message: '请输入请假事由', trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: '请输入开始时间', trigger: 'blur' }
        ],
        endTime: [
          { required: true, message: '请输入结束时间', trigger: 'blur' }
        ],
        totalHours: [
          { required: true, message: '请输入请假时长', trigger: 'blur' }
        ]
      },
      processFormVisible: false,
      imageUrl: ''
    }
  },
  mounted () {
    this.initList()
  },
  methods: {
    typeFormat (row) {
      if (row.leaveType === 0) {
        return '事假'
      } else {
        return '病假'
      }
    },
    statusFormat (row) {
      switch (row.approveStatus) {
        case 0:
          return '待审批'
        case 1:
          return '通过'
        case 2:
          return '驳回'
      }
    },
    initList () {
      this.loading = true
      this.$axios({
        method: 'GET',
        url: '/api/leave/applyList?pageNum=' + this.pageNum + '&pageSize=' + this.pageSize,
        headers: {
          'Authorization': userInfo['token']
        }
      }).then(res => {
        let data = res.data
        if (data && data['code'] === 200) {
          this.applyList = data['data']['list']
          this.total = data['data']['total']
        } else {
          this.$message.warning('暂无数据')
        }
        this.loading = false
      }).catch(() => {
        this.$message.error('查询失败')
        this.loading = false
      })
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.initList()
    },
    handleCurrentChange (val) {
      this.pageNum = val
      this.initList()
    },
    applySubmit (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$axios({
            method: 'POST',
            url: '/api/leave/apply',
            data: this.applyForm,
            headers: {
              'Authorization': userInfo['token']
            }
          }).then(res => {
            let data = res.data
            if (data && data['code'] === 200) {
              this.$message.success('提交成功')
              this.initList()
            } else {
              this.$message.error('提交失败')
            }
            this.applyFormVisible = false
          }).catch(() => {
            this.$message.error('提交失败')
            this.applyFormVisible = false
          })
        }
      })
    },
    showEditDialog (row) {
      this.applyFormVisible = true
      console.log(row)
    },
    showProcessDialog (row) {
      this.processFormVisible = true
      this.$axios({
        method: 'GET',
        url: '/api/leave/getProcessImage/' + row.processId,
        headers: {
          'Authorization': userInfo['token']
        },
        responseType: 'arraybuffer'
      }).then(res => {
        return 'data:image/png;base64,' + btoa(new Uint8Array(res.data)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
        )
      }).then(data => {
        this.imageUrl = data
      })
    },
    showDeleteDialog (row) {
      console.log(row)
    },
    closeProcessDialog () {
      this.processFormVisible = false
    }
  }
}
</script>

<style scoped>
</style>
