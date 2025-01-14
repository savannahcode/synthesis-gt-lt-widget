import { message } from 'antd';
import { MouseEvent, TouchEvent, useEffect, useRef, useState } from 'react';

const Canvas = (props: { [x: string]: any; }) => {
    const { interaction, availableHeight, coordinates, changeReadyForComparison, startComparison, numSquaresOne, numSquaresTwo, ...rest } = props;

    const canvasReference = useRef<HTMLCanvasElement | null>(null);
    const contextReference = useRef<CanvasRenderingContext2D | null>(null);

    const [isPressed, setIsPressed] = useState(false);
    const [startPosition, setStartPosition] = useState<{ x: number, y: number } | null>(null);
    const [lines, setLines] = useState<lineType[]>([]);
    const [opacity, setOpacity] = useState(1);
    const [topLineFound, setTopLineFound] = useState(false)
    const [bottomLineFound, setBottomLineFound] = useState(false)

    const linesRef = useRef<lineType[]>(lines);
    useEffect(() => {
        linesRef.current = lines; // Sync lines state with the ref
    }, [lines]);

    useEffect(() => {
        if (topLineFound && bottomLineFound) {
            changeReadyForComparison(true);
            message.success('You can now play the comparison')

        }
    }, [topLineFound, bottomLineFound])

    useEffect(() => { if (startComparison) doComparison() }, [startComparison])

    type lineType = { start: { x: number, y: number }, end: { x: number, y: number }, color: string, width: number };
    type targetLineType = { start: { x: number, y: number }, end: { x: number, y: number } };


    function animateLines(targetTop: targetLineType, targetBottom: targetLineType) {
        const duration = 500; // Animation duration in ms
        const steps = 60; // Number of steps (frames) for the animation
        let frame = 0;

        let topLines = []
        let bottomLines = []
        let topTwoLines: 'bottom' | 'top' = 'top'
        if (lines[0].start.y < lines[2].start.y) {
            topLines = lines.slice(0, 2)
            bottomLines = lines.slice(2, 4)
        } else {
            topLines = lines.slice(2, 4)
            bottomLines = lines.slice(0, 2)
            topTwoLines = 'bottom'
        }

        const interval = setInterval(() => {
            // Clear the canvas and redraw all lines
            const context = contextReference.current;
            if (!context) return
            context.clearRect(0, 0, canvasReference.current!.width, canvasReference.current!.height);
            linesRef.current.forEach(line => {
                context.globalAlpha = 1;
                context.lineWidth = line.width;
                context.strokeStyle = line.color;
                context.beginPath();
                context.moveTo(line.start.x, line.start.y);
                context.lineTo(line.end.x, line.end.y);
                context.stroke();
            });

            if (frame >= steps) {
                // give a moment, then fade out the lines
                //setLines([])
                setTopLineFound(false)
                setTopLineFound(false)
                clearInterval(interval);
                return;
            }

            const t = frame / steps;

            let currentTop = topLines[0]
            let currentBottom = bottomLines[0]

            // Interpolate coordinates for both lines in the pair
            const interpolatedTop = {
                start: {
                    x: currentTop.start.x + (targetTop.start.x - currentTop.start.x) * t,
                    y: currentTop.start.y + (targetTop.start.y - currentTop.start.y) * t,
                },
                end: {
                    x: currentTop.end.x + (targetTop.end.x - currentTop.end.x) * t,
                    y: currentTop.end.y + (targetTop.end.y - currentTop.end.y) * t,
                },
                color: currentTop.color,
                width: currentTop.width,
            };

            const interpolatedBottom = {
                start: {
                    x: currentBottom.start.x + (targetBottom.start.x - currentBottom.start.x) * t,
                    y: currentBottom.start.y + (targetBottom.start.y - currentBottom.start.y) * t,
                },
                end: {
                    x: currentBottom.end.x + (targetBottom.end.x - currentBottom.end.x) * t,
                    y: currentBottom.end.y + (targetBottom.end.y - currentBottom.end.y) * t,
                },
                color: currentBottom.color,
                width: currentBottom.width,
            };
            console.log('lines', lines)
            // Update both lines in the state
            setLines((prevLines) => {
                return prevLines.map((line, i) => {
                    if (i === 0 || i === 1) return interpolatedTop; // Adjust indices for the top lines
                    if (i === 2 || i === 3) return interpolatedBottom; // Adjust indices for the bottom lines
                    return line;
                });
            });


            frame++;
        }, duration / steps);
    }


    function doComparison() {
        // move lines to be in the shape of whatever comparison operator it is
        console.log('lines', lines)
        const targets = [];
        if (numSquaresOne > numSquaresTwo) {
            console.log('greater than')
            // greater than sign '>'
            targets.push(
                {
                    top: { start: { x: window.innerWidth / 2 + 100, y: availableHeight / 2 + 60 }, end: { x: window.innerWidth / 2 + 70, y: availableHeight / 2 + 100 } },
                    bottom: { start: { x: window.innerWidth / 2 + 100, y: availableHeight / 2 + 60 }, end: { x: window.innerWidth / 2 + 70, y: availableHeight / 2 + 20 } }
                }
            );

        } else if (numSquaresOne < numSquaresTwo) {
            console.log('less than')
            // less than sign '<'
            targets.push(
                {
                    top: { start: { x: window.innerWidth / 2 + 70, y: availableHeight / 2 + 60 }, end: { x: window.innerWidth / 2 + 100, y: availableHeight / 2 + 100 } },
                    bottom: { start: { x: window.innerWidth / 2 + 70, y: availableHeight / 2 + 60 }, end: { x: window.innerWidth / 2 + 100, y: availableHeight / 2 + 20 } }
                }
            );
        } else if (numSquaresOne === numSquaresTwo) {
            console.log('equal to')
            // equal sign '='
            targets.push(
                {
                    top: { start: { x: window.innerWidth / 2 + 50, y: 50 }, end: { x: window.innerWidth / 2 + 100, y: availableHeight / 2 + 50 } },
                    bottom: { start: { x: window.innerWidth / 2 + 50, y: 70 }, end: { x: window.innerWidth / 2 + 100, y: availableHeight / 2 + 70 } }
                }
            );
        }
        console.log('targets', targets)
        for (let i = 0; i < lines.length; i += 2) {
            animateLines(targets[0].top, targets[0].bottom);
        }
    }

    const shouldFadeOutLine = (start: { x: number, y: number }, end: { x: number, y: number }) => {
        const offset = 60;

        const stackOneTopX = coordinates.stackOneTop.x
        const stackOneTopY = coordinates.stackOneTop.y

        const stackOneBottomX = coordinates.stackOneBottom.x
        const stackOneBottomY = coordinates.stackOneBottom.y

        const stackTwoTopX = coordinates.stackTwoTop.x
        const stackTwoTopY = coordinates.stackTwoTop.y

        const stackTwoBottomX = coordinates.stackTwoBottom.x
        const stackTwoBottomY = coordinates.stackTwoBottom.y

        const stackOneTopToStackTwoTop = ((Math.abs(stackOneTopX - start.x) < offset) && (Math.abs(stackOneTopY - start.y) < offset) && (Math.abs(stackTwoTopX - end.x) < offset) && (Math.abs(stackTwoTopY - end.y) < offset) && !topLineFound)
        const stackTwoTopToStackOneTop = ((Math.abs(stackOneTopX - end.x) < offset) && (Math.abs(stackOneTopY - end.y) < offset) && (Math.abs(stackTwoTopX - start.x) < offset) && (Math.abs(stackTwoTopY - start.y) < offset) && !topLineFound)

        const stackOneBottomToStackTwoBottom = ((Math.abs(stackOneBottomX - start.x) < offset) && (Math.abs(stackOneBottomY - start.y) < offset) && (Math.abs(stackTwoBottomX - end.x) < offset) && (Math.abs(stackTwoBottomY - end.y) < offset) && !bottomLineFound)
        const stackTwoBottomToStackOneBottom = ((Math.abs(stackOneBottomX - end.x) < offset) && (Math.abs(stackOneBottomY - end.y) < offset) && (Math.abs(stackTwoBottomX - start.x) < offset) && (Math.abs(stackTwoBottomY - start.y) < offset) && !bottomLineFound)


        if (stackOneTopToStackTwoTop || stackTwoTopToStackOneTop) {
            setTopLineFound(true)
            return false
        } else if (stackOneBottomToStackTwoBottom || stackTwoBottomToStackOneBottom) {
            setBottomLineFound(true)
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
