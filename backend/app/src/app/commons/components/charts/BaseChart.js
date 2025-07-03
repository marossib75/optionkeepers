import React, { useEffect, useMemo, useRef, useState } from "react";

import LoadingOverlay from "react-loading-overlay";
import Loader from "react-loader-spinner";
import { SaveChartAsImage } from "react-stockcharts/lib/helper";

import { FaExpand, FaCompress } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { MdGridOff } from "react-icons/md";
import { CgClose } from "react-icons/cg";

import { ChartTemplate, ChartType } from "../../../enums/chart-type.enum";

import ButtonIcon from "../buttons/button-icon/ButtonIcon";
import ErrorBoundary from "../error-boundary/ErrorBoundary";

import "./BaseChart.css";
import { Suspense } from "react";

const CandleStickChart = React.lazy(() => import("./candlestick/CandleStickChart"));
const GroupedBarChart = React.lazy(() => import("./groupedbar/GroupedBarChart"));
const LineChart = React.lazy(() => import("./line/LineChart"));
const AreaChart = React.lazy(() => import("./area/AreaChart"));

const Render = React.forwardRef(({render, params, full, items, template, height}, ref) => {
    switch(render) {
        case ChartType.CandleStick:
            return <CandleStickChart key={template} ref={ref} items={items} full={full} params={params} height={height}/>
        case ChartType.Line:
            return <LineChart key={template} ref={ref} items={items} full={full} params={params} height={height}/>
        case ChartType.Area:
            return <AreaChart key={template} ref={ref} items={items} full={full} params={params} height={height}/>
        case ChartType.GroupedBar:
            return <GroupedBarChart key={template} ref={ref} items={items} full={full} params={params} height={height}/>
        default:
            return <div>No chart</div>
    }
});


function BaseChart({chart, onClose, onSelect, height=300}) {
    const [showGrid, setShowGrid] = useState(true);
    const [expand, setExpand] = useState(false);
    const chartRef = useRef();

    return (
        <LoadingOverlay
            active={chart.loading}
            spinner={<Loader className="app-accordion--loader" type="ThreeDots" color="#bbbbbb" height={50} width={100}/>}
            fadeSpeed={0}>
                <div className="app-chart-header">
                    <div className="app-chart-header--title" onClick={onSelect}>{chart.label}</div>
                    <div className="app-chart-header--control">
                        <ButtonIcon
                            theme="dark"
                            fontSize={20}
                            onClick={()=> SaveChartAsImage.saveChartAsImage(chartRef.current.node.divRef.current)}
                        >
                            <FiDownload/>
                        </ButtonIcon>
                        <ButtonIcon
                            active={!showGrid}
                            theme="dark"
                            fontSize={20}
                            onClick={()=> setShowGrid(!showGrid)}
                        >
                            <MdGridOff/>
                        </ButtonIcon>
                        <ButtonIcon
                            check={true}
                            theme="dark"
                            fontSize={18}
                            onClick={()=> setExpand(!expand)}
                        >
                            {expand ? <FaCompress/> : <FaExpand/>}
                        </ButtonIcon>
                        {
                            onClose &&
                            <ButtonIcon 
                                theme="dark" 
                                fontSize={20} 
                                onClick={onClose}>
                                    <CgClose/>
                            </ButtonIcon>
                        }
                    </div>
                </div>
            {
                chart.items &&
                chart.items.length > 0 ?
                <ErrorBoundary
                key={chart.open && !chart.loading ? chart.id : ChartTemplate.Loading}
                failed={!chart.loading && chart.failed}>
                    <Suspense fallback={<div></div>}>
                        <Render
                            ref={chartRef} 
                            height={expand ? height + 200 : height}
                            full={chart.full}
                            render={chart.type}
                            params={{...chart.params, showGrid}}
                            items={chart.items}
                            template={chart.id}
                        />
                    </Suspense>
                </ErrorBoundary>
                    :
                <div className="app-charts--empty">
                    There are no data to display
                </div>
            }
        </LoadingOverlay>
    );
};

export default BaseChart;
