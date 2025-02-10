import React, { useState } from 'react';

type props = {
  TopRightID: string;
  TopLeftID: string;
  BottomRightID: string;
  BottomLeftID: string;
  handleRegionEnter: (region: string) => void;
  handleRegionLeave: (region: string) => void;
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
  // const { handleRegionEnter, handleRegionLeave } = props;
  const colors = [ '#FF0000', '#FFD700', '#0000FF', '#00FF00' ];

  const topLeft = getQuadrants('TopLeft');
  const topRight = getQuadrants('TopRight');
  const bottomLeft = getQuadrants('BottomLeft');
  const bottomRight = getQuadrants('BottomRight');

  const quadrants = {
    topLeft,
    topRight,
    bottomLeft,
    bottomRight
  }

  // topLeft.top = 'topOuterLeft'; // top left top
  // topRight.top = 'topOuterRight';
  // topRight.right = 'rightOuterTop';
  // bottomRight.right = 'rightOuterBottom';
  // bottomRight.bottom = 'bottomOuterRight';
  // bottomLeft.bottom = 'bottomOuterLeft';
  // bottomLeft.left = 'leftOuterBottom';
  // topLeft.left = 'leftOuterTop';
  // bottomRight.top = 'circleSection1';
  // bottomRight.left = 'circleSection2';
  // bottomLeft.right = 'circleSection3';
  // bottomLeft.top = 'circleSection4';
  // topLeft.bottom = 'circleSection5';
  // topLeft.right = 'circleSection6';
  // topRight.left = 'circleSection7';
  // topRight.bottom = 'circleSection8';

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

  const graph = {
    // Triangular regions
    [topLeft.top]: [bottomRight.top, topRight.bottom, topLeft.left],
    [topRight.top]: [bottomRight.left, bottomRight.top, topRight.right],
    [topRight.right]: [bottomLeft.right, bottomRight.left, topRight.top],
    [bottomRight.right]: [bottomLeft.top, bottomLeft.right, bottomRight.bottom],
    [bottomRight.bottom]: [topLeft.bottom, bottomLeft.top, bottomRight.right],
    [bottomLeft.bottom]: [topLeft.right, topLeft.bottom, bottomLeft.left],
    [bottomLeft.left]: [topRight.left, topLeft.right, bottomLeft.bottom],
    [topLeft.left]: [topRight.bottom, topRight.left, topLeft.top],

    // Circle sections (45 degrees each)
    [quadrants.bottomRight.top]: [topLeft.top, topRight.top, bottomRight.left, topRight.bottom],
    [quadrants.bottomRight.left]: [topRight.top, topRight.right, bottomLeft.right, bottomRight.top],
    [quadrants.bottomLeft.right]: [topRight.right, bottomRight.right, bottomLeft.top, bottomRight.left],
    [quadrants.bottomLeft.top]: [bottomRight.right, bottomRight.bottom, topLeft.bottom, bottomLeft.right],
    [quadrants.topLeft.bottom]: [bottomRight.bottom, bottomLeft.bottom, topLeft.right, bottomLeft.top],
    [quadrants.topLeft.right]: [bottomLeft.bottom, bottomLeft.left, topRight.left, topLeft.bottom],
    [quadrants.topRight.left]: [bottomLeft.left, topLeft.left, topRight.bottom, topLeft.right],
    [quadrants.topRight.bottom]: [topLeft.left, topLeft.top, bottomRight.top, topRight.left]
  };

  function isColorValid(vertex, color, colorAssignments) {
    const neighbors = graph[ vertex ];
    return !neighbors.some(neighbor => colorAssignments[ neighbor ] === color);
  }

  const initialColors = () => {
    const colorAssignments = {};
    Object.keys(graph).forEach((vertex, index) => {
      colorAssignments[ vertex ] = colors[ index % colors.length ];
    });
    return colorAssignments;
  };

  const [ tileColors, setTileColors ] = useState<Record<string, string>>(initialColors);
  const [ hoveredRegions, setHoveredRegions ] = useState(new Set());

  const handleCircleSectionEnter = (circleSectionID: string) => {
    const regionID = getQuadrantSide(circleSectionID, quadrants);
    handleRegionEnter(regionID);
  }

  const handleRegionEnter = (region) => {
    console.log(region);
    if (!hoveredRegions.has(region)) {
      setHoveredRegions(prev => new Set(prev).add(region));
      setTileColors(prev => {
        const currentColor = prev[ region ];
        const currentIndex = colors.indexOf(currentColor);
        const nextColor = colors[ (currentIndex + 1) % colors.length ];
        const newColors = { ...prev };
        newColors[ region ] = nextColor;
        return newColors;
      });
    }
  };

  const handleCircleSectionLeave = (circleSectionID: string) => {
    const regionID = getQuadrantSide(circleSectionID, quadrants);
    handleRegionLeave(regionID);
  }

  const handleRegionLeave = (region) => {
    setHoveredRegions(prev => {
      const newSet = new Set(prev);
      newSet.delete(region);
      return newSet;
    });
  };

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