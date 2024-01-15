<template>
    <el-table
        ref="multipleTableRef"
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
    >
        <el-table-column type="selection" width="50" />
        <el-table-column 
            label="标题" 
            header-align="center" 
            property="title" 
            min-width="300" 
            :show-overflow-tooltip="true"
        />
        <el-table-column label="链接" width="150" header-align="center" :show-overflow-tooltip="true">
            <template #default="scope">
                <ElLink type="primary" :href="scope.row.link" :underline="false"
                    >{{ scope.row.link.split('://')[1].split('/')[0] }}</ElLink
                >
            </template>
        </el-table-column>
        <el-table-column label="块链接" width="100" align="center" >
            <template #default="scope">
                <ElTooltip :content="scope.row.blockId" :hide-after="0">
                    <div
                        @click="handlePreviewBlock(scope.row, $event)"
                    >块链接</div>
                </ElTooltip>
            </template>
        </el-table-column>
        <el-table-column label="操作" align="center" >
            <template #default="scope">
                <el-button circle size="small"
                    @click="handleReplaceLink(scope.row)"
                >
                    <ElTooltip content="使用该标题替换链接锚文本">
                        <Svg icon="#iconReplace" style="width: 16px; height: 16px;"></Svg>
                    </ElTooltip>
                </el-button>
                <el-button circle size="small"  v-if="!scope.row.saved"
                    @click="handleClipper(scope.$index, scope.row)"
                >
                    <ElTooltip content="收藏">
                        <Svg icon="#iconInbox" style="width: 16px; height: 16px;"></Svg>
                    </ElTooltip>
                </el-button>
                <el-button circle size="small" type="danger" v-if="scope.row.saved"
                    @click="handleDelete(scope.$index, scope.row)"
                >
                    <ElTooltip content="删除收藏">
                        <Svg icon="#iconTrashcan" style="width: 16px; height: 16px;"></Svg>
                    </ElTooltip>
                </el-button>
            </template>
        </el-table-column>
    </el-table>
</template>
  
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElTable, ElButton, ElLink, ElTableColumn, ElTooltip } from 'element-plus'
import { getPlugin } from '../../../utils/config';
import { ILinkInfo, getTableData } from './clipper-table';
import Svg from '../../siyuan/misc/Svg.vue';

let tableData: ILinkInfo[]

const props = defineProps<{
    blockId: string
}>()
const loading = ref(true)
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<ILinkInfo[]>([])

const handleSelectionChange = (val: ILinkInfo[]) => {
    multipleSelection.value = val
}
const handlePreviewBlock = (row: ILinkInfo, event: MouseEvent) => {
    const plugin = getPlugin()
    console.log(plugin, row.blockId, event)
    plugin.addFloatLayer({
        ids: [row.blockId],
        x: event.clientX,
        y: event.clientY,
    })
}
const handleReplaceLink = async (row: ILinkInfo) => {
    row.blockId
}
const handleClipper = (index: number, row: ILinkInfo) => {
    console.log(index, row)
}
const handleDelete = (index: number, row: ILinkInfo) => {
    console.log(index, row)
}

onMounted(async () => {
    tableData = await getTableData(props.blockId)
    loading.value = false
})
</script>