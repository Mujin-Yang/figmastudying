"use client"
import dynamic from "next/dynamic";

const App = dynamic(() => import("./App"), { ssr: false });

// 因为画布 canvas 需要再 client 端渲染，所以要禁用 服务端渲染

/**
 * disable ssr to avoid pre-rendering issues of Next.js
 *
 * we're doing this because we're using a canvas element that can't be pre-rendered by Next.js on the server
 */

export default App;