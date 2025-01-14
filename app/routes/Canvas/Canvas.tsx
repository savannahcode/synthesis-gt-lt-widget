import { useEffect, useRef, useState } from 'react';

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

    const endDraw = (e: { nativeEvent: { offsetX: number, offsetY: number } }) => {
        if (contextReference.current) {
            contextReference.current.closePath();
        }
        if (startPosition) {
            const { offsetX, offsetY } = e.nativeEvent;

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

    return (
        <canvas
            ref={canvasReference}
            {...rest}
            onMouseDown={interaction === 'drawCompare' ? beginDraw : () => { }}
            onMouseMove={interaction === 'drawCompare' ? updateDraw : () => { }}
            onMouseUp={interaction === 'drawCompare' ? (e) => endDraw(e) : () => { }}
            onMouseOut={interaction === 'drawCompare' ? (e) => endDraw(e) : () => { }} // Ensures the drawing stops if the mouse leaves the canvas
        />
    );
};

export default Canvas;
