import React, {
  forwardRef,
  useRef,
  useCallback,
  useState,
  useImperativeHandle,
  useEffect,
} from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import ImageToolbar from "./ImageToolbar";
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
  ({ selectedImage, onImageUpload, activeTool, onToolSelect }, ref) => {
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const overlayImageInputRef = useRef(null);
    const containerRef = useRef(null);
    const textElementRefs = useRef({});
    const [textElements, setTextElements] = useState([]);
    const [overlayImages, setOverlayImages] = useState([]);
    const [selectedTextId, setSelectedTextId] = useState(null);
    const [selectedOverlayImageId, setSelectedOverlayImageId] = useState(null);
    const [cropState, setCropState] = useState({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      aspectRatio: null,
      rotation: 0,
      verticalPerspective: 0,
      horizontalPerspective: 0,
    });
    const initialAdjustments = {
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
    };
    const [adjustments, setAdjustments] = useState(initialAdjustments);
    const [colorAdjustments, setColorAdjustments] = useState({
      hue: 0,
      saturation: 0,
      brightness: 0,
    });
    const initialShadow = {
      offsetX: 0,
      offsetY: 0,
      blur: 0,
      color: "rgba(0,0,0,0)",
      opacity: 0,
      size: 0,
      thickness: 0,
      spread: 0,
    };
    const [shadow, setShadow] = useState(initialShadow);
    const [duotone, setDuotone] = useState(null);
    const [renderTrigger, setRenderTrigger] = useState(0);
    const [toolbarVisible, setToolbarVisible] = useState(false);
    const isMountedRef = useRef(true);

    // Brush-related state
    const [brushMode, setBrushMode] = useState(false);
    const [brushSettings, setBrushSettings] = useState({
      size: 1,
      intensity: 0,
      type: "blur",
    });
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);
    const blurMaskCanvasRef = useRef(document.createElement("canvas"));
    const blurMaskCtxRef = useRef(blurMaskCanvasRef.current.getContext("2d"));

    // Dragging state
    const [isDragging, setIsDragging] = useState(false);
    const dragDataRef = useRef(null);

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
            setOverlayImages((prev) => [
              ...prev,
              {
                id,
                src: imageUrl,
                x: 50,
                y: 50,
                width: Math.min(img.width, 200),
                height: Math.min(img.height, 200 * (img.height / img.width)),
                opacity: 1,
              },
            ]);
            setSelectedOverlayImageId(id);
          };
          img.onerror = () => console.error("Error loading overlay image");
        };
        reader.onerror = () =>
          console.error("Error reading overlay image file");
        reader.readAsDataURL(file);
      },
      [overlayImages]
    );

    const handleDrop = useCallback(
      (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find((file) => file.type.startsWith("image/"));
        if (imageFile) {
          if (selectedImage) {
            handleOverlayImageUpload(imageFile);
          } else {
            handleFileUpload(imageFile);
          }
        }
      },
      [handleFileUpload, handleOverlayImageUpload, selectedImage]
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
      if (!canvasRef.current || !selectedImage) {
        console.warn("Canvas or selected image not available");
        return;
      }
      drawCanvasHelper(
        canvasRef.current,
        selectedImage,
        activeTool,
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
      selectedImage,
      activeTool,
      cropState,
      adjustments,
      colorAdjustments,
      shadow,
      duotone,
      brushMode,
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
          selectedImage,
          setLastX,
          setLastY,
          isMountedRef
        );
      },
      [brushMode, cropState, selectedImage]
    );

    const draw = useCallback(
      (e) => {
        if (!isDrawing || !brushMode || !canvasRef.current) return;
        drawHelper(
          e,
          canvasRef.current,
          cropState,
          selectedImage,
          brushSettings,
          blurMaskCtxRef.current,
          lastX,
          lastY,
          setLastX,
          setLastY,
          setRenderTrigger,
          isMountedRef
        );
      },
      [
        isDrawing,
        brushMode,
        cropState,
        selectedImage,
        brushSettings,
        lastX,
        lastY,
      ]
    );

    const stopDrawing = useCallback(() => {
      setIsDrawing(false);
    }, []);

    // Centralized drag handler
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

      const startX = e.clientX;
      const startY = e.clientY;
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
    };

    // Centralized resize handler
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

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = element.width;
      const startHeight = element.height;
      const startLeft = element.x;
      const startTop = element.y;
      const aspectRatio = element.width / element.height;

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
        aspectRatio,
        hasMoved: false,
        action: "resize",
      };

      setIsDragging(true);
    };

    // Unified move handler
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
        aspectRatio,
      } = dragDataRef.current;

      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (
        !dragDataRef.current.hasMoved &&
        (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)
      ) {
        dragDataRef.current.hasMoved = true;
      }

      if (!dragDataRef.current.hasMoved) return;

      if (action === "drag") {
        const newX = moveEvent.clientX - offsetX;
        const newY = moveEvent.clientY - offsetY;

        if (type === "overlay") {
          setOverlayImages((prev) =>
            prev.map((el) => (el.id === id ? { ...el, x: newX, y: newY } : el))
          );
        } else if (type === "text") {
          setTextElements((prev) =>
            prev.map((el) => (el.id === id ? { ...el, x: newX, y: newY } : el))
          );
        }
      } else if (action === "resize") {
        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startLeft;
        let newY = startTop;

        if (type === "overlay") {
          const minSize = 20;
          if (direction.includes("e")) {
            newWidth = Math.max(minSize, startWidth + dx);
            newHeight = newWidth / aspectRatio;
          }
          if (direction.includes("s")) {
            newHeight = Math.max(minSize, startHeight + dy);
            newWidth = newHeight * aspectRatio;
          }
          if (direction.includes("w")) {
            newWidth = Math.max(minSize, startWidth - dx);
            newHeight = newWidth / aspectRatio;
            newX = startLeft + (startWidth - newWidth);
          }
          if (direction.includes("n")) {
            newHeight = Math.max(minSize, startHeight - dy);
            newWidth = newHeight * aspectRatio;
            newY = startTop + (startHeight - newHeight);
          }

          setOverlayImages((prev) =>
            prev.map((el) =>
              el.id === id
                ? {
                    ...el,
                    width: newWidth,
                    height: newHeight,
                    x: newX,
                    y: newY,
                  }
                : el
            )
          );
        } else if (type === "text") {
          if (direction.includes("e")) newWidth = Math.max(10, startWidth + dx);
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

          setTextElements((prev) =>
            prev.map((el) =>
              el.id === id
                ? {
                    ...el,
                    width: newWidth,
                    height: newHeight,
                    x: newX,
                    y: newY,
                  }
                : el
            )
          );
        }
      }
    }, 10);

    // Unified end handler
    const handleEnd = () => {
      setIsDragging(false);
      dragDataRef.current = null;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("blur", handleEnd);
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
      addText: ({
        text,
        style,
        font,
        color,
        opacity,
        fontWeight,
        fontStyle,
        textDecoration,
      }) => {
        if (!isMountedRef.current) return;
        const id = Date.now();
        const fontSize =
          style === "h1" ? "32px" : style === "h2" ? "24px" : "20px";

        setTextElements((prev) => [
          ...prev,
          {
            id,
            text: text || "",
            x: 50,
            y: 50,
            fontSize,
            fontFamily: font,
            color,
            opacity: opacity || 1,
            fontWeight: fontWeight || "normal",
            fontStyle: fontStyle || "normal",
            textDecoration: textDecoration || "none",
            width: 200,
            height: 50,
          },
        ]);
        setSelectedTextId(id);
      },
      addOverlayImage: () => {
        if (overlayImages.length >= MAX_OVERLAY_IMAGES) {
          console.error("Maximum number of overlay images reached");
          return;
        }
        overlayImageInputRef.current?.click();
      },
      updateSelectedText: (props) => {
        if (!isMountedRef.current) return;
        setTextElements((prev) =>
          prev.map((el) =>
            el.id === selectedTextId ? { ...el, ...props } : el
          )
        );
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
          setCropState((prev) => ({ ...prev, ...newCrop, aspectRatio: null }));
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
          img.src = selectedImage;
          img.onload = () => {
            if (!isMountedRef.current) return;
            newCrop.aspectRatio = img.width / img.height;
            setCropState((prev) => ({ ...prev, ...newCrop }));
          };
          img.onerror = () => console.error("Error loading image for crop");
          return;
        } else {
          newCrop.aspectRatio = null;
        }

        setCropState((prev) => ({ ...prev, ...newCrop }));
      },
      applyRotation: (rotation) => {
        if (!isMountedRef.current) return;
        setCropState((prev) => ({ ...prev, rotation }));
      },
      applyPerspective: ({ vertical, horizontal }) => {
        if (!isMountedRef.current) return;
        setCropState((prev) => ({
          ...prev,
          verticalPerspective: vertical,
          horizontalPerspective: horizontal,
        }));
      },
      applyAdjustments: (newAdjustments) => {
        if (!isMountedRef.current) return;
        setAdjustments((prev) => ({
          ...initialAdjustments,
          ...newAdjustments,
        }));
        setRenderTrigger((prev) => prev + 1);
      },
      applyColorAdjustments: (newColorAdjustments) => {
        if (!isMountedRef.current) return;
        setColorAdjustments((prev) => ({
          hue: 0,
          saturation: 0,
          brightness: 0,
          ...newColorAdjustments,
        }));
        setRenderTrigger((prev) => prev + 1);
      },
      applyFilter: ({ adjustments, colorAdjustments, duotone }) => {
        if (!isMountedRef.current) return;
        setAdjustments({
          ...initialAdjustments,
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
      },
      applyShadow: (shadowProps) => {
        if (!isMountedRef.current) return;
        setShadow({
          ...initialShadow,
          ...shadowProps,
        });
        setRenderTrigger((prev) => prev + 1);
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
            onImageUpload(newImageUrl);

            setCropState({
              x: 0,
              y: 0,
              width: 0,
              height: 0,
              aspectRatio: null,
              rotation: 0,
              verticalPerspective: 0,
              horizontalPerspective: 0,
            });
            setOverlayImages([]);
            setTextElements([]);

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
        img.src = selectedImage;
      },
      enableBrushMode: (settings) => {
        if (!isMountedRef.current) return;
        setBrushMode(true);
        setBrushSettings(settings);
        if (canvasRef.current) {
          canvasRef.current.style.cursor = "crosshair";
        }
      },
      updateBrushSettings: (settings) => {
        if (!isMountedRef.current) return;
        setBrushSettings(settings);
      },
      disableBrushMode: () => {
        if (!isMountedRef.current) return;
        setBrushMode(false);
        if (canvasRef.current) {
          canvasRef.current.style.cursor = "default";
        }
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

    const handleTextInput = useCallback((id, text) => {
      const normalizedText = text.normalize();
      console.log(`Input text for ID ${id}: ${normalizedText}`);
      setTextElements((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, text: normalizedText } : item
        )
      );
    }, []);

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (["Backspace", "Delete"].includes(e.key)) {
          if (selectedTextId !== null) {
            setTextElements((prev) =>
              prev.filter((el) => el.id !== selectedTextId)
            );
            setSelectedTextId(null);
            e.preventDefault();
            e.stopPropagation();
          } else if (selectedOverlayImageId !== null) {
            setOverlayImages((prev) =>
              prev.filter((el) => el.id !== selectedOverlayImageId)
            );
            setSelectedOverlayImageId(null);
            e.preventDefault();
            e.stopPropagation();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [selectedTextId, selectedOverlayImageId]);

    if (!selectedImage) {
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
        <ImageToolbar
          visible={toolbarVisible}
          onToolSelect={(toolId) => {
            onToolSelect(toolId);
            if (toolId === "add-image") {
              overlayImageInputRef.current?.click();
            }
            setToolbarVisible(false);
          }}
          onClose={() => setToolbarVisible(false)}
        />
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
          {textElements.map((el) => (
            <div
              key={el.id}
              className="text-overlay-element"
              dir="auto"
              style={{
                position: "absolute",
                top: el.y,
                left: el.x,
                minWidth: el.width,
                width: "auto",
                minHeight: el.height,
                height: "auto",
                fontSize: el.fontSize,
                fontFamily: el.fontFamily,
                color: el.color,
                opacity: el.opacity,
                fontWeight: el.fontWeight,
                fontStyle: el.fontStyle,
                textDecoration: el.textDecoration,
                border:
                  selectedTextId === el.id
                    ? "2px solid #8B5CF6"
                    : "1px solid transparent",
                padding: "4px",
                background: "transparent",
                cursor: "move",
                userSelect: "none",
                outline: "none",
                whiteSpace: "pre-wrap",
              }}
              contentEditable
              tabIndex={0}
              suppressContentEditableWarning
              draggable={false}
              ref={(node) => {
                if (node) {
                  textElementRefs.current[el.id] = node;
                  if (!node.innerText) {
                    node.innerText = el.text; // ✅ inject initial text once
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
                console.log(`Raw input event text: ${text}`);
                handleTextInput(el.id, text);
              }}
              onKeyDown={(e) => {
                if (["Backspace", "Delete"].includes(e.key)) {
                  // Delete the selected text element immediately
                  setTextElements((prev) =>
                    prev.filter((item) => item.id !== el.id)
                  );
                  setSelectedTextId(null);
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            />
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
                  objectFit: "contain",
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
