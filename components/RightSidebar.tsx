import React, {useRef} from "react";
import Export from "@/components/settings/Export";
import Color from "@/components/settings/Color";
import Dimensions from "@/components/settings/Dimensions";
import Text from "@/components/settings/Text";
import {RightSidebarProps} from "@/types/type";
import {modifyShape} from "@/lib/shapes";
import {fabric} from "fabric";
import StrokeColor from "@/components/settings/StrokeColor";

const  RightSidebar = ({
    elementAttributes,
    setElementAttributes,
    fabricRef,
    isEditingRef,
    activeObjectRef,
    syncShapeInStorage}: RightSidebarProps) =>   {

    const colorInputRef = useRef(null);
    const strokeInputRef = useRef(null);

    const handleInputChange = (property: string, value: string | number) => {
        if(!isEditingRef.current) isEditingRef.current = true;
        //(property === "strokeWidth") ? setElementAttributes((prev)=>({...prev, [property]: value.toString()})) : setElementAttributes((prev)=>({...prev, [property]: value}))
        if (property === "strokeWidth") {
    setElementAttributes((prev) => ({ ...prev, [property]: value.toString() }));
} else {
    setElementAttributes((prev) => ({ ...prev, [property]: value }));
}
        //只改变需要改变的值
        modifyShape({
            canvas: fabricRef.current as fabric.Canvas,
            property,
            value,
            activeObjectRef,
            syncShapeInStorage
        })
    }

    return (
        <section className="flex flex-col border-t border-primary-grey-200 bg-primary-black text-primary-grey-300
        min-2-[227px] sticky right-0 h-full max-sm:hidden select-none">
            <h3 className="px-5 pt-4 text-xs uppercase">Design</h3>
            <span className="text-xs text-primary-grey-300 mt-3 px-5 border-b border-primary-grey-200 pb-4">Make changes to canvas as you like.</span>
            <Dimensions
                width={elementAttributes?.width}
                height={elementAttributes?.height}
                handleInputChange={handleInputChange}
                isEditingRef={isEditingRef}
            />
            <Text
                fontFamily={elementAttributes?.fontFamily}
                fontSize={elementAttributes?.fontSize}
                fontWeight={elementAttributes?.fontWeight}
                handleInputChange={handleInputChange}
                isEditingRef={isEditingRef}
            />
            <Color
                inputRef={colorInputRef}
                attribute={elementAttributes?.fill}
                opacity={elementAttributes?.opacity}
                attributeType='fill'
                placeholder="color"
                handleInputChange={handleInputChange}
                isEditingRef={isEditingRef}
            />
            <StrokeColor
                inputRef={strokeInputRef}
                attribute={elementAttributes?.stroke}
                strokeWidth={elementAttributes?.strokeWidth}
                strokeOpacity={elementAttributes?.strokeOpacity}
                attributeType='stroke'
                placeholder="stroke"
                handleInputChange={handleInputChange}
                isEditingRef={isEditingRef}
            />
            <Export/>
        </section>
    )
}

export default RightSidebar;