import { Svg, Line, Path, Circle, G } from 'react-native-svg';

const Chart = () => (
  <Svg width="100%" height="100%">
    <Line x1="10%" y1="90%" x2="90%" y2="90%" stroke="gray" />
    <Line x1="10%" y1="90%" x2="10%" y2="10%" stroke="gray" />
    
    <Path
      d="M10% 90% L30% 70% L50% 50% ..."
      stroke="#7B5CB8"
      strokeWidth={2}
      fill="none"
    />
    
    <Circle cx="30%" cy="70%" r="4" fill="#7B5CB8" />
  </Svg>
);

export default Chart;