import { useEffect, useRef, useState } from 'react';

const Canvas = (props: { [x: string]: any; }) => {
    const { ...rest } = props
    // const ref = useCanvas(draw)

    const canvasReference = useRef<HTMLCanvasElement | null>(null);
    const contextReference = useRef<CanvasRenderingContext2D | null>(null);

    const [isPressed, setIsPressed] = useState(false);

    useEffect(() => {
        const canvas = canvasReference.current
        if (canvas) {
            const context = canvas.getContext("2d")
            if (context) {
                context.lineCap = "round"
                context.strokeStyle = 'white'
                context.lineWidth = 5
                contextReference.current = context
            }
        }
    }), []

    const beginDraw = (e: { nativeEvent: { offsetX: number; offsetY: number; }; }) => {
        if (contextReference.current) {
            contextReference.current.beginPath();
            contextReference.current.moveTo(
                e.nativeEvent.offsetX,
                e.nativeEvent.offsetY
            );
            setIsPressed(true);
        }
    };

    const updateDraw = (e: { nativeEvent: { offsetX: number; offsetY: number; }; }) => {
        if (!isPressed) return;
        if (contextReference.current) {
            contextReference.current.lineTo(
                e.nativeEvent.offsetX,
                e.nativeEvent.offsetY
            );
            contextReference.current.stroke();
        }
    };

    const endDraw = () => {
        if (contextReference.current) {
            contextReference.current.closePath();
            setIsPressed(false);
        }
    };


    return <canvas
        ref={canvasReference}
        {...rest}
        onMouseDown={beginDraw}
        onMouseMove={updateDraw}
        onMouseUp={endDraw}
    />
}

export default Canvas