import React, { useState, useEffect } from 'react';


interface GridDimensions {
  rows: number;
  cols: number;
}

interface ColorMap {
  [ key: string ]: string;
}

interface TileColors {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

interface Graph {
  [ key: string ]: string[];
}

interface ColorAssignments {
  [ key: string ]: string;
}

interface SingleTileProps {
  square: string;
  colors: TileColors;
}

interface ColoredTileGridProps {
  minTileSize?: number;
}

const ColoredTileGrid: React.FC<ColoredTileGridProps> = ({ minTileSize = 200 }) => {
  const colors: string[] = [ 'red', 'yellow', 'green', 'blue' ];
  const colorMap: ColorMap = {
    'red': '#FF0000',
    'yellow': '#FFD700',
    'blue': '#0000FF',
    'green': '#00FF00'
  };

  const [ dimensions, setDimensions ] = useState<GridDimensions>({ rows: 1, cols: 1 });
  const [ tileSize, setTileSize ] = useState<number>(minTileSize);
  const [ hoveredTriangles, setHoveredTriangles ] = useState<Set<string>>(new Set());

  useEffect(() => {
    function calculateGridSize(): void {
      const padding = 5;
      const availableWidth = window.innerWidth - (padding * 2);
      const availableHeight = window.innerHeight - (padding * 2);

      const maxCols = Math.floor(availableWidth / minTileSize);
      const maxRows = Math.floor(availableHeight / minTileSize);

      const actualTileSize = Math.min(
        availableWidth / maxCols,
        availableHeight / maxRows
      );

      setDimensions({
        rows: maxRows,
        cols: maxCols
      });
      setTileSize(actualTileSize);
    }

    calculateGridSize();
    window.addEventListener('resize', calculateGridSize);
    return () => window.removeEventListener('resize', calculateGridSize);
  }, [ minTileSize ]);

  function generateIdentifiers(count: number): string[] {
    const letters = Array.from(
      { length: Math.ceil(count / 26) },
      (_, i) => String.fromCharCode('A'.charCodeAt(0) + i)
    );

    return Array.from({ length: count }, (_, i) => {
      const letterIndex = Math.floor(i / 26);
      const number = (i % 26) + 1;
      return `${letters[ letterIndex ]}${number}`;
    });
  }

  function generateGraph(): Graph {
    const graph: Graph = {};
    const rowIds = generateIdentifiers(dimensions.rows);
    const colIds = generateIdentifiers(dimensions.cols);

    for (let r = 0; r < dimensions.rows; r++) {
      for (let c = 0; c < dimensions.cols; c++) {
        const square = `${rowIds[ r ]}${colIds[ c ]}`;

        graph[ `${square}-Top` ] = [ `${square}-Right`, `${square}-Left` ];
        graph[ `${square}-Right` ] = [ `${square}-Top`, `${square}-Bottom` ];
        graph[ `${square}-Bottom` ] = [ `${square}-Right`, `${square}-Left` ];
        graph[ `${square}-Left` ] = [ `${square}-Top`, `${square}-Bottom` ];

        if (c < dimensions.cols - 1) {
          const rightNeighbor = `${rowIds[ r ]}${colIds[ c + 1 ]}`;
          graph[ `${square}-Right` ].push(`${rightNeighbor}-Left`);
        }
        if (c > 0) {
          const leftNeighbor = `${rowIds[ r ]}${colIds[ c - 1 ]}`;
          graph[ `${square}-Left` ].push(`${leftNeighbor}-Right`);
        }
        if (r < dimensions.rows - 1) {
          const bottomNeighbor = `${rowIds[ r + 1 ]}${colIds[ c ]}`;
          graph[ `${square}-Bottom` ].push(`${bottomNeighbor}-Top`);
        }
        if (r > 0) {
          const topNeighbor = `${rowIds[ r - 1 ]}${colIds[ c ]}`;
          graph[ `${square}-Top` ].push(`${topNeighbor}-Bottom`);
        }
      }
    }
    return graph;
  }

  const graph = generateGraph();

  function getSameSquareVertices(vertex: string): string[] {
    const square = vertex.split('-')[ 0 ];
    return Object.keys(graph).filter(v => v.startsWith(square));
  }

  function isColorValid(
    vertex: string,
    color: string,
    graph: Graph,
    colorAssignments: ColorAssignments
  ): boolean {
    const neighbors = graph[ vertex ];
    if (neighbors.some(neighbor => colorAssignments[ neighbor ] === color)) {
      return false;
    }

    const sameSquareVertices = getSameSquareVertices(vertex);
    if (sameSquareVertices.some(v => colorAssignments[ v ] === color)) {
      return false;
    }

    return true;
  }

  function shuffleArray<T>(array: T[]): T[] {
    return array
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  function colorGraph(
    graph: Graph,
    fixedVertex: string,
    fixedColor: string
  ): ColorAssignments | null {
    const vertices = shuffleArray(Object.keys(graph));
    const colorAssignments: ColorAssignments = {};
    console.log('computing color assignments');

    colorAssignments[ fixedVertex ] = fixedColor;

    function colorVertex(vertex: string): boolean {
      if (vertex === fixedVertex) return true;

      for (const color of colors) {
        if (isColorValid(vertex, color, graph, colorAssignments)) {
          colorAssignments[ vertex ] = color;
          return true;
        }
      }
      return false;
    }

    const remainingVertices = vertices.filter(v => v !== fixedVertex);
    for (const vertex of remainingVertices) {
      if (!colorVertex(vertex)) {
        console.log('no valid color for vertex', vertex);
        return null;
      }
    }

    console.log('finished computing color assignments');
    return colorAssignments;
  }

  const [ solution, setSolution ] = useState<ColorAssignments>(() =>
    colorGraph(graph, 'A1-Top', colors[ 0 ]) || {}
  );

  useEffect(() => {
    const newSolution = colorGraph(graph, 'A1-Top', colors[ 0 ]);
    if (newSolution) {
      setSolution(newSolution);
    }
  }, [ dimensions ]);

  const handleTriangleEnter = (vertex: string): void => {
    if (!hoveredTriangles.has(vertex)) {
      setHoveredTriangles(prev => new Set(prev).add(vertex));

      const currentColor = solution[ vertex ];
      const currentIndex = colors.indexOf(currentColor);
      const nextColor = colors[ (currentIndex + 1) % colors.length ];

      const newSolution = colorGraph(graph, vertex, nextColor);
      if (newSolution) {
        setSolution(newSolution);
      }
    }
  };

  const handleTriangleLeave = (vertex: string): void => {
    setHoveredTriangles(prev => {
      const newSet = new Set(prev);
      newSet.delete(vertex);
      return newSet;
    });
  };

  const getTileColors = (square: string): TileColors => ({
    top: colorMap[ solution[ `${square}-Top` ] ],
    right: colorMap[ solution[ `${square}-Right` ] ],
    bottom: colorMap[ solution[ `${square}-Bottom` ] ],
    left: colorMap[ solution[ `${square}-Left` ] ]
  });

  const SingleTile: React.FC<SingleTileProps> = ({ square, colors }) => (
    <div style={{ width: `${tileSize}px`, height: `${tileSize}px` }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d="M 0 0 L 50 50 L 100 0 Z"
          fill={colors.top}
          onMouseEnter={() => handleTriangleEnter(`${square}-Top`)}
          onMouseLeave={() => handleTriangleLeave(`${square}-Top`)}
          className="transition-colors duration-200"
        />
        <path
          d="M 100 0 L 50 50 L 100 100 Z"
          fill={colors.right}
          onMouseEnter={() => handleTriangleEnter(`${square}-Right`)}
          onMouseLeave={() => handleTriangleLeave(`${square}-Right`)}
          className="transition-colors duration-200"
        />
        <path
          d="M 100 100 L 50 50 L 0 100 Z"
          fill={colors.bottom}
          onMouseEnter={() => handleTriangleEnter(`${square}-Bottom`)}
          onMouseLeave={() => handleTriangleLeave(`${square}-Bottom`)}
          className="transition-colors duration-200"
        />
        <path
          d="M 0 100 L 50 50 L 0 0 Z"
          fill={colors.left}
          onMouseEnter={() => handleTriangleEnter(`${square}-Left`)}
          onMouseLeave={() => handleTriangleLeave(`${square}-Left`)}
          className="transition-colors duration-200"
        />
      </svg>
    </div>
  );

  const rowIds = generateIdentifiers(dimensions.rows);
  const colIds = generateIdentifiers(dimensions.cols);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div
        className="grid gap-1 bg-white p-4 rounded-lg shadow-lg"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${dimensions.cols}, ${tileSize}px)`,
          gridTemplateRows: `repeat(${dimensions.rows}, ${tileSize}px)`,
        }}
      >
        {Array.from({ length: dimensions.rows }, (_, rowIndex) => {
          const row = rowIds[ rowIndex ];
          return Array.from({ length: dimensions.cols }, (_, colIndex) => {
            const col = colIds[ colIndex ];
            const square = `${row}${col}`;
            return (
              <SingleTile
                key={square}
                square={square}
                colors={getTileColors(square)}
              />
            );
          });
        }).flat()}
      </div>
      {/* <div className="mt-4 text-sm text-gray-600">
        {dimensions.rows}×{dimensions.cols} grid - Hover over triangles to change their colors
      </div> */}
    </div>
  );
};

export default ColoredTileGrid;