import { Label } from "../ui/label";
import {useRef} from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {strokeWidthOptions} from "@/constants";

const strokeWidthConfig = [
  { property: "strokeWidth", placeholder: "30", options: strokeWidthOptions },
];


type Props = {
  inputRef: any;
  attribute: string;
  placeholder: string;
  strokeOpacity:number;
  strokeWidth:string;
  attributeType: string;
  handleInputChange: (property: string, value: string | number) => void;
  isEditingRef: React.MutableRefObject<boolean>;
};

const StrokeColor = ({
  inputRef,
  attribute,
  placeholder,
  strokeWidth,
  strokeOpacity,
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

    const newOpacity = Math.min(100, Math.max(0, strokeOpacity + deltaX / 2)); // 限制范围并调节步进
    handleInputChange("strokeOpacity", newOpacity); // 更新透明度到 0-1 范围
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
         {`${Math.round(strokeOpacity)}%`}
      </Label>

    </div>
    <div  className='flex flex-col gap-3' onBlur={() => (isEditingRef.current = false)}>
        {RenderSelect({
          config: strokeWidthConfig[0],
          strokeWidth,
          handleInputChange,
        })}
    </div>
  </div>
)
};


type Props_Select = {
  config: {
    property: string;
    placeholder: string;
    options: { label: string; value: string }[];
  };
  strokeWidth:string
  handleInputChange: (property: string, value: string | number) => void;
};

const RenderSelect = ({
  config,
  strokeWidth,
  handleInputChange,
}: Props_Select) => (
  <Select
    key={config.property}
    onValueChange={(value:string) => {
      const numericValue = parseFloat(value); // 转换为 number 类型
      handleInputChange(config.property, numericValue);}} // 确保传入的是数字类型}
    value={strokeWidth}
  >
    <SelectTrigger className='no-ring w-full rounded-sm border border-primary-grey-200'>
      <SelectValue placeholder="StrokeWidth" />
      {/*<SelectValue> 的 placeholder 属性仅在 value 属性为空时会显示。当前组件中，value={strokeWidth.toString()} 绑定了值，所以即使没有选择有效选项，也不会触发 placeholder 的显示。*/}
    </SelectTrigger>
    <SelectContent className='border-primary-grey-200 bg-primary-black text-primary-grey-300'>
      {config.options.map((option) => (
        <SelectItem
          key={option.value}
          value={option.value}
          className=' hover:bg-primary-green hover:text-primary-black'
        >
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default StrokeColor;

