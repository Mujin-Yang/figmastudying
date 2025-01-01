import { Label } from "../ui/label";
import {useRef} from "react";

type Props = {
  inputRef: any;
  attribute: string;
  placeholder: string;
  opacity:number;
  attributeType: string;
  handleInputChange: (property: string, value: string | number) => void;
  isEditingRef: React.MutableRefObject<boolean>;
};

const Color = ({
  inputRef,
  attribute,
  placeholder,
  opacity,
  attributeType,
  handleInputChange,
  isEditingRef,
}: Props) =>
{
  const startX = useRef(0); // 记录鼠标按下的起始 X 坐标

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isEditingRef.current = true;
    startX.current = e.clientX;
    // 设置鼠标样式为 <->（水平调整）
    document.body.style.cursor = "ew-resize";
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditingRef.current) return;

    const deltaX = e.clientX - startX.current; // 计算拖动的距离
    startX.current = e.clientX;

    const newOpacity = Math.min(100, Math.max(0, opacity + deltaX / 2)); // 限制范围并调节步进
    handleInputChange("opacity", newOpacity); // 更新透明度到 0-1 范围
  };

  const handleMouseUp = () => {
    isEditingRef.current = false;
    // 恢复默认鼠标样式
    document.body.style.cursor = "default";
  };

return (
  <div className='flex flex-col gap-3 border-b border-primary-grey-200 p-5'
       onMouseMove={handleMouseMove}
       onMouseUp={handleMouseUp}
       onMouseLeave={handleMouseUp} // 防止鼠标移出区域时仍触发拖动
   >
    <h3 className='text-[10px] uppercase'>{placeholder}</h3>
    <div
        className='flex items-center gap-2 border border-primary-grey-200'
    >
      <input
          type='color'
          //这是 html 5 自带的
          value={attribute}
          ref={inputRef}
          onClick={() => inputRef.current.click()}
          onChange={(e) => handleInputChange(attributeType, e.target.value)}
          onBlur={() => (isEditingRef.current = false)}
      />
      <Label className='flex-1' onClick={() => inputRef.current.click()} style={{ cursor: "pointer" }}>{attribute}</Label>

      <Label
          className='flex h-6 w-8 items-center justify-center bg-primary-grey-100 text-[10px] leading-3'
          onMouseDown={(e: React.MouseEvent<HTMLLabelElement>) => handleMouseDown(e as unknown as React.MouseEvent<HTMLDivElement>)}
          style={{ userSelect: "none" ,cursor: "ew-resize",}}
      >
        {`${Math.round(opacity)}%`}
      </Label>
      {/*Label组件不直接支持开箱即用的key 、 value或onMouseDown属性，因为它不是表单控件，而是样式化的容器元素。但是，您可以通过传递附加属性或自定义其实现来扩展其行为。*/}
    </div>
  </div>
)
};

export default Color;
