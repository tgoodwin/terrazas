interface TileColors {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

interface SingleTileProps {
  tileSize: number;
  squareID: string;
  colors: TileColors;
  enter: (region: string) => void;
  leave: (region: string) => void;
}

const SingleTile: React.FC<SingleTileProps> = ({ tileSize, squareID, colors, enter, leave }) => (
  <div style={{ width: `${tileSize}px`, height: `${tileSize}px` }}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M 0 0 L 50 50 L 100 0 Z"
        fill={colors.top}
        onMouseEnter={() => enter(`${squareID}-Top`)}
        onMouseLeave={() => leave(`${squareID}-Top`)}
        className="transition-colors duration-200"
      />
      <path
        d="M 100 0 L 50 50 L 100 100 Z"
        fill={colors.right}
        onMouseEnter={() => enter(`${squareID}-Right`)}
        onMouseLeave={() => leave(`${squareID}-Right`)}
        className="transition-colors duration-200"
      />
      <path
        d="M 100 100 L 50 50 L 0 100 Z"
        fill={colors.bottom}
        onMouseEnter={() => enter(`${squareID}-Bottom`)}
        onMouseLeave={() => leave(`${squareID}-Bottom`)}
        className="transition-colors duration-200"
      />
      <path
        d="M 0 100 L 50 50 L 0 0 Z"
        fill={colors.left}
        onMouseEnter={() => enter(`${squareID}-Left`)}
        onMouseLeave={() => leave(`${squareID}-Left`)}
        className="transition-colors duration-200"
      />
    </svg>
  </div>
);

export default SingleTile;