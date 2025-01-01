import { useMemo } from "react";
import {useThreads} from "@liveblocks/react/suspense";
// Returns the highest z-index of all threads
export const useMaxZIndex = () => {
  // get all threads

  const {threads} = useThreads();
// 确保 threads 每次渲染都被记录
  //console.log("Threads snapshot:", threads);
  // calculate the max z-index
  // 过滤掉已 resolved 的线程
  const activeThreads = threads.filter(thread => !thread.resolved);

  return useMemo(() => {
    if (activeThreads.length === 0) {
      // 如果没有线程，直接返回 0
      console.log("No threads, returning maxZIndex as 0");
      return 0;
    }

    let max = 0;
    for (const thread of activeThreads) {
      if (thread.metadata.zIndex > max) {
        max = thread.metadata.zIndex;
      }
    }
    //console.log("Calculated maxZIndex:", max);
    return max;
  }, [activeThreads]);
  //useMemo 依赖于 threads 数组。当 threads 被删除时，React 仍然保留了之前的 useMemo 计算结果，直到 threads 数组完全变化。即使 threads 数组为空，如果没有重新触发 useMemo，它依旧会返回之前计算的 maxZIndex。
};
