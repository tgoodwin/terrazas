import React from 'react';

// Define the configuration for each quadrant
type QuadrantConfig = {
  straightPaths: {
    [ key: string ]: string;  // key is 'top', 'right', 'bottom', or 'left'
  };
  circleAngles: {
    [ key: string ]: [ number, number ];  // key is 'top', 'right', 'bottom', or 'left'
  };
};

const quadrantConfigs: Record<string, QuadrantConfig> = {
  'TopLeft': {
    straightPaths: {
      top: "M 0 0 L 50 0 L 50 50 L 0 0",
      left: "M 0 50 L 0 0 L 50 50 L 0 50"
    },
    circleAngles: {
      bottom: [ 180, 225 ],
      right: [ 225, 270 ]
    }
  },
  'TopRight': {
    straightPaths: {
      top: "M 50 0 L 100 0 L 50 50 L 50 0",
      right: "M 100 0 L 100 50 L 50 50 L 100 0"
    },
    circleAngles: {
      left: [ 270, 315 ],
      bottom: [ 315, 360 ]
    }
  },
  'BottomLeft': {
    straightPaths: {
      left: "M 0 50 L 0 100 L 50 50 L 0 50",
      bottom: "M 0 100 L 50 100 L 50 50 L 0 100"
    },
    circleAngles: {
      right: [ 90, 135 ],
      top: [ 135, 180 ]
    }
  },
  'BottomRight': {
    straightPaths: {
      right: "M 100 50 L 100 100 L 50 50 L 100 50",
      bottom: "M 100 100 L 50 100 L 50 50 L 100 100"
    },
    circleAngles: {
      top: [ 0, 45 ],
      left: [ 45, 90 ]
    }
  }
};

// Common region rendering component
const Region: React.FC<{
  path: string;
  color: string;
  onEnter: () => void;
  onLeave: () => void;
  isCircle?: boolean;
}> = ({ path, color, onEnter, onLeave, isCircle }) => (
  <path
    d={path}
    fill={color}
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
    className={isCircle ? "transition-colors duration-200" : ""}
  // stroke="white"
  // strokeWidth="0.1"
  />
);

// Generic quadrant component
const Quadrant: React.FC<QuadrantProps & { type: keyof typeof quadrantConfigs; }> = ({
  tileSize,
  tileColors,
  enter: handleRegionEnter,
  leave: handleRegionLeave,
  QuadrantID,
  type
}) => {
  const quadrant = getQuadrants(QuadrantID);
  const config = quadrantConfigs[ type ];

  return (
    <div>
      {/* <svg viewBox="0 0 50 50" className="absolute w-full h-full"> */}
        {/* Render straight-line regions */}
        {Object.entries(config.straightPaths).map(([ region, path ]) => (
          <Region
            key={region}
            path={path}
            color={tileColors[ quadrant[ region as keyof typeof quadrant ] ]}
            onEnter={() => handleRegionEnter(quadrant[ region as keyof typeof quadrant ])}
            onLeave={() => handleRegionLeave(quadrant[ region as keyof typeof quadrant ])}
          />
        ))}

        {/* Render circular regions */}
        {Object.entries(config.circleAngles).map(([ region, [ startAngle, endAngle ] ]) => (
          <Region
            key={region}
            path={getCircleSectionPath(startAngle, endAngle)}
            color={tileColors[ quadrant[ region as keyof typeof quadrant ] ]}
            onEnter={() => handleRegionEnter(quadrant[ region as keyof typeof quadrant ])}
            onLeave={() => handleRegionLeave(quadrant[ region as keyof typeof quadrant ])}
            isCircle
          />
        ))}
      {/* </svg> */}
    </div>
  );
};

