import React, { useState, useEffect, lazy } from 'react';
import "../resizeable_n_moveable.css";
import botProfile from "../../../../Assets/lucide--circle-user-round.svg";
import closeIcon from "../../../../Assets/line-md--menu-to-close-transition.svg";

         
const Support = lazy(() => import("../supportUser/SupportUser"));

function ResizeableAndMoveableSupport({ close }) {
  const [startX, setStartX] = useState(20);
  const [startY, setStartY] = useState(10);
  const [startWidth, setStartWidth] = useState(300);
  const [startHeight, setStartHeight] = useState(400);
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  // Calculate initial left position
  const initialLeft = windowWidth -(startWidth + startX);

  // Calculate initial top position
  const initialTop = windowHeight - (startHeight + startY);

  const [startLeft, setStartLeft] = useState(initialLeft);
  const [startTop, setStartTop] = useState(initialTop);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingTop, setIsResizingTop] = useState(false);

  useEffect(() => {
    const resizeEventDiv = document.querySelector(".event_reciever_div");
    const container = resizeEventDiv.querySelector(".container");

    const startDragging = (event) => {
      if (!event.target.classList.contains("moveEvent")) return;
      setIsDragging(true);
      setStartX(event.clientX);
      setStartY(event.clientY);
      setStartLeft(resizeEventDiv.offsetLeft);
      setStartTop(resizeEventDiv.offsetTop);
    };

    const onDrag = (event) => {
      if (isDragging) {
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        resizeEventDiv.style.left = `${startLeft + deltaX}px`;
        resizeEventDiv.style.top = `${startTop + deltaY}px`;
      }
    };

    const stopDragging = () => {
      setIsDragging(false);
    };

    const startResizing = (event) => {
      if (!event.target.classList.contains("resizeEvent")) return;
      setIsResizing(true);
      setStartX(event.clientX);
      setStartY(event.clientY);
      setStartWidth(resizeEventDiv.offsetWidth);
      setStartHeight(resizeEventDiv.offsetHeight);
      setStartLeft(resizeEventDiv.offsetLeft);
      setStartTop(resizeEventDiv.offsetTop);

      const cursorX = event.clientX;
      const cursorY = event.clientY;
      const topLeftX = resizeEventDiv.offsetLeft;
      const topY = resizeEventDiv.offsetTop;
      setIsResizingLeft(
        Math.abs(cursorX - topLeftX) <
          Math.abs(cursorX - (topLeftX + startWidth))
      );
      setIsResizingTop(
        Math.abs(cursorY - topY) < Math.abs(cursorY - (topY + startHeight))
      );
    };

    const onResize = (event) => {
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      if (isResizing) {
        if (isResizingLeft) {
          const newWidth = startWidth - deltaX;
          const newLeft = startLeft + deltaX;
          resizeEventDiv.style.width = `${newWidth}px`;
          resizeEventDiv.style.left = `${newLeft}px`;
        } else {
          resizeEventDiv.style.width = `${startWidth + deltaX}px`;
        }

        if (isResizingTop) {
          const newHeight = startHeight - deltaY;
          const newTop = startTop + deltaY;
          resizeEventDiv.style.height = `${newHeight}px`;
          resizeEventDiv.style.top = `${newTop}px`;
        } else {
          resizeEventDiv.style.height = `${startHeight + deltaY}px`;
        }

        container.style.height = `calc(100% - (2 * var(--margin)))`;
      }
    };

    const stopResizing = () => {
      setIsResizing(false);
    };

    resizeEventDiv.addEventListener("mousedown", startResizing);
    document.addEventListener("mousemove", onResize);
    document.addEventListener("mouseup", stopResizing);

    resizeEventDiv.addEventListener("mousedown", startDragging);
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDragging);

    return () => {
      resizeEventDiv.removeEventListener("mousedown", startResizing);
      document.removeEventListener("mousemove", onResize);
      document.removeEventListener("mouseup", stopResizing);

      resizeEventDiv.removeEventListener("mousedown", startDragging);
      document.removeEventListener("mousemove", onDrag);
      document.removeEventListener("mouseup", stopDragging);
    };
  }, [
    startLeft,
    startTop,
    startWidth,
    startHeight,
    isDragging,
    isResizing,
    isResizingLeft,
    isResizingTop,
  ]);

  return (
    <div
      className="event_reciever_div resizeEvent"
      style={{
        left: startLeft,
        top: startTop,
        width: startWidth,
        height: startHeight,
      }}
    >
      <div className="container">
        <div className="moveEvent flex justify-between">
          <div>
            <img
              src={botProfile}
              alt={"profileImage"}
              className="pagelogo w-6 aspect-square rounded-full mx-auto cursor-pointer"
              title="back to addysmart"
            />
          </div>

          <div>
            <img
              src={closeIcon}
              alt={"profileImage"}
              className="pagelogo w-6 aspect-square rounded-full mx-auto cursor-pointer"
              title="back to addysmart"
              onClick={close}
            />
          </div>
        </div>
        <div className="content">
          <Support />
        </div>
      </div>
    </div>
  );
}

export default ResizeableAndMoveableSupport;
