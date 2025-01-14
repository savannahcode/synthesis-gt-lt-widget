import { MouseEvent, TouchEvent, useEffect, useRef, useState } from 'react';

const Canvas = (props: { [x: string]: any; }) => {
    const { interaction, availableHeight, coordinates, ...rest } = props;

    const canvasReference = useRef<HTMLCanvasElement | null>(null);
    const contextReference = useRef<CanvasRenderingContext2D | null>(null);

    const [isPressed, setIsPressed] = useState(false);
    const [startPosition, setStartPosition] = useState<{ x: number, y: number } | null>(null);
    const [lines, setLines] = useState<{ start: { x: number, y: number }, end: { x: number, y: number }, color: string, width: number }[]>([]);
    const [opacity, setOpacity] = useState(1);


    const shouldFadeOutLine = (start: { x: number, y: number }, end: { x: number, y: number }) => {
        const offset = 60;

        let stackOneTopX = coordinates.stackOneTop.x
        let stackOneTopY = coordinates.stackOneTop.y

        let stackOneBottomX = coordinates.stackOneBottom.x
        let stackOneBottomY = coordinates.stackOneBottom.y

        let stackTwoTopX = coordinates.stackTwoTop.x
        let stackTwoTopY = coordinates.stackTwoTop.y

        let stackTwoBottomX = coordinates.stackTwoBottom.x
        let stackTwoBottomY = coordinates.stackTwoBottom.y

        const stackOneTopToStackTwoTop = ((Math.abs(stackOneTopX - start.x) < offset) && (Math.abs(stackOneTopY - start.y) < offset) && (Math.abs(stackTwoTopX - end.x) < offset) && (Math.abs(stackTwoTopY - end.y) < offset))
        const stackTwoTopToStackOneTop = ((Math.abs(stackOneTopX - end.x) < offset) && (Math.abs(stackOneTopY - end.y) < offset) && (Math.abs(stackTwoTopX - start.x) < offset) && (Math.abs(stackTwoTopY - start.y) < offset))

        const stackOneBottomToStackTwoBottom = ((Math.abs(stackOneBottomX - start.x) < offset) && (Math.abs(stackOneBottomY - start.y) < offset) && (Math.abs(stackTwoBottomX - end.x) < offset) && (Math.abs(stackTwoBottomY - end.y) < offset))
        const stackTwoBottomToStackOneBottom = ((Math.abs(stackOneBottomX - end.x) < offset) && (Math.abs(stackOneBottomY - end.y) < offset) && (Math.abs(stackTwoBottomX - start.x) < offset) && (Math.abs(stackTwoBottomY - start.y) < offset))


        if (stackOneTopToStackTwoTop || stackTwoTopToStackOneTop || stackOneBottomToStackTwoBottom || stackTwoBottomToStackOneBottom) {
            return false
        } return true;
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

                    localOpacity -= 0.05;
                }, 30);
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
