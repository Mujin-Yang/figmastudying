"use client";

import { useEffect, useState } from "react";
import * as Portal from "@radix-ui/react-portal";

const DEFAULT_CURSOR_POSITION = -10000;

// display a custom cursor when placing a new thread
const NewThreadCursor = ({ display }: { display: boolean }) => {
  const [coords, setCoords] = useState({
    x: DEFAULT_CURSOR_POSITION,
    y: DEFAULT_CURSOR_POSITION,
  });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      // get canvas element
      const canvas = document.getElementById("canvas");

      if (canvas) {
        /**
         * getBoundingClientRect returns the size of an element and its position relative to the viewport
         *
         * getBoundingClientRect: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
         */
        const canvasRect = canvas.getBoundingClientRect();

        // check if the mouse is outside the canvas
        // if so, hide the custom comment cursor
        if (
          e.clientX < canvasRect.left ||
          e.clientX > canvasRect.right ||
          e.clientY < canvasRect.top ||
          e.clientY > canvasRect.bottom
        ) {
          setCoords({
            x: DEFAULT_CURSOR_POSITION,
            y: DEFAULT_CURSOR_POSITION,
          });
          //隐藏自定义光标到屏幕外
          return;
        }
      }

      // set the coordinates of the cursor
      setCoords({
        x: e.clientX,
        y: e.clientY,
      });
    };
    //检查鼠标是否位于 canvas 范围内。
    // 如果鼠标离开 canvas 区域，将光标重置到默认位置（隐藏）。
    // 如果鼠标在 canvas 内，更新自定义光标的位置。

    document.addEventListener("mousemove", updatePosition, false);
    document.addEventListener("mouseenter", updatePosition, false);

    return () => {
      document.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("mouseenter", updatePosition);
    };
  }, []);

  useEffect(() => {
    if (display) {
      document.documentElement.classList.add("hide-cursor");
    } else {
      document.documentElement.classList.remove("hide-cursor");
    }
  }, [display]);
  //document.documentElement 代表整个 HTML 文档的根元素，即 <html> 标签。
  // classList.add("hide-cursor") 会将一个 CSS 类（hide-cursor）添加到 <html> 标签中，从而可能通过 CSS 隐藏系统的鼠标光标。

  if (!display) {
    return null;
  }
  //组件接收一个名为 display 的布尔参数来控制自定义光标是否显示。
  //当 display 为 true 时，光标会显示为自定义的样式；当 display 为 false 时，光标会隐藏（return null）。


//该 div 是用来取代系统默认光标的视觉表示。
// 当用户进入特定区域（如画布）时，系统光标会被隐藏，取而代之的是该 div。
  return (
    // Portal.Root is used to render a component outside its parent component
    <Portal.Root>
      {/*在这段代码中，div 的作用是定义和渲染自定义光标的外观和行为。以下是它的具体作用和功能：*/}
      <div
        className="pointer-events-none fixed left-0 top-0 h-9 w-9 cursor-grab select-none rounded-bl-full rounded-br-full rounded-tl-md rounded-tr-full bg-white shadow-2xl"
        style={{
          transform: `translate(${coords.x}px, ${coords.y}px)`,
        }}
      />
{/*      pointer-events-none：确保该 div 不会拦截鼠标事件（例如点击或拖拽），鼠标事件可以穿过这个 div 作用到页面上的其他元素。*/}
{/*fixed：让这个 div 的位置相对于视口固定，而不是受其他父元素的布局影响。*/}
{/*left-0 top-0：设置起始参考点为页面的左上角。*/}
{/*h-9 w-9：定义自定义光标的高度和宽度（9 单位）。*/}
{/*cursor-grab：在支持自定义光标的场景下，为 div 添加类似抓取手势的样式。*/}
{/*select-none：防止用户选中文本内容。*/}
{/*rounded-*: 定义了圆角样式，让光标外观更加平滑圆润。*/}
{/*bg-white 和 shadow-2xl：定义了光标的背景色和阴影效果。*/}
{/*行内样式的作用：*/}

{/*transform: translate(${coords.x}px, ${coords.y}px)：*/}
{/*动态设置 div 的位置，使其跟随鼠标移动。*/}
{/*通过 coords 提供的 x 和 y 值，将光标的位置调整到鼠标所在的坐标。*/}
    </Portal.Root>
  );
};

export default NewThreadCursor;
