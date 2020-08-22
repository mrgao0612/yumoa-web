<template>
<div class="approve">
  <el-row>
    <el-col :span="24">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>处理中心</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
  </el-row>

  <el-table v-loading="loading" :data="approveList" border style="width: 100%;margin: 20px">
    <el-table-column prop="leaveCode" label="编号" width="100"></el-table-column>
    <el-table-column prop="leaveType" label="请假类型" :formatter="typeFormat" width="100"></el-table-column>
    <el-table-column prop="startTime" label="开始时间" width="180"></el-table-column>
    <el-table-column prop="endTime" label="结束时间" width="180"></el-table-column>
    <el-table-column prop="totalHours" label="总时长" width="180"></el-table-column>
    <el-table-column prop="reason" label="请假事由" width="200"></el-table-column>
    <el-table-column prop="ownerName" label="申请人" width="180"></el-table-column>
    <el-table-column prop="approveStatus" label="审批状态" :formatter="statusFormat" width="180"></el-table-column>
    <el-table-column label="操作">
      <template slot-scope="scope">
        <el-button size="mini" type="success" plain icon="el-icon-check" @click="showPassDialog(scope.row)"></el-button>
        <el-button size="mini" type="danger" plain icon="el-icon-close" @click="showRejectDialog(scope.row)"></el-button>
      </template>
    </el-table-column>
  </el-table>

  <div style="margin: 20px;padding: 5px 0;background-color: #D3DCE6;width: 100%;">
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                   :current-page="pageNum" :page-sizes="[10, 20, 30, 40]" :page-size="pageSize"
                   layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </div>
</div>
</template>

<script>
let userInfo = JSON.parse(localStorage.getItem('UserInfo'))
export default {
  name: 'approveList',
  data: function () {
    return {
      loading: false,
      approveList: [],
      pageNum: 1,
      pageSize: 10,
      total: 0
    }
  },
  mounted () {
    this.initList()
  },
  methods: {
    initList () {
      this.loading = true
      this.$axios({
        method: 'GET',
        url: '/api/leave/pendingApproveList?pageNum=' + this.pageNum + '&pageSize=' + this.pageSize,
        headers: {
          'Authorization': userInfo['token']
        }
      }).then(res => {
        let data = res.data
        if (data && data['code'] === 200) {
          this.approveList = data['data']['list']
          this.total = data['data']['total']
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
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
    handleSizeChange (val) {
      this.pageSize = val
      this.initList()
    },
    handleCurrentChange (val) {
      this.pageNum = val
      this.initList()
    },
    showPassDialog (row) {
      this.$confirm('是否同意该申请?', '提示', {
        confirmButtonText: '同意',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$axios({
          method: 'POST',
          url: '/api/leave/pass/' + row.id + '/' + row.processId,
          headers: {
            'Authorization': userInfo['token']
          }
        }).then(res => {
          if (res.data['code'] === 200) {
            this.$message.success('操作成功')
            this.initList()
          } else {
            this.$message.error('操作失败')
          }
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    showRejectDialog (row) {

    }
  }
}
</script>

<style scoped>

</style>
