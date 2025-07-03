import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import { BarSeries, CandlestickSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { EdgeIndicator } from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { HoverTooltip } from "react-stockcharts/lib/tooltip";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";
import ZoomButtons from "react-stockcharts/lib/ZoomButtons";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";

const dateFormat = timeFormat("%b %d, %Y");
const numberFormat = format(".2f");

function tooltipContent() {
	return ({ currentItem, xAccessor }) => {
		return {
			x: dateFormat(xAccessor(currentItem)),
			y: [
				{
					label: "Open",
					value: currentItem.open && numberFormat(currentItem.open)
				},
				{
					label: "High",
					value: currentItem.high && numberFormat(currentItem.high)
				},
				{
					label: "Low",
					value: currentItem.low && numberFormat(currentItem.low)
				},
				{
					label: "Close",
					value: currentItem.close && numberFormat(currentItem.close)
				},
				{
					label: "Volume",
					value: currentItem.volume ? numberFormat(currentItem.volume) : "-"
				},
				{
					label: "Open Interest",
					value: currentItem.openInterest ? numberFormat(currentItem.openInterest) : "-"
				}
			]
		};
	};
}

class CandleStickChartWith extends React.Component {

	constructor(props) {
		super(props);
		this.state = {options: [], suffix: 1};
		this.handleReset = this.handleReset.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.preventDefault = this.preventDefault.bind(this);
		this.divRef = React.createRef()
	}

	handleReset() {
		this.setState({
			suffix: this.state.suffix + 1,
		});
	}
	
	handleChange(val) {
		this.setState(state => ({
			options: val,
		}));
	}
	preventDefault(e) {
		e.preventDefault();
	}
	componentDidMount () {
		this.divRef.current.addEventListener('wheel', this.preventDefault)
	}
	
	componentWillUnmount () {
		this.divRef.current.removeEventListener('wheel', this.preventDefault)
	}

	render() {

		// PROPS
		const { params, items, type, seriesName, width, height, margin, ratio, mouseMoveEvent, panEvent, zoomEvent, zoomAnchor, clamp} = this.props;

		// MEASURES		
		var totalHeight = height + 150 * this.state.options.length;

		// SCALES
		const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.date);
		const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(items);
		const start = xAccessor(last(data));
		const end = xAccessor(data[Math.max(0, data.length - 50)]);
		const xExtents = [start, end];

		// GRID
		const showGrid = params.showGrid;
		const gridHeight = totalHeight - margin.top - margin.bottom;
		const gridWidth = width - margin.left - margin.right;
		const yGrid = showGrid ? { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.1 } : {};
		const xGrid = showGrid ? { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.1 } : {};

		return (
			<div ref={this.divRef} className="app-chart">
				<div className="app-chart--buttons">
					<ToggleButtonGroup size="sm" type="checkbox" value={this.state.options} onChange={this.handleChange}>
						<ToggleButton variant="outline-secondary" value={1}>Volume</ToggleButton>
						<ToggleButton variant="outline-secondary" value={2}>Open Interest</ToggleButton>
					</ToggleButtonGroup>
				</div>
				<ChartCanvas
					height={totalHeight}
					seriesName={`${seriesName}_${this.state.suffix}`}
					ratio={ratio}
					width={width}
					margin={margin}
					mouseMoveEvent={mouseMoveEvent}
					panEvent={panEvent}
					zoomEvent={zoomEvent}
					clamp={clamp}
					zoomAnchor={zoomAnchor}
					type={type}
					data={data}
					xScale={xScale}
					xAccessor={xAccessor}
					xExtents={xExtents}
					displayXAccessor={displayXAccessor}
				>
					
					<Chart
						id={1}
						yExtents={[d => [d.high, d.low]]}
						padding={{ top: 10, bottom: 20 }}
						height={height - 40}
					>

						<CandlestickSeries/>
						
						<YAxis axisAt="left" orient="left" ticks={5} stroke={"#bdbdbd"} fontWeight={300} opacity={0.5} {...yGrid}/>
						<EdgeIndicator
							itemType="last"
							orient="right"
							edgeAt="right"
							yAccessor={d => d.close}
							fill={d => (d.close > d.open ? "#6BA583" : "#FF0000")}
							displayFormat={format(".4s")}/>
						{
							this.state.options.length == 0 &&
							<>
							<XAxis 
								axisAt="bottom"
								orient="bottom"
								stroke={"#bdbdbd"} fontWeight={300} opacity={0.5}
								{...xGrid}/>
							<ZoomButtons onReset={this.handleReset}/>
							</>
						}
						
					</Chart>
					{
						this.state.options.includes(1) &&
						<Chart
							id={2}
							yExtents={[d => d.volume || null]}
							height={130}
							origin={(w, h) => [0, h - 150 * this.state.options.length]}
						>
							<BarSeries
								yAccessor={d => d.volume || null}
								fill={d => (d.close > d.open ? "#6BA583" : "#FF0000")}/>
							<YAxis
								axisAt="left"
								orient="left"
								ticks={2}
								tickFormat={format(".3s")}
								stroke={"#bdbdbd"} fontWeight={300} opacity={0.5}
								{...yGrid}
							/>
						{
							this.state.options.length == 1 &&
							<>
							<XAxis
								axisAt="bottom"
								orient="bottom"
								stroke={"#bdbdbd"} fontWeight={300} opacity={0.5}
								{...xGrid}/>
							<ZoomButtons onReset={this.handleReset}/>
							</>
						}
						</Chart>
					}
					{
						this.state.options.includes(2) &&
						<Chart
							id={3}
							yExtents={[d => d.openInterest || null]}
							height={130}
							origin={(w, h) => [0, h - 150]}
						>
							<BarSeries
								yAccessor={d => d.openInterest || null}
								fill="#A0D8FA"/>
							<YAxis
								axisAt="left"
								orient="left"
								ticks={4}
								tickFormat={format(".3s")}
								stroke={"#bdbdbd"} fontWeight={300} opacity={0.5}
								{...yGrid}
							/>
							<XAxis 
								axisAt="bottom"
								orient="bottom"
								stroke={"#bdbdbd"} fontWeight={300} opacity={0.5}
								{...xGrid}/>
							<ZoomButtons onReset={this.handleReset}/>
						</Chart>
					}
					
					<HoverTooltip
						yAccessor={d => d.close}
						tooltipContent={tooltipContent()}
						fontSize={15}
					/>
				</ChartCanvas>
			</div>
		);
	}
}

CandleStickChartWith.propTypes = {
	params: PropTypes.object.isRequired,
	items: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	margin: PropTypes.object.isRequired,
	ratio: PropTypes.number.isRequired,
	seriesName: PropTypes.string.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired
};

CandleStickChartWith.defaultProps = {
	params: {},
	type: "hybrid",
	seriesName: "Principal",
	height: 300,
	margin: { left: 50, right: 50, top: 5, bottom: 20},
	mouseMoveEvent: true,
	panEvent: true,
	zoomEvent: true,
	clamp: false,
};
CandleStickChartWith = fitWidth(CandleStickChartWith);

export default CandleStickChartWith;
