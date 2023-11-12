<template>
    <div v-if="state.loading" class="lodding">
        <p>正在查询...</p>
    </div>
    <template v-else-if="tableSuccess.length > 0">
        <div id="table-tab">
            <span @click="showTab = true">
                成功的表
            </span>
            <span @click="showTab = false">
                失败的表
            </span>
            <span class="fn__flex-1"></span>
            <span @click="replceTitle">
                替换
            </span>
        </div>
        <ListTable id="success-table" v-show="showTab" :headers="header" :tables="tableSuccess" ref="tab1"
            @click-block="clickBlock"
            @click-button="clickButton"
            @click-checkbox="clickCheckbox"
            @click-link="clickLink"
            @click-input="clickInput"
            @click-text="clickText"
            @changed-checkbox="changedCheckbox"
            @changed-input="changedInput"
        />
        <ListTable id="failed-table" v-show="!showTab" :headers="header" :tables="tableFailed" 
            @click-block="clickBlock"
            @click-button="clickButton"
            @click-checkbox="clickCheckbox"
            @click-link="clickLink"
            @click-input="clickInput"
            @click-text="clickText"
            @changed-checkbox="changedCheckbox"
            @changed-input="changedInput"
            />
    </template>
    <div v-else class="lodding">
        <p>查询失败...</p>
    </div>
</template>

<script setup lang="ts">
import { Plugin, showMessage } from 'siyuan';
import { onMounted, ref } from 'vue';
import { getUrlTitle } from '../../utils/import';
import { 
    IHeader, IItem, ILine, ILinkInfo,
    clickCheckbox, clickLink, clickInput, clickText,
    changedInput, changedCheckbox, 
    replaceLinkInfo
} from './table';
import ListTable from '../base/ListTable.vue';

type propsOption = {
    linkInfos: ILinkInfo[],
    plugin: Plugin,
}
const props = defineProps<propsOption>();
const showTab = ref(true);
const tab1 = ref(null);
const header: IHeader[] = [
    {
        type: 'checkbox',
        style: 'width: 30px',
    },
    {
        type: 'normal',
        text: '标题',
        style: 'flex: 1',
    },
    {
        type: 'normal',
        text: '链接',
        style: 'width: 150px',
    },
    {
        type: 'normal',
        text: '块链接',
        style: 'width: 100px',
    },
    {
        type: 'normal',
        text: '',
        style: 'width: 60px',
    }
]
const tableSuccess: ILine[] = [];
const tableFailed: ILine[] = [];
const state = ref({
    loading: true
})
console.log(props.linkInfos.length);

onMounted(async () => {
    const timeStart = Date.now();
    const titles = await Promise.allSettled(props.linkInfos.map(linkInfo => getUrlTitle(linkInfo.link)));
    titles.forEach((title, index) => {
        const refreshIcon = `<svg style="width: 16px; height: 16px"><use xlink:href="#iconRefresh"></use></svg>`;
        const deleteIcon = `<svg style="width: 16px; height: 16px"><use xlink:href="#iconTrashcan"></use></svg>`;
        // const cuboxIcon = `<svg style="width: 16px; height: 16px"><use xlink:href="#icon-pkm-tools-add"></use></svg>`;
        const items: IItem[] = [
            {
                type: 'checkbox',
                key: 'select',
                style: 'width: 30px',
            },
            {
                type: 'text',
                key: 'title',
                text: '',
                style: 'flex: 1; justify-content: start;',
                disabled: true,
            },
            {
                type: 'link',
                key: 'link',
                url: props.linkInfos[index].link,
                style: 'width: 150px; justify-content: start;',
            },
            {
                type: 'block',
                key: 'blockLink',
                url: props.linkInfos[index].blockId,
                text: '块链接',
                style: 'width: 100px',
            },
            {
                type: 'button',
                key: 'delete',
                text: deleteIcon,
                style: 'width: 30px',
            },
            // {
            //     type: 'button',
            //     key: 'cubox',
            //     text: cuboxIcon,
            //     style: 'width: 30px',
            // }
        ]
        if (title.status === 'fulfilled') {
            if (title.value) {
                items[1].text = title.value;
                tableSuccess.push(items);
            } else {
                items[4].text = refreshIcon;
                tableFailed.push(items);    
            }
        } else {
            items[4].text = refreshIcon;
            tableFailed.push(items);
        }
    })
    const timeEnd = Date.now();
    console.log('time used: ', timeEnd - timeStart, 'ms');
    state.value.loading = false;
})

function clickBlock(event: PointerEvent) {
    console.log(event);
    const target = event.target as HTMLElement;
    const blockId = target.dataset['href'];
    props.plugin.addFloatLayer({
        ids: [blockId],
        x: event.clientX,
        y: event.clientY,
    })
}

function clickButton(event: PointerEvent, index: number, tables: ILine[], checked: number[], key: string) {
    console.log(event);
    switch (key) {
        case "delete": 
            tables.splice(index, 1);
            const checkedIndex = checked.indexOf(index);
            if (checkedIndex !== -1) { checked.splice(checkedIndex, 1) }
            checked.forEach((item, count) => checked[count] = item > index ? item - 1 : item);
            break;
        case "cubox":
            console.log(event);
            break;
    }
}

// 替换标题文本
function replceTitle() {
    const linkInfos: ILinkInfo[] = [];
    const dynamicTable: ILine[] = tab1.value.dynamicTable;
    const checkedLines: number[] = tab1.value.checkedLines;
    checkedLines.forEach(index => {
        const linkInfo: ILinkInfo = {
            title: dynamicTable[index][1].text,
            link: dynamicTable[index][2].url,
            blockId: dynamicTable[index][3].url,
        }
        linkInfos.push(linkInfo);
    })
    replaceLinkInfo(linkInfos);
    showMessage('替换完成');
}
</script>

<style>
    #table-tab {
        display: flex;
    }
    #table-tab > span {
        padding: 10px;
    }
    #table-tab > span:last-child {
        width: 30px;
    }

    .lodding {
        margin: 9px 24px;
    }

    .table-item-column[column-type="button"] {
        padding: 5px;
    }
    .table-item-column[column-type="button"] > button {
        background-color: transparent;
        border: none;
    }
    .table-item-column[column-type="input"] > input:not(:read-only) {
        border: none;
        box-shadow: 0 0 1px;
    }
    .table-item-column[column-type="input"] > input:disabled,
    .table-item-column[column-type="input"] > input:read-only {
        background-color: transparent;
        border: none;
    }
</style>