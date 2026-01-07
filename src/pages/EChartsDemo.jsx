import * as echarts from 'echarts';
// import * as echarts from 'echarts/core';
// import { TooltipComponent, GridComponent, TitleComponent, LegendComponent  } from 'echarts/components';
// import { BarChart, LineChart } from 'echarts/charts';
// // 可以根据需要选用只用到的渲染器
// import { SVGRenderer, CanvasRenderer } from 'echarts/renderers';
import { useEffect, useRef } from 'react';
import ECGChart from '../components/ECGChart';

//echarts.use([SVGRenderer, CanvasRenderer, TitleComponent, TooltipComponent, GridComponent, BarChart, LineChart,LegendComponent]);


const EChartsDemo = () => {

  const refB = useRef(null);
  const refLine = useRef(null);
  const refChart = useRef(null);

  useEffect(() => {
    refChart.current = echarts.init(refB.current,null, { renderer: 'canvas' });
    const lineChart = echarts.init(refLine.current,null, { renderer: 'svg' });

    const option = {
      title: { text: "My Chart" },
      legend: {
        // Try 'horizontal'
        orient: 'horizontal',
    },
      tooltip: {},
      xAxis: { data: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
      yAxis: {},
      series: [
        {
          name: "Series 1",
          type: "bar",
          data: [5, 20, 36, 10, 10],
          barGap: '20%',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(220, 220, 220, 0.8)'
         }
        },
        {
          name: "Series 2",
          type: "bar",
          data: [4, 22, 39, 9, 16],
          barGap: '20%',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(220, 220, 220, 0.8)'
         }
        },
      ],
    };

    const LineOption = {
    title: { text: "Line Chart" },
    tooltip: {},
    xAxis: { type: "category", data: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    yAxis: { type: "value" },
    series: [
        {
        type: "line",
        smooth: true,
        data: [150, 230, 224, 218, 135],
        },
    ],
    };

    refChart.current.setOption(option);
    lineChart.setOption(LineOption);

    window.addEventListener("resize", refChart.current.resize);
    return () => {
      window.removeEventListener("resize", refChart.current.resize);
      refChart.current.dispose();
    };
  }, []);

  const updateChart = (labels, values) => {
    refChart.current.setOption({
      series: [
        {},
        { data: values }]
    });
  };

  useEffect(() => {
    let x = 0;
    const labels = [];
    const values = [24, 3, 4, 26, 6];

    const timer = setInterval(() => {
      updateChart(labels, values);
      x++;
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className='container text-center flex'>
      <div ref={refB} style={{ width: "600px", height: "400px" }}></div>
      <div ref={refLine} style={{ width: "600px", height: "400px" }}></div>
      <ECGChart />
    </div>
  );
}

export default EChartsDemo