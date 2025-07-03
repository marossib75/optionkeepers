import React from "react";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import PropTypes from "prop-types";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import { scaleLinear } from  "d3-scale";

import { last } from "react-stockcharts/lib/utils";
import { ChartCanvas, Chart } from "react-stockcharts";
import { LineSeries} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { fitWidth } from "react-stockcharts/lib/helper";
import ZoomButtons from "react-stockcharts/lib/ZoomButtons";
import CurrentCoordinate from "react-stockcharts/lib/coordinates/CurrentCoordinate";
import GroupTooltip from "react-stockcharts/lib/tooltip/GroupTooltip";
import PriceCoordinate from "react-stockcharts/lib/coordinates/PriceCoordinate";
import { CrossHairCursor, MouseCoordinateX, MouseCoordinateY} from "react-stockcharts/lib/coordinates";
import discontinuousTimeScaleProvider from "react-stockcharts/lib/scale/discontinuousTimeScaleProvider";
import {Annotate, SvgPathAnnotation} from "react-stockcharts/lib/annotation";

import { ChartScaleType } from "../../../../enums/chart-type.enum";
import { underlyingPath } from "../../../paths/charts.path";

const getPriceAnnotation = (price, height) =>({
	y: ({ yScale }) => yScale.range()[0],
	fill: "#bdbdbd",
	path: underlyingPath(height),
	tooltip: "Underlying: " +  price,
});

class LineChart extends React.Component {

	constructor(props) {
		super(props);
		var groups = props.params.groups;
		this.state = {
			options: groups.map(group => new Set(group.lines.map(line => line.label))),
			selections: [0],
			suffix: 1
		};
		this.handleReset = this.handleReset.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleSelection = this.handleSelection.bind(this);
		this.preventDefault = this.preventDefault.bind(this);
		this.divRef = React.createRef()
	}

	handleReset() {
		this.setState({
			suffix: this.state.suffix + 1
		});
	}

	handleChange(option, id) {
		var options = this.state.options;

		if (options[id].has(option.yLabel)) {
			options[id].delete(option.yLabel);
		} else {
			options[id].add(option.yLabel);
		}

		this.setState(state => ({
			...state, options,
		}));
	}

	handleSelection(selections) {
		this.setState(state => ({
			...state, selections,
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
		const groups = params.groups;
		const values = items[params.index];

		var data = items;
		var totalHeight = height + (100 * (this.state.selections.length-1));
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
		var flexMargin = full ? margin : {...margin, left: 10, right: 10};
		const yGrid = params.showGrid && full ? { innerTickSize: -1 * (width - flexMargin.left - flexMargin.right), tickStrokeOpacity: 0.1 } : {};

		const showGroups = groups.filter(group => this.state.selections.includes(group.id));
		const showLines = (group) => group.lines.filter(line => this.state.options[group.id].has(line.label) && !line.hide);

		return (
		<div ref={this.divRef} >
			<div className="app-chart--buttons">
				<ToggleButtonGroup size="sm" type="checkbox" value={this.state.selections} onChange={this.handleSelection}>
					{
						groups &&
						groups.length > 1 &&
						groups.filter(group => group.id > 0).map((group, idx) => (
							<ToggleButton key={group.id} variant="outline-secondary" value={group.id}>{group.title} {format(".2f")(values.y[idx+1])}</ToggleButton>
						))
					}
				</ToggleButtonGroup>
			</div>
			<ChartCanvas 
				ratio={ratio}
				width={width}
				height={totalHeight}
				margin={flexMargin}
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
				{
					showGroups
					.map((group, idx) => (
						<Chart
							key={group.id}
							id={group.id}
							yExtents={d => d.y[group.id].filter((v, idx) => this.state.options[group.id].has(group.lines[idx].label))}
							height={idx === 0 ? (height-40) : 90}
							origin={(w, h) => [0, (idx === 0 ? 0 : ((height-20) + (100*(idx-1))))]}
							>
							{
								showGroups.length - 1 === idx &&
								<XAxis axisAt="bottom" orient="bottom" ticks={full ? 10 : 5} stroke={"#bdbdbd"} fontWeight={300} opacity={0.5}/>
							}
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
								showLines(group).map(line => (
								<LineSeries
									key={line.id}
									yAccessor={d => d.y[group.id][line.id]}
									stroke={line.color}
									strokeWidth={2}
									strokeDasharray="Solid"
									highlightOnHover/>
								))
							}
							{
								showLines(group).map(line => (
									<CurrentCoordinate 
									key={line.id}
									yAccessor={(d) => d.y[group.id][line.id]} 
									fill={line.color}/>
								))
							}
							<GroupTooltip
								onClick={(option) => this.handleChange(option, group.id)}
								layout="vertical"
								fontSize={12}
								verticalSize={20}
								origin={full ? [10, 8] : [50, 8]}
								displayFormat={format(".2f")}
								options={group.lines.filter(line => !line.hide).map(line => ({
									yAccessor: d => d.y[group.id][line.id],
									yLabel: line.label,
									valueFill: line.color,
									withShape: true,
								}))}
								/>

							{
								params.x &&
								<Annotate with={SvgPathAnnotation}
									when={d => d.x == params.x}
									usingProps={getPriceAnnotation(params.x, totalHeight)} />
							}
							{
								showGroups.length - 1 === idx &&
								<MouseCoordinateX
									at="bottom"
									orient="bottom"
									displayFormat={params.xScaleType === ChartScaleType.DateTime ? timeFormat("%b %d, %Y") : format(".2f")}/>
							}
							<MouseCoordinateY
								at="left"
								orient={full ? "left" : "right"}
								displayFormat={format(".3s")}/>
							{
								idx === 0 &&
								<ZoomButtons heightFromBase={height-40} onReset={this.handleReset}/>
							}
						</Chart>
					))
				}
				<CrossHairCursor/>
			</ChartCanvas>
		</div>
		);
	}
}

LineChart.propTypes = {
	params: PropTypes.object.isRequired,
	items: PropTypes.array.isRequired,
	seriesName: PropTypes.string.isRequired,
	width: PropTypes.number.isRequired,
	margin: PropTypes.object.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

LineChart.defaultProps = {
	params: {},
	type: "hybrid",
	seriesName: "Line",
	height: 300,
	full: true,
	margin: { left: 50, right: 50, top: 5, bottom: 20},
	mouseMoveEvent: true,
	panEvent: true,
	zoomEvent: true,
	clamp: false,
};

LineChart = fitWidth(LineChart);

export default LineChart;
