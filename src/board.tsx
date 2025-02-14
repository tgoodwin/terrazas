import React, { useState, useEffect } from 'react';
import SingleTile from './square';
import { TopLeft, TopRight, BottomLeft, BottomRight } from './quadrant';

interface GridDimensions {
  rows: number;
  cols: number;
}

// map of color names to hex values
export interface ColorMap {
  [ key: ColorID ]: string;
}

interface TileColors {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

type VertexID = string;

interface Graph {
  [ key: VertexID ]: VertexID[];
}

type ColorID = string;

export type ColorAssignments = {
  [ key: VertexID ]: ColorID;
};

interface ColoredTileGridProps {
  minTileSize?: number;
}

enum TileType {
  ST = "ST",  // Standard tile
  TL = "TL",  // Top-left quadrant
  TR = "TR",  // Top-right quadrant
  BL = "BL",  // Bottom-left quadrant
  BR = "BR"   // Bottom-right quadrant
}

function generateTileGrid(M: number, N: number): TileType[][] {
  // Initialize grid with "ST" tiles
  const grid: TileType[][] = Array.from({ length: M }, () => Array(N).fill(TileType.ST));

  // Ensure a circle can fit
  if (M < 2 || N < 2) {
    return grid;  // No space for a circle
  }

  // Pick a random position for the top-left of the circle
  const i = Math.floor(Math.random() * (M - 1));
  const j = Math.floor(Math.random() * (N - 1));

  // Assign quadrant tiles
  grid[ i ][ j ] = TileType.TL;      // Top-left
  grid[ i ][ j + 1 ] = TileType.TR;  // Top-right
  grid[ i + 1 ][ j ] = TileType.BL;  // Bottom-left
  grid[ i + 1 ][ j + 1 ] = TileType.BR;  // Bottom-right

  return grid;
}
const ColoredTileGrid: React.FC<ColoredTileGridProps> = ({ minTileSize = 200 }) => {
  const colors: string[] = [ 'red', 'yellow', 'green', 'blue'];
  const colorMap: ColorMap = {
    'red': '#EE334E',
    'yellow': '#FCB131',
    'blue': '#0081C8',
    'green': '#00A651'
  };

  const [ dimensions, setDimensions ] = useState<GridDimensions>({ rows: 1, cols: 1 });
  const [ tileSize, setTileSize ] = useState<number>(minTileSize);
  const [ hoveredTriangles, setHoveredTriangles ] = useState<Set<string>>(new Set());

  const [ tileAssignments, setTileAssignments ] = useState<TileType[][]>([]);

  useEffect(() => {
    function calculateGridSize(): void {
      const padding = 20;
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
      setTileAssignments(generateTileGrid(maxRows, maxCols));
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

  function generateGraph(dimensions: GridDimensions): Graph {
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

  const graph = generateGraph(dimensions);

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

  function colorGraphBacktracking(
    graph: Graph,
    fixedVertex: string,
    fixedColor: string
  ): ColorAssignments | null {
    const vertices = Object.keys(graph);
    const colorAssignments: ColorAssignments = {};

    // Assign the fixed vertex color
    colorAssignments[ fixedVertex ] = fixedColor;


    function backtrack(index: number): boolean {
      if (index === vertices.length) {
        return true; // All vertices are colored
      }

      const vertex = vertices[ index ];
      if (vertex === fixedVertex) {
        return backtrack(index + 1); // Skip fixed vertex
      }

      for (const color of shuffleArray(colors)) {
        if (isColorValid(vertex, color, graph, colorAssignments)) {
          colorAssignments[ vertex ] = color;
          if (backtrack(index + 1)) {
            return true; // Successful assignment
          }
          console.log('backtracing at index', index);
          delete colorAssignments[ vertex ]; // Backtrack
        }
      }

      return false; // No valid color found
    }

    return backtrack(0) ? colorAssignments : null;
  }

  // TODO implement backtracking
  function colorGraph(
    graph: Graph,
    fixedVertex: string,
    fixedColor: string
  ): ColorAssignments {
    const assignment = colorGraphBacktracking(graph, fixedVertex, fixedColor);
    if (!assignment) {
      console.error('No solution found');
    }
    return assignment || {};
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

  const handleRegionEnter = (vertex: string): void => {
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

  const handleRegionLeave = (vertex: string): void => {
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

  const rowIds = generateIdentifiers(dimensions.rows);
  const colIds = generateIdentifiers(dimensions.cols);

  const getColorAssignments = () => {
    const out: Record<string, string> = {};
    for (const tileKey of Object.keys(solution)) {
      out[ tileKey ] = colorMap[ solution[ tileKey ] ];
    }
    return out;
  };

  const renderTile = (tileType: TileType, regionId: string) => {
    const sharedProps = {
      colors: getColorAssignments(),
      onRegionEnter: handleRegionEnter,
      onRegionLeave: handleRegionLeave
    };
    switch (tileType) {
      case TileType.ST:
        return (
          <SingleTile
            {...sharedProps}
            tileSize={tileSize}
            key={regionId}
            regionID={regionId}
            colors={getTileColors(regionId)}
          />
        );
      case TileType.TL:
        return <TopLeft key={regionId} regionId={regionId} {...sharedProps} />;
      case TileType.TR:
        return <TopRight key={regionId} regionId={regionId} {...sharedProps} />;
      case TileType.BL:
        return <BottomLeft key={regionId} regionId={regionId} {...sharedProps} />;
      case TileType.BR:
        return <BottomRight key={regionId} regionId={regionId} {...sharedProps} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div
        className="grid gap-1 bg-white p-4 rounded-lg shadow-lg"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${dimensions.cols}, ${tileSize}px)`,
          gridTemplateRows: `repeat(${dimensions.rows}, ${tileSize}px)`,
          padding: '20px',
        }}
      >
        {Array.from({ length: dimensions.rows }, (_, rowIndex) => {
          const row = rowIds[ rowIndex ];
          return Array.from({ length: dimensions.cols }, (_, colIndex) => {
            const col = colIds[ colIndex ];
            const squareID = `${row}${col}`;
            return tileAssignments.length > 0 ? renderTile(tileAssignments[ rowIndex ][ colIndex ], squareID) : null;
          });
        }).flat()}
      </div>
    </div>
  );
};

export default ColoredTileGrid;