import { useEffect, useRef, useState } from 'react';

const Canvas = (props: { [x: string]: any; }) => {
    const { interaction, availableHeight, ...rest } = props;

    const canvasReference = useRef<HTMLCanvasElement | null>(null);
    const contextReference = useRef<CanvasRenderingContext2D | null>(null);

    const [isPressed, setIsPressed] = useState(false);
    const [startPosition, setStartPosition] = useState<{ x: number, y: number } | null>(null);

    useEffect(() => {
        const canvas = canvasReference.current;
        if (canvas) {
            const context = canvas.getContext("2d");
            canvas.width = window.innerWidth;
            canvas.height = availableHeight;
            if (context) {
                context.lineCap = "round";
                context.lineWidth = 8; // Outer white stroke width
                context.strokeStyle = 'white'; // White color for outer stroke
                contextReference.current = context;
            }
        }
    }, [availableHeight]);

    const beginDraw = (e: { nativeEvent: { offsetX: number; offsetY: number; }; }) => {
        if (contextReference.current) {
            const { offsetX, offsetY } = e.nativeEvent;
            setStartPosition({ x: offsetX, y: offsetY }); // Set start position
            contextReference.current.beginPath();
            contextReference.current.moveTo(offsetX, offsetY);
            setIsPressed(true);
        }
    };

    const updateDraw = (e: { nativeEvent: { offsetX: number; offsetY: number; }; }) => {
        if (!isPressed || !startPosition) return;

        const { offsetX, offsetY } = e.nativeEvent;
        const context = contextReference.current;

        if (context) {
            // Draw the white stroke first (outer) for the entire line
            context.clearRect(0, 0, canvasReference.current.width, canvasReference.current.height); // Clear the canvas before redrawing all lines
            context.beginPath();
            context.moveTo(startPosition.x, startPosition.y);
            context.lineTo(offsetX, offsetY);
            context.stroke();

            // Draw the blue stroke on top (inner) for the entire line
            context.lineWidth = 4; // Smaller width for the blue line
            context.strokeStyle = 'lightblue'; // Light blue color for inner stroke
            context.beginPath();
            context.moveTo(startPosition.x, startPosition.y);
            context.lineTo(offsetX, offsetY);
            context.stroke();

            // Reset to original white stroke width and color
            context.lineWidth = 8;
            context.strokeStyle = 'white';
        }
    };

    const endDraw = () => {
        if (contextReference.current) {
            contextReference.current.closePath();
        }
        setIsPressed(false);
        setStartPosition(null);
    };

    return (
        <canvas
            ref={canvasReference}
            {...rest}
            onMouseDown={interaction === 'drawCompare' ? beginDraw : () => { }}
            onMouseMove={interaction === 'drawCompare' ? updateDraw : () => { }}
            onMouseUp={interaction === 'drawCompare' ? endDraw : () => { }}
            onMouseOut={interaction === 'drawCompare' ? endDraw : () => { }} // Ensures the drawing stops if the mouse leaves the canvas
        />
    );
};

export default Canvas;
