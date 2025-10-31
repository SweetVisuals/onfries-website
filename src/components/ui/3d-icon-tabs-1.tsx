"use client";

import { motion } from "motion/react";
import { useState, useRef, useEffect } from "react";

import { cn } from "@/lib/utils";

const tabs = [
  {
    id: 0,
    label: "Overview",
    video_url:
      "https://a0.muscache.com/videos/search-bar-icons/webm/house-selected.webm",
    initial_render_url:
      "https://a0.muscache.com/videos/search-bar-icons/webm/house-twirl-selected.webm",
  },
  {
    id: 1,
    label: "Current Orders",
    video_url:
      "https://i.ibb.co/5WSbHfqQ/b0d5353a-ea63-4397-842a-598ea51a8c4b-removalai-preview.png",
    initial_render_url:
      "https://i.ibb.co/5WSbHfqQ/b0d5353a-ea63-4397-842a-598ea51a8c4b-removalai-preview.png",
  },
  {
    id: 2,
    label: "Past Orders",
    video_url:
      "https://a0.muscache.com/videos/search-bar-icons/webm/consierge-selected.webm",
    initial_render_url:
      "https://a0.muscache.com/videos/search-bar-icons/webm/consierge-twirl.webm",
  },
  {
    id: 3,
    label: "Stock",
    video_url:
      "https://i.ibb.co/GvnchdcC/Make-a-3d-202510310135-unscreen-ezgif-com-crop.gif",
    initial_render_url:
      "https://i.ibb.co/GvnchdcC/Make-a-3d-202510310135-unscreen-ezgif-com-crop.gif",
  },
  {
    id: 4,
    label: "Customers",
    video_url:
      "https://i.ibb.co/4wT33mz9/00294c95-5faf-4b96-a6ad-78ea59ab9065-removalai-preview.png",
    initial_render_url:
      "https://i.ibb.co/4wT33mz9/00294c95-5faf-4b96-a6ad-78ea59ab9065-removalai-preview.png",
  },
];

function getBadgePosition(tabId: number) {
  switch (tabId) {
    case 0:
      return "-top-5 -right-8";
    case 1:
      return "-top-[38px] -right-8";
    case 2:
      return "-top-[18px] -right-8";
    case 3:
      return "-top-[41px] -right-6";
    case 4:
      return "-top-[44px] -right-6";
    default:
      return "-top-5 -right-8";
  }
}

function NewBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-primary px-2 py-1 rounded-t-full rounded-br-full rounded-bl-sm text-xs font-bold text-primary-foreground transition-all duration-200 relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:z-[1] before:shadow-[inset_0_0_0_1px_rgba(170,202,255,0.2),inset_0_0_10px_0_rgba(170,202,255,0.3),inset_0_3px_7px_0_rgba(170,202,255,0.4),inset_0_-4px_3px_0_rgba(170,202,255,0.4),0_1px_3px_0_rgba(0,0,0,0.50),0_4px_12px_0_rgba(0,0,0,0.65)]  backdrop-blur-md",
        className
      )}
    >
      <span>NEW</span>
      <span
        className="absolute left-1/2 -translate-x-1/2 opacity-40 z-50 scale-y-[-1] translate-y-2.5"
        style={{
          maskImage: "linear-gradient(to top, white 20%, transparent 50%)",
          WebkitMaskImage:
            "linear-gradient(to top, white 10%, transparent 50%)",
        }}
      >
        NEW
      </span>
    </div>
  );
}

function Component({ className, onTabChange }: { className?: string; onTabChange?: (tabId: number) => void }) {
  const [activeTab, setActiveTab] = useState(0);
  // Create refs for each video
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  // Initialize refs array
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, tabs.length);
  }, []);
  const [tabClicked, setTabClicked] = useState(false);
  const handleTabClick = (newTabId: number) => {
    setTabClicked(true);
    if (newTabId !== activeTab) {
      setActiveTab(newTabId);
      onTabChange?.(newTabId);
      // Reset all videos first
      videoRefs.current.forEach((video, index) => {
        if (video) {
          // Pause and reset any playing videos
          video.pause();
          video.currentTime = 0;
        }
      });

      // Then play only the selected tab's video
      const videoElement = videoRefs.current[newTabId];
      if (videoElement) {
        videoElement.currentTime = 0;
        videoElement.play();
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* <NewBadge /> */}
      <div className={cn("flex space-x-8 rounded-full", className)}>
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            whileTap={"tapped"}
            whileHover={"hovered"}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "relative px-2 tracking-[0.01em] cursor-pointer text-neutral-600 dark:text-neutral-300 transition focus:outline-none outline-none ring-0 focus:ring-0 flex gap-2 items-center",
              activeTab === tab.id
                ? "text-black dark:text-white font-medium tracking-normal"
                : "hover:text-neutral-800 dark:hover:text-neutral-200 text-neutral-500 dark:text-neutral-400",
              tab.id === 3 ? "ml-[3px]" : tab.id === 4 ? "ml-[5px]" : ""
            )}
            style={{ WebkitTapHighlightColor: "transparent", outline: "none", border: "none" }}
          >
            {activeTab === tab.id && (
              <motion.span
                layoutId="bubble"
                className="absolute bottom-0 w-full left-0 z-10 bg-black dark:bg-white rounded-full h-1"
                transition={{ type: "spring", bounce: 0.19, duration: 0.4 }}
              />
            )}
            <motion.div
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                transition: {
                  type: "spring",
                  bounce: 0.2,
                  damping: 7,
                  duration: 0.4,
                  delay: index * 0.1,
                },
              }}
              variants={{
                default: { scale: 1 },
                ...(!(activeTab === tab.id) && { hovered: { scale: 1.1 } }),
                ...(!(activeTab === tab.id) && {
                  tapped: {
                    scale: 0.8,
                    transition: {
                      type: "spring",
                      bounce: 0.2,
                      damping: 7,
                      duration: 0.4,
                    },
                  },
                }),
              }}
              className="relative"
              transition={{ type: "spring" }}
            >

              <div className={cn("relative", tab.id === 1 ? "size-10" : tab.id === 3 ? "size-9 pl-[5px]" : tab.id === 4 ? "size-[1.93640625rem] pr-[5px] pl-[5px]" : "size-20")}>
                {(tab.video_url.includes('.gif') || tab.video_url.includes('.jpg') || tab.video_url.includes('.png')) ? (
                  <img
                    src={tab.video_url}
                    alt={tab.label}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <>
                    <video
                      id="banner-video"
                      key={`initial-${tab.id}`}
                      ref={(el) => {
                        if (el) videoRefs.current[tab.id] = el;
                      }}
                      muted
                      playsInline
                      autoPlay
                      className={cn(
                        "absolute",
                        tabClicked ? "opacity-0" : "opacity-100"
                      )}
                    >
                      <source src={tab.initial_render_url} type="video/webm" />
                    </video>
                    <video
                      id="banner-video"
                      key={`clicked-${tab.id}`}
                      ref={(el) => {
                        if (el) videoRefs.current[tab.id] = el;
                      }}
                      muted
                      playsInline
                      autoPlay
                      className={cn(
                        "absolute",
                        tabClicked ? "opacity-100" : "opacity-0"
                      )}
                    >
                      <source src={tab.video_url} type="video/webm" />
                    </video>
                  </>
                )}
              </div>
            </motion.div>
            <span className={tab.id === 3 ? "pl-[6px]" : ""}>{tab.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
export { Component };