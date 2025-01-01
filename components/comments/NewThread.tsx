"use client";

import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Slot } from "@radix-ui/react-slot";
import * as Portal from "@radix-ui/react-portal";
import { useMaxZIndex } from "@/lib/useMaxZIndex";

import PinnedComposer from "./PinnedComposer";
import NewThreadCursor from "./NewThreadCursor";
import {useCreateThread} from "@liveblocks/react/suspense";
import {ComposerSubmitComment} from "@liveblocks/react-ui";

type ComposerCoords = null | { x: number; y: number };

type Props = {
  children: ReactNode;
};

export const NewThread = ({ children }: Props) => {
  // set state to track if we're placing a new comment or not
  const [creatingCommentState, setCreatingCommentState] = useState<
    "placing" | "placed" | "complete"
  >("complete");

  /**
   * We're using the useCreateThread hook to create a new thread.
   *
   * useCreateThread: https://liveblocks.io/docs/api-reference/liveblocks-react#useCreateThread
   */
  const createThread = useCreateThread();

  // get the max z-index of a thread
  const maxZIndex = useMaxZIndex();
  //z-index 是一种 CSS 属性，用于控制 HTML 元素在 三维堆叠上下文（z 轴） 中的显示顺序。它定义了元素在屏幕上的“堆叠层级”，从而决定哪个元素会覆盖或遮挡其他元素。
  //数值越高的元素会覆盖数值较低的元素。
  // 默认情况下，HTML 元素的 z-index 为 auto，即没有特别的堆叠顺序。


  // set state to track the coordinates of the composer (liveblocks comment editor)
  const [composerCoords, setComposerCoords] = useState<ComposerCoords>(null);

  // set state to track the last pointer event
  const lastPointerEvent = useRef<PointerEvent>();

  // set state to track if user is allowed to use the composer
  const [allowUseComposer, setAllowUseComposer] = useState(false);
  const allowComposerRef = useRef(allowUseComposer);
  allowComposerRef.current = allowUseComposer;

  useEffect(() => {
    // If composer is already placed, don't do anything
    if (creatingCommentState === "complete") {
      return;
    }

    // Place a composer on the screen
    const newComment = (e: MouseEvent) => {
      e.preventDefault();

      // If already placed, click outside to close composer
      if (creatingCommentState === "placed") {
        // check if the click event is on/inside the composer
        const isClickOnComposer = ((e as any)._savedComposedPath = e
            //(e as any)._savedComposedPath
            // 目的：缓存 composedPath() 的结果，避免后续重复计算，提升性能。
            // 原因：composedPath() 的计算成本较高，尤其在复杂的 DOM 树中。
          .composedPath()
          .some((el: any) => {
            return el.classList?.contains("lb-composer-footer","lb-composer-editor-container");
          }));
        //some 用于遍历 composedPath() 返回的数组，逐一检查是否有符合条件的 DOM 节点。
        //检查当前节点是否有 lb-composer-editor-actions 这个 CSS 类。
        // 如果是，则说明点击的位置在评论编辑器内部。

        // if click is inside/on composer, don't do anything
        if (isClickOnComposer) {
          return;
        }

        // if click is outside composer, close composer
        if (!isClickOnComposer) {
          setCreatingCommentState("complete");
          return;
        }
        //点击在编辑器内部： 如果 isClickOnComposer 为 true，则代码什么都不做，让用户继续编辑评论。
        //
        // 点击在外部： 如果 isClickOnComposer 为 false，代码会认为用户的意图是关闭编辑器：
      }

      // First click sets composer down
      //if (creatingCommentState === "placing")
      setCreatingCommentState("placed");
      setComposerCoords({
        x: e.clientX,
        y: e.clientY,
      });
    };
    //评论功能通常分为以下几个阶段：
    //
    // 创建阶段（placing）：
    //
    // 用户第一次点击页面，触发显示编辑器。
    // 编辑器的初始位置由用户的点击位置决定。

    // 编辑阶段（placed）：
    // 用户开始输入评论内容。
    // 点击外部时，可能会关闭编辑器。

    // 完成阶段（complete）：
    // 用户提交评论，编辑器关闭。

    document.documentElement.addEventListener("click", newComment);
    //为整个 HTML 文档的根元素 (document.documentElement) 添加全局的 click 事件监听器。
    // 每次用户点击页面时，都会触发 newComment 函数。

    return () => {
      document.documentElement.removeEventListener("click", newComment);
    };
  }, [creatingCommentState]);
  //清理工作：当组件卸载或依赖项 (creatingCommentState) 发生变化时，移除事件监听器。
  // 这是防止内存泄漏的关键步骤。

  // useEffect(() => {
  //   // If dragging composer, update position
  //   const handlePointerMove = (e: PointerEvent) => {
  //     // Prevents issue with composedPath getting removed
  //     //实时捕获指针移动事件：
  //     //
  //     // 无论鼠标还是触控设备，pointermove 事件都会触发，用于动态计算或记录移动路径。
  //     (e as any)._savedComposedPath = e.composedPath();
  //     //获取事件传播路径（事件冒泡时经过的所有元素）。
  //     // 通常用于判断事件是否发生在某个特定的元素或区域。
  //     // 将路径存储到 e._savedComposedPath 中，以防止 e.composedPath() 在事件处理后被销毁。
  //     lastPointerEvent.current = e;
  //     //将最新的 pointermove 事件保存到 lastPointerEvent.current，为后续的逻辑（如计算位置或拖拽路径）提供最新的指针状态。
  //   };
  //
  //   //如果将来扩展功能，比如：lastPointerEvent
  //   //
  //   // 实现拖拽编辑器的功能，可能需要动态更新拖拽路径。
  //   // 在编辑器位置初始化时，还原到用户最后的点击状态。
  //   // 对指针位置的轨迹分析，增加复杂的用户行为追踪。
  //   // lastPointerEvent 可能会变得有用。否则，目前来看，它是可以安全移除的。
  //
  //
  //   document.documentElement.addEventListener("pointermove", handlePointerMove);
  //   //这段代码虽然只在组件初始化时运行一次，但它注册的事件监听器会在整个组件生命周期内生效，动态捕获指针移动事件，为交互式功能（如拖拽、绘图、路径分析）提供基础数据。
  //   //监听器绑定到 DOM 节点上，而不是绑定到 React 组件本身。
  //   // 因此，即使 React 更新了组件的状态或重新渲染，监听器依然保持活跃状态，只要没有被移除。
  //   //在这段代码中，移除监听器的逻辑写在 useEffect 的清理函数中，只有在组件卸载时才会执行。
  //   return () => {
  //     document.documentElement.removeEventListener(
  //       "pointermove",
  //       handlePointerMove
  //     );
  //   };
  // }, []);

  //
  // Set pointer event from last click on body for use later
  useEffect(() => {
    if (creatingCommentState !== "placing") {
      return;
    }

    const handlePointerDown = (e: PointerEvent) => {
      // if composer is already placed, don't do anything
      if (allowComposerRef.current) {
        return;
      }

      // Prevents issue with composedPath getting removed
      (e as any)._savedComposedPath = e.composedPath();
      lastPointerEvent.current = e;
      setAllowUseComposer(true);
      // 将最后一次点击事件保存到 lastPointerEvent.current，为后续交互（如计算评论框的放置位置）提供初始指针数据。
      //这是最终位置
    };

    // Right click to cancel placing
    const handleContextMenu = (e: Event) => {
      if (creatingCommentState === "placing") {
        e.preventDefault();
        setCreatingCommentState("complete");
      }
    };

    document.documentElement.addEventListener("pointerdown", handlePointerDown);
    document.documentElement.addEventListener("contextmenu", handleContextMenu);
    //用户的指针按下事件 (pointerdown)。
    // 用户的右键菜单事件 (contextmenu)。

    return () => {
      document.documentElement.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
      document.documentElement.removeEventListener(
        "contextmenu",
        handleContextMenu
      );
    };
  }, [creatingCommentState]);

//在 NewThread 中注册的监听器，可能仅用于管理新评论框的初始位置，与 CommentsOverlay 中的逻辑独立。



  // On composer submit, create thread and reset state
  const handleComposerSubmit = useCallback(
    ({ body }: ComposerSubmitComment, event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();
      //event.preventDefault()：阻止表单的默认提交行为（例如页面刷新）。
      // event.stopPropagation()：阻止事件继续冒泡到父级元素，确保事件只在当前组件中处理。

      // Get your canvas element
      const overlayPanel = document.querySelector("#canvas");

      // if there's no composer coords or last pointer event, meaning the user hasn't clicked yet, don't do anything
      if (!composerCoords || !lastPointerEvent.current || !overlayPanel) {
        return;
      }

      // Set coords relative to the top left of your canvas
      const { top, left } = overlayPanel.getBoundingClientRect();
      const x = composerCoords.x - left;
      const y = composerCoords.y - top;

      // create a new thread with the composer coords and cursor selectors
      createThread({
        body,
        metadata: {
          x,
          y,
          resolved: false,
          zIndex: maxZIndex + 1,
        },
      });

      setComposerCoords(null);
      setCreatingCommentState("complete");
      setAllowUseComposer(false);
      //NewThread 提交后，必须清理其内部的状态，防止临时 composer 再次渲染。
    },
    [createThread, composerCoords, maxZIndex]
  );

  return (
    <>
      {/**
       * Slot is used to wrap the children of the NewThread component
       * to allow us to add a click event listener to the children
       *
       * Slot: https://www.radix-ui.com/primitives/docs/utilities/slot
       *
       * Disclaimer: We don't have to download this package specifically,
       * it's already included when we install Shadcn
       */}
      <Slot
        onClick={() =>
          setCreatingCommentState(
            creatingCommentState !== "complete" ? "complete" : "placing"
              //如果现在是 complete 状态，点一下就开始变成 placing
          )
        }
        style={{ opacity: creatingCommentState !== "complete" ? 0.7 : 1 }}
        //creatingCommentState == "placing"：设置透明度为 0.7（部分透明）。
          // 否则，透明度为 1（完全不透明）。
          //可以追踪看放置在那里？
      >
        {children}
      </Slot>

      {/* if composer coords exist and we're placing a comment, render the composer */}
      {composerCoords && creatingCommentState === "placed" ? (
        /**
         * Portal.Root is used to render the composer outside of the NewThread component to avoid z-index issuess
         *
         * Portal.Root: https://www.radix-ui.com/primitives/docs/utilities/portal
         */
        //像评论编辑器、模态窗口、悬浮菜单等组件需要“浮动”在页面的其他内容之上，通常需要高层级的 z-index。
          // 如果它被嵌套在一个父组件中，而父组件的层级较低，就会导致显示问题。
          // 避免复杂的 CSS 处理
          //
          // 如果不使用 Portal.Root，我们可能需要手动调整父级和子级的 z-index，并且确保所有其他上下文也兼容。这种处理会让代码复杂且难以维护。
          //Portal 的核心作用是将组件渲染到 DOM 的一个全局节点中，比如 body 或指定的根节点。这会让组件跳出原来的层级上下文，从而不再受到父级 z-index 的限制。
        <Portal.Root
          className='absolute left-0 top-0'
          style={{
            pointerEvents: allowUseComposer ? "initial" : "none",
            //控制交互
            //如果 allowUseComposer 为 false，则禁用交互，确保用户只能在某些情况下使用评论框。
            transform: `translate(${composerCoords.x}px, ${composerCoords.y}px)`,
            //transform: translate(...)：动态调整位置，将 PinnedComposer 移动到用户点击的坐标点。
            // composerCoords.x 和 composerCoords.y 是用户点击评论区域时的坐标。
            // 确保编辑器出现在正确的位置。
          }}
          data-hide-cursors
        >
          <PinnedComposer onComposerSubmit={handleComposerSubmit} />
        </Portal.Root>
      ) : null}

      {/* Show the customizing cursor when placing a comment. The one with comment shape */}
      <NewThreadCursor display={creatingCommentState === "placing"} />
      {/*评论的光标*/}
    </>
  );
};



