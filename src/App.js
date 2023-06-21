import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

import "./styles.css";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  

  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
        img: "https://picsum.photos/200",
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  const handleDelete = (id) => {
    const updatedMoveables = moveableComponents.filter(
      (moveable) => moveable.id !== id
    );
    setMoveableComponents(updatedMoveables);
  };
  

  return (
    <main style={{ height : "100vh", width: "100vw", backgroundColor: '#262626 ' }}>
      <button 
      onClick={addMoveable}
      style={{
        top: "10px",
        left: "10px",
        zIndex: 1000,
        border: "none",
        padding: "10px",
        backgroundColor: "#FF9800",
        borderRadius: "5px",
        cursor: "pointer",
      }}
      >Add Moveable1</button>
      <div
        id="parent"
        style={{
          position: "relative",
          backgroundColor: "#E0E0E0",
          height: "80vh",
          width: "80vw",
          margin: "auto",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
            handleDelete={handleDelete}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  handleDelete,
}) => {
  const ref = useRef();
  const containerRef = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/photos")
      .then((response) => response.json())
      .then((data) => {
        const randomIndex = Math.floor(Math.random() * data.length);
        setImageUrl(data[randomIndex].url);
      })
      .catch((error) => {
        console.error("Error al obtener la imagen:", error);
      });
  }, []);
  
  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();
  
  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    const newWidth = e.width;
    const newHeight = e.height;
    let newTop = top + e.deltaY;
    let newLeft = left + e.deltaX;
  
    const positionMaxTop = newTop + newHeight;
    const positionMaxLeft = newLeft + newWidth;
  
    if (newTop < 0) {
      newTop = 0;
    } else if (positionMaxTop > parentBounds.height) {
      newTop = parentBounds.height - newHeight;
    }
  
    if (newLeft < 0) {
      newLeft = 0;
    } else if (positionMaxLeft > parentBounds.width) {
      newLeft = parentBounds.width - newWidth;
    }
  
    if (newLeft !== left && newWidth + newLeft > parentBounds.width) {
      newWidth = parentBounds.width - newLeft;
    }
  
    if (newTop !== top && newHeight + newTop > parentBounds.height) {
      newHeight = parentBounds.height - newTop;
    }
  
    // Actualizar las dimensiones y coordenadas del elemento
    updateMoveable(id, {
      top: newTop,
      left: newLeft,
      width: newWidth,
      height: newHeight,
      color,
    });
  

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
        }}
        onClick={() => setSelected(id)}
      >

        <div
          className="image-container"
          style={{
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <button className="floating-button" onClick={() => handleDelete(id)}>X</button>
          <img
            src={imageUrl}
            alt="Component Image"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain", // Puedes cambiar a "cover" u otro valor según tus necesidades
            }}
          ></img>
        </div>
      </div>

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {

          const newTop = e.top
          const newLeft = e.left

          const positionMaxTop = newTop + height
          const positionMaxLeft = newLeft + width

          if (positionMaxTop > parentBounds?.height)
            e.top = parentBounds?.height - height
          if (positionMaxLeft > parentBounds?.width)
            e.left = parentBounds?.width - width
          if (newTop < 0)
            e.top = 0
          if (newLeft < 0)
            e.left = 0

          
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
      
    </>
  );
};
