<template>
    <v-chart class="chart" :option="option" />
</template>

<script setup lang="ts">
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { HeatmapChart } from "echarts/charts";
import {
    TitleComponent,
    TooltipComponent,
    VisualMapComponent,
    CalendarComponent,
} from "echarts/components";

import VChart, { THEME_KEY } from "vue-echarts";
import { ref, provide } from "vue";

echarts.use([
    TitleComponent,
    TooltipComponent,
    CalendarComponent,
    VisualMapComponent,
    CanvasRenderer,
    HeatmapChart,
]);

provide(THEME_KEY, "light");

const option = ref({
    title: {
        id: 'hatmap-title',
        top: 30,
        left: 'center',
        text: '记录热力图'
    },
    tooltip: {},
    visualMap: {
        showLabel: false,
        min: 0,
        max: 1000,
        type: 'piecewise',
        orient: 'horizontal',
        left: 'center',
        top: 65,
        inRange: {
            color: [
                '#ebedf0',
                '#aee6ad',
                '#6cc06d',
                '#569e57',
                '#3a6c3e'
            ]
        }
    },
    calendar: {
        id: 'hotmap-calendar',
        top: 120,
        left: 30,
        right: 30,
        cellSize: ['auto', 13],
        range: '2023',
        itemStyle: {
            borderWidth: 3,
            color: '#ccc',
            borderColor: '#fff'
        },
        yearLabel: { show: false },
        splitLine: { show: false },
    },
    series: {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: getVirtualData('2023')
    }
});

function getVirtualData(year: string) {
    const date = + echarts.time.parse(year + '-01-01');
    const end = +  echarts.time.parse(+year + 1 + '-01-01');
    const dayTime = 3600 * 24 * 1000;
    const data: [string, number][] = [];
    for (let time = date; time < end; time += dayTime) {
        data.push([
            echarts.time.format(time, '{yyyy}-{MM}-{dd}', false),
            Math.floor(Math.random() * 1000)
        ]);
    }
    return data;
}
</script>

<style scoped>
.chart {
    height: 400px;
}
</style>