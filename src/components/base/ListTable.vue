<template>
    <div>
        <div class="header">
            <div v-for="header in headers" 
                :column-type="header.type" 
                :style="header.style"
            >
                <input v-if="header.type === 'checkbox'" 
                    type="checkbox" 
                    :checked="checkedLines.length === dynamicTable.length"
                    :indeterminate="checkedLines.length > 0 && checkedLines.length < dynamicTable.length"
                    @click="checkedLines = checkedLines.length !== dynamicTable.length 
                        ? Array.from(Array(dynamicTable.length).keys()) 
                        : []"
                >
                <span v-else>{{ header.text }}</span>
            </div>
        </div>
        <div class="table">
            <div v-for="(lines, index) in dynamicTable" class="table-item">
                <div v-for="item in lines" class="table-item-column" 
                    :column-type="item.type" 
                    :style="item.style"
                >
                    <input v-if="item.type === 'checkbox'" 
                        type="checkbox"
                        v-model="checkedLines"
                        :value="index"
                        @change="$emit('changedCheckbox', $event, checkedLines, dynamicTable)"
                    >
                    <input v-if="item.type === 'input'" 
                        class="ariaLabel"
                        :value="item.text"
                        :aria-label="item.text"
                        :readonly="item?.disabled ? 'true' : 'false'"
                        @click="$emit('clickInput', $event)"
                        @change="$emit('changedInput', $event)"
                    >
                    <button v-if="item.type === 'button'" 
                        v-html="item.text"
                        @click="$emit('clickButton', $event, index, dynamicTable, checkedLines, item.key)"
                    ></button>
                    <div v-if="item.type === 'link'" 
                        class="ariaLabel"
                        :data-href="item?.url"
                        :aria-label="item?.url"
                        @click="$emit('clickLink', $event)"
                    >{{ item.url.split('://')[1].split('/')[0] }}</div>
                    <div v-if="item.type === 'block'" 
                        class="ariaLabel"
                        :data-href="item?.url"
                        :aria-label="item?.url"
                        @click="$emit('clickBlock',$event)"
                    >{{ item.text }}</div>
                    <div v-if="item.type === 'text'"
                        class="ariaLabel"
                        :aria-label="item.text"
                        @click="$emit('clickText', $event)"
                    >{{ item.text }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IHeader, ILine } from '../custom/table'

type propsOption = {
    headers: IHeader[],
    tables: ILine[],
}

const props = defineProps<propsOption>();
const dynamicTable = ref(props.tables);
const checkedLines = ref([]);
defineEmits([
    'clickCheckbox', 'clickButton', 'clickLink', 'clickBlock', 'clickInput', 'clickText', 
    'changedCheckbox', 'changedInput'
])
defineExpose({
    dynamicTable, checkedLines
})
</script>

<style>
    .header {
        display: flex;
        flex-wrap: wrap;
    }
    .header > div {
        padding: 10px;
        width: 200px;
        box-shadow: 0 0 1px;
        display: flex;
        justify-content: center;
    }
    .header > [column-type="checkbox"] {
        width: 30px;
    }

    .table {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
    }
    .table-item {
        display: flex;
        flex-wrap: wrap;
    }
    .table-item-column {
        width: 200px;
        padding: 5px 10px;
        display: flex;
        justify-content: center;
    }
    .table-item-column > div {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    .table-item-column[column-type="checkbox"] {
        width: 30px;
    }
    .table-item-column[column-type="link"] > div {
        text-decoration: underline;
        text-decoration-color: blue;
        color: blue;
    }
    .table-item-column[column-type="link"] > div:hover {
        cursor: pointer;
    }
    .table-item-column[column-type="block"] > div {
        text-decoration: underline;
        text-decoration-color: blue;
        color: blue;
    }
    .table-item-column[column-type="block"] > div:hover {
        cursor: pointer;
    }
    .table-item-column[column-type="input"] > input {
        width: 100%;
        text-overflow: ellipsis;
    }
</style>