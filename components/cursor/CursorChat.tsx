import {CursorChatProps, CursorMode} from "@/types/type";
import CursorSVG from "@/public/assets/CursorSVG";

const CursorChat = ({cursor, cursorState, setCursorState, updateMyPresence}:CursorChatProps) => {
    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        updateMyPresence({message:e.target.value});
        setCursorState({
            mode: CursorMode.Chat,
            previousMessage: null,
            message: e.target.value,
        });
    }

    const handleKeyDown = (e:React.KeyboardEvent<HTMLInputElement>) => {
        //必须监视 enter key
        if (e.key === 'Enter') {
        setCursorState({
            mode:CursorMode.Chat,
            // @ts-ignore
            previousMessage: cursorState.message,
            message: '',
        })
        } else if (e.key === 'Escape') {
        setCursorState({
            mode:CursorMode.Hidden,
            })
        }
    }

    return (
        //transform 是 CSS 中的一个属性，用于对元素进行变换操作，例如平移、旋转、缩放或倾斜。
        //因为 React JSX 内不能直接使用 if 语句。在 JSX 中，条件渲染需要使用以下几种方法：
        <div className="absolute top-0 left-0" style={{transform: `translateX(${cursor.x}px) translateY(${cursor.y}px)`}}>
            {cursorState.mode === CursorMode.Chat && (
            <>
                <CursorSVG color="#000" />
                <div className="absolute left-2 top-5 bg-blue-500 px-4 py-2 text-sm leading-relaxed text-white rounded-[20px]"
                     onKeyUp={(e) => e.stopPropagation()}
                >{/*// 没有 e.stopPropagation() 时：事件会冒泡到父级 div，触发外层的 onKeyUp 事件。
                    // 输出：外层 onKeyUp。
                    // 有 e.stopPropagation() 时：事件会在内部 div 停止，不再冒泡到父级元素。
                    // 输出：无。*/}

                    {cursorState.previousMessage && (
                        <div>{cursorState.previousMessage}</div>
                    )}
                    <input
                        className="z-10 w-60 border-none bg-transparent text-white placeholder-blue-300 outline-none"
                        autoFocus={true}
                        //当页面加载或组件渲染时，自动将输入光标放置在指定的输入框内，方便用户立即输入。
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder={cursorState.previousMessage ? '':'Type a message...'}
                        value={cursorState.message}
                        maxLength={100}
                    />
                </div>
            </>
            )}
        </div>
    )
}

export default CursorChat;