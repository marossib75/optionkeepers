import React from "react";
import PropTypes from "prop-types";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import {
  scaleOrdinal,
  schemeCategory10,
  scaleLinear
} from "d3-scale";
import { set } from "d3-collection";
import { Label } from "react-stockcharts/lib/annotation";
import { ChartCanvas, Chart } from "react-stockcharts";
import { GroupedBarSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { fitWidth } from "react-stockcharts/lib/helper";
import HoverTooltip from "react-stockcharts/lib/tooltip/HoverTooltip";
import ZoomButtons from "react-stockcharts/lib/ZoomButtons";
import { ChartScaleType } from "../../../../enums/chart-type.enum";
import discontinuousTimeScaleProvider from "react-stockcharts/lib/scale/discontinuousTimeScaleProvider";
import { last } from "react-stockcharts/lib/utils";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";

const dateFormat = timeFormat("%b %d, %Y");
const numberFormat = format(".2f");

function tooltipContent(groups, xScaleType) {
	return ({ currentItem, xAccessor }) => {
		return {
			x: xScaleType === ChartScaleType.DateTime ? dateFormat(xAccessor(currentItem)) : xAccessor(currentItem),
			y: groups.map((group) => 
					group.bars.map((bar, index) => 
						({
							label: bar, 
							value: currentItem.y[group.id][index] ? numberFormat(currentItem.y[group.id][index]) : "0"
						})
					)
				).flat()
		};
	};
}

class GroupedBarChart extends React.Component {

	constructor(props) {
		super(props);
		this.state = {selection: 0, suffix: 1};
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
	
	handleChange(val) {
		this.setState(state => ({
			selection: val
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
		const { params, items, type, seriesName, width, height, margin, ratio, mouseMoveEvent, panEvent, zoomEvent, zoomAnchor, clamp } = this.props;
		var data = items;

		const mid = params.index || Math.round(data.length/2);
		const groups = params.groups;

		// SCALES
		var xScale = scaleLinear(data);
		var xAccessor = (d) => d.x;
		var xExtents = [xAccessor(data[Math.max(0, mid-10)]), xAccessor(data[Math.min(data.length-1, mid+10)])];
		var displayXAccessor = xAccessor;


		if (params.xScaleType === ChartScaleType.DateTime ) {
			const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.x);
			
			data = xScaleProvider(items).data;
			xScale = xScaleProvider(items).xScale;
			xAccessor = xScaleProvider(items).xAccessor;
			displayXAccessor = xScaleProvider(items).displayXAccessor;
			xExtents = [xAccessor(last(data)), xAccessor(data[Math.max(0, data.length-20)])];
		}

		// GRID
		const yGrid = params.showGrid ? { innerTickSize: -1 * (width - margin.left - margin.right), tickStrokeOpacity: 0.1 } : {};

		const f = scaleOrdinal(schemeCategory10).domain(
			set(data.map((d) => d.x))
		);

		const fill = (d, i) => f(i);
		return (
			<div ref={this.divRef} className="app-chart">
				<div className="app-chart--buttons">
					<ToggleButtonGroup size="sm" name="radio" type="radio" value={this.state.selection} onChange={this.handleChange}>
						{
							groups &&
							groups.length > 1 &&
							groups.map((group, index) => (
								<ToggleButton key={group.id} variant="outline-secondary" value={index}>{group.title}</ToggleButton>
							))
						}
					</ToggleButtonGroup>
				</div>
				<ChartCanvas
					ratio={ratio}
					width={width}
					height={height}
					margin={margin}
					type={type}
					seriesName={`${seriesName}_${this.state.suffix}`}
					mouseMoveEvent={mouseMoveEvent}
					panEvent={panEvent}
					zoomEvent={zoomEvent}
					clamp={clamp}
					zoomAnchor={zoomAnchor}
					data={data}
					xExtents={xExtents}
					xAccessor={xAccessor}
					xScale={xScale}
					displayXAccessor={displayXAccessor}
				>
				{
					groups &&
					this.state.selection < groups.length &&
					<Label x={(width - margin.left - margin.right) / 2} y={10} fontSize={15} text={groups[this.state.selection].label} />
				}
				{
					groups &&
					this.state.selection < groups.length &&
					<Chart
						id={groups[this.state.selection].id}
						yExtents={[0, (d) => d.y[groups[this.state.selection].id]]}
						yScale={scaleLinear()}>
						<XAxis
							axisAt="bottom"
							orient="bottom"
							stroke={"#bdbdbd"} fontWeight={300} opacity={0.5}
							ticks={5}/>
						<YAxis
							axisAt="left"
							orient="left"
							ticks={10}
							tickFormat={format(".2s")}
							stroke={"#bdbdbd"} fontWeight={300} opacity={0.5}
							{...yGrid}/>
						<GroupedBarSeries
							baseAt={(xScale, yScale/* , d */) => yScale(0)}
							yAccessor={groups[this.state.selection].bars.map((bar, index)=> {return (d) => d.y[groups[this.state.selection].id][index]})}
							fill={fill}
							spaceBetweenBar={5}
							widthRatio={1}
							width={10}
						/>
						<ZoomButtons onReset={this.handleReset}/>
					</Chart>
				}
				<HoverTooltip
					yAccessor={(d) => d.y[groups[this.state.selection].id]}
					tooltipContent={tooltipContent(groups, params.xScaleType)}
					fontSize={15}
				/>
				</ChartCanvas>
			</div>
		);
	}
}

GroupedBarChart.propTypes = {
  params: PropTypes.object.isRequired,
  items: PropTypes.array.isRequired,
  index: PropTypes.array,
  width: PropTypes.number.isRequired,
  margin: PropTypes.object.isRequired,
  ratio: PropTypes.number.isRequired,
  seriesName: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["svg", "hybrid"]).isRequired
};

GroupedBarChart.defaultProps = {
  params: {},
  type: "hybrid",
  seriesName: "Grouped",
  height: 300,
  margin: { left: 50, right: 50, top: 5, bottom: 30},
  mouseMoveEvent: true,
  panEvent: true,
  zoomEvent: true,
  clamp: false,
};
GroupedBarChart = fitWidth(GroupedBarChart);

export default GroupedBarChart;
