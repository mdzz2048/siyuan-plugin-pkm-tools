<template>
    <el-table
        ref="multipleTableRef"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
    >
    <el-table-column type="selection" width="55" />
    <el-table-column label="Date" width="120">
        <template #default="scope">{{ scope.row.date }}</template>
    </el-table-column>
    <el-table-column property="name" label="Name" width="120" />
    <el-table-column property="address" label="Address" show-overflow-tooltip />
    <el-table-column label="Link" width="120">
        <template #default="scope">
            <ElLink :href="scope.row?.url" type="primary" :underline="false"
                >{{ scope.row.date }}</ElLink
            >
        </template>
    </el-table-column>
    <el-table-column label="Operations">
        <template #default="scope">
        <el-button size="small" @click="handleEdit(scope.$index, scope.row)"
            >Edit</el-button
        >
        <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.$index, scope)"
            >Delete</el-button
        >
        <el-button circle>
            <Svg icon="#icon-pkm-tools-add"></Svg>
        </el-button>
      </template>
    </el-table-column>
    </el-table>
    <div style="margin-top: 20px">
    <el-button @click="toggleSelection([tableData[1], tableData[2]])">
        Toggle selection status of second and third rows
    </el-button>
    <el-button @click="toggleSelection()">Clear selection</el-button>
    </div>
</template>
  
<script lang="ts" setup>
import { ref } from 'vue'
import { ElTable, ElButton, ElLink, ElTableColumn } from 'element-plus'
import Svg from '../siyuan/misc/Svg.vue';

interface User {
    date: string
    name: string
    address: string
    url?: string
}

const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<User[]>([])
const toggleSelection = (rows?: User[]) => {
    if (rows) {
        rows.forEach((row) => {
            multipleTableRef.value!.toggleRowSelection(row, undefined)
        })
    } else {
        multipleTableRef.value!.clearSelection()
    }
}
const handleSelectionChange = (val: User[]) => {
    multipleSelection.value = val
}
const handleEdit = (index: number, row: User) => {
  console.log(index, row)
}
const handleDelete = (index: number, scope) => {
  console.log(index, scope)
  const data: [] = scope.store.states.data.value;
  console.log(data);
  data.splice(index, 1)
}

const tableData: User[] = [
    {
        date: '2016-05-03',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-02',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-04',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-01',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
        url: "siyuan://blocks/20231116222939-beez4fq"
    },
    {
        date: '2016-05-08',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-06',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-07',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
]
</script>
  