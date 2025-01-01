'use client'

import { fabric } from "fabric";
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import {useEffect, useRef, useState} from "react";
import {ActiveElement, Attributes} from "@/types/type";
import {
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasObjectModified,
    handleCanvasObjectScaling,
    handleCanvasSelectionCreated, handlePathCreated,
    handleResize,
    initializeFabric,
    renderCanvas
} from "@/lib/canvas";
import {useMutation, useRedo, useStorage, useUndo} from "@liveblocks/react";
import {defaultNavElement} from "@/constants";
import {handleDelete, handleKeyDown} from "@/lib/key-events";
import {handleImageUpload} from "@/lib/shapes";

export default function Page() {
    //redo and undo
    const redo = useRedo();
    const undo = useUndo();


        //liveblocks storage
    const canvasObjects = useStorage((root) => root.canvasObjects);
    //initialStorage 的初始化： 你在 RoomProvider 的 initialStorage 中已经将 canvasObjects 初始化为 new LiveMap()。按理来说，canvasObjects 不应该是 null。
    //
    // useStorage 的数据订阅： useStorage((root) => root.canvasObjects) 会订阅 canvasObjects，但在同步数据到存储前，可能会存在短暂的延迟，导致 canvasObjects 为 undefined。
    //所以放在最开始

    const canvasRef = useRef<HTMLCanvasElement>(null);
    //canvasRef 是 用于初始化 fabricRef 的
    const fabricRef = useRef<fabric.Canvas | null>(null);
    //fabricRef 是对 fabric.Canvas 对象的引用，但函数 handleResize 需要实际的 fabric.Canvas 实例本身（而不是引用）。
    const isDrawing = useRef(false);
    //useState：当状态变化需要反映在 UI 上时使用。
    // useRef：当状态变化不需要触发渲染、且需要跨渲染周期持久存储时使用。
    //在鼠标拖动绘制场景下，useRef 是更好的选择。
    const shapeRef = useRef<fabric.Object | null>(null);
    const selectedShapeRef = useRef<string | null>(null);
    const activeObjectRef = useRef<fabric.Object | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    //在考虑右边栏的时候需要用 isediting
    const isEditingRef = useRef(false);
    const [elementAttributes, setElementAttributes] = useState<Attributes>({
        width: '',
        height: '',
        fontSize: '',
        fontFamily: '',
        fontWeight: '',
        fill:'#aabbcc',
        stroke:'#aabbcc',
        opacity:100,
        strokeWidth:'',
        strokeOpacity:100,
    })

    //如何把创建的这些东西同步给其他人，协作？

    const syncShapeInStorage = useMutation(({ storage },object) => {
        if(!object) return;
        const {objectId} = object;
        const shapeData = object.toJSON();
        shapeData.objectId = objectId;
        const canvasObjects = storage.get('canvasObjects');
        canvasObjects.set(objectId, shapeData)
    },[]);

    const [activeElement, setActiveElement] = useState<ActiveElement>({
        name:'',
        value:'',
        icon:'',
    })
    //这是要追踪我们现在点击的是哪一个工具，哪一个是处于激活状态
    //有了 activeElement 后还需要 counterpart 部分 handleactiveElement
    //让我们可以选择不同的 element
    const handleActiveElement = (elem:ActiveElement) => {
        setActiveElement(elem);
        switch (elem?.value) {
            case 'reset':
                deleteALLShapes();
                fabricRef.current?.clear();
                setActiveElement(defaultNavElement);
                break;

            case 'delete':
                handleDelete(fabricRef.current as any, deleteShapeFromStorage)
                setActiveElement(defaultNavElement);
                break;

            case 'image':
                imageInputRef.current?.click();
                isDrawing.current = false;
                if (fabricRef.current) {
                    fabricRef.current.isDrawingMode=false;
                }

                break;
        }
        selectedShapeRef.current = elem?.value as string;
    }

    const deleteALLShapes = useMutation(({ storage }) => {
        const canvasObjects = storage.get('canvasObjects');
        if (!canvasObjects || canvasObjects.size === 0) return true;
        for (const [key] of canvasObjects.entries()){
            canvasObjects.delete(key)
        }
        return canvasObjects.size === 0;
    },[])

    const deleteShapeFromStorage = useMutation(({ storage },objectId) => {
        const canvasObjects = storage.get('canvasObjects');
        canvasObjects.delete(objectId);
    },[])

//在 Liveblocks 的 LiveMap 中，forEach 方法并不一定可用，或者不具备原生 Map 的行为。
// 由于 LiveMap 是自定义对象，Liveblocks 推荐使用 for...of 循环与 entries() 来遍历内容。


    useEffect(() => {
        console.log("开始")
        const canvas = initializeFabric({canvasRef,fabricRef})
        //作用：监听用户的鼠标按下事件。
        // 必要性：实现绘图逻辑，当用户按下鼠标时触发 handleCanvasMouseDown 事件。

        //useEffect 的作用是在组件首次渲染时初始化画布，并将事件监听器绑定到画布对象。
        // 注册监听器后，canvas.on 监听的事件回调会在事件触发时执行，无需重新绑定。
        // 监听器的回调函数（例如 handleCanvasMouseDown）本质上是用户操作的逻辑处理器。

        canvas.on("mouse:down",(options)=>{
            handleCanvasMouseDown({
                options,
                canvas,
                isDrawing,
                shapeRef,
                selectedShapeRef
            })
        });
        canvas.on("mouse:move",(options)=>{
            handleCanvasMouseMove({
                options,
                canvas,
                isDrawing,
                shapeRef,
                selectedShapeRef,
                syncShapeInStorage
            });
        });
        canvas.on("mouse:up",()=>{
            handleCanvasMouseUp({
                canvas,
                isDrawing,
                shapeRef,
                selectedShapeRef,
                syncShapeInStorage,
                setActiveElement,
                activeObjectRef
            });
        });

        canvas.on("object:modified",(options)=>{
            handleCanvasObjectModified({
                options,
                syncShapeInStorage
            });
        });

        canvas.on("selection:created",(options)=>{
            //selection 是选中框，拉选
            handleCanvasSelectionCreated({
                options,
                isEditingRef,
                //方便知道用户是否在手动操作数值
                setElementAttributes,
                //选中某东西的时候，更新 setElement，传入参数
            });
        });

        canvas.on("object:scaling",(options)=>{
           handleCanvasObjectScaling({
               options,
               setElementAttributes,
           })
        });
        //window.addEventListener 是用于监听 全局窗口 级别的事件。你可以监听浏览器窗口上的各种事件，如 resize、scroll、keydown 等。
        // canvas.on 是用于监听 Fabric.js 画布 上的特定事件，如对象的修改、鼠标的点击和移动等，属于局部事件监听，只针对 canvas 对象发生的事件。
        //window.addEventListener 是原生 JavaScript API，用于监听原生 DOM 事件（如 click、resize、scroll 等）。
        // canvas.on 是 Fabric.js 库特有的事件系统，用于监听 canvas 上的 Fabric.js 事件（如 object:modified、mouse:down、mouse:move、mouse:up 等）。



        //此时自由绘图 path 还存在问题所以要加一个 listener
        canvas.on("path:created",(options)=>{
           handlePathCreated({options,syncShapeInStorage})
        });


        // 1. 定义事件处理函数（不要使用匿名函数）
    const handleResizeEvent = () => {
        handleResize({ canvas: fabricRef.current });
    };

    const handleKeyDownEvent = (e: KeyboardEvent) => {
        handleKeyDown({
            e,
            canvas: fabricRef.current as any,
            undo,
            redo,
            syncShapeInStorage,
            deleteShapeFromStorage,
        });
    };

    // 2. 使用这些命名函数添加事件监听器
    window.addEventListener("resize", handleResizeEvent);
    window.addEventListener("keydown", handleKeyDownEvent);

    return () => {
      canvas.dispose();
        // 使用同样的函数引用移除监听器
        window.removeEventListener("resize", handleResizeEvent);
        window.removeEventListener("keydown", handleKeyDownEvent);
    };
        //在前端开发中，当你删除一个元素或对象时，如果该元素存在与浏览器渲染、事件监听器、或者某个第三方库的引用，可能会导致 内存泄漏。
//一开始没有被正确移除，因为用了匿名函数
        //确保在 addEventListener 和 removeEventListener 中使用相同的函数引用，避免匿名函数，才能确保事件监听器的正确移除。在开发中，养成这种习惯有助于避免内存泄漏和性能问题。
    },[canvasRef])// run this effect only once when the component mounts and the canvasRef changes

    //在同步好之后，要重新 render 云端的画布

    useEffect(() => {
  if (canvasObjects) {
    renderCanvas({ fabricRef, canvasObjects, activeObjectRef });
  }
    }, [canvasObjects]);

    //. 确保 canvasObjects 的默认值是一个空 LiveMap
    // 在 RoomProvider 初始化 initialStorage 时，确保 canvasObjects 不为空：
    //
    // tsx
    // 复制代码
    // <RoomProvider
    //   id="my-room"
    //   initialStorage={{ canvasObjects: new LiveMap<string, any>() }} // 初始化为一个空 LiveMap
    //   initialPresence={{
    //     cursor: null,
    //     cursorColor: null,
    //     editingText: null,
    //   }}
    // >
    // 这样，useStorage 就能返回一个空的 LiveMap 而不是 null。

  return (
      <main className="h-screen overflow-hidden">
          <Navbar
              activeElement={activeElement}
              handleActiveElement={handleActiveElement}
              imageInputRef={imageInputRef}
              handleImageUpload={(e:any)=>{
                  e.stopPropagation();
                  handleImageUpload({
                      file: e.target.files[0],
                      canvas: fabricRef as any,
                      shapeRef,
                      syncShapeInStorage,
                  });
              }}
          />
          <section className="flex h-full flex-row">
          <LeftSidebar allShapes={canvasObjects ? Array.from(canvasObjects) : []}/>

          <Live canvasRef={canvasRef} undo={undo} redo={redo}/>

          <RightSidebar
              elementAttributes={elementAttributes}
              setElementAttributes={setElementAttributes}
              fabricRef={fabricRef}
              isEditingRef={isEditingRef}
              activeObjectRef={activeObjectRef}
              syncShapeInStorage={syncShapeInStorage}
          />
          </section>
      </main>
  );
}