//NewThread：只负责创建和提交新的 composer，提交后不再直接渲染。
// PinnedThread：唯一负责从 threads 列表中读取并渲染所有 composer。


//1. 初始加载
// 当组件加载时，默认状态：
//
// creatingCommentState 初始化为 "complete"，表示当前没有进行评论的创建流程。
// 相关事件监听器（如 pointermove, pointerdown, contextmenu）尚未激活。
// 无操作用户行为，此时组件处于静止状态。
//
// 2. 开始放置评论框
// 触发条件：某个用户操作将 creatingCommentState 设置为 "placing"。
//
// 2.1 激活放置逻辑
// 组件进入 placing 状态后：
//
// Pointer Move（指针移动监听器）：
//
// 通过 pointermove 捕获鼠标的当前位置并更新 lastPointerEvent。
// 准备随时记录用户的点击位置。
// Pointer Down（指针按下监听器）：
//
// 监听用户的鼠标按下事件（pointerdown）。
// 如果允许用户与评论框交互（allowUseComposer），记录指针的 x, y 坐标，更新 allowComposerRef，并启用评论框。
// Click（全局点击监听器）：
//
// 监听整个页面的点击事件。
// 如果用户未点在编辑器内部，则将 creatingCommentState 切换到 "complete"，表示放置流程结束。
// Right Click（右键菜单监听器）：
//
// 阻止默认的右键菜单行为。
// 如果在 placing 状态下触发，取消放置并结束流程。
// 此时，用户可以通过鼠标左键完成放置评论框，或者通过右键取消放置。
//
// 3. 放置评论框
// 触发条件：用户左键点击，creatingCommentState 从 "placing" 切换到 "placed"。
//
// 3.1 更新评论框位置
// 用户点击时，newComment 事件触发：
// 检查点击位置是否在评论编辑器内。
// 如果不在编辑器内，设置 composerCoords 为点击位置的坐标。
// 更新状态为 "placed"，显示评论框。
// 3.2 激活评论框
// 当状态切换为 "placed" 时：
// 渲染评论编辑器组件 PinnedComposer，并根据 composerCoords 定位。
// 激活用户与评论框的交互（通过 allowUseComposer）。
// 4. 提交评论
// 触发条件：用户在编辑器内输入内容并点击提交按钮。
//
// 4.1 提交流程
// handleComposerSubmit 处理用户提交事件：
//
// 阻止默认表单行为。
// 根据 composerCoords 和画布位置计算评论框的相对坐标。
// 调用 createThread 创建新的评论线程，传入内容和元数据（坐标、z-index 等）。
// 提交成功后，creatingCommentState 切换回 "complete"，评论创建流程结束。
//
// 5. 取消放置评论框
// 触发条件：用户点击画布其他区域或右键菜单，未完成评论放置。
//
// 5.1 取消流程
// 右键触发 contextmenu，或页面点击触发 newComment：
// 如果当前状态为 "placing" 或 "placed"，切换状态为 "complete"。
// 隐藏评论框并移除交互功能。