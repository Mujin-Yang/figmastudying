import { fabric } from 'fabric'; // v5
import { v4 as uuidv4 } from 'uuid';

import {
  CustomFabricObject,
  ElementDirection,
  ImageUpload,
  ModifyShape, StrokeType,
} from "@/types/type";

export const createRectangle = (pointer: PointerEvent) => {
  const rect = new fabric.Rect({
    left: pointer.x,
    top: pointer.y,
    width: 100,
    height: 100,
    fill: "#aabbcc",
  }) as CustomFabricObject<fabric.Rect>;
  rect.objectId = uuidv4();
  return rect;
};

export const createTriangle = (pointer: PointerEvent) => {
  const tri = new fabric.Triangle({
    left: pointer.x,
    top: pointer.y,
    width: 100,
    height: 100,
    fill: "#aabbcc",
  }) as CustomFabricObject<fabric.Triangle>;
  tri.objectId = uuidv4();
  return tri;
};

export const createCircle = (pointer: PointerEvent) => {
  return new fabric.Circle({
    left: pointer.x,
    top: pointer.y,
    radius: 100,
    fill: "#aabbcc",
    objectId: uuidv4(),
  } as any);
};

export const createLine = (pointer: PointerEvent) => {
  const line =  new fabric.Line(
    [pointer.x, pointer.y, pointer.x + 100, pointer.y + 100],
    {
      stroke: "#aabbcc",
      strokeWidth: 2,
    }
  ) as CustomFabricObject<fabric.Line>;
  line.objectId = uuidv4();
  return line;
};

export const createText = (pointer: PointerEvent, text: string) => {
  return new fabric.IText(text, {
    left: pointer.x,
    top: pointer.y,
    fill: "#aabbcc",
    fontFamily: "Helvetica",
    fontSize: 36,
    fontWeight: "400",
    objectId: uuidv4()
  } as fabric.ITextOptions);
};

export const createSpecificShape = (
  shapeType: string,
  pointer: PointerEvent
) => {
  switch (shapeType) {
    case "rectangle":
      return createRectangle(pointer);

    case "triangle":
      return createTriangle(pointer);

    case "circle":
      return createCircle(pointer);

    case "line":
      return createLine(pointer);

    case "text":
      return createText(pointer, "Tap to Type");

    default:
      return null;
  }
};

export const handleImageUpload = ({
  file,
  canvas,
  shapeRef,
  syncShapeInStorage,
}: ImageUpload) => {
  const reader = new FileReader();

  reader.onload = () => {
    fabric.Image.fromURL(reader.result as string, (img) => {
      img.scaleToWidth(200);
      img.scaleToHeight(200);

      canvas.current.add(img);

      // @ts-ignore
      img.objectId = uuidv4();

      shapeRef.current = img;

      syncShapeInStorage(img);
      canvas.current.requestRenderAll();
    });
  };

  reader.readAsDataURL(file);
};

export const createShape = (
  canvas: fabric.Canvas,
  pointer: PointerEvent,
  shapeType: string
) => {
  if (shapeType === "freeform") {
    canvas.isDrawingMode = true;
    return null;
  }

  return createSpecificShape(shapeType, pointer);
};

export const modifyShape = ({
  canvas,
  property,
  value,
  activeObjectRef,
  syncShapeInStorage,
}: ModifyShape) => {
  const selectedElement = canvas.getActiveObject();

  if (!selectedElement || selectedElement?.type === "activeSelection") return;

  // if  property is width or height, set the scale of the selected element
  if (property === "width") {
    selectedElement.set("scaleX", 1);
    selectedElement.set("width", value);  
  } else if (property === "height") {
    selectedElement.set("scaleY", 1);
    selectedElement.set("height", value);
  } else if (property === "opacity") {
    selectedElement.set("opacity", value / 100);
  } else if (property === "strokeOpacity") {
    const currentStroke:StrokeType = selectedElement.get("stroke"); // 获取当前边框颜色
  if (!currentStroke) {
    console.warn("No stroke color found, setting default.");
    selectedElement.set("stroke", `rgba(0, 0, 0, ${value / 100})`);
  } else if (currentStroke.startsWith("rgba")) {
    // Parse rgba and update opacity
    const [r, g, b] = currentStroke
      .replace(/rgba?\((.*?)\)/, "$1")
      .split(",")
      .slice(0, 3)
      .map(Number);
    selectedElement.set("stroke", `rgba(${r}, ${g}, ${b}, ${value / 100})`);
  } else if (currentStroke.startsWith("rgb")) {
    // Convert rgb to rgba
    const [r, g, b] = currentStroke
      .replace(/rgb\((.*?)\)/, "$1")
      .split(",")
      .map(Number);
    selectedElement.set("stroke", `rgba(${r}, ${g}, ${b}, ${value / 100})`);
  } else if (currentStroke.startsWith("#")) {
    // Convert hex to rgba
    const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
      const bigint = parseInt(hex.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return { r, g, b };
    };
    const { r, g, b } = hexToRgb(currentStroke);
    selectedElement.set("stroke", `rgba(${r}, ${g}, ${b}, ${value / 100})`);
  } else {
    console.warn("Unsupported stroke format, setting default color.");
    selectedElement.set("stroke", `rgba(0, 0, 0, ${value / 100})`);
  }} else {
    if (selectedElement[property as keyof object] === value) return;
    selectedElement.set(property as keyof object, value);
    //对于其他属性：
    // 如果当前属性的值已经等于传入的值，直接返回，避免不必要的更新。
  }

  // set selectedElement to activeObjectRef
  activeObjectRef.current = selectedElement;

  syncShapeInStorage(selectedElement);
};

export const bringElement = ({
  canvas,
  direction,
  syncShapeInStorage,
}: ElementDirection) => {
  if (!canvas) return;

  // get the selected element. If there is no selected element or there are more than one selected element, return
  const selectedElement = canvas.getActiveObject();

  if (!selectedElement || selectedElement?.type === "activeSelection") return;

  // bring the selected element to the front
  if (direction === "front") {
    canvas.bringToFront(selectedElement);
  } else if (direction === "back") {
    canvas.sendToBack(selectedElement);
  }

  // canvas.renderAll();
  syncShapeInStorage(selectedElement);

  // re-render all objects on the canvas
};