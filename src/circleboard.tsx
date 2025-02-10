import React, { useState } from 'react';

type props = {
  TopRightID: string;
  TopLeftID: string;
  BottomRightID: string;
  BottomLeftID: string;
}

type quadrant = {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

const ComplexTile = (props: props) => {
  const colors = [ '#FF0000', '#FFD700', '#0000FF', '#00FF00' ];


  let topOuterLeft = 'topOuterLeft'; // top left
  let topOuterRight = 'topOuterRight';
  let rightOuterTop = 'rightOuterTop';
  let rightOuterBottom = 'rightOuterBottom';
  let bottomOuterRight = 'bottomOuterRight';
  let bottomOuterLeft = 'bottomOuterLeft';
  let leftOuterBottom = 'leftOuterBottom';
  let leftOuterTop = 'leftOuterTop';
  let circleSection1 = 'circleSection1';
  let circleSection2 = 'circleSection2';
  let circleSection3 = 'circleSection3';
  let circleSection4 = 'circleSection4';
  let circleSection5 = 'circleSection5';
  let circleSection6 = 'circleSection6';
  let circleSection7 = 'circleSection7';
  let circleSection8 = 'circleSection8';

  const graph = {
    // Triangular regions
    topOuterLeft: [circleSection1, circleSection8, leftOuterTop],
    topOuterRight: [circleSection2, circleSection1, rightOuterTop],
    rightOuterTop: [circleSection3, circleSection2, topOuterRight],
    rightOuterBottom: [circleSection4, circleSection3, bottomOuterRight],
    bottomOuterRight: [circleSection5, circleSection4, rightOuterBottom],
    bottomOuterLeft: [circleSection6, circleSection5, leftOuterBottom],
    leftOuterBottom: [circleSection7, circleSection6, bottomOuterLeft],
    leftOuterTop: [circleSection8, circleSection7, topOuterLeft],

    // Circle sections (45 degrees each)
    circleSection1: [topOuterLeft, topOuterRight, circleSection2, circleSection8],
    circleSection2: [topOuterRight, rightOuterTop, circleSection3, circleSection1],
    circleSection3: [rightOuterTop, rightOuterBottom, circleSection4, circleSection2],
    circleSection4: [rightOuterBottom, bottomOuterRight, circleSection5, circleSection3],
    circleSection5: [bottomOuterRight, bottomOuterLeft, circleSection6, circleSection4],
    circleSection6: [bottomOuterLeft, leftOuterBottom, circleSection7, circleSection5],
    circleSection7: [leftOuterBottom, leftOuterTop, circleSection8, circleSection6],
    circleSection8: [leftOuterTop, topOuterLeft, circleSection1, circleSection7]
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

  const [ tileColors, setTileColors ] = useState(initialColors);
  const [ hoveredRegions, setHoveredRegions ] = useState(new Set());

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
              fill={tileColors.topOuterLeft}
              onMouseEnter={() => handleRegionEnter(topOuterLeft)}
              onMouseLeave={() => handleRegionLeave(topOuterLeft)}
            />
            <path
              d="M 50 0 L 100 0 L 50 50 L 50 0"
              fill={tileColors.topOuterRight}
              onMouseEnter={() => handleRegionEnter(topOuterRight)}
              onMouseLeave={() => handleRegionLeave(topOuterRight)}
            />
            <path
              d="M 100 0 L 100 50 L 50 50 L 100 0"
              fill={tileColors.rightOuterTop}
              onMouseEnter={() => handleRegionEnter(rightOuterTop)}
              onMouseLeave={() => handleRegionLeave(rightOuterTop)}
            />
            <path
              d="M 100 50 L 100 100 L 50 50 L 100 50"
              fill={tileColors.rightOuterBottom}
              onMouseEnter={() => handleRegionEnter(rightOuterBottom)}
              onMouseLeave={() => handleRegionLeave(rightOuterBottom)}
            />
            <path
              d="M 100 100 L 50 100 L 50 50 L 100 100"
              fill={tileColors.bottomOuterRight}
              onMouseEnter={() => handleRegionEnter(bottomOuterRight)}
              onMouseLeave={() => handleRegionLeave(bottomOuterRight)}
            />
            <path
              d="M 50 100 L 0 100 L 50 50 L 50 100"
              fill={tileColors.bottomOuterLeft}
              onMouseEnter={() => handleRegionEnter(bottomOuterLeft)}
              onMouseLeave={() => handleRegionLeave(bottomOuterLeft)}
            />
            <path
              d="M 0 100 L 0 50 L 50 50 L 0 100"
              fill={tileColors.leftOuterBottom}
              onMouseEnter={() => handleRegionEnter(leftOuterBottom)}
              onMouseLeave={() => handleRegionLeave(leftOuterBottom)}
            />
            <path
              d="M 0 50 L 0 0 L 50 50 L 0 50"
              fill={tileColors.leftOuterTop}
              onMouseEnter={() => handleRegionEnter(leftOuterTop)}
              onMouseLeave={() => handleRegionLeave(leftOuterTop)}
            />

            {/* Circle sections */}
            {[ ...Array(8) ].map((_, i) => {
              const startAngle = i * 45;
              const endAngle = (i + 1) * 45;
              return (
                <path
                  key={i}
                  d={getCircleSectionPath(startAngle, endAngle)}
                  fill={tileColors[ `circleSection${i + 1}` ]}
                  onMouseEnter={() => handleRegionEnter(`circleSection${i + 1}`)}
                  onMouseLeave={() => handleRegionLeave(`circleSection${i + 1}`)}
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