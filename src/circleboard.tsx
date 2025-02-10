import React, { useState } from 'react';

type props = {
  TopRightID: string;
  TopLeftID: string;
  BottomRightID: string;
  BottomLeftID: string;
  handleRegionEnter: (region: string) => void;
  handleRegionLeave: (region: string) => void;
  tileColors: Record<string, string>;
}

type quadrant = {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

type quadrants = {
  topLeft: quadrant;
  topRight: quadrant;
  bottomLeft: quadrant;
  bottomRight: quadrant;
}

const getQuadrants = (quadrantID: string): quadrant => ({
    top: `${quadrantID}-Top`,
    right: `${quadrantID}-Right`,
    bottom: `${quadrantID}-Bottom`,
    left: `${quadrantID}-Left`
  }
)

const ComplexTile = (props: props) => {
  const { handleRegionEnter, handleRegionLeave, tileColors } = props;
  // const colors = [ '#FF0000', '#FFD700', '#0000FF', '#00FF00' ];

  const topLeft = getQuadrants(props.TopLeftID);
  const topRight = getQuadrants(props.TopRightID);
  const bottomLeft = getQuadrants(props.BottomLeftID);
  const bottomRight = getQuadrants(props.BottomRightID);

  const quadrants = {
    topLeft,
    topRight,
    bottomLeft,
    bottomRight
  }

  const getQuadrantSide = (circleSectionID: string, quadrants: quadrants): string => {
    const mapping: Record<string, string> = {
      circleSection1: quadrants.bottomRight.top,
      circleSection2: quadrants.bottomRight.left,
      circleSection3: quadrants.bottomLeft.right,
      circleSection4: quadrants.bottomLeft.top,
      circleSection5: quadrants.topLeft.bottom,
      circleSection6: quadrants.topLeft.right,
      circleSection7: quadrants.topRight.left,
      circleSection8: quadrants.topRight.bottom
    };

    return mapping[circleSectionID];
  };

  const handleCircleSectionEnter = (circleSectionID: string) => {
    const regionID = getQuadrantSide(circleSectionID, quadrants);
    handleRegionEnter(regionID);
  }

  const handleCircleSectionLeave = (circleSectionID: string) => {
    const regionID = getQuadrantSide(circleSectionID, quadrants);
    handleRegionLeave(regionID);
  }

  // Helper function to create circle section path
  const getCircleSectionPath = (startAngle, endAngle) => {
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

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 rounded-lg">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="relative w-64 h-64">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Outer triangular regions */}
            <path
              d="M 0 0 L 50 0 L 50 50 L 0 0"
              fill={tileColors[ topLeft.top  ]}
              onMouseEnter={() => handleRegionEnter(topLeft.top)}
              onMouseLeave={() => handleRegionLeave(topLeft.top)}
            />
            <path
              d="M 50 0 L 100 0 L 50 50 L 50 0"
              fill={tileColors [ topRight.top ]}
              onMouseEnter={() => handleRegionEnter(topRight.top)}
              onMouseLeave={() => handleRegionLeave(topRight.top)}
            />
            <path
              d="M 100 0 L 100 50 L 50 50 L 100 0"
              fill={tileColors [ topRight.right ]}
              onMouseEnter={() => handleRegionEnter(topRight.right)}
              onMouseLeave={() => handleRegionLeave(topRight.right)}
            />
            <path
              d="M 100 50 L 100 100 L 50 50 L 100 50"
              fill={tileColors [ bottomRight.right ]}
              onMouseEnter={() => handleRegionEnter(bottomRight.right)}
              onMouseLeave={() => handleRegionLeave(bottomRight.right)}
            />
            <path
              d="M 100 100 L 50 100 L 50 50 L 100 100"
              fill={tileColors [ bottomRight.bottom ]}
              onMouseEnter={() => handleRegionEnter(bottomRight.bottom)}
              onMouseLeave={() => handleRegionLeave(bottomRight.bottom)}
            />
            <path
              d="M 50 100 L 0 100 L 50 50 L 50 100"
              fill={tileColors [ bottomLeft.bottom ]}
              onMouseEnter={() => handleRegionEnter(bottomLeft.bottom)}
              onMouseLeave={() => handleRegionLeave(bottomLeft.bottom)}
            />
            <path
              d="M 0 100 L 0 50 L 50 50 L 0 100"
              fill={tileColors [ bottomLeft.left ]}
              onMouseEnter={() => handleRegionEnter(bottomLeft.left)}
              onMouseLeave={() => handleRegionLeave(bottomLeft.left)}
            />
            <path
              d="M 0 50 L 0 0 L 50 50 L 0 50"
              fill={tileColors [ topLeft.left ]}
              onMouseEnter={() => handleRegionEnter(topLeft.left)}
              onMouseLeave={() => handleRegionLeave(topLeft.left)}
            />

            {/* Circle sections */}
            {[ ...Array(8) ].map((_, i) => {
              const startAngle = i * 45;
              const endAngle = (i + 1) * 45;
              return (
                <path
                  key={i}
                  d={getCircleSectionPath(startAngle, endAngle)}
                  fill={tileColors[getQuadrantSide(`circleSection${i + 1}`, quadrants)]}
                  onMouseEnter={() => handleCircleSectionEnter(`circleSection${i + 1}`)}
                  onMouseLeave={() => handleCircleSectionLeave(`circleSection${i + 1}`)}
                  className="transition-colors duration-200"
                />
              );
            })}

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