export const TopLeftQuadrant: React.FC<QuadrantProps> = (props: QuadrantProps) => {
  const { tileColors, enter: enter, leave } = props;
  const quadrant = getQuadrants(props.QuadrantID);
  return (
    <>
      <path
        d="M 0 0 L 50 0 L 50 50 L 0 0"
        fill={tileColors[ quadrant.top ]}
        onMouseEnter={() => enter(quadrant.top)}
        onMouseLeave={() => leave(quadrant.top)}
      />
      <path
        d="M 0 50 L 0 0 L 50 50 L 0 50"
        fill={tileColors[ quadrant.left ]}
        onMouseEnter={() => enter(quadrant.left)}
        onMouseLeave={() => leave(quadrant.left)}
      />
      <path
        d={getCircleSectionPath(180, 225)}
        fill={tileColors[ quadrant.bottom ]}
        onMouseEnter={() => enter(quadrant.bottom)}
        onMouseLeave={() => leave(quadrant.bottom)}
        className="transition-colors duration-200"
      />
      <path
        d={getCircleSectionPath(225, 270)}
        fill={tileColors[ quadrant.right ]}
        onMouseEnter={() => enter(quadrant.right)}
        onMouseLeave={() => leave(quadrant.right)}
        className="transition-colors duration-200"
      />
    </>
  );
};

export const TopRightQuadrant: React.FC<QuadrantProps> = (props: QuadrantProps) => {
  const { tileColors, enter: enter, leave } = props;
  const quadrant = getQuadrants(props.QuadrantID);
  return (
    <>
      <path
        d="M 50 0 L 100 0 L 50 50 L 50 0"
        fill={tileColors[ quadrant.top ]}
        onMouseEnter={() => enter(quadrant.top)}
        onMouseLeave={() => leave(quadrant.top)}
      />
      <path
        d="M 100 0 L 100 50 L 50 50 L 100 0"
        fill={tileColors[ quadrant.right ]}
        onMouseEnter={() => enter(quadrant.right)}
        onMouseLeave={() => leave(quadrant.right)}
      />
      <path
        d={getCircleSectionPath(270, 315)}
        fill={tileColors[ quadrant.left ]}
        onMouseEnter={() => enter(quadrant.left)}
        onMouseLeave={() => leave(quadrant.left)}
        className="transition-colors duration-200"
      />
      <path
        d={getCircleSectionPath(315, 360)}
        fill={tileColors[ quadrant.bottom ]}
        onMouseEnter={() => enter(quadrant.bottom)}
        onMouseLeave={() => leave(quadrant.bottom)}
        className="transition-colors duration-200"
      />
    </>
  );
};

export const BottomLeftQuadrant: React.FC<QuadrantProps> = (props: QuadrantProps) => {
  const { tileColors, enter: enter, leave } = props;
  const quadrant = getQuadrants(props.QuadrantID);
  return (
    <>
      <path
        d="M 0 50 L 0 100 L 50 50 L 0 50"
        fill={tileColors[ quadrant.left ]}
        onMouseEnter={() => enter(quadrant.left)}
        onMouseLeave={() => leave(quadrant.left)}
      />
      <path
        d="M 0 100 L 50 100 L 50 50 L 0 100"
        fill={tileColors[ quadrant.bottom ]}
        onMouseEnter={() => enter(quadrant.bottom)}
        onMouseLeave={() => leave(quadrant.bottom)}
      />
      <path
        d={getCircleSectionPath(90, 135)}
        fill={tileColors[ quadrant.right ]}
        onMouseEnter={() => enter(quadrant.right)}
        onMouseLeave={() => leave(quadrant.right)}
        className="transition-colors duration-200"
      />
      <path
        d={getCircleSectionPath(135, 180)}
        fill={tileColors[ quadrant.top ]}
        onMouseEnter={() => enter(quadrant.top)}
        onMouseLeave={() => leave(quadrant.top)}
        className="transition-colors duration-200"
      />
    </>
  );
};

export const BottomRightQuadrant: React.FC<QuadrantProps> = (props: QuadrantProps) => {
  const { tileColors, enter: enter, leave } = props;
  const quadrant = getQuadrants(props.QuadrantID);
  return (
    <>
      <path
        d="M 100 50 L 100 100 L 50 50 L 100 50"
        fill={tileColors[ quadrant.right ]}
        onMouseEnter={() => enter(quadrant.right)}
        onMouseLeave={() => leave(quadrant.right)}
      />
      <path
        d="M 100 100 L 50 100 L 50 50 L 100 100"
        fill={tileColors[ quadrant.bottom ]}
        onMouseEnter={() => enter(quadrant.bottom)}
        onMouseLeave={() => leave(quadrant.bottom)}
      />
      <path
        d={getCircleSectionPath(0, 45)}
        fill={tileColors[ quadrant.top ]}
        onMouseEnter={() => enter(quadrant.top)}
        onMouseLeave={() => leave(quadrant.top)}
        className="transition-colors duration-200"
      />
      <path
        d={getCircleSectionPath(45, 90)}
        fill={tileColors[ quadrant.left ]}
        onMouseEnter={() => enter(quadrant.left)}
        onMouseLeave={() => leave(quadrant.left)}
        className="transition-colors duration-200"
      />
    </>
  );
};

// Simplified quadrant components
export const TopLeft: React.FC<QuadrantProps> = (props) => (
  <Quadrant {...props} type="TopLeft" />
);

export const TopRight: React.FC<QuadrantProps> = (props) => (
  <Quadrant {...props} type="TopRight" />
);

export const BottomLeft: React.FC<QuadrantProps> = (props) => (
  <Quadrant {...props} type="BottomLeft" />
);

export const BottomRight: React.FC<QuadrantProps> = (props) => (
  <Quadrant {...props} type="BottomRight" />
);

type props = {
  tileSize: number;
  TopRightID: string;
  TopLeftID: string;
  BottomRightID: string;
  BottomLeftID: string;
  handleRegionEnter: (region: string) => void;
  handleRegionLeave: (region: string) => void;
  tileColors: Record<string, string>;
};

type quadrant = {
  top: string;
  right: string;
  bottom: string;
  left: string;
};

const getQuadrants = (quadrantID: string): quadrant => ({
  top: `${quadrantID}-Top`,
  right: `${quadrantID}-Right`,
  bottom: `${quadrantID}-Bottom`,
  left: `${quadrantID}-Left`
}
);

// Helper function to create circle section path
const getCircleSectionPath = (startAngle: number, endAngle: number) => {
  const start = {
    x: 50 + 50 * Math.cos(startAngle * Math.PI / 180),
    y: 50 + 50 * Math.sin(startAngle * Math.PI / 180)
  };
  const end = {
    x: 50 + 50 * Math.cos(endAngle * Math.PI / 180),
    y: 50 + 50 * Math.sin(endAngle * Math.PI / 180)
  };
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M 50 50 L ${start.x} ${start.y} A 50 50 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
};

type QuadrantProps = {
  tileSize?: number;
  tileColors: Record<string, string>;
  enter: (region: string) => void;
  leave: (region: string) => void;
  QuadrantID: string;
};



const ComplexTile = (props: props) => {
  const { handleRegionEnter, handleRegionLeave, tileColors, tileSize } = props;
  const quadrantSize = tileSize;

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 rounded-lg">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="relative w-64 h-64">
          <svg viewBox="0 0 100 100" className="absolute w-full h-full">
            <TopLeftQuadrant
              tileSize={quadrantSize}
              tileColors={tileColors}
              enter={handleRegionEnter}
              leave={handleRegionLeave}
              QuadrantID={props.TopLeftID}
            />
            <TopRightQuadrant
              tileSize={quadrantSize}
              tileColors={tileColors}
              enter={handleRegionEnter}
              leave={handleRegionLeave}
              QuadrantID={props.TopRightID}
            />
            <BottomLeftQuadrant
              tileSize={quadrantSize}
              tileColors={tileColors}
              enter={handleRegionEnter}
              leave={handleRegionLeave}
              QuadrantID={props.BottomLeftID}
            />
            <BottomRightQuadrant
              tileSize={quadrantSize}
              tileColors={tileColors}
              enter={handleRegionEnter}
              leave={handleRegionLeave}
              QuadrantID={props.BottomRightID}
            />
            {/* Reference lines */}
            <circle
              cx="50"
              cy="50"
              r="50"
              fill="none"
              stroke="#ccc"
              strokeWidth="0.5"
            />
            <line x1="0" y1="0" x2="100" y2="100" stroke="#ccc" strokeWidth="0.5" />
            <line x1="100" y1="0" x2="0" y2="100" stroke="#ccc" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ComplexTile;