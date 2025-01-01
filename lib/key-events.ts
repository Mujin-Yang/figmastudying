import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";

import { CustomFabricObject } from "@/types/type";

export const handleCopy = (canvas: fabric.Canvas) => {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length > 0) {
    // Serialize the selected objects
    const serializedObjects = activeObjects.map((obj) => obj.toObject());
    // Store the serialized objects in the clipboard
    localStorage.setItem("clipboard", JSON.stringify(serializedObjects));
    //setItem 并不会自动释放内存，它的机制是覆盖存储，导致每次调用 setItem 时，都会用新的数据替换掉旧的数据。因此，localStorage 中始终只保留最新一次写入的数据。
  }

  return activeObjects;
};

export const handlePaste = (
  canvas: fabric.Canvas,
  syncShapeInStorage: (shape: fabric.Object) => void
) => {
  if (!canvas || !(canvas instanceof fabric.Canvas)) {
    console.error("Invalid canvas object. Aborting paste operation.");
    return;
  }

  // Retrieve serialized objects from the clipboard
  const clipboardData = localStorage.getItem("clipboard");

  if (clipboardData) {
    try {
      const parsedObjects = JSON.parse(clipboardData);
      console.log("clipboardData", clipboardData);
      console.log("parsedObjects:", parsedObjects);
      parsedObjects.forEach((objData: fabric.Object) => {
        // convert the plain javascript objects retrieved from localStorage into fabricjs objects (deserialization)
        fabric.util.enlivenObjects(
          [objData],
          //回调函数中的 enlivenedObjects：
            //
            // 该回调会接收到一个包含两个 Fabric.js 对象的数组，即便您的数据是两个对象，这些对象会被转化为 Fabric.js 对象，并以数组的形式传递给您。
            // 第二次 forEach：
            //
            // 这个第二个 forEach 遍历 enlivenedObjects 数组，并对每个对象做设置（例如设置位置、颜色等），然后将它们添加到画布上。
          (enlivenedObjects: fabric.Object[]) => {
            enlivenedObjects.forEach((enlivenedObj) => {
              //两次 foreach 的原因
              //第一次 forEach 遍历普通对象，它们需要被传递给 fabric.util.enlivenObjects 来异步转换为 Fabric.js 对象。
              // 第二次 forEach 是在 fabric.util.enlivenObjects 的回调中执行的，只有当对象已经转化为 Fabric.js 对象后，才能执行对这些对象的操作。
              // 嵌套关系是因为 fabric.util.enlivenObjects 是异步操作，所以需要等待它完成后，才能在回调中对转化后的对象进行操作。
              // Offset the pasted objects to avoid overlap with existing objects
              enlivenedObj.set({
                left: (enlivenedObj.left || 0) + 20,
                top: (enlivenedObj.top || 0) + 20,
                objectId: uuidv4(),
                fill: "#aabbcc",
              } as CustomFabricObject<any>);

              canvas.add(enlivenedObj);
              syncShapeInStorage(enlivenedObj);
            });
            canvas.renderAll();
          },
          "fabric"
        );
      });
    } catch (error) {
      console.error("Error parsing clipboard data:", error);
    }
  }
};

export const handleDelete = (
  canvas: fabric.Canvas,
  deleteShapeFromStorage: (id: string) => void
) => {
  const activeObjects = canvas.getActiveObjects();
  if (!activeObjects || activeObjects.length === 0) return;

  if (activeObjects.length > 0) {
    activeObjects.forEach((obj: CustomFabricObject<any>) => {
      if (!obj.objectId) return;
      canvas.remove(obj);
      deleteShapeFromStorage(obj.objectId);
    });
  }

  canvas.discardActiveObject();
  canvas.requestRenderAll();
};

// create a handleKeyDown function that listen to different keydown events
export const handleKeyDown = ({
  e,
  canvas,
  undo,
  redo,
  syncShapeInStorage,
  deleteShapeFromStorage,
}: {
  e: KeyboardEvent;
  canvas: fabric.Canvas | any;
  undo: () => void;
  redo: () => void;
  syncShapeInStorage: (shape: fabric.Object) => void;
  deleteShapeFromStorage: (id: string) => void;
}) => {
  // Check if the key pressed is ctrl/cmd + c (copy)
      console.log("2313")
  if ((e?.ctrlKey || e?.metaKey) && e.key === "c") {
    handleCopy(canvas);
    console.log("111112312313")
  }

  // Check if the key pressed is ctrl/cmd + v (paste)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 86) {
    handlePaste(canvas, syncShapeInStorage);
  }
//e?.ctrlKey：检查用户是否按下了 Ctrl 键。ctrlKey 是一个布尔值，表示用户是否按下了 Ctrl 键。
// e?.metaKey：检查用户是否按下了 Meta 键（在 macOS 上是 Command 键，在 Windows 上通常是 Windows 键）。metaKey 也是一个布尔值，表示用户是否按下了 Meta 键。
  // Check if the key pressed is delete/backspace (delete)
  // if (e.keyCode === 8 || e.keyCode === 46) {
  //   handleDelete(canvas, deleteShapeFromStorage);
  // }

  // check if the key pressed is ctrl/cmd + x (cut)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 88) {
    handleCopy(canvas);
    handleDelete(canvas, deleteShapeFromStorage);
  }

  // check if the key pressed is ctrl/cmd + z (undo)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 90) {
    undo();
  }

  // check if the key pressed is ctrl/cmd + y (redo)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 89) {
    redo();
  }

  if (e.keyCode === 191 && !e.shiftKey) {
    e.preventDefault();
  }
};
