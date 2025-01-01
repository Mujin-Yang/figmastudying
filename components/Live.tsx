"use client";

import React, {useCallback, useEffect, useState} from 'react';
import LiveCursors from "@/components/cursor/LiveCursors";
import {useMyPresence} from "@liveblocks/react/suspense";
import CursorChat from "@/components/cursor/CursorChat";
import {CursorMode, CursorState, Reaction} from "@/types/type";
import ReactionSelector from "@/components/reaction/ReactionButton";
import FlyingReaction from "@/components/reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";
import {useBroadcastEvent, useEventListener} from "@liveblocks/react";
import {Comments} from "@/components/comments/Comments";

//导入右键菜单
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {shortcuts} from "@/constants";




type Props = {
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
    undo:()=>void;
    redo:()=>void;
}
const Live = ({canvasRef, undo, redo}:Props) => {
    //const others = useOthers();
    //最后一步还可以删除
    //这个 hook 可以 return list of all other users
    const [{cursor}, updateMyPresence] = useMyPresence();
    const [cursorState, setCursorState] = useState<CursorState>(
        {mode: CursorMode.Hidden,})
    const [reactions, setReactions] = useState<Reaction[]>([]);

    //把 reaction 广播到其他房间
    const broadcast = useBroadcastEvent();

    useInterval(()=>{
        if(cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor){
            setReactions((reactions) => reactions.concat([{
              point:{x:cursor.x, y:cursor.y} ,
              value:cursorState.reaction,
                timestamp:Date.now()
            }]));
            broadcast({
                x:cursor.x,
                y:cursor.y,
                value:cursorState.reaction,
            })
        }
    },100)

        //广播之后还需要其他人还需要收听 listen
    useEventListener((eventData)=>{
        const event = eventData.event;
        setReactions((reactions) => reactions.concat([{
              point:{x:event.x, y:event.y} ,
              value:event.value,
                timestamp:Date.now()
            }]));
    });


    //重要
    //飞出去的表情，消失了但仍然存在，需要清理
    useInterval(()=>{
        setReactions((reactions) => reactions.filter((r)=>r.timestamp > Date.now()-4000));
    },100)

    const handlePointerMove = useCallback ((event:React.PointerEvent) => {
        event.preventDefault();
        if (cursor === null || cursorState.mode !== CursorMode.ReactionSelector) {
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
        updateMyPresence({cursor: {x, y}});
        }
    },[])

    const handlePointerLeave = useCallback (() => {
        setCursorState({mode: CursorMode.Hidden});

        updateMyPresence({cursor: null, message: null});
    },[])

    const handlePointerDown = useCallback ((event:React.PointerEvent) => {
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

        updateMyPresence({cursor: {x, y}});
        setCursorState((state:CursorState) => (cursorState.mode === CursorMode.Reaction) ? {...state, isPressed: true} : state);
    },[cursorState.mode, setCursorState])
//传入一个回调函数，通过回调获取前一个状态并基于它计算新状态：setCursorState((prevState) => ({ ...prevState, mode: CursorMode.Reaction }));

    const handlePointerUp = useCallback (() => {
        setCursorState((state:CursorState) => (cursorState.mode === CursorMode.Reaction) ? {...state, isPressed: true} : state);
    },[cursorState.mode, setCursorState])


    useEffect(() => {
        const onKeyUp = (e:KeyboardEvent) => {
            if(e.key === '/'){
                setCursorState({
                    mode: CursorMode.Chat,
                    previousMessage: null,
                    message: '',
                });
            }else if (e.key === 'Escape'){
                updateMyPresence({message: ''});
                setCursorState({mode: CursorMode.Hidden});
            }else if (e.key === 'e'){
                setCursorState({mode: CursorMode.ReactionSelector});
        }};
        const onKeyDown = (e:KeyboardEvent) => {
            if(e.key === '/'){
                e.preventDefault();
            }
        }
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        return () => {
            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('keyup', onKeyUp);
        };
    },[updateMyPresence]);


    const setReaction = useCallback((reaction: string) => {
         setCursorState({mode: CursorMode.Reaction, reaction, isPressed: false})
    },[]);

    const handleContextMenuClick = useCallback((key:string) => {
        switch (key) {
            case 'Chat':
            setCursorState({
                    mode: CursorMode.Chat,
                    previousMessage: null,
                    message: '',
                });
             break;
             case 'Undo':
                undo();
             break;
            case 'Redo':
                redo();
             break;
            case 'Reactions':
            setCursorState({mode: CursorMode.ReactionSelector});
             break;
        }
    },[]);

    return (

    <ContextMenu>
        {/*把div换成ContextMenuTrigger*/}
        <ContextMenuTrigger
            id="canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerUp={handlePointerUp}
            className="relative w-full flex flex-1 justify-center items-center"
            // 注意这里改变成了 relative，否则放comments的时候会shift
        >
            <canvas ref={canvasRef}/>

            {reactions.map((reaction)=>(
                <FlyingReaction
                    key={reaction.timestamp.toString()}
                    x={reaction.point.x}
                    y={reaction.point.y}
                    timestamp={reaction.timestamp}
                    value={reaction.value}
                />
            ))}

        {cursor && (
          <CursorChat
            cursor={cursor}
            cursorState={cursorState}
            setCursorState={setCursorState}
            updateMyPresence={updateMyPresence}
          />
        )}

        {cursorState.mode === CursorMode.ReactionSelector && (
            <ReactionSelector
                setReaction={setReaction}
            />
        )}

        <LiveCursors/>

        <Comments/>
            {/*换成ContextMenuTrigger的 div*/}
        </ContextMenuTrigger>

        <ContextMenuContent className="right-menu-content">
            {shortcuts.map((item)=>(
             <ContextMenuItem key={item.key} className="right-menu-item" onClick={()=>handleContextMenuClick(item.name)}>
                 <p>{item.name}</p>
                 <p className="text-xs text-primary-grey-300">{item.shortcut}</p>
             </ContextMenuItem>
            ))}

        </ContextMenuContent>

        </ContextMenu>
    )
}

//onClick={handleContextMenuClick(item.name)}
// 和onClick=()=>handleContextMenuClick(item.name)
// 有什么区别？
// 这里 handleContextMenuClick(item.name) 会立即调用函数，并将其返回值赋给 onClick。
// 如果 handleContextMenuClick 有返回值，则 onClick 会绑定该返回值（假设是一个函数才会工作）；如果没有返回值，则 onClick 会变成 undefined。
//当组件渲染时，handleContextMenuClick(item.name) 会直接执行，而不是在用户点击时才触发。
// 这是一个常见的误用，通常不是开发者想要的行为。

//() => handleContextMenuClick(item.name) 是一个箭头函数，定义一个匿名函数，只有在点击时才会执行 handleContextMenuClick(item.name)。
// 这是正确的写法，常用于需要传递参数的事件处理函数。

export default Live;