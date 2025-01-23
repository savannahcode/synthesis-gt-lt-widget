import { message } from 'antd';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import type { TouchEvent } from 'react';


const Canvas = (props: { [x: string]: any; }) => {
    const { interaction, availableHeight, coordinates, changeReadyForComparison, changeStartComparison, startComparison, numSquaresOne, numSquaresTwo, ...rest } = props;

    const canvasReference = useRef<HTMLCanvasElement | null>(null);
    const contextReference = useRef<CanvasRenderingContext2D | null>(null);

    const [isPressed, setIsPressed] = useState(false);
    const [startPosition, setStartPosition] = useState<{ x: number, y: number } | null>(null);
    const [lines, setLines] = useState<lineType[]>([]);
    const [opacity, setOpacity] = useState(1);
    const [topLineFound, setTopLineFound] = useState(false)
    const [bottomLineFound, setBottomLineFound] = useState(false)

    // attempt to fix issues on ipad and iphone with lines's offset being more finicky due to pixel density
    useEffect(() => {
        const canvas = canvasReference.current;
        if (canvas) {
            const context = canvas.getContext("2d");
            const devicePixelRatio = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * devicePixelRatio;
            canvas.height = availableHeight * devicePixelRatio;
            if (context) {
                context.scale(devicePixelRatio, devicePixelRatio);
                contextReference.current = context;
            }
        }
    }, [])


    // this useEffect ensures no scroll while drawing
    useEffect(() => {
        const canvas = canvasReference.current;
        if (!canvas) return;
        const handleTouchStart = (e: Event) => {
            const rect = canvas.getBoundingClientRect();
            if (e instanceof TouchEvent) {
                const touch = e.touches[0];
                const isInsideCanvas =
                    touch.clientX >= rect.left &&
                    touch.clientX <= rect.right &&
                    touch.clientY >= rect.top &&
                    touch.clientY <= rect.bottom;

                if (isInsideCanvas) {
                    e.preventDefault();
                }
            }
        };
        const handleTouchMove = (e: Event) => {
            e.preventDefault();
        };
        canvas.addEventListener("touchstart", handleTouchStart);
        canvas.addEventListener("touchmove", handleTouchMove);
        return () => {
            canvas.removeEventListener("touchstart", handleTouchStart);
            canvas.removeEventListener("touchmove", handleTouchMove);
        };
    }, [isPressed]);

    const linesRef = useRef<lineType[]>(lines);
    useEffect(() => {
        linesRef.current = lines;
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

    function delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function animateLines(targetTop: targetLineType, targetBottom: targetLineType) {
        const steps = 70; // Number of steps (frames) for the animation
        let animationFinished = false;
        let frame = 0;
        let topLines: lineType[] = []
        let bottomLines: lineType[] = []
        let topTwoLines: 'bottom' | 'top' = 'top'
        if (lines[0].start.y < lines[2].start.y) {
            topLines = lines.slice(0, 2)
            bottomLines = lines.slice(2, 4)
        } else {
            topLines = lines.slice(2, 4)
            bottomLines = lines.slice(0, 2)
            topTwoLines = 'bottom'
        }

        async function draw() {
            if (animationFinished) return;
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
                await delay(3000);
                // Finished animation, stop and fade out lines
                const context = contextReference.current;
                if (!context) return
                let localOpacity = 1;
                const fadeOutInterval = setInterval(() => {
                    context.clearRect(0, 0, canvasReference.current!.width, canvasReference.current!.height);

                    if (localOpacity <= 0) {
                        setLines([])
                        linesRef.current = []
                        setTopLineFound(false);
                        setBottomLineFound(false);
                        changeReadyForComparison(false)
                        changeStartComparison(false)
                        clearInterval(fadeOutInterval);
                        animationFinished = true;
                        return;
                    }

                    linesRef.current.forEach(line => {
                        context.globalAlpha = localOpacity;
                        context.lineWidth = line.width;
                        context.strokeStyle = line.color;
                        context.beginPath();
                        context.moveTo(line.start.x, line.start.y);
                        context.lineTo(line.end.x, line.end.y);
                        context.stroke();
                    });

                    localOpacity -= 0.05;
                }, 50);
            }

            const t = frame / steps;
            let currentTop = topLines[0];
            let currentBottom = bottomLines[0];

            setLines((prevLines) => {
                return prevLines.map((line, i) => {
                    if (i === 0 || i === 1) {
                        return {
                            start: {
                                x: currentTop.start.x + (targetTop.start.x - currentTop.start.x) * t,
                                y: currentTop.start.y + (targetTop.start.y - currentTop.start.y) * t,
                            },
                            end: {
                                x: currentTop.end.x + (targetTop.end.x - currentTop.end.x) * t,
                                y: currentTop.end.y + (targetTop.end.y - currentTop.end.y) * t,
                            },
                            color: prevLines[i].color,
                            width: prevLines[i].width,
                        };
                    }
                    if (i === 2 || i === 3) {
                        return {
                            start: {
                                x: currentBottom.start.x + (targetBottom.start.x - currentBottom.start.x) * t,
                                y: currentBottom.start.y + (targetBottom.start.y - currentBottom.start.y) * t,
                            },
                            end: {
                                x: currentBottom.end.x + (targetBottom.end.x - currentBottom.end.x) * t,
                                y: currentBottom.end.y + (targetBottom.end.y - currentBottom.end.y) * t,
                            },
                            color: prevLines[i].color,
                            width: prevLines[i].width,
                        };
                    }
                    return line;
                });
            });

            frame++;
            requestAnimationFrame(draw); // Recursively call draw to update the next frame
        }
        draw(); // Start the animation loop
    }


    function doComparison() {
        // move lines to be in the shape of whatever comparison operator it is
        const targets = [];
        if (numSquaresOne > numSquaresTwo) {
            // greater than sign '>'
            targets.push(
                {
                    top: { start: { x: window.innerWidth / 2 + 80, y: availableHeight / 2 + 55 }, end: { x: window.innerWidth / 2 - 40, y: availableHeight / 2 + 20 } },
                    bottom: { start: { x: window.innerWidth / 2 - 40, y: availableHeight / 2 + 100 }, end: { x: window.innerWidth / 2 + 80, y: availableHeight / 2 + 55 } },
                }
            );
        } else if (numSquaresOne < numSquaresTwo) {
            // less than sign '<'
            targets.push(
                {
                    top: { start: { x: window.innerWidth / 2 - 70, y: availableHeight / 2 + 60 }, end: { x: window.innerWidth / 2 + 50, y: availableHeight / 2 + 20 } },
                    bottom: { start: { x: window.innerWidth / 2 - 70, y: availableHeight / 2 + 60 }, end: { x: window.innerWidth / 2 + 50, y: availableHeight / 2 + 100 } },
                }
            );
        } else if (numSquaresOne === numSquaresTwo) {
            // equal sign '='
            targets.push(
                {
                    top: { start: { x: window.innerWidth / 2 + -30, y: availableHeight / 2 + 50 }, end: { x: window.innerWidth / 2 + 30, y: availableHeight / 2 + 50 } },
                    bottom: { start: { x: window.innerWidth / 2 - 30, y: availableHeight / 2 + 70 }, end: { x: window.innerWidth / 2 + 30, y: availableHeight / 2 + 70 } }
                }
            );
        }
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
                context.lineWidth = 8;
                context.strokeStyle = 'white';
                contextReference.current = context;
            }
        }
    }, [availableHeight]);

    const beginDraw = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
        const context = contextReference.current;
        if (context) {
            context.clearRect(0, 0, canvasReference.current!.width, canvasReference.current!.height);
            setOpacity(1)
            if (context) {
                const { offsetX, offsetY } = getPosition(e)
                setStartPosition({ x: offsetX, y: offsetY });
                context.beginPath();
                context.moveTo(offsetX, offsetY);
                setIsPressed(true);
            }
        }
    };

    const updateDraw = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
        if (!isPressed || !startPosition) return;

        const { offsetX, offsetY } = getPosition(e);
        const context = contextReference.current;

        if (context && canvasReference.current) {
            context.clearRect(0, 0, canvasReference.current.width, canvasReference.current.height);

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
        if (contextReference.current) {
            contextReference.current.closePath();
        }

        if (startPosition) {
            const { offsetX, offsetY } = getPosition(e);

            // Check if the line should fade out
            if (shouldFadeOutLine(startPosition, { x: offsetX, y: offsetY })) {
                let localOpacity = 1;
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
            const touch = e.touches[0] ? e.touches[0] : e.changedTouches[0];
            const rect = canvasReference.current?.getBoundingClientRect();
            const offsetX = touch.clientX - (rect?.left || 0);
            const offsetY = touch.clientY - (rect?.top || 0);
            return { offsetX, offsetY };
        }
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
            onMouseOut={interaction === 'drawCompare' ? (e) => endDraw(e) : () => { }}
            onTouchStart={interaction === 'drawCompare' ? beginDraw : () => { }}
            onTouchMove={interaction === 'drawCompare' ? updateDraw : () => { }}
            onTouchEnd={interaction === 'drawCompare' ? (e) => endDraw(e) : () => { }}
        />
    );
};

export default Canvas;
