import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import { BarSeries } from "react-stockcharts/lib/series";
import { YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

class BarChart extends React.Component {
	
	render() {
		const { data: initialData, type, seriesName, width, height, margin, ratio, mouseMoveEvent, panEvent, zoomEvent, zoomAnchor, clamp } = this.props;

		const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.x);

		const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(initialData);

		const start = xAccessor(last(data));
		const end = xAccessor(data[Math.max(0, data.length - 150)]);
		const xExtents = [start, end];

		return (
			<ChartCanvas 
				ratio={ratio}
				height={height}
				width={width}
				margin={margin}
				seriesName={seriesName}
				mouseMoveEvent={mouseMoveEvent}
				panEvent={panEvent}
				zoomEvent={zoomEvent}
				clamp={clamp}
				zoomAnchor={zoomAnchor}
				type={type}
				data={data}
				xScale={xScale}
				xExtents={xExtents}
				xAccessor={xAccessor}
				displayXAccessor={displayXAccessor}
			>
				<Chart 
					id={2}
					yExtents={d => d.y}
					height={height}
				>
					<YAxis
						axisAt="left"
						orient="left"
						ticks={5}
						tickFormat={format(".2s")}
						zoomEnabled={zoomEvent}
					/>

					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")} />
					<MouseCoordinateY
						at="left"
						orient="left"
						displayFormat={format(".4s")} />

					<BarSeries yAccessor={d => d.y} fill={"#6BA583"} />
				</Chart>
				<CrossHairCursor/>
			</ChartCanvas>
		);
	}
}

BarChart.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	margin: PropTypes.object.isRequired,
	ratio: PropTypes.number.isRequired,
	seriesName: PropTypes.string.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

BarChart.defaultProps = {
	type: "hybrid",
	seriesName: "Bar",
	height: 300,
	margin: { left: 50, right: 50, top: 5, bottom: 8},
	mouseMoveEvent: true,
	panEvent: true,
	zoomEvent: false,
	clamp: false,
};

BarChart = fitWidth(BarChart);

export default BarChart;
