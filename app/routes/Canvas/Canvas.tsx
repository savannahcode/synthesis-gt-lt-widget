import { MouseEvent, TouchEvent, useEffect, useRef, useState } from 'react';

const Canvas = (props: { [x: string]: any; }) => {
    const { interaction, availableHeight, ...rest } = props;

    const canvasReference = useRef<HTMLCanvasElement | null>(null);
    const contextReference = useRef<CanvasRenderingContext2D | null>(null);

    const [isPressed, setIsPressed] = useState(false);
    const [startPosition, setStartPosition] = useState<{ x: number, y: number } | null>(null);
    const [lines, setLines] = useState<{ start: { x: number, y: number }, end: { x: number, y: number }, color: string, width: number }[]>([]);
    const [opacity, setOpacity] = useState(1);


    const shouldFadeOutLine = (start: { x: number, y: number }, end: { x: number, y: number }) => {
        return true
        // const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        // return distance > 100;  // Example condition: If the line is longer than 100px, fade out
    };

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
        setOpacity(1)
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

            context.globalAlpha = opacity;
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

            // Check if the line should fade out
            if (shouldFadeOutLine(startPosition, { x: offsetX, y: offsetY })) {
                let localOpacity = 1; // Local opacity variable for fading
                const context = contextReference.current;
                if (!context) return
                const fadeOutInterval = setInterval(() => {
                    // Clear the canvas and redraw all lines except the fading one
                    context.clearRect(0, 0, canvasReference.current!.width, canvasReference.current!.height);
                    lines.forEach(line => {
                        context.globalAlpha = 1;
                        context.lineWidth = line.width;
                        context.strokeStyle = line.color;
                        context.beginPath();
                        context.moveTo(line.start.x, line.start.y);
                        context.lineTo(line.end.x, line.end.y);
                        context.stroke();
                    });

                    if (localOpacity <= 0) {
                        clearInterval(fadeOutInterval);
                        console.log('RETURN', localOpacity)
                        return;
                    }

                    // Draw the fading line
                    context.globalAlpha = localOpacity;
                    context.lineWidth = 8;
                    context.strokeStyle = 'white';
                    context.beginPath();
                    context.moveTo(startPosition.x, startPosition.y);
                    context.lineTo(offsetX, offsetY);
                    context.stroke();

                    context.lineWidth = 4;
                    context.strokeStyle = 'lightblue';
                    context.beginPath();
                    context.moveTo(startPosition.x, startPosition.y);
                    context.lineTo(offsetX, offsetY);
                    context.stroke();

                    localOpacity -= 0.05; // Decrease opacity for next frame

                    console.log('localOpacity', localOpacity)
                }, 30); // Adjust interval duration for smoother fading
            } else {
                // Store the line with full opacity if it doesn't fade out
                setLines(prevLines => [
                    ...prevLines,
                    { start: startPosition, end: { x: offsetX, y: offsetY }, color: 'white', width: 8 },
                    { start: startPosition, end: { x: offsetX, y: offsetY }, color: 'lightblue', width: 4 },
                ]);
            }
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
