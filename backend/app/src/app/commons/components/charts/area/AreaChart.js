
import React from "react";
import PropTypes from "prop-types";
import { format } from "d3-format";
import { scaleLinear } from  "d3-scale";

import { ChartCanvas, Chart } from "react-stockcharts";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { CrossHairCursor, MouseCoordinateX, MouseCoordinateY} from "react-stockcharts/lib/coordinates";
import { fitWidth } from "react-stockcharts/lib/helper";
import ZoomButtons from "react-stockcharts/lib/ZoomButtons";
import CurrentCoordinate from "react-stockcharts/lib/coordinates/CurrentCoordinate";
import GroupTooltip from "react-stockcharts/lib/tooltip/GroupTooltip";
import PriceCoordinate from "react-stockcharts/lib/coordinates/PriceCoordinate";
import Annotate from "react-stockcharts/lib/annotation/Annotate";
import { SvgPathAnnotation } from "react-stockcharts/lib/annotation";
import discontinuousTimeScaleProvider from "react-stockcharts/lib/scale/discontinuousTimeScaleProvider";
import { last } from "react-stockcharts/lib/utils";
import AreaSeries from "react-stockcharts/lib/series/AreaSeries";

import { ChartScaleType } from "../../../../enums/chart-type.enum";
import { underlyingPath } from "../../../paths/charts.path";

const getPriceAnnotation = (price, height) =>({
	y: ({ yScale }) => yScale.range()[0],
	fill: "#bdbdbd",
	path: underlyingPath(height),
	tooltip: "Underlying: " +  price,
});

class AreaChart extends React.Component {

	constructor(props) {
		super(props);
		var lines = props.params.lines || [];
		this.state = {
			options: new Set(lines.map(l => l.label)),
			suffix: 1
		};
		this.handleReset = this.handleReset.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.preventDefault = this.preventDefault.bind(this);
		this.divRef = React.createRef()
	}

	handleReset() {
		this.setState({
			suffix: this.state.suffix + 1
		});
	}

	handleChange(option) {
		var options = this.state.options;

		if (options.has(option.yLabel)) {
			options.delete(option.yLabel);
		} else {
			options.add(option.yLabel);
		}

		this.setState(state => ({
			...state, options: options
		}));
	}
	preventDefault(e) {
		e.preventDefault();
	}

	componentDidMount () {
		this.divRef.current.addEventListener('wheel', this.preventDefault);
	}
	
	componentWillUnmount () {
		this.divRef.current.removeEventListener('wheel', this.preventDefault);
	}	

	render() {
		const { params, items, type, seriesName, full, width, height, margin, ratio, mouseMoveEvent, panEvent, zoomEvent, zoomAnchor, clamp } = this.props;
		var data = items;
		var lines = params.lines || [];
		var range = full ? 30 : 20;

		// SCALES
		var xScale = scaleLinear(data);
		var xAccessor = (d) => d.x;
		var displayXAccessor = xAccessor;
		var xExtents = [xAccessor(data[Math.max(0, params.index-range)]), xAccessor(data[Math.min(data.length-1, params.index+range)])];

		if (params.xScaleType === ChartScaleType.DateTime) {
			const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.x);
			data = xScaleProvider(items).data;
			xScale = xScaleProvider(items).xScale;
			xAccessor = xScaleProvider(items).xAccessor;
			displayXAccessor = xScaleProvider(items).displayXAccessor;
			xExtents = [xAccessor(last(data)), xAccessor(data[Math.max(0, data.length - 20)])];
		} 

		// GRID
		const yGrid = params.showGrid && full ? { innerTickSize: -1 * (width - margin.left - margin.right), tickStrokeOpacity: 0.1 } : {};

		var showLines = lines.filter(l => this.state.options.has(l.label));
		return (
		<div ref={this.divRef} >
			<ChartCanvas 
				ratio={ratio}
				width={width}
				height={height}
				margin={full ? {...margin, left: 50} : margin}
				seriesName={`${seriesName}_${this.state.suffix}`}
				pointsPerPxThreshold={1}
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
					id={1}
					yExtents={d => d.y.filter((e, i) => this.state.options.has(lines[i].label))}
					>
					<XAxis axisAt="bottom" orient="bottom" ticks={full ? 10 : 5} stroke={"#bdbdbd"} fontWeight={300} opacity={0.5}/>
					<YAxis axisAt="left"
						orient={full ? "left" : "right" }
						ticks={full ? 4 : 2}
						tickFormat={format(full ? ".3s" : ".2s")}
						stroke={"#bdbdbd"}
						fontWeight={300}
						opacity={0.5}
						{...yGrid}
					/>
					<PriceCoordinate
						at="left"
						orient={full ?"left": "right"}
						price={0}
						lineOpacity={0.5}
						strokeWidth={0.5}
						displayFormat={format(".2f")}
					/>

					{
						showLines.map(line => (
						<AreaSeries
							key={line.id}
							yAccessor={d => d.y[line.id]}
                            fill={line.color}
							stroke={line.color}
							strokeWidth={2}
                            opacity={0.8}
							strokeDasharray="Solid"
							highlightOnHover/>
						))
					}
					{
						showLines.map(line => (
							<CurrentCoordinate 
							key={line.id}
							yAccessor={(d) => d.y[line.id]} 
							fill={line.color}/>
						))
					}
					<GroupTooltip
						onClick={(option) => this.handleChange(option)}
						layout="vertical"
						fontSize={12}
						verticalSize={20}
						origin={full ? [10, 8] : [50, 8]}
						displayFormat={format(".2f")}
						options={lines.map(line => ({
							yAccessor: d => d.y[line.id],
							yLabel: line.label,
							valueFill: line.color,
							withShape: true,
						}))}
						/>
					{params.x &&
						<Annotate with={SvgPathAnnotation}
						when={d => d.x == params.x}
						usingProps={getPriceAnnotation(params.x, height)} />
					}
					<MouseCoordinateX
						at="bottom"
						orient="top"
						displayFormat={format(".2f")}/>
					<MouseCoordinateY
						at="left"
						orient={full ? "left" : "right"}
						displayFormat={format(".3s")}/>
					<ZoomButtons heightFromBase={height-30} onReset={this.handleReset}/>
				</Chart>
				<CrossHairCursor/>
			</ChartCanvas>
		</div>
		);
	}
}

AreaChart.propTypes = {
	params: PropTypes.object.isRequired,
	items: PropTypes.array.isRequired,
	seriesName: PropTypes.string.isRequired,
	width: PropTypes.number.isRequired,
	margin: PropTypes.object.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

AreaChart.defaultProps = {
	params: {},
	type: "hybrid",
	seriesName: "Line",
	height: 300,
	full: true,
	margin: { left: 50, right: 50, top: 5, bottom: 30},
	mouseMoveEvent: true,
	panEvent: true,
	zoomEvent: true,
	clamp: false,
};

AreaChart = fitWidth(AreaChart);

export default AreaChart;
