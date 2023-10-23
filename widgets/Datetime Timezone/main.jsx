
//
// ScriptWidget
// https://scriptwidget.app
//
//

const widget_size = $getenv("widget-size");
const widget_param = $getenv("widget-param");

const beijingDate = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }).toLocaleString();
const sanJoseDate = new Date().toLocaleString("zh-CN", { timeZone: "America/Los_Angeles" }).toLocaleString();
const newYorkDate = new Date().toLocaleString("zh-CN", { timeZone: "America/New_York" }).toLocaleString();

$render(
    <hstack frame="max">
        <vstack alignment="leading">
            <text font="title3" color="blue">Beijing:</text>
            <text font="title3" color="green">San Jose:</text>
            <text font="title3" color="orange">New York:</text>
        </vstack>
        <vstack alignment="leading">
            <text font="title3" color="red">{beijingDate}</text>
            <text font="title3" color="yellow">{sanJoseDate}</text>
            <text font="title3" color="purple">{newYorkDate}</text>
        </vstack>
    </hstack>
);
