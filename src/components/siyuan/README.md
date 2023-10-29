这些组件是对思源界面样式的封装，参考项目：https://github.com/Zuoqiu-Yingyi/siyuan-packages-monorepo/tree/main/workspace/packages/components/siyuan

# 组件使用说明

## Setting

- Group：需要搭配 MiniItem 使用，效果类似思源设置界面“搜索”设置项
- Item：单独使用，效果类似设置界面的“编辑器”、“文档树”等设置项
- Tabs：生成一行页签按钮，效果类似思源设置界面“资源”上方的两个页签
- Panels：生成一列面板按钮，效果类似思源设置界面左侧选项卡
- Panel：页签内容，承载 Group、Item、MiniItem 等内容项

## Input

- Button：按键
- Checkbox：开关
- Number：数字输入框
- Select：下拉选择
- Text：单行文本框
- Textarea：多行文本框
- Password：密码输入框（这个不是思源原生的）

所有组件都需要传递 setting-key 和 setting-value，用于和父组件交互数据