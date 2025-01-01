"use client";

import Image from "next/image";
import {useMemo, useRef, useState} from "react";
import { ThreadData } from "@liveblocks/client";
import { Thread } from "@liveblocks/react-ui";

type ThreadMetadata = {
  resolved: boolean;
  zIndex: number;
  time?: number;
  x: number;
  y: number;
};

type Props = {
  thread: ThreadData<ThreadMetadata>;
  action: (threadId: string) => void;
  isDraggingRef: React.RefObject<boolean>;
};

export const PinnedThread = ({ thread, action, isDraggingRef, ...props }: Props) => {
  // Open pinned threads that have just been created
  const startMinimized = useMemo(
    () => Number(new Date()) - Number(new Date(thread.createdAt)) > 100,
    [thread]
  );

  const [minimized, setMinimized] = useState(startMinimized);
  const [isDragging, setIsDragging] = useState(false); // Track drag state
  const dragDelay = 500; // 500ms delay to confirm dragging
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = (e: any) => {
    action(thread.id);

    // Prevent toggling minimized state during drag
    if (isDraggingRef.current) {
      e.preventDefault();
      return;
    }

    // Prevent toggling minimize when clicking on specific icons
    if (
      e.target &&
      e.target.classList.contains("lb-icon") &&
      e.target.classList.contains("lb-button-icon")
    ) {
      return;
    }

    // Start detecting drag behavior with a delay
    dragTimeoutRef.current = setTimeout(() => {
      setMinimized((prev) => !prev);
    }, dragDelay);
  };

  const memoizedContent = useMemo(
    () => (
      <div
        className="absolute flex cursor-pointer gap-4"
        {...props}
        onMouseDown={handleMouseDown}
        onMouseMove={() => {
          if (isDraggingRef.current) {
            setMinimized(false)
            // Set isDragging to true when dragging starts
            if (!isDragging) {
              setIsDragging(true);
            }
          }
        }}
        onMouseUp={() => {
          setIsDragging(false); // Reset dragging state when mouse is released
        }}
      >
        <div
          className="relative flex h-9 w-9 select-none items-center justify-center rounded-bl-full rounded-br-full rounded-tl-md rounded-tr-full bg-white shadow"
          data-draggable={true}
        >
          <Image
            src={`https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`}
            alt="Dummy Name"
            width={28}
            height={28}
            draggable={false}
            className="rounded-full"
          />
        </div>
        {/* Only show thread if not minimized */}
        {!minimized || isDragging ? (
          <div className="flex min-w-60 flex-col overflow-hidden rounded-lg bg-white text-sm shadow">
            <Thread
              thread={thread}
              indentCommentContent={false}
              onKeyUp={(e) => {
                e.stopPropagation();
              }}
            />
          </div>
        ) : null}
      </div>
    ),
    [thread.comments.length, minimized, isDraggingRef, isDragging]
  );

  return <>{memoizedContent}</>;
};
