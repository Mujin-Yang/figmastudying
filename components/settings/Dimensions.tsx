import { Label } from "../ui/label";
import { Input } from "../ui/input";

const dimensionsOptions = [
  { label: "W", property: "width" },
  { label: "H", property: "height" },
];

type Props = {
  width: string;
  height: string;
  isEditingRef: React.MutableRefObject<boolean>;
  handleInputChange: (property: string, value: string) => void;
};

const  Dimensions = ({ width, height, isEditingRef, handleInputChange }: Props) => (
  <section className='flex flex-col border-b border-primary-grey-200'>
    <div className='flex flex-col gap-4 px-6 py-3'>
      {dimensionsOptions.map((item) => (
        <div
          key={item.label}
          className='flex flex-1 items-center gap-3 rounded-sm'
        >
          <Label htmlFor={item.property} className='text-[10px] font-bold'>
              {/*为什么要用 htmlFor
用户体验：

当用户点击 <label> 的文字时，焦点会自动移动到对应的表单控件（例如输入框）。
提高了操作的便捷性，特别是对于小屏设备或需要更精准操作的场景。
*/}
            {item.label}
          </Label>
          <Input
            type='number'
            //可以选择不同 type
            id={item.property}
            placeholder='100'
            value={item.property === "width" ? width : height}
            className='input-ring'
            min={10}
            onChange={(e) => handleInputChange(item.property, e.target.value)}
            onBlur={() => (isEditingRef.current = false)}
            //onblur 是点选到框外，失焦的时候产生的
          />
        </div>
      ))}
    </div>
  </section>
);

export default Dimensions;
