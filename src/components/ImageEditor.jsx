import React, {
  forwardRef,
  useRef,
  useCallback,
  useState,
  useImperativeHandle,
  useEffect,
} from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import "./ImageEditor.css";
import {
  drawCanvasHelper,
  startDrawingHelper,
  drawHelper,
  applyAdjustmentsToContext,
} from "../helper/imageEditorHelperFunctions";

// Utility to throttle function calls
const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

const MAX_OVERLAY_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const DRAG_THRESHOLD = 5; // Pixels to move before starting drag

const ImageEditor = forwardRef(
  ({ editorState, onImageUpload, onStateChange, onToolSelect }, ref) => {
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const overlayImageInputRef = useRef(null);
    const containerRef = useRef(null);
    const textElementRefs = useRef({});
    const resizeTimeoutRef = useRef(null);
    const [textElements, setTextElements] = useState(
      editorState?.textElements || []
    );
    const [overlayImages, setOverlayImages] = useState(
      editorState?.overlayImages || []
    );
    const [selectedTextId, setSelectedTextId] = useState(null);
    const [selectedOverlayImageId, setSelectedOverlayImageId] = useState(null);
    const [cropState, setCropState] = useState(
      editorState?.cropState || {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        aspectRatio: null,
        rotation: 0,
        verticalPerspective: 0,
        horizontalPerspective: 0,
      }
    );
    const [adjustments, setAdjustments] = useState(
      editorState?.adjustments || {
        temperature: 0,
        tint: 0,
        brightness: 0,
        contrast: 0,
        highlights: 0,
        shadows: 0,
        whites: 0,
        blacks: 0,
        vibrance: 0,
        saturation: 0,
        sharpness: 0,
        clarity: 0,
        grayscale: 0,
        invert: false,
        sepia: 0,
      }
    );
    const [colorAdjustments, setColorAdjustments] = useState(
      editorState?.colorAdjustments || {
        hue: 0,
        saturation: 0,
        brightness: 0,
      }
    );
    const [shadow, setShadow] = useState(
      editorState?.shadow || {
        offsetX: 0,
        offsetY: 0,
        blur: 0,
        color: "rgba(0,0,0,0)",
        opacity: 0,
        size: 0,
        thickness: 0,
        spread: 0,
      }
    );
    const [duotone, setDuotone] = useState(editorState?.duotone || null);
    const [renderTrigger, setRenderTrigger] = useState(0);
    const [toolbarVisible, setToolbarVisible] = useState(false);
    const [brushMode, setBrushMode] = useState(editorState?.brushMode || false);
    const [brushSettings, setBrushSettings] = useState(
      editorState?.brushSettings || {
        size: 1,
        intensity: 0,
        type: "blur",
      }
    );
    const isMountedRef = useRef(true);
    const blurMaskCanvasRef = useRef(document.createElement("canvas"));
    const blurMaskCtxRef = useRef(blurMaskCanvasRef.current.getContext("2d"));
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragDataRef = useRef(null);

    // Update state when editorState prop changes
    useEffect(() => {
      if (editorState) {
        setTextElements((prev) =>
          JSON.stringify(prev) !==
          JSON.stringify(editorState.textElements || [])
            ? editorState.textElements || []
            : prev
        );
        setOverlayImages((prev) =>
          JSON.stringify(prev) !==
          JSON.stringify(editorState.overlayImages || [])
            ? editorState.overlayImages || []
            : prev
        );
        setCropState((prev) =>
          JSON.stringify(prev) !==
          JSON.stringify(
            editorState.cropState || {
              x: 0,
              y: 0,
              width: 0,
              height: 0,
              aspectRatio: null,
              rotation: 0,
              verticalPerspective: 0,
              horizontalPerspective: 0,
            }
          )
            ? editorState.cropState || {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                aspectRatio: null,
                rotation: 0,
                verticalPerspective: 0,
                horizontalPerspective: 0,
              }
            : prev
        );
        setAdjustments((prev) =>
          JSON.stringify(prev) !==
          JSON.stringify(
            editorState.adjustments || {
              temperature: 0,
              tint: 0,
              brightness: 0,
              contrast: 0,
              highlights: 0,
              shadows: 0,
              whites: 0,
              blacks: 0,
              vibrance: 0,
              saturation: 0,
              sharpness: 0,
              clarity: 0,
              grayscale: 0,
              invert: false,
              sepia: 0,
            }
          )
            ? editorState.adjustments || {
                temperature: 0,
                tint: 0,
                brightness: 0,
                contrast: 0,
                highlights: 0,
                shadows: 0,
                whites: 0,
                blacks: 0,
                vibrance: 0,
                saturation: 0,
                sharpness: 0,
                clarity: 0,
                grayscale: 0,
                invert: false,
                sepia: 0,
              }
            : prev
        );
        setColorAdjustments((prev) =>
          JSON.stringify(prev) !==
          JSON.stringify(
            editorState.colorAdjustments || {
              hue: 0,
              saturation: 0,
              brightness: 0,
            }
          )
            ? editorState.colorAdjustments || {
                hue: 0,
                saturation: 0,
                brightness: 0,
              }
            : prev
        );
        setShadow((prev) =>
          JSON.stringify(prev) !==
          JSON.stringify(
            editorState.shadow || {
              offsetX: 0,
              offsetY: 0,
              blur: 0,
              color: "rgba(0,0,0,0)",
              opacity: 0,
              size: 0,
              thickness: 0,
              spread: 0,
            }
          )
            ? editorState.shadow || {
                offsetX: 0,
                offsetY: 0,
                blur: 0,
                color: "rgba(0,0,0,0)",
                opacity: 0,
                size: 0,
                thickness: 0,
                spread: 0,
              }
            : prev
        );
        setDuotone((prev) =>
          JSON.stringify(prev) !== JSON.stringify(editorState.duotone || null)
            ? editorState.duotone || null
            : prev
        );
        setBrushMode((prev) =>
          prev !== (editorState.brushMode || false)
            ? editorState.brushMode || false
            : prev
        );
        setBrushSettings((prev) =>
          JSON.stringify(prev) !==
          JSON.stringify(
            editorState.brushSettings || {
              size: 1,
              intensity: 0,
              type: "blur",
            }
          )
            ? editorState.brushSettings || {
                size: 1,
                intensity: 0,
                type: "blur",
              }
            : prev
        );
        setRenderTrigger((prev) => prev + 1);
      }
    }, [editorState]);

    // Notify parent of state changes
    const notifyStateChange = useCallback(() => {
      if (!editorState?.selectedImage) return;
      const newState = {
        selectedImage: editorState.selectedImage,
        activeTool: editorState.activeTool,
        textElements,
        overlayImages,
        cropState,
        adjustments,
        colorAdjustments,
        shadow,
        duotone,
        brushMode,
        brushSettings,
      };
      setTimeout(() => {
        if (isMountedRef.current) {
          onStateChange(newState);
        }
      }, 0);
    }, [
      editorState?.selectedImage,
      editorState?.activeTool,
      textElements,
      overlayImages,
      cropState,
      adjustments,
      colorAdjustments,
      shadow,
      duotone,
      brushMode,
      brushSettings,
      onStateChange,
    ]);

    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleEnd);
        window.removeEventListener("blur", handleEnd);
      };
    }, []);

    const handleFileUpload = useCallback(
      (file) => {
        if (!file || !file.type.startsWith("image/")) {
          console.error("Invalid file type");
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          console.error("File size exceeds 5MB limit");
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          if (!isMountedRef.current) return;
          const imageUrl = e.target?.result;
          if (typeof imageUrl !== "string") {
            console.error("Failed to read image file");
            return;
          }
          onImageUpload(imageUrl);
        };
        reader.onerror = () => console.error("Error reading file");
        reader.readAsDataURL(file);
      },
      [onImageUpload]
    );

    const handleOverlayImageUpload = useCallback(
      (file) => {
        if (!file || !file.type.startsWith("image/")) {
          console.error("Invalid file type for overlay image");
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          console.error("Overlay image size exceeds 5MB limit");
          return;
        }
        if (overlayImages.length >= MAX_OVERLAY_IMAGES) {
          console.error("Maximum number of overlay images reached");
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          if (!isMountedRef.current) return;
          const imageUrl = e.target?.result;
          if (typeof imageUrl !== "string") {
            console.error("Failed to read overlay image file");
            return;
          }
          const img = new Image();
          img.src = imageUrl;
          img.onload = () => {
            if (!isMountedRef.current) return;
            const id = Date.now();
            if (overlayImages.some((img) => img.id === id)) {
              console.warn("Overlay image with this ID already exists");
              return;
            }
            const newOverlayImage = {
              id,
              src: imageUrl,
              x: 50,
              y: 50,
              width: Math.min(img.width, 200),
              height: Math.min(img.height, 200 * (img.height / img.width)),
              opacity: 1,
            };
            setOverlayImages((prev) => {
              const newOverlayImages = [...prev, newOverlayImage];
              const newState = {
                selectedImage: editorState.selectedImage,
                activeTool: editorState.activeTool || "add-image",
                textElements,
                overlayImages: newOverlayImages,
                cropState,
                adjustments,
                colorAdjustments,
                shadow,
                duotone,
                brushMode,
                brushSettings,
              };
              setTimeout(() => {
                if (isMountedRef.current) {
                  onStateChange(newState);
                }
              }, 0);
              return newOverlayImages;
            });
            setSelectedOverlayImageId(id);
            setSelectedTextId(null);
            setRenderTrigger((prev) => prev + 1);
          };
          img.onerror = () => console.error("Error loading overlay image");
        };
        reader.onerror = () =>
          console.error("Error reading overlay image file");
        reader.readAsDataURL(file);
      },
      [
        overlayImages,
        editorState?.selectedImage,
        editorState?.activeTool,
        textElements,
        cropState,
        adjustments,
        colorAdjustments,
        shadow,
        duotone,
        brushMode,
        brushSettings,
        onStateChange,
      ]
    );

    const handleDrop = useCallback(
      (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find((file) => file.type.startsWith("image/"));
        if (imageFile) {
          if (editorState?.selectedImage) {
            handleOverlayImageUpload(imageFile);
          } else {
            handleFileUpload(imageFile);
          }
        }
      },
      [handleFileUpload, handleOverlayImageUpload, editorState?.selectedImage]
    );

    const handleDragOver = useCallback((e) => e.preventDefault(), []);

    const handleFileInputChange = useCallback(
      (e) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
      },
      [handleFileUpload]
    );

    const handleOverlayImageInputChange = useCallback(
      (e) => {
        const file = e.target.files?.[0];
        if (file) handleOverlayImageUpload(file);
      },
      [handleOverlayImageUpload]
    );

    const drawCanvas = useCallback(() => {
      if (!canvasRef.current || !editorState?.selectedImage) {
        console.warn("Canvas or selected image not available");
        return;
      }
      drawCanvasHelper(
        canvasRef.current,
        editorState.selectedImage,
        editorState?.activeTool,
        cropState,
        adjustments,
        colorAdjustments,
        shadow,
        duotone,
        brushMode,
        blurMaskCanvasRef.current,
        blurMaskCtxRef.current,
        brushSettings,
        []
      );
    }, [
      editorState?.selectedImage,
      editorState?.activeTool,
      cropState,
      adjustments,
      colorAdjustments,
      shadow,
      duotone,
      brushMode,
      brushSettings,
      textElements,
    ]);

    useEffect(() => {
      drawCanvas();
    }, [drawCanvas, renderTrigger]);

    const startDrawing = useCallback(
      (e) => {
        if (!brushMode || !canvasRef.current) return;
        setIsDrawing(true);
        startDrawingHelper(
          e,
          canvasRef.current,
          cropState,
          editorState?.selectedImage,
          setLastX,
          setLastY,
          isMountedRef
        );
      },
      [brushMode, cropState, editorState?.selectedImage]
    );

    const draw = useCallback(
      (e) => {
        if (!isDrawing || !brushMode || !canvasRef.current) return;
        drawHelper(
          e,
          canvasRef.current,
          cropState,
          editorState?.selectedImage,
          brushSettings,
          blurMaskCtxRef.current,
          lastX,
          lastY,
          setLastX,
          setLastY,
          setRenderTrigger,
          isMountedRef
        );
        notifyStateChange();
      },
      [
        isDrawing,
        brushMode,
        cropState,
        editorState?.selectedImage,
        brushSettings,
        lastX,
        lastY,
        notifyStateChange,
      ]
    );

    const stopDrawing = useCallback(() => {
      setIsDrawing(false);
      notifyStateChange();
    }, [notifyStateChange]);

    const startDrag = (e, id, type) => {
      e.stopPropagation();

      if (type === "overlay") {
        setSelectedOverlayImageId(id);
        setSelectedTextId(null);
      } else if (type === "text") {
        setSelectedTextId(id);
        setSelectedOverlayImageId(null);
      }

      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const elements = type === "overlay" ? overlayImages : textElements;
      const element = elements.find((el) => el.id === id);
      if (!element) return;

      const startX = e.clientX - containerRect.left;
      const startY = e.clientY - containerRect.top;
      const offsetX = startX - element.x;
      const offsetY = startY - element.y;

      dragDataRef.current = {
        id,
        type,
        startX,
        startY,
        offsetX,
        offsetY,
        hasMoved: false,
        action: "drag",
      };

      setIsDragging(true);

      // ✅ Immediately add listeners to allow movement
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("blur", handleEnd);
    };

    const startResize = (e, id, type, direction) => {
      e.stopPropagation();
      if (type === "overlay") {
        setSelectedOverlayImageId(id);
        setSelectedTextId(null);
      } else if (type === "text") {
        setSelectedTextId(id);
        setSelectedOverlayImageId(null);
      }

      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const elements = type === "overlay" ? overlayImages : textElements;
      const element = elements.find((el) => el.id === id);
      if (!element) return;

      const startX = e.clientX - containerRect.left;
      const startY = e.clientY - containerRect.top;
      const startWidth = element.width;
      const startHeight = element.height;
      const startLeft = element.x;
      const startTop = element.y;

      dragDataRef.current = {
        id,
        type,
        direction,
        startX,
        startY,
        startWidth,
        startHeight,
        startLeft,
        startTop,
        hasMoved: false,
        action: "resize",
      };

      setIsDragging(true);
    };

    // const handleMove = throttle((moveEvent) => {
    //   if (!isDragging || !isMountedRef.current || !dragDataRef.current) return;

    //   const {
    //     id,
    //     type,
    //     action,
    //     startX,
    //     startY,
    //     offsetX,
    //     offsetY,
    //     direction,
    //     startWidth,
    //     startHeight,
    //     startLeft,
    //     startTop,
    //   } = dragDataRef.current;

    //   const containerRect = containerRef.current?.getBoundingClientRect();
    //   if (!containerRect) return;

    //   const currentX = moveEvent.clientX - containerRect.left;
    //   const currentY = moveEvent.clientY - containerRect.top;
    //   const dx = currentX - startX;
    //   const dy = currentY - startY;

    //   if (
    //     !dragDataRef.current.hasMoved &&
    //     (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)
    //   ) {
    //     dragDataRef.current.hasMoved = true;
    //   }

    //   if (!dragDataRef.current.hasMoved) return;

    //   if (action === "drag") {
    //     const element =
    //       type === "overlay"
    //         ? overlayImages.find((el) => el.id === id)
    //         : textElements.find((el) => el.id === id);
    //     if (!element) return;

    //     const newX = Math.max(
    //       0,
    //       Math.min(currentX - offsetX, containerRect.width - element.width)
    //     );
    //     const newY = Math.max(
    //       0,
    //       Math.min(currentY - offsetY, containerRect.height - element.height)
    //     );

    //     if (type === "overlay") {
    //       setOverlayImages((prev) => {
    //         const newOverlayImages = prev.map((el) =>
    //           el.id === id ? { ...el, x: newX, y: newY } : el
    //         );
    //         notifyStateChange();
    //         return newOverlayImages;
    //       });
    //     } else if (type === "text") {
    //       console.log("Dragging text to:", newX, newY);

    //       setTextElements((prev) => {
    //         const newTextElements = prev.map((el) =>
    //           el.id === id ? { ...el, x: newX, y: newY } : el
    //         );
    //         setRenderTrigger((t) => t + 1);
    //         notifyStateChange();
    //         return newTextElements;
    //       });
    //     }
    //   } else if (action === "resize") {
    //     let newWidth = startWidth;
    //     let newHeight = startHeight;
    //     let newX = startLeft;
    //     let newY = startTop;

    //     if (type === "overlay") {
    //       const minSize = 20;

    //       if (direction === "e") {
    //         newWidth = Math.max(minSize, startWidth + dx);
    //       }
    //       if (direction === "w") {
    //         newWidth = Math.max(minSize, startWidth - dx);
    //         newX = startLeft + dx;
    //       }
    //       if (direction === "s") {
    //         newHeight = Math.max(minSize, startHeight + dy);
    //       }
    //       if (direction === "n") {
    //         newHeight = Math.max(minSize, startHeight - dy);
    //         newY = startTop + dy;
    //       }
    //       if (["ne", "se"].includes(direction)) {
    //         newWidth = Math.max(minSize, startWidth + dx);
    //       }
    //       if (["nw", "sw"].includes(direction)) {
    //         newWidth = Math.max(minSize, startWidth - dx);
    //         newX = startLeft + dx;
    //       }
    //       if (["sw", "se"].includes(direction)) {
    //         newHeight = Math.max(minSize, startHeight + dy);
    //       }
    //       if (["nw", "ne"].includes(direction)) {
    //         newHeight = Math.max(minSize, startHeight - dy);
    //         newY = startTop + dy;
    //       }

    //       setOverlayImages((prev) => {
    //         const newOverlayImages = prev.map((el) =>
    //           el.id === id
    //             ? {
    //                 ...el,
    //                 width: newWidth,
    //                 height: newHeight,
    //                 x: newX,
    //                 y: newY,
    //               }
    //             : el
    //         );
    //         notifyStateChange();
    //         return newOverlayImages;
    //       });
    //     } else if (type === "text") {
    //       if (["se", "nw", "ne", "sw"].includes(direction)) {
    //         const delta = Math.max(dx, dy);
    //         newWidth = Math.max(10, startWidth + delta);
    //         newHeight = Math.max(10, startHeight + delta);
    //         if (["nw", "sw"].includes(direction)) newX = startLeft - delta;
    //         if (["nw", "ne"].includes(direction)) newY = startTop - delta;
    //       } else {
    //         if (direction.includes("e"))
    //           newWidth = Math.max(10, startWidth + dx);
    //         if (direction.includes("s"))
    //           newHeight = Math.max(10, startHeight + dy);
    //         if (direction.includes("w")) {
    //           newWidth = Math.max(10, startWidth - dx);
    //           newX = startLeft + dx;
    //         }
    //         if (direction.includes("n")) {
    //           newHeight = Math.max(10, startHeight - dy);
    //           newY = startTop + dy;
    //         }
    //       }

    //       setTextElements((prev) => {
    //         const newTextElements = prev.map((el) =>
    //           el.id === id
    //             ? {
    //                 ...el,
    //                 width: newWidth,
    //                 height: newHeight,
    //                 x: newX,
    //                 y: newY,
    //               }
    //             : el
    //         );
    //         notifyStateChange();
    //         return newTextElements;
    //       });
    //     }
    //   }
    // }, 10);

    const handleMove = throttle((moveEvent) => {
      if (!isDragging || !isMountedRef.current || !dragDataRef.current) return;

      const {
        id,
        type,
        action,
        startX,
        startY,
        offsetX,
        offsetY,
        direction,
        startWidth,
        startHeight,
        startLeft,
        startTop,
      } = dragDataRef.current;

      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const currentX = moveEvent.clientX - containerRect.left;
      const currentY = moveEvent.clientY - containerRect.top;
      const dx = currentX - startX;
      const dy = currentY - startY;

      if (
        !dragDataRef.current.hasMoved &&
        (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)
      ) {
        dragDataRef.current.hasMoved = true;
      }

      if (!dragDataRef.current.hasMoved) return;

      if (action === "drag") {
        const element =
          type === "overlay"
            ? overlayImages.find((el) => el.id === id)
            : textElements.find((el) => el.id === id);
        if (!element) return;

        let newX = currentX - offsetX;
        let newY = currentY - offsetY;

        // Optional: Clamp inside canvas
        const width = element.width || 100;
        const height = element.height || 40;
        newX = Math.max(0, Math.min(newX, containerRect.width - width));
        newY = Math.max(0, Math.min(newY, containerRect.height - height));

        if (type === "overlay") {
          setOverlayImages((prev) => {
            const newOverlayImages = prev.map((el) =>
              el.id === id ? { ...el, x: newX, y: newY } : el
            );
            notifyStateChange();
            return newOverlayImages;
          });
        } else if (type === "text") {
          console.log("Dragging text to:", newX, newY);
          setTextElements((prev) => {
            const newTextElements = prev.map((el) =>
              el.id === id ? { ...el, x: newX, y: newY } : el
            );
            setRenderTrigger((t) => t + 1);
            notifyStateChange();
            return newTextElements;
          });
        }
      } else if (action === "resize") {
        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startLeft;
        let newY = startTop;

        if (type === "overlay") {
          const minSize = 20;

          if (direction === "e") {
            newWidth = Math.max(minSize, startWidth + dx);
          }
          if (direction === "w") {
            newWidth = Math.max(minSize, startWidth - dx);
            newX = startLeft + dx;
          }
          if (direction === "s") {
            newHeight = Math.max(minSize, startHeight + dy);
          }
          if (direction === "n") {
            newHeight = Math.max(minSize, startHeight - dy);
            newY = startTop + dy;
          }
          if (["ne", "se"].includes(direction)) {
            newWidth = Math.max(minSize, startWidth + dx);
          }
          if (["nw", "sw"].includes(direction)) {
            newWidth = Math.max(minSize, startWidth - dx);
            newX = startLeft + dx;
          }
          if (["sw", "se"].includes(direction)) {
            newHeight = Math.max(minSize, startHeight + dy);
          }
          if (["nw", "ne"].includes(direction)) {
            newHeight = Math.max(minSize, startHeight - dy);
            newY = startTop + dy;
          }

          setOverlayImages((prev) => {
            const newOverlayImages = prev.map((el) =>
              el.id === id
                ? {
                    ...el,
                    width: newWidth,
                    height: newHeight,
                    x: newX,
                    y: newY,
                  }
                : el
            );
            notifyStateChange();
            return newOverlayImages;
          });
        } else if (type === "text") {
          if (["se", "nw", "ne", "sw"].includes(direction)) {
            const delta = Math.max(dx, dy);
            newWidth = Math.max(10, startWidth + delta);
            newHeight = Math.max(10, startHeight + delta);
            if (["nw", "sw"].includes(direction)) newX = startLeft - delta;
            if (["nw", "ne"].includes(direction)) newY = startTop - delta;
          } else {
            if (direction.includes("e"))
              newWidth = Math.max(10, startWidth + dx);
            if (direction.includes("s"))
              newHeight = Math.max(10, startHeight + dy);
            if (direction.includes("w")) {
              newWidth = Math.max(10, startWidth - dx);
              newX = startLeft + dx;
            }
            if (direction.includes("n")) {
              newHeight = Math.max(10, startHeight - dy);
              newY = startTop + dy;
            }
          }

          setTextElements((prev) => {
            const newTextElements = prev.map((el) =>
              el.id === id
                ? {
                    ...el,
                    width: newWidth,
                    height: newHeight,
                    x: newX,
                    y: newY,
                  }
                : el
            );
            notifyStateChange();
            return newTextElements;
          });
        }
      }
    }, 10);

    const handleEnd = () => {
      setIsDragging(false);
      dragDataRef.current = null;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("blur", handleEnd);
      notifyStateChange();
    };

    useEffect(() => {
      if (isDragging) {
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleEnd);
        window.addEventListener("blur", handleEnd);
        return () => {
          window.removeEventListener("mousemove", handleMove);
          window.removeEventListener("mouseup", handleEnd);
          window.removeEventListener("blur", handleEnd);
        };
      }
    }, [isDragging]);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
      restoreState: (state) => {
        if (!isMountedRef.current) return;
        setTextElements(state.textElements || []);
        setOverlayImages(state.overlayImages || []);
        setCropState(
          state.cropState || {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            aspectRatio: null,
            rotation: 0,
            verticalPerspective: 0,
            horizontalPerspective: 0,
          }
        );
        setAdjustments(
          state.adjustments || {
            temperature: 0,
            tint: 0,
            brightness: 0,
            contrast: 0,
            highlights: 0,
            shadows: 0,
            whites: 0,
            blacks: 0,
            vibrance: 0,
            saturation: 0,
            sharpness: 0,
            clarity: 0,
            grayscale: 0,
            invert: false,
            sepia: 0,
          }
        );
        setColorAdjustments(
          state.colorAdjustments || {
            hue: 0,
            saturation: 0,
            brightness: 0,
          }
        );
        setShadow(
          state.shadow || {
            offsetX: 0,
            offsetY: 0,
            blur: 0,
            color: "rgba(0,0,0,0)",
            opacity: 0,
            size: 0,
            thickness: 0,
            spread: 0,
          }
        );
        setDuotone(state.duotone || null);
        setBrushMode(state.brushMode || false);
        setBrushSettings(
          state.brushSettings || {
            size: 1,
            intensity: 0,
            type: "blur",
          }
        );
        setRenderTrigger((prev) => prev + 1);
      },

      getSelectedText: () => {
        return textElements.find((el) => el.id === selectedTextId) || null;
      },

      getCurrentState: () => ({
        selectedImage: editorState?.selectedImage || "",
        activeTool: editorState?.activeTool || "",
        textElements: textElements || [],
        overlayImages: overlayImages || [],
        cropState,
        adjustments,
        colorAdjustments,
        shadow,
        duotone,
        brushMode,
        brushSettings,
      }),
      addText: ({
        text,
        style,
        font,
        color,
        opacity,
        fontSize,
        fontWeight,
        fontStyle,
        textDecoration,
      }) => {
        if (!isMountedRef.current) return;
        const id = Date.now();
        const resolvedFontSize =
          fontSize ||
          (style === "h1" ? "32px" : style === "h2" ? "24px" : "20px");

        const numericSize = parseInt(resolvedFontSize);
        const defaultWidth = numericSize * 5; // Reduce width
        const defaultHeight = numericSize * 1.4; // Reduce height

        setTextElements((prev) => {
          const newTextElements = [
            ...prev,
            {
              id,
              text: text || "",
              x: 50,
              y: 50,
              fontSize: resolvedFontSize,
              fontFamily: font,
              color,
              opacity: opacity || 1,
              fontWeight: fontWeight || "normal",
              fontStyle: fontStyle || "normal",
              textDecoration: textDecoration || "none",
              width: defaultWidth,
              height: defaultHeight,
            },
          ];
          const newState = {
            selectedImage: editorState.selectedImage,
            activeTool: "text",
            textElements: newTextElements,
            overlayImages,
            cropState,
            adjustments,
            colorAdjustments,
            shadow,
            duotone,
            brushMode,
            brushSettings,
          };
          setTimeout(() => {
            if (isMountedRef.current) {
              onStateChange(newState);
            }
          }, 0);
          setSelectedTextId(id);
          setSelectedOverlayImageId(null);
          return newTextElements;
        });
      },

      addOverlayImage: () => {
        if (overlayImages.length >= MAX_OVERLAY_IMAGES) {
          console.error("Maximum number of overlay images reached");
          return;
        }
        setSelectedTextId(null);
        setSelectedOverlayImageId(null);
        overlayImageInputRef.current?.click();
      },
      updateSelectedText: (props) => {
        if (!isMountedRef.current) return;

        // Immediate estimated size update for fast visual sync
        setTextElements((prev) => {
          const newTextElements = prev.map((el) => {
            if (el.id !== selectedTextId) return el;

            const fontSizePx = parseInt(
              props.fontSize || el.fontSize || "20",
              10
            );
            const text = props.text || el.text || "";
            const fallbackWidth = fontSizePx * Math.max(text.length * 0.6, 5);

            return {
              ...el,
              ...props,
              width: fallbackWidth,
              height: fontSizePx * 1.6,
            };
          });

          const newState = {
            selectedImage: editorState.selectedImage,
            activeTool: editorState.activeTool,
            textElements: newTextElements,
            overlayImages,
            cropState,
            adjustments,
            colorAdjustments,
            shadow,
            duotone,
            brushMode,
            brushSettings,
          };
          setTimeout(() => {
            if (isMountedRef.current) {
              onStateChange(newState);
            }
          }, 0);
          return newTextElements;
        });

        // Optional fine-tuning using actual DOM measurements
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }

        resizeTimeoutRef.current = setTimeout(() => {
          const node = textElementRefs.current[selectedTextId];
          if (!node) return;

          if (props.fontSize) node.style.fontSize = props.fontSize;
          if (props.fontFamily) node.style.fontFamily = props.fontFamily;
          if (props.fontWeight) node.style.fontWeight = props.fontWeight;
          if (props.fontStyle) node.style.fontStyle = props.fontStyle;
          if (props.textDecoration)
            node.style.textDecoration = props.textDecoration;

          node.style.width = "auto";
          node.style.height = "auto";

          void node.offsetWidth;

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const text = node.innerText || "";
              const fontSizePx = parseInt(props.fontSize || "20", 10);
              const fallbackWidth = fontSizePx * Math.max(text.length * 0.6, 5);

              const newWidth = Math.min(
                Math.max(node.scrollWidth + 8, fallbackWidth),
                300
              ); // Limit width to 300
              const newHeight = Math.min(node.scrollHeight, 150); // Limit height to 150

              setTextElements((prev) => {
                const newTextElements = prev.map((el) =>
                  el.id === selectedTextId
                    ? {
                        ...el,
                        width: newWidth,
                        height: newHeight,
                      }
                    : el
                );
                const newState = {
                  selectedImage: editorState.selectedImage,
                  activeTool: editorState.activeTool,
                  textElements: newTextElements,
                  overlayImages,
                  cropState,
                  adjustments,
                  colorAdjustments,
                  shadow,
                  duotone,
                  brushMode,
                  brushSettings,
                };
                setTimeout(() => {
                  if (isMountedRef.current) {
                    onStateChange(newState);
                  }
                }, 0);
                return newTextElements;
              });
            });
          });
        }, 60);
      },

      applyCrop: ({ aspectRatio, reset = false }) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        let newCrop = {
          x: 0,
          y: 0,
          width: canvas.width,
          height: canvas.height,
        };

        if (reset) {
          setCropState((prev) => {
            const newCropState = { ...prev, ...newCrop, aspectRatio: null };
            notifyStateChange();
            return newCropState;
          });
          return;
        }

        if (
          aspectRatio &&
          aspectRatio !== "freeform" &&
          aspectRatio !== "original"
        ) {
          const [w, h] = aspectRatio.split(":").map(Number);
          const targetRatio = w / h;
          let width = canvas.width;
          let height = width / targetRatio;
          if (height > canvas.height) {
            height = canvas.height;
            width = height * targetRatio;
          }
          newCrop = {
            x: (canvas.width - width) / 2,
            y: (canvas.height - height) / 2,
            width,
            height,
            aspectRatio,
          };
        } else if (aspectRatio === "original") {
          const img = new Image();
          img.src = editorState?.selectedImage;
          img.onload = () => {
            if (!isMountedRef.current) return;
            newCrop.aspectRatio = img.width / img.height;
            setCropState((prev) => {
              const newCropState = { ...prev, ...newCrop };
              notifyStateChange();
              return newCropState;
            });
          };
          img.onerror = () => console.error("Error loading image for crop");
          return;
        } else {
          newCrop.aspectRatio = null;
        }

        setCropState((prev) => {
          const newCropState = { ...prev, ...newCrop };
          notifyStateChange();
          return newCropState;
        });
      },
      applyRotation: (rotation) => {
        if (!isMountedRef.current) return;
        setCropState((prev) => {
          const newCropState = { ...prev, rotation };
          notifyStateChange();
          return newCropState;
        });
      },
      applyPerspective: ({ vertical, horizontal }) => {
        if (!isMountedRef.current) return;
        setCropState((prev) => {
          const newCropState = {
            ...prev,
            verticalPerspective: vertical,
            horizontalPerspective: horizontal,
          };
          notifyStateChange();
          return newCropState;
        });
      },
      applyAdjustments: (newAdjustments) => {
        if (!isMountedRef.current) return;
        setAdjustments((prev) => {
          const newAdjustmentsState = {
            temperature: 0,
            tint: 0,
            brightness: 0,
            contrast: 0,
            highlights: 0,
            shadows: 0,
            whites: 0,
            blacks: 0,
            vibrance: 0,
            saturation: 0,
            sharpness: 0,
            clarity: 0,
            grayscale: 0,
            invert: false,
            sepia: 0,
            ...newAdjustments,
          };
          notifyStateChange();
          return newAdjustmentsState;
        });
        setRenderTrigger((prev) => prev + 1);
      },
      applyColorAdjustments: (newColorAdjustments) => {
        if (!isMountedRef.current) return;
        setColorAdjustments((prev) => {
          const newColorAdjustmentsState = {
            hue: 0,
            saturation: 0,
            brightness: 0,
            ...newColorAdjustments,
          };
          notifyStateChange();
          return newColorAdjustmentsState;
        });
        setRenderTrigger((prev) => prev + 1);
      },
      applyFilter: ({ adjustments, colorAdjustments, duotone }) => {
        if (!isMountedRef.current) return;
        setAdjustments({
          temperature: 0,
          tint: 0,
          brightness: 0,
          contrast: 0,
          highlights: 0,
          shadows: 0,
          whites: 0,
          blacks: 0,
          vibrance: 0,
          saturation: 0,
          sharpness: 0,
          clarity: 0,
          grayscale: 0,
          invert: false,
          sepia: 0,
          ...adjustments,
        });
        setColorAdjustments({
          hue: 0,
          saturation: 0,
          brightness: 0,
          ...colorAdjustments,
        });
        setDuotone(duotone || null);
        setRenderTrigger((prev) => prev + 1);
        notifyStateChange();
      },
      applyShadow: (shadowProps) => {
        if (!isMountedRef.current) return;
        setShadow({
          offsetX: 0,
          offsetY: 0,
          blur: 0,
          color: "rgba(0,0,0,0)",
          opacity: 0,
          size: 0,
          thickness: 0,
          spread: 0,
          ...shadowProps,
        });
        setRenderTrigger((prev) => prev + 1);
        notifyStateChange();
      },
      finalizeCrop: () => {
        if (!canvasRef.current || !cropState.width || !cropState.height) {
          console.warn("Cannot finalize crop: invalid canvas or crop state");
          return;
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("Canvas context not available");
          return;
        }
        const img = new Image();
        img.onload = () => {
          if (!isMountedRef.current) return;
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = cropState.width;
          tempCanvas.height = cropState.height;
          const tempCtx = tempCanvas.getContext("2d");
          if (!tempCtx) {
            console.error("Temp canvas context not available");
            return;
          }

          tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
          tempCtx.rotate((cropState.rotation * Math.PI) / 180);
          const vScale = 1 + cropState.verticalPerspective / 100;
          const hScale = 1 + cropState.horizontalPerspective / 100;
          tempCtx.scale(hScale, vScale);
          tempCtx.translate(-tempCanvas.width / 2, -tempCanvas.height / 2);
          applyAdjustmentsToContext(
            tempCtx,
            img,
            adjustments,
            colorAdjustments,
            duotone,
            brushMode,
            blurMaskCanvasRef.current,
            brushSettings
          );

          const overlayPromises = overlayImages.map((overlay) => {
            return new Promise((resolve) => {
              const overlayImg = new Image();
              overlayImg.src = overlay.src;
              overlayImg.onload = () => {
                tempCtx.globalAlpha = overlay.opacity;
                tempCtx.drawImage(
                  overlayImg,
                  overlay.x - cropState.x,
                  overlay.y - cropState.y,
                  overlay.width,
                  overlay.height
                );
                tempCtx.globalAlpha = 1;
                resolve();
              };
              overlayImg.onerror = () => {
                console.error("Error loading overlay image during crop");
                resolve();
              };
            });
          });

          Promise.all(overlayPromises).then(() => {
            if (!isMountedRef.current) return;
            textElements.forEach((el) => {
              tempCtx.font = `${el.fontStyle} ${el.fontWeight} ${el.fontSize} ${el.fontFamily}`;
              tempCtx.fillStyle = el.color;
              tempCtx.globalAlpha = el.opacity;
              tempCtx.textDecoration = el.textDecoration;
              tempCtx.fillText(
                el.text,
                el.x - cropState.x,
                el.y - cropState.y + parseInt(el.fontSize)
              );
              tempCtx.globalAlpha = 1;
            });

            canvas.width = cropState.width;
            canvas.height = cropState.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(tempCanvas, 0, 0);

            const newImageUrl = canvas.toDataURL();
            const newState = {
              selectedImage: newImageUrl,
              activeTool: editorState?.activeTool,
              textElements: [],
              overlayImages: [],
              cropState: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                aspectRatio: null,
                rotation: 0,
                verticalPerspective: 0,
                horizontalPerspective: 0,
              },
              adjustments,
              colorAdjustments,
              shadow,
              duotone,
              brushMode,
              brushSettings,
            };
            onImageUpload(newImageUrl);
            setOverlayImages([]);
            setTextElements([]);
            setCropState(newState.cropState);
            notifyStateChange();

            blurMaskCanvasRef.current.width = cropState.width;
            blurMaskCanvasRef.current.height = cropState.height;
            blurMaskCtxRef.current.fillStyle = "rgba(0, 0, 0, 0)";
            blurMaskCtxRef.current.fillRect(
              0,
              0,
              cropState.width,
              cropState.height
            );
          });
        };
        img.onerror = () => console.error("Error loading image for crop");
        img.src = editorState?.selectedImage;
      },
      enableBrushMode: (settings) => {
        if (!isMountedRef.current) return;
        setBrushMode(true);
        setBrushSettings(settings);
        if (canvasRef.current) {
          canvasRef.current.style.cursor = "crosshair";
        }
        notifyStateChange();
      },
      updateBrushSettings: (settings) => {
        if (!isMountedRef.current) return;
        setBrushSettings(settings);
        notifyStateChange();
      },
      disableBrushMode: () => {
        if (!isMountedRef.current) return;
        setBrushMode(false);
        if (canvasRef.current) {
          canvasRef.current.style.cursor = "default";
        }
        notifyStateChange();
      },
      resetBrush: () => {
        if (!isMountedRef.current || !blurMaskCanvasRef.current) return;
        blurMaskCtxRef.current.clearRect(
          0,
          0,
          blurMaskCanvasRef.current.width,
          blurMaskCanvasRef.current.height
        );
        blurMaskCtxRef.current.fillStyle = "rgba(0, 0, 0, 0)";
        blurMaskCtxRef.current.fillRect(
          0,
          0,
          blurMaskCanvasRef.current.width,
          blurMaskCanvasRef.current.height
        );
        setRenderTrigger((prev) => prev + 1);
        notifyStateChange();
      },
      downloadImage: () => {
        if (!editorState?.selectedImage || !canvasRef.current) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const editorCanvas = canvasRef.current;
        canvas.width = editorCanvas.width;
        canvas.height = editorCanvas.height;

        const canvasRect = editorCanvas.getBoundingClientRect();
        const scaleX = editorCanvas.width / canvasRect.width;
        const scaleY = editorCanvas.height / canvasRect.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const baseImage = new Image();
        baseImage.onload = () => {
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((cropState.rotation * Math.PI) / 180);
          const vScale = 1 + cropState.verticalPerspective / 100;
          const hScale = 1 + cropState.horizontalPerspective / 100;
          ctx.scale(hScale, vScale);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
          ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
          applyAdjustmentsToContext(
            ctx,
            baseImage,
            adjustments,
            colorAdjustments,
            duotone,
            brushMode,
            blurMaskCanvasRef.current,
            brushSettings
          );
          ctx.restore();

          const overlayPromises = overlayImages.map((overlay) => {
            return new Promise((resolve) => {
              const img = new Image();
              img.src = overlay.src;
              img.onload = () => {
                ctx.globalAlpha = overlay.opacity;
                const scaledX = (overlay.x - cropState.x) * scaleX;
                const scaledY = (overlay.y - cropState.y) * scaleY;
                const scaledWidth = overlay.width * scaleX;
                const scaledHeight = overlay.height * scaleY;
                ctx.drawImage(img, scaledX, scaledY, scaledWidth, scaledHeight);
                ctx.globalAlpha = 1;
                resolve();
              };
              img.onerror = () => {
                console.error("Error loading overlay image during download");
                resolve();
              };
            });
          });

          Promise.all(overlayPromises).then(() => {
            textElements.forEach((el) => {
              const scaledFontSize = parseInt(el.fontSize) * scaleY;
              ctx.font = `${el.fontStyle} ${el.fontWeight} ${scaledFontSize}px ${el.fontFamily}`;
              ctx.fillStyle = el.color;
              ctx.globalAlpha = el.opacity;
              ctx.textBaseline = "top";
              const scaledX = (el.x - cropState.x) * scaleX;
              const scaledY = (el.y - cropState.y) * scaleY;
              ctx.fillText(el.text, scaledX, scaledY);
              ctx.globalAlpha = 1;
            });

            setTimeout(() => {
              const link = document.createElement("a");
              link.download = "edited-image.png";
              link.href = canvas.toDataURL("image/png");
              link.click();
            }, 500);
          });
        };

        baseImage.onerror = () =>
          console.error("Error loading base image for download");
        baseImage.src = editorState?.selectedImage;
      },
    }));

    const handleCanvasClick = (e) => {
      e.stopPropagation();
      if (e.target === canvasRef.current) {
        setToolbarVisible((prev) => !prev);
        setSelectedOverlayImageId(null);
        setSelectedTextId(null);
      }
    };

    const handleContainerClick = (e) => {
      if (e.target === containerRef.current) {
        setSelectedTextId(null);
        setSelectedOverlayImageId(null);
        setToolbarVisible(false);
        if (
          document.activeElement?.classList.contains("text-overlay-element")
        ) {
          document.activeElement.blur();
        }
      }
    };

    const handleTextKeyDown = (e) => {
      if (["Delete", "Backspace", "Enter"].includes(e.key)) {
        e.stopPropagation();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        document.execCommand("insertText", false, "\n");
      }
    };

    const handleTextInput = useCallback(
      (id, text) => {
        const normalizedText = text.normalize();
        setTextElements((prev) => {
          const newTextElements = prev.map((item) =>
            item.id === id ? { ...item, text: normalizedText } : item
          );
          const newState = {
            selectedImage: editorState.selectedImage,
            activeTool: editorState.activeTool,
            textElements: newTextElements,
            overlayImages,
            cropState,
            adjustments,
            colorAdjustments,
            shadow,
            duotone,
            brushMode,
            brushSettings,
          };
          setTimeout(() => {
            if (isMountedRef.current) {
              onStateChange(newState);
            }
          }, 0);
          return newTextElements;
        });
      },
      [
        editorState?.selectedImage,
        editorState?.activeTool,
        overlayImages,
        cropState,
        adjustments,
        colorAdjustments,
        shadow,
        duotone,
        brushMode,
        brushSettings,
        onStateChange,
      ]
    );

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "Delete") {
          if (selectedTextId !== null) {
            setTextElements((prev) => {
              const newTextElements = prev.filter(
                (el) => el.id !== selectedTextId
              );
              const newState = {
                selectedImage: editorState.selectedImage,
                activeTool: editorState.activeTool,
                textElements: newTextElements,
                overlayImages,
                cropState,
                adjustments,
                colorAdjustments,
                shadow,
                duotone,
                brushMode,
                brushSettings,
              };
              setTimeout(() => {
                if (isMountedRef.current) {
                  onStateChange(newState);
                }
              }, 0);
              return newTextElements;
            });
            setSelectedTextId(null);
            e.preventDefault();
            e.stopPropagation();
          } else if (selectedOverlayImageId !== null) {
            setOverlayImages((prev) => {
              const newOverlayImages = prev.filter(
                (el) => el.id !== selectedOverlayImageId
              );
              const newState = {
                selectedImage: editorState.selectedImage,
                activeTool: editorState.activeTool,
                textElements,
                overlayImages: newOverlayImages,
                cropState,
                adjustments,
                colorAdjustments,
                shadow,
                duotone,
                brushMode,
                brushSettings,
              };
              setTimeout(() => {
                if (isMountedRef.current) {
                  onStateChange(newState);
                }
              }, 0);
              return newOverlayImages;
            });
            setSelectedOverlayImageId(null);
            e.preventDefault();
            e.stopPropagation();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [
      selectedTextId,
      selectedOverlayImageId,
      editorState?.selectedImage,
      editorState?.activeTool,
      textElements,
      overlayImages,
      cropState,
      adjustments,
      colorAdjustments,
      shadow,
      duotone,
      brushMode,
      brushSettings,
      onStateChange,
    ]);

    if (!editorState?.selectedImage) {
      return (
        <div className="image-editor">
          <div
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-content">
              <FaCloudUploadAlt className="upload-icon" />
              <h3>Drag & drop your image here</h3>
              <p>or click to browse</p>
              <span>Supports: JPG, PNG, GIF, WebP</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              style={{ display: "none" }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="image-editor" dir="ltr">
        <div
          className="canvas-container"
          ref={containerRef}
          style={{ position: "relative" }}
          onClick={handleContainerClick}
        >
          <canvas
            ref={canvasRef}
            className="image-canvas"
            onClick={handleCanvasClick}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
          />
          {/* {textElements.map((el) => (
            <div
              key={el.id}
              className="text-overlay-element-wrapper"
              style={{
                position: "absolute",
                top: el.y,
                left: el.x,
                width: el.width,
                height: el.height,
                zIndex: 100,
              }}
            >
              <div
                className="text-overlay-element"
                dir="auto"
                contentEditable
                tabIndex={0}
                suppressContentEditableWarning
                style={{
                  width: "100%",
                  height: "100%",
                  fontSize: el.fontSize,
                  fontFamily: el.fontFamily,
                  color: el.color,
                  opacity: el.opacity,
                  fontWeight: el.fontWeight,
                  fontStyle: el.fontStyle,
                  textDecoration: el.textDecoration,
                  padding: "4px",
                  background: "transparent",
                  border:
                    selectedTextId === el.id
                      ? "2px solid #8B5CF6"
                      : "1px solid transparent",
                  overflow: "visible",
                  outline: "none",
                  cursor: "move",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 40,
                }}
                draggable={false}
                ref={(node) => {
                  if (node) {
                    textElementRefs.current[el.id] = node;
                    if (!node.innerText) {
                      node.innerText = el.text;
                    }
                  }
                }}
                onMouseDown={(e) => {
                  if (e.target === textElementRefs.current[el.id]) {
                    startDrag(e, el.id, "text");
                  }
                }}
                onFocus={() => setSelectedTextId(el.id)}
                onBlur={() => {
                  const text = textElementRefs.current[el.id]?.innerText || "";
                  handleTextInput(el.id, text);
                }}
                onInput={(e) => {
                  const text = e.target.innerText;
                  handleTextInput(el.id, text);

                  const currentNode = textElementRefs.current[el.id];
                  if (currentNode) {
                    const newHeight = currentNode.scrollHeight;
                    setTextElements((prev) => {
                      const newTextElements = prev.map((item) =>
                        item.id === el.id
                          ? { ...item, height: newHeight }
                          : item
                      );
                      const newState = {
                        selectedImage: editorState.selectedImage,
                        activeTool: editorState.activeTool,
                        textElements: newTextElements,
                        overlayImages,
                        cropState,
                        adjustments,
                        colorAdjustments,
                        shadow,
                        duotone,
                        brushMode,
                        brushSettings,
                      };
                      setTimeout(() => {
                        if (isMountedRef.current) {
                          onStateChange(newState);
                        }
                      }, 0);
                      return newTextElements;
                    });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Delete") {
                    setTextElements((prev) => {
                      const newTextElements = prev.filter(
                        (item) => item.id !== el.id
                      );
                      const newState = {
                        selectedImage: editorState.selectedImage,
                        activeTool: editorState.activeTool,
                        textElements: newTextElements,
                        overlayImages,
                        cropState,
                        adjustments,
                        colorAdjustments,
                        shadow,
                        duotone,
                        brushMode,
                        brushSettings,
                      };
                      setTimeout(() => {
                        if (isMountedRef.current) {
                          onStateChange(newState);
                        }
                      }, 0);
                      return newTextElements;
                    });
                    setSelectedTextId(null);
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              />
              {selectedTextId === el.id && (
                <div
                  className="text-move-handle"
                  style={{
                    position: "absolute",
                    bottom: -20, // show below text
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#8B5CF6",
                    color: "#fff",
                    fontSize: "12px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    cursor: "move",
                    userSelect: "none",
                    zIndex: 999,
                  }}
                  onMouseDown={(e) => startDrag(e, el.id, "text")}
                >
                  ↔ Move
                </div>
              )}
            </div>
          ))} */}

          {textElements.map((el) => (
            <div
              key={el.id}
              className="text-overlay-element-wrapper"
              style={{
                position: "absolute",
                top: `${el.y}px`,
                left: `${el.x}px`,
                zIndex: 100,
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  paddingBottom: "24px", // leave space for move button
                }}
              >
                <div
                  className="text-overlay-element"
                  dir="auto"
                  contentEditable
                  tabIndex={0}
                  suppressContentEditableWarning
                  style={{
                    fontSize: el.fontSize,
                    fontFamily: el.fontFamily,
                    color: el.color,
                    opacity: el.opacity,
                    fontWeight: el.fontWeight,
                    fontStyle: el.fontStyle,
                    textDecoration: el.textDecoration,
                    padding: "4px",
                    background: "transparent",
                    border:
                      selectedTextId === el.id
                        ? "2px solid #8B5CF6"
                        : "1px solid transparent",
                    outline: "none",
                    cursor: "move",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    minWidth: 40,
                    // maxWidth: 300,
                  }}
                  draggable={false}
                  ref={(node) => {
                    if (node) {
                      textElementRefs.current[el.id] = node;
                      if (!node.innerText) {
                        node.innerText = el.text;
                      }
                    }
                  }}
                  onMouseDown={(e) => {
                    startDrag(e, el.id, "text");
                  }}
                  onFocus={() => setSelectedTextId(el.id)}
                  onBlur={() => {
                    const text =
                      textElementRefs.current[el.id]?.innerText || "";
                    handleTextInput(el.id, text);
                  }}
                  onInput={(e) => {
                    const text = e.target.innerText;
                    handleTextInput(el.id, text);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Delete") {
                      setTextElements((prev) =>
                        prev.filter((item) => item.id !== el.id)
                      );
                      setSelectedTextId(null);
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                />

                {/* Move handle */}
                {selectedTextId === el.id && (
                  <div
                    className="text-move-handle"
                    onMouseDown={(e) => startDrag(e, el.id, "text")}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      transform: "translate(0%, -110%)",
                      backgroundColor: "#8B5CF6",
                      color: "#fff",
                      fontSize: "12px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      cursor: "move",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                      zIndex: 999,
                    }}
                  >
                    ↔ Move
                  </div>
                )}
              </div>
            </div>
          ))}

          {overlayImages.map((el) => (
            <div
              key={el.id}
              className="overlay-image-element"
              style={{
                position: "absolute",
                top: el.y,
                left: el.x,
                width: el.width,
                height: el.height,
                opacity: el.opacity,
                border:
                  selectedOverlayImageId === el.id
                    ? "2px solid #8B5CF6"
                    : "1px solid transparent",
                cursor: "move",
                zIndex: 50,
              }}
              onMouseDown={(e) => startDrag(e, el.id, "overlay")}
            >
              <img
                src={el.src}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "fill",
                }}
                alt="Overlay"
              />
              {selectedOverlayImageId === el.id && (
                <>
                  {["nw", "n", "ne", "e", "se", "s", "sw", "w"].map((dir) => (
                    <div
                      key={dir}
                      className={`resizer resizer-${dir}`}
                      onMouseDown={(e) => startResize(e, el.id, "overlay", dir)}
                    />
                  ))}
                </>
              )}
            </div>
          ))}
          <input
            ref={overlayImageInputRef}
            type="file"
            accept="image/*"
            onChange={handleOverlayImageInputChange}
            style={{ display: "none" }}
          />
        </div>
      </div>
    );
  }
);

ImageEditor.displayName = "ImageEditor";

export default ImageEditor;
