
import { TbRectangle } from "react-icons/tb";
import { IoMdDownload } from "react-icons/io";
import { FaLongArrowAltRight } from "react-icons/fa";
import { LuPencil } from "react-icons/lu";
import { GiArrowCursor } from "react-icons/gi";
import { FaRegCircle } from "react-icons/fa6";
import {
  Arrow,
  Circle,
  Layer,
  Line,
  Rect,
  Stage,
  Transformer,
  Image,
  Text as KonvaText
} from "react-konva";
import React, { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ACTIONS } from "./constants";

export default function App() {
  const stageRef = useRef();
  const [action, setAction] = useState(ACTIONS.SELECT);
  const [fillColor, setFillColor] = useState("#ff0000");
  const [strokeColor1, setstrokeColor1] = useState("black");

  const [rectangles, setRectangles] = useState([]);
  const [circles, setCircles] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [scribbles, setScribbles] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePositions, setImagePositions] = useState([]);
  const [isTextInputVisible, setTextInputVisible] = useState(false);
  const [textValue, setTextValue] = useState("");
  const [texts, setTexts] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [textSelected, settextSelected] = useState(false)
  const [SelectedShapeId, setSelectedShapeId] = useState(null)
  const textInputRef = useRef()

  const textOutputRef = useRef()


  // FUNCTIONS 
  const handleTextSubmit = () => {
    const stage = stageRef.current;
    const { x, y } = stage.getPointerPosition();

    setTexts((texts) => [
      ...texts,
      { x, y, text: textValue, id: uuidv4() },
    ]);

    setTextValue("");
    setTextInputVisible(false);
  };

  const strokeColor = "#000";
  const isPaining = useRef();
  const currentShapeId = useRef();
  const transformerRef = useRef();

  const isDraggable = action === ACTIONS.SELECT;

  const handleZoom = (e) => {
    const newZoom = parseFloat(e.target.value);
    const stage = stageRef.current;
    const scale = {
      x: newZoom,
      y: newZoom,
    };
    stage.scale(scale);
    stage.batchDraw();
    console.log("ZOOMED");
  };

  function onPointerDown() {
    if (action === ACTIONS.SELECT) return;

    const stage = stageRef.current;
    const { x, y } = stage.getPointerPosition();
    const id = uuidv4();

    currentShapeId.current = id;
    isPaining.current = true;

    switch (action) {
      case ACTIONS.RECTANGLE:
        setRectangles((rectangles) => [
          ...rectangles,
          {
            id,
            x,
            y,
            height: 20,
            width: 20,
            fillColor,
          },
        ]);
        break;
      case ACTIONS.CIRCLE:
        setCircles((circles) => [
          ...circles,
          {
            id,
            x,
            y,
            radius: 20,
            fillColor,
          },
        ]);
        break;

      case ACTIONS.ARROW:
        setArrows((arrows) => [
          ...arrows,
          {
            id,
            points: [x, y, x + 20, y + 20],
            fillColor,
          },
        ]);
        break;
      case ACTIONS.SCRIBBLE:
        setScribbles((scribbles) => [
          ...scribbles,
          {
            id,
            points: [x, y],
            fillColor,
          },
        ]);
        break;
    }
  }

  const uploadImage = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.src = reader.result;
        img.onload = () => {
          setImages((prevImages) => [...prevImages, img]);
          setImagePositions((prevPositions) => [
            ...prevPositions,
            { x: 0, y: 0 },
          ]);
        };
      };
      reader.readAsDataURL(file);
    });
    console.log("images uploaded");
  };
  const textAdd = () => {
    console.log("added");
    setTextInputVisible(true)



  };
  const ChangeValue = (e) => {
    setTextValue(e.target.value)
    console.log("valye is ", textValue);
  }

  function onPointerMove() {
    if (action === ACTIONS.SELECT || !isPaining.current) return;

    const stage = stageRef.current;
    const { x, y } = stage.getPointerPosition();

    switch (action) {
      case ACTIONS.RECTANGLE:
        setRectangles((rectangles) =>
          rectangles.map((rectangle) => {
            if (rectangle.id === currentShapeId.current) {
              return {
                ...rectangle,
                width: x - rectangle.x,
                height: y - rectangle.y,
              };
            }
            return rectangle;
          })
        );
        break;
      case ACTIONS.CIRCLE:
        setCircles((circles) =>
          circles.map((circle) => {
            if (circle.id === currentShapeId.current) {
              return {
                ...circle,
                radius: ((y - circle.y) ** 2 + (x - circle.x) ** 2) ** 0.5,
              };
            }
            return circle;
          })
        );
        break;
      case ACTIONS.ARROW:
        setArrows((arrows) =>
          arrows.map((arrow) => {
            if (arrow.id === currentShapeId.current) {
              return {
                ...arrow,
                points: [arrow.points[0], arrow.points[1], x, y],
              };
            }
            return arrow;
          })
        );
        break;
      case ACTIONS.SCRIBBLE:
        setScribbles((scribbles) =>
          scribbles.map((scribble) => {
            if (scribble.id === currentShapeId.current) {
              return {
                ...scribble,
                points: [...scribble.points, x, y],
                strokeColor1
              };
            }
            return scribble;
          })
        );
        break;
    }
  }

  function onPointerUp() {
    isPaining.current = false;
  }

  function handleExport() {
    const uri = stageRef.current.toDataURL();
    var link = document.createElement("a");
    link.download = "image.png";
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // function onClick(e) {
  //   if (action !== ACTIONS.SELECT) return;
  //   if (textValue !== "") {
  //     var newid = textOutput.id;
  //     handleTextSubmit(newid)
  //   }
  //   const target = e.currentTarget;
  //   transformerRef.current.nodes([target]);
  // }
  // const handleTextClick = (id) => {
  //   setSelectedTextId(id);
  //   setFillColor(texts.find((text) => text.id === id)?.fill);
  //   onClick()
  // };



  const newColor = (e) => {
    setFillColor(e.target.value)
    setstrokeColor1(e.target.value)
  }



  const handleTextClick = (id) => {
    if (textSelected) {

      settextSelected(false)
      transformerRef.current.nodes([]);

    }
    setSelectedTextId(id);
    const selectedText = texts.find((text) => text.id === id);
    setFillColor(selectedText ? selectedText.fillColor : "#000000");
    settextSelected(true)
    transformerRef.current.nodes([textOutputRef.current]);

  };

  const onClick = (e) => {
    if (action !== ACTIONS.SELECT) return;

    const target = e.currentTarget;
    transformerRef.current.nodes([target]);
  };



  return (
    <>
      <div className="relative w-full h-screen overflow-hidden">
        {/* Controls */}
        <div className="absolute top-0 z-10 w-full py-2 ">
          <div className="flex justify-center items-center gap-3 py-2 px-3 w-fit mx-auto border shadow-lg rounded-lg">
            <button
              className={
                action === ACTIONS.SELECT
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.SELECT)}
            >
              <GiArrowCursor size={"2rem"} />
            </button>
            <button
              className={
                action === ACTIONS.RECTANGLE
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.RECTANGLE)}
            >
              <TbRectangle size={"2rem"} />
            </button>
            <button
              className={
                action === ACTIONS.CIRCLE
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.CIRCLE)}
            >
              <FaRegCircle size={"1.5rem"} />
            </button>
            <button
              className={
                action === ACTIONS.ARROW
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.ARROW)}
            >
              <FaLongArrowAltRight size={"2rem"} />
            </button>
            <button
              className={
                action === ACTIONS.SCRIBBLE
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.SCRIBBLE)}
            >
              <LuPencil size={"1.5rem"} />
            </button>

            <button>

              <input
                className="w-6 h-6"
                type="color"
                value={fillColor}
                // onChange={(e) => setFillColor(e.target.value)}
                onChange={newColor}
              />
            </button>

            <button onClick={handleExport}>
              <IoMdDownload size={"1.5rem"} />
            </button>
            <div className="flex flex-col items-center">
              <div>ZOOM LEVEL</div>
              <input
                type="range"
                min={0.3}
                defaultValue={0.6}
                max={1.4}
                step={0.1}
                onChange={handleZoom}
              />
            </div>
            <div

              className={
                action === ACTIONS.UPLOAD
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.UPLOAD)}
            >

              <label className="upload-button hover:cursor-pointer">
                Upload
                <input type="file" className="hidden" onChange={uploadImage} />
              </label>
            </div>

            <div

              className={
                action === ACTIONS.TEXT
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.TEXT)}
            >
              <button onClick={textAdd}>TEXT</button>
            </div>
          </div>
        </div>

        {isTextInputVisible && (
          <div className="absolute z-20 flex flex-col items-center  border p-2 rounded justify-center">
            <div className="flex flex-col items-center bg-blue-400 p-4">


              <input
                ref={textInputRef}
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                className="border p-1 rounded"
              />
              <button
                onClick={handleTextSubmit}
                className="bg-green-700 text-white p-1 rounded mt-2"
              >
                Submit
              </button>
            </div>
          </div>
        )}
        {/* CANVAS  */}
        <Stage
          ref={stageRef}
          width={window.innerWidth}
          height={window.innerHeight}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <Layer>
            <Rect
              x={0}
              y={0}
              height={window.innerHeight}
              width={window.innerWidth}
              // fill="#EBF4F6"
              // fill="pink"

              id="bg"
              onClick={() => {
                transformerRef.current.nodes([]);
                setSelectedTextId(null);
              }}
            />
            {images.map((image, index) => (
              <Image
                key={index}
                image={image}
                x={imagePositions[index].x}
                y={imagePositions[index].y}
                draggable={isDraggable}
                onClick={onClick}
                onDragEnd={(e) => {
                  const newPositions = [...imagePositions];
                  newPositions[index] = {
                    x: e.target.x(),
                    y: e.target.y(),
                  };
                  setImagePositions(newPositions);
                }}
              />
            ))}

            {rectangles.map((rectangle) => (
              <Rect
                key={rectangle.id}
                x={rectangle.x}
                y={rectangle.y}
                stroke={strokeColor}
                strokeWidth={2}
                fill={rectangle.fillColor}
                height={rectangle.height}
                width={rectangle.width}
                draggable={isDraggable}
                onClick={onClick}
              />
            ))}

            {circles.map((circle) => (
              <Circle
                key={circle.id}
                radius={circle.radius}
                x={circle.x}
                y={circle.y}
                stroke={strokeColor}
                strokeWidth={2}
                fill={circle.fillColor}
                draggable={isDraggable}
                onClick={onClick}
              />
            ))}
            {arrows.map((arrow) => (
              <Arrow
                key={arrow.id}
                points={arrow.points}
                stroke={strokeColor}
                strokeWidth={2}
                fill={arrow.fillColor}
                draggable={isDraggable}
                onClick={onClick}
              />
            ))}

            {scribbles.map((scribble) => (
              <Line
                key={scribble.id}
                lineCap="round"
                lineJoin="round"
                points={scribble.points}
                stroke={scribble.strokeColor1}
                strokeWidth={2}
                // fill={scribble.fillColor}
                draggable={isDraggable}
                onClick={onClick}
              />
            ))}
            {texts.map((text) => (
              <KonvaText
                key={text.id}
                x={text.x}
                y={text.y}
                text={text.text}
                fontSize={20}
                draggable={isDraggable}
                fill={fillColor}
                onClick={onClick}
              // ref={textOutput}
              // key={text.id}
              // x={text.x}
              // y={text.y}
              // text={text.text}
              // fontSize={20}
              // draggable={isDraggable}
              // fill={text.id === selectedTextId ? fillColor : text.fill}
              // onClick={() => handleTextClick(text.id)}
              />
            ))}

            <Transformer ref={transformerRef} />
          </Layer>
        </Stage>
      </div>
    </>
  );
}
