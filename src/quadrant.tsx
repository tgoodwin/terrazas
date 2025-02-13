import React, { useState } from 'react';

interface QuadrantProps {
	regionId: string;
	colors: Record<string, string>;
	onRegionEnter: (regionId: string) => void;
	onRegionLeave: (regionId: string) => void;
	debug?: boolean;
}

type PathConfig = {
	straight: {
		[ key: string ]: string;
	};
	arcs: {
		[ key: string ]: {
			startAngle: number;
			endAngle: number;
      centerX: number;
      centerY: number;
		};
	};
};

const QUADRANT_CONFIGS: Record<string, PathConfig> = {
	TopLeft: {
		straight: {
			Top: "M 0 0 L 50 0 L 50 50 L 0 0",
			Left: "M 0 50 L 0 0 L 50 50 L 0 50"
		},
		arcs: {
			Bottom: { startAngle: 180, endAngle: 225, centerX: 50, centerY: 50 },
			Right: { startAngle: 225, endAngle: 270, centerX: 50, centerY: 50 }
		}
	},
	TopRight: {
		straight: {
			Top: "M 0 0 L 50 0 L 0 50 L 0 0",
			Right: "M 50 0 L 50 50 L 0 50 L 50 0"
		},
		arcs: {
			Bottom: { startAngle: 315, endAngle: 360, centerX: 0, centerY: 50 },
			Left: { startAngle: 270, endAngle: 315, centerX: 0, centerY: 50 }
		}
	},
	BottomLeft: {
		straight: {
			Left: "M 0 0 L 0 50 L 50 0 L 50 0",
			Bottom: "M 0 50 L 50 50 L 50 0 L 50 0"
		},
		arcs: {
			Right: { startAngle: 90, endAngle: 135, centerX: 50, centerY: 0 },
			Top: { startAngle: 135, endAngle: 180, centerX: 50, centerY: 0 }
		}
	},
	BottomRight: {
		straight: {
			Right: "M 0 0 L 100 100 L 50 50 L 50 0",
			Bottom: "M 0 0 L 0 0 L 50 50 L 0 50"
		},
		arcs: {
			Top: { startAngle: 0, endAngle: 45, centerX: 0, centerY: 0 },
			Left: { startAngle: 45, endAngle: 90, centerX: 0, centerY: 0 }
		}
	}
};

const getCircleSectionPath = (startAngle: number, endAngle: number, centerX: number, centerY: number): string => {
	const radius = 50;
	const start = {
		x: centerX + radius * Math.cos(startAngle * Math.PI / 180),
		y: centerY + radius * Math.sin(startAngle * Math.PI / 180)
	};
	const end = {
		x: centerX + radius * Math.cos(endAngle * Math.PI / 180),
		y: centerY + radius * Math.sin(endAngle * Math.PI / 180)
	};
	const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
	return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
};

const Quadrant: React.FC<QuadrantProps & { quadrantType: keyof typeof QUADRANT_CONFIGS; }> = ({
	regionId,
	colors,
	onRegionEnter,
	onRegionLeave,
	debug = false,
	quadrantType
}) => {
	const config = QUADRANT_CONFIGS[ quadrantType ];

	return (
		<g>
			{/* Render straight paths */}
			{Object.entries(config.straight).map(([ key, path ]) => (
				<path
					key={key}
					d={path}
					fill={colors[ `${regionId}-${key}` ]}
					stroke="white"
					strokeWidth="1"
					onMouseEnter={() => onRegionEnter(`${regionId}-${key}`)}
					onMouseLeave={() => onRegionLeave(`${regionId}-${key}`)}
				/>
			))}

			{/* Render arc paths */}
			{Object.entries(config.arcs).map(([ key, { startAngle, endAngle, centerX, centerY } ]) => (
				<path
					key={key}
					d={getCircleSectionPath(startAngle, endAngle, centerX, centerY)}
					fill={colors[ `${regionId}-${key}` ]}
					stroke="white"
					strokeWidth="1"
					onMouseEnter={() => onRegionEnter(`${regionId}-${key}`)}
					onMouseLeave={() => onRegionLeave(`${regionId}-${key}`)}
				/>
			))}
		</g>
	);
};

