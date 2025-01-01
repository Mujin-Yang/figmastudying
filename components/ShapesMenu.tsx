"use client";

import Image from "next/image";

import { ShapesMenuProps } from "@/types/type";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";


const ShapesMenu = ({
  item,
  activeElement,
  handleActiveElement,
  handleImageUpload,
  imageInputRef,
}: ShapesMenuProps) => {
  const isDropdownElem = item.value.some((elem) => elem?.value === activeElement.value);
  //some() 是数组方法，用来测试数组中是否至少有一个元素满足指定的条件。
    // 如果找到满足条件的元素，some() 返回 true，否则返回 false

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="no-ring">
          <Button className="relative h-5 w-5 object-contain" onClick={() => handleActiveElement(item)}>
            <Image
              src={isDropdownElem ? activeElement.icon : item.icon}
              alt={item.name}
              fill
              className={isDropdownElem ? "invert" : ""}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="mt-5 flex flex-col gap-y-1 border-none bg-primary-black py-4 text-white">
          {item.value.map((elem) => (
            <Button
              key={elem?.name}
              onClick={() => {
                handleActiveElement(elem);
              }}
              className={`flex h-fit justify-between gap-10 rounded-none px-5 py-3 focus:border-none ${
                activeElement.value === elem?.value ? "bg-primary-green" : "hover:bg-primary-grey-200"
              }`}
            >
              <div className="group flex items-center gap-2">
                <Image
                  src={elem?.icon as string}
                  alt={elem?.name as string}
                  width={20}
                  height={20}
                  className={activeElement.value === elem?.value ? "invert" : ""}
                />
                <p
                  className={`text-sm  ${
                    activeElement.value === elem?.value ? "text-primary-black" : "text-white"
                  }`}
                >
                  {elem?.name}
                </p>
              </div>
            </Button>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        type="file"
        className="hidden"
        //是看不见的 input
        ref={imageInputRef}
        //ref 是 React 中的引用机制，允许你直接访问 DOM 元素。imageInputRef 是通过 useRef 钩子创建的一个引用对象，它会指向这个 <input> 元素。
          //一旦绑定，imageInputRef.current 就会指向这个 <input> 元素。
          // 你现在可以通过 imageInputRef.current 操控这个元素，就像直接操作原生 DOM 一样。
        accept="image/*"
        //accept 属性限制了文件选择框可以上传的文件类型。这里的 image/* 表示只允许选择图片文件，任何类型的图片（例如 .jpg、.png 等）。用户选择非图片文件时，会显示为无效选项。
        onChange={handleImageUpload}
      />
    </>
  );
};

export default ShapesMenu;
