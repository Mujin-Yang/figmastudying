function CursorSVG({ color }: { color: string }) {
  return (
    <svg
      className="relative"
      width="24"
      height="36"
      viewBox="0 0 24 36"
      fill="none"
      stroke="white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
        fill={color}
      />
    </svg>
  );
}

{/*path 定义了光标的形状路径，使用 d 属性表示路径的点和指令。*/}
{/*d 属性值（"M5.65376 ... 12.3673H5.65376Z"）是一系列指令，用于绘制光标形状：*/}
{/*M：移动到指定点，M5.65376 12.3673 表示起始点的坐标。*/}
{/*L：画直线到指定点，例如 L0.500002 16.8829。*/}
{/*H：水平线到指定 x 坐标，例如 H5.46026。*/}
{/*Z：闭合路径。*/}
{/*路径的形状表现为一个光标箭头。*/}

export default CursorSVG;