const TopLeftQuadrant: React.FC<QuadrantProps> = (props) => (
	<Quadrant {...props} quadrantType="TopLeft" />
);

const TopRightQuadrant: React.FC<QuadrantProps> = (props) => (
	<Quadrant {...props} quadrantType="TopRight" />
);

const BottomLeftQuadrant: React.FC<QuadrantProps> = (props) => (
	<Quadrant {...props} quadrantType="BottomLeft" />
);

const BottomRightQuadrant: React.FC<QuadrantProps> = (props) => (
	<Quadrant {...props} quadrantType="BottomRight" />
);

const ComplexTile: React.FC<{ debug?: boolean; }> = ({ debug = false }) => {
	const colors = [ '#FF0000', '#FFD700', '#0000FF', '#00FF00' ];

	const [ colorState, setColorState ] = useState<Record<string, string>>(() => {
		const initialColors: Record<string, string> = {};
		const quadrants = [ 'Q1', 'Q2', 'Q3', 'Q4' ];
		const regions = [ 'Top', 'Right', 'Bottom', 'Left' ];

		quadrants.forEach((quadrant, qIndex) => {
			regions.forEach((region, rIndex) => {
				initialColors[ `${quadrant}-${region}` ] = colors[ (qIndex + rIndex) % colors.length ];
			});
		});

		return initialColors;
	});

	const handleRegionEnter = (regionId: string) => {
		setColorState(prev => {
			const currentColor = prev[ regionId ];
			const currentIndex = colors.indexOf(currentColor);
			const nextColor = colors[ (currentIndex + 1) % colors.length ];
			return {
				...prev,
				[ regionId ]: nextColor
			};
		});
	};

	const handleRegionLeave = (regionId: string) => {
		// Optional: handle leave event if needed
	};

	const sharedProps = {
		colors: colorState,
		onRegionEnter: handleRegionEnter,
		onRegionLeave: handleRegionLeave,
		debug
	};

	return (
		<div className="flex flex-col items-center p-8 bg-gray-100 rounded-lg">
			<div className="bg-white p-4 rounded-lg shadow-lg">
				<div style={{ width: 100, height: 100, border: '1px solid black' }}>
					<svg viewBox="0 0 100 100" className="w-full h-full">
						<TopLeftQuadrant {...sharedProps} regionId="Q1" />
						<TopRightQuadrant {...sharedProps} regionId="Q2" />
						<BottomLeftQuadrant {...sharedProps} regionId="Q3" />
						<BottomRightQuadrant {...sharedProps} regionId="Q4" />
					</svg>
				</div>
			</div>
		</div>
	);
};

const QuadrantContainer: React.FC<QuadrantProps & { children?: React.ReactNode }> = (props) => (
	<div className="flex flex-col items-center bg-gray-100">
		<div className="bg-white">
			<div>
				<svg viewBox="0 0 50 50" className="w-full h-full">
					{props.children}
				</svg>
			</div>
		</div>
	</div>
);

export const TopLeft: React.FC<QuadrantProps> = (props) => (
	<QuadrantContainer {...props}>
		<TopLeftQuadrant {...props} />
	</QuadrantContainer>
);

export const TopRight: React.FC<QuadrantProps> = (props) => (
	<QuadrantContainer {...props}>
		<TopRightQuadrant {...props} />
	</QuadrantContainer>
);

export const BottomLeft: React.FC<QuadrantProps> = (props) => (
	<QuadrantContainer {...props}>
		<BottomLeftQuadrant {...props} />
	</QuadrantContainer>
);

export const BottomRight: React.FC<QuadrantProps> = (props) => (
	<QuadrantContainer {...props}>
		<BottomRightQuadrant {...props} />
	</QuadrantContainer>
);

export default ComplexTile;