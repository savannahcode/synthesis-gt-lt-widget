import { MouseEvent, TouchEvent, useEffect, useRef, useState } from 'react';

const Canvas = (props: { [x: string]: any; }) => {
    const { interaction, availableHeight, ...rest } = props;

    const canvasReference = useRef<HTMLCanvasElement | null>(null);
    const contextReference = useRef<CanvasRenderingContext2D | null>(null);

    const [isPressed, setIsPressed] = useState(false);
    const [startPosition, setStartPosition] = useState<{ x: number, y: number } | null>(null);
    const [lines, setLines] = useState<{ start: { x: number, y: number }, end: { x: number, y: number }, color: string, width: number }[]>([]);


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

    const beginDraw = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (contextReference.current) {
            const { offsetX, offsetY } = getPosition(e)
            setStartPosition({ x: offsetX, y: offsetY }); // Set start position
            contextReference.current.beginPath();
            contextReference.current.moveTo(offsetX, offsetY);
            setIsPressed(true);
        }
    };

    const updateDraw = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (!isPressed || !startPosition) return;

        const { offsetX, offsetY } = getPosition(e);
        const context = contextReference.current;

        if (context && canvasReference.current) {
            // Draw the white stroke first (outer) for the entire line
            context.clearRect(0, 0, canvasReference.current.width, canvasReference.current.height); // Clear the canvas before redrawing all lines

            // Redraw previously stored lines
            lines.forEach(line => {
                context.lineWidth = line.width;
                context.strokeStyle = line.color;
                context.beginPath();
                context.moveTo(line.start.x, line.start.y);
                context.lineTo(line.end.x, line.end.y);
                context.stroke();
            });

            // Draw the current white stroke (outer) for the line
            context.lineWidth = 8;
            context.strokeStyle = 'white';
            context.beginPath();
            context.moveTo(startPosition.x, startPosition.y);
            context.lineTo(offsetX, offsetY);
            context.stroke();

            // Draw the current blue stroke (inner) for the line
            context.lineWidth = 4; // Smaller width for the blue line
            context.strokeStyle = 'lightblue';
            context.beginPath();
            context.moveTo(startPosition.x, startPosition.y);
            context.lineTo(offsetX, offsetY);
            context.stroke();
        }
    };

    const endDraw = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (contextReference.current) {
            contextReference.current.closePath();
        }
        if (startPosition) {
            const { offsetX, offsetY } = getPosition(e);

            // Store the final line's start and end points
            setLines(prevLines => [
                ...prevLines,
                { start: startPosition, end: { x: offsetX, y: offsetY }, color: 'white', width: 8 }, // Store outer white line
                { start: startPosition, end: { x: offsetX, y: offsetY }, color: 'lightblue', width: 4 } // Store inner blue line
            ]);
        }
        setIsPressed(false);
        setStartPosition(null);
    };

    const getPosition = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
        if ('touches' in e) {
            // For touch events, get the first touch point
            const touch = e.touches[0];
            const rect = canvasReference.current?.getBoundingClientRect();
            const offsetX = touch.clientX - (rect?.left || 0);
            const offsetY = touch.clientY - (rect?.top || 0);
            return { offsetX, offsetY }; // Return offsetX and offsetY
        }

        // For mouse events, get the offsetX and offsetY from the native event
        return {
            offsetX: e.nativeEvent.offsetX,
            offsetY: e.nativeEvent.offsetY,
        };
    };

    return (
        <canvas
            ref={canvasReference}
            {...rest}
            onMouseDown={interaction === 'drawCompare' ? beginDraw : () => { }}
            onMouseMove={interaction === 'drawCompare' ? updateDraw : () => { }}
            onMouseUp={interaction === 'drawCompare' ? (e) => endDraw(e) : () => { }}
            onMouseOut={interaction === 'drawCompare' ? (e) => endDraw(e) : () => { }} // Ensures the drawing stops if the mouse leaves the canvas
            onTouchStart={interaction === 'drawCompare' ? beginDraw : () => { }}
            onTouchMove={interaction === 'drawCompare' ? updateDraw : () => { }}
            onTouchEnd={interaction === 'drawCompare' ? (e) => endDraw(e) : () => { }}
        />
    );
};

export default Canvas;
