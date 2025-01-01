"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import { ThreadData } from "@liveblocks/client";
import { useMaxZIndex } from "@/lib/useMaxZIndex";
import { PinnedThread } from "./PinnedThread";
import { useThreads } from "@liveblocks/react/suspense";
import { useUser, useEditThreadMetadata } from "@liveblocks/react";

type ThreadMetadata = {
  resolved: boolean;
  zIndex: number;
  time?: number;
  x: number;
  y: number;
};

type OverlayThreadProps = {
  thread: ThreadData<ThreadMetadata>;
  maxZIndex: number;
  setSelectedThread: (thread: ThreadData<ThreadMetadata> | null) => void;
  lastPointerEvent: React.MutableRefObject<PointerEvent | null>;
  isDraggingRef: React.MutableRefObject<boolean>;
};

export const CommentsOverlay = () => {
  const { threads } = useThreads();
  const maxZIndex = useMaxZIndex();
  const [selectedThread, setSelectedThread] = useState<ThreadData<ThreadMetadata> | null>(null); // 当前选中线程
  const lastPointerEvent = useRef<PointerEvent | null>(null); // 用于记录最后的鼠标事件
  const editThreadMetadata = useEditThreadMetadata();
  const isDraggingRef = useRef(false);

  // 添加全局监听器以捕获拖拽操作
  useEffect(() => {
       // 获取 canvas 的边界
    const canvas = document.getElementById("canvas");

    if (!selectedThread ) return;

    // 本地状态来跟踪当前拖动位置
  let currentX = selectedThread.metadata.x;
  let currentY = selectedThread.metadata.y;

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDraggingRef.current || !lastPointerEvent.current) return;

    // 计算增量
    const deltaX = e.clientX - lastPointerEvent.current.clientX;
    const deltaY = e.clientY - lastPointerEvent.current.clientY;

    // 更新当前位置
    currentX += deltaX;
    currentY += deltaY;

      if (canvas) {
        const canvasRect = canvas.getBoundingClientRect();

        // 限制拖拽位置在 Canvas 边界内
        currentX = Math.max(0, Math.min(currentX, canvasRect.width - 50)); // 50 是线程宽度的假定值
        currentY = Math.max(0, Math.min(currentY, canvasRect.height - 50));
      }

    // 更新样式
    const threadElement = document.getElementById(`thread-${selectedThread.id}`);
    if (threadElement) {
      threadElement.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }

    // 更新最后位置
    lastPointerEvent.current = e;
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;

    // 同步最终位置到全局状态
    editThreadMetadata({
      threadId: selectedThread.id,
      metadata: {
        x: currentX,
        y: currentY,
      },
    });

    // 清除选中线程
    setSelectedThread(null);
  };

  document.documentElement.addEventListener("pointermove", handlePointerMove);
  document.documentElement.addEventListener("pointerup", handlePointerUp);

  return () => {
    document.documentElement.removeEventListener("pointermove", handlePointerMove);
    document.documentElement.removeEventListener("pointerup", handlePointerUp);
  };
}, [selectedThread, editThreadMetadata]);

  return (
    <div>
      {threads
        .filter((thread) => !thread.resolved)
        .map((thread) => (
          <OverlayThread key={thread.id} isDraggingRef={isDraggingRef} thread={thread} maxZIndex={maxZIndex} setSelectedThread={setSelectedThread} lastPointerEvent={lastPointerEvent} />
        ))}
    </div>
  );
};

const OverlayThread = ({ isDraggingRef,thread, maxZIndex,setSelectedThread,lastPointerEvent }: OverlayThreadProps) => {
  const editThreadMetadata = useEditThreadMetadata();
  const { isLoading } = useUser(thread.comments[0].userId);
  const threadRef = useRef<HTMLDivElement>(null);

//将事件绑定到特定的 OverlayThread 上，可以避免不必要的全局监听。
// 只有用户点击某个线程时，才会触发 handlePointerDown。
// 如果全局监听，那么每次点击页面的任意位置都会触发逻辑，即使与线程无关，也会执行判断逻辑，可能影响性能。


  // 聚焦线程时更新 zIndex
  const handleFocusThread = useCallback(() => {
    console.log(`thread with id: ${thread.id}`, '当前 thread zIndex:', thread.metadata.zIndex, '当前 maxZIndex:', maxZIndex);

    // 如果当前线程已经是最顶层 zIndex，不执行更新
    if (thread.metadata.zIndex === maxZIndex) {
      console.log('已经是最高层级，无需更新');
      return;
    }
    //检查当前线程是否已在最顶层（zIndex 为 maxZIndex + 1），避免不必要的更新。

    // 更新线程的 zIndex，确保其位于最顶层
    editThreadMetadata({
      threadId: thread.id,
      metadata: {
        zIndex: maxZIndex + 1,
      },
    });
    console.log('更新 zIndex 为:', maxZIndex + 1);
  }, [thread.id, thread.metadata.zIndex, maxZIndex, editThreadMetadata]);

    // **新增的 handlePointerDown 方法**
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      isDraggingRef.current = true; // 开启拖拽
      setSelectedThread(thread);
      lastPointerEvent.current = e.nativeEvent; // 记录鼠标事件
      handleFocusThread(); // 处理聚焦线程的逻辑
    },
    [thread, setSelectedThread, handleFocusThread, isDraggingRef.current, lastPointerEvent.current]
  );


  if (isLoading) {
   return <div>Loading...</div>;
  }

  return (
    <div
      ref={threadRef}
      id={`thread-${thread.id}`}
      className="absolute left-0 top-0 flex gap-5"
      style={{
        transform: `translate(${thread.metadata.x}px, ${thread.metadata.y}px)`,
        zIndex: thread.metadata.zIndex, // 动态设置 zIndex
      }}
      onMouseDown={handlePointerDown}
    >
      <PinnedThread thread={thread} action={handleFocusThread} isDraggingRef={isDraggingRef} />
    </div>
  );
};

//是否重复: 如果同时使用 onClick 和 onMouseDown/onMouseUp，确实可能导致重复行为，尤其是在 onClick 内部和其他事件中触发了相同逻辑。
//
// 建议: 如果你的交互逻辑需要捕获拖拽等复杂操作，优先使用 onMouseDown 和 onMouseUp。可以移除 onClick，避免逻辑重复。