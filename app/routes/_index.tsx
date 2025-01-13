import type { MetaFunction } from "@remix-run/node";
import { motion } from "motion/react"
import { useEffect, useRef, useState } from "react";
import { Button, Input, Radio, Space, Tooltip, Typography } from "antd";
import { Ban, Diff, PencilRuler, Play } from 'lucide-react';
import Canvas from './Canvas/Canvas'

export const meta: MetaFunction = () => {
  return [
    { title: "Synthesis Widget App" },
    { name: "description", content: "Sav's comparison widget for the application process to Synthesis!" },
  ];
};

export default function Index() {
  const [numSquaresOne, setNumSquaresOne] = useState(3)
  const [numSquaresTwo, setNumSquaresTwo] = useState(2)
  const [statusOne, setStatusOne] = useState<undefined | 'error'>(undefined);
  const [statusTwo, setStatusTwo] = useState<undefined | 'error'>(undefined);
  const [interaction, setInteraction] = useState<'none' | 'addRemove' | 'drawCompare'>('none')
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [availableHeight, setAvailableHeight] = useState(300);

  const draw = (context: { clearRect: (arg0: number, arg1: number, arg2: any, arg3: any) => void; canvas: { width: any; height: any; }; fillStyle: string; fillRect: (arg0: number, arg1: number, arg2: number, arg3: number) => void; }, count: number) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    context.fillStyle = 'grey'
    const delta = count % 800
    context.fillRect(10 + delta, 10, 100, 100)
  }

  useEffect(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      setAvailableHeight(containerHeight);
    }
  }, []);

  const calculateGap = (numSquares: number, availableHeight: number) => {
    const squareHeight = 40;
    const padding = 16;
    const totalHeight = numSquares * squareHeight + 2 * padding; // Total height of all squares plus padding

    if (totalHeight >= availableHeight) return 0;

    // Otherwise, calculate the gap
    const gap = (availableHeight - totalHeight) / (numSquares - 1);
    return gap;
  };

  const getStackHeight = (numSquares: number, gap: number) => {
    return numSquares === 1 ? 0 : gap * (numSquares - 1) + 2 * 16; // Add padding for top and bottom
  };

  const largerStackSquares = Math.max(numSquaresOne, numSquaresTwo);
  const gapForLargerStack = calculateGap(largerStackSquares, availableHeight);

  // Calculate the height for both stacks based on the gap
  const heightForLargerStack = getStackHeight(largerStackSquares, gapForLargerStack);
  const heightForSmallerStack = getStackHeight(
    Math.min(numSquaresOne, numSquaresTwo),
    gapForLargerStack
  );

  return (
    <div className="gradient-bg h-screen flex flex-col">
      {/* <Canvas
        draw={draw}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9999, // Ensures it is above everything else
          pointerEvents: "none", // Prevents it from interfering with clicks if it's decorative
        }} /> */}

      <div className="flex items-center justify-center w-1/3 m-auto flex-1">
        <div className="flex flex-col items-center gap-16 w-full h-full">
          <div className="flex items-center justify-between w-full h-full">
            <div className={`flex flex-col items-center justify-center h-5/6`}
              ref={containerRef}
              style={{ gap: `${gapForLargerStack}px` }}
            >
              {Array(numSquaresOne).fill('').map((_, index) => (
                <motion.div className={`container floating`} key={index}
                  style={{
                    zIndex: numSquaresOne - index,
                  }}>
                  <div className="cube">
                    <div className="face top"></div>
                    <div className="face bottom"></div>
                    <div className="face left"></div>
                    <div className="face right"></div>
                    <div className="face front"></div>
                    <div className="face back"></div>
                  </div>
                </motion.div>))}

            </div>
            <div className={`flex flex-col items-center justify-center h-5/6`}
              style={{ gap: `${gapForLargerStack}px` }}>
              {Array(numSquaresTwo).fill('').map((_, index) => (
                <motion.div className="container floating" key={index}
                  style={{
                    zIndex: numSquaresTwo - index,
                  }}>
                  <div className="cube">
                    <div className="face top"></div>
                    <div className="face bottom"></div>
                    <div className="face left"></div>
                    <div className="face right"></div>
                    <div className="face front"></div>
                    <div className="face back"></div>
                  </div>
                </motion.div>))}
            </div>
          </div>
        </div>
      </div>
      <div className="controlPanel border m-10 p-3 rounded-md h-1/4">
        <Typography.Title level={3} style={{ color: "white" }} className="text-center">Control Panel</Typography.Title>
        <div className="flex justify-between my-3">
          <div className="flex gap-2">
            <h4>Stack 1</h4>
            {/* <Button disabled={numSquaresOne >= 10} onClick={() => setNumSquaresOne((prevNumSquaresOne) => { return prevNumSquaresOne + 1 })}>+</Button> */}
            {interaction === 'addRemove' ? (<Input
              style={{ width: '45px' }}
              count={{
                show: false,
                max: 2,
                strategy: (txt) => txt.length,
                exceedFormatter: (txt, { max }) => txt.slice(0, max),
              }}
              status={statusOne}
              onChange={(e) => {
                const value = e.target.value.trim();
                const isValidNumber = /^[1-9]\d*$/;
                if (parseInt(value) <= 10 && parseInt(value) > 0 && isValidNumber.test(value)) {
                  setStatusOne(undefined)
                  setNumSquaresOne(parseInt(e.target.value))
                } else {
                  setStatusOne('error')
                }
              }}
              defaultValue={numSquaresOne} />) : (<Typography.Text>{numSquaresOne}</Typography.Text>)}
            {/* <Button disabled={numSquaresOne <= 1} onClick={() => setNumSquaresOne((prevNumSquaresOne) => { return prevNumSquaresOne - 1 })}>-</Button> */}
          </div>
          <Tooltip title="Draw lines from the top and bottom of Stack 1, to the top and bottom of Stack 2 before playing this comparison, unless you want the answer spoiled for you!"><Button icon={<Play />} className="content-center pt-1" size="large" /></Tooltip>

          <div className="flex gap-2">
            <h4>Stack 2</h4>
            {/* <Button disabled={numSquaresTwo >= 10} onClick={() => setNumSquaresTwo((prevNumSquaresOne) => { return prevNumSquaresOne + 1 })}>+</Button> */}
            {interaction === 'addRemove' ? (<Input
              style={{ width: '45px' }}
              count={{
                show: false,
                max: 2,
                strategy: (txt) => txt.length,
                exceedFormatter: (txt, { max }) => txt.slice(0, max),
              }}
              status={statusTwo}
              onChange={(e) => {
                const value = e.target.value.trim();
                const isValidNumber = /^[1-9]\d*$/;
                if (parseInt(value) <= 10 && parseInt(value) > 0 && isValidNumber.test(value)) {

                  setStatusTwo(undefined)
                  setNumSquaresTwo(parseInt(value))
                } else {
                  setStatusTwo('error')
                }
              }}
              defaultValue={numSquaresTwo} />) : (<Typography.Text>{numSquaresTwo}</Typography.Text>)}
            {/* <Button disabled={numSquaresTwo <= 1} onClick={() => setNumSquaresTwo((prevNumSquaresOne) => { return prevNumSquaresOne - 1 })}>-</Button> */}
          </div>
        </div>
        <div>
          <div className="flex justify-center gap-3">
            <h4>Interaction Mode:</h4>
            <Space>
              <Radio.Group value={interaction} onChange={(e) => setInteraction(e.target.value)}>
                <Radio.Button value="none" className="content-center"><Tooltip title='None'><Ban /></Tooltip></Radio.Button>
                <Radio.Button value="addRemove" className="content-center"><Tooltip title='Add / Remove'><Diff /></Tooltip></Radio.Button>
                <Radio.Button value="drawCompare" className="content-center"><Tooltip title='Draw / Compare'><PencilRuler /></Tooltip></Radio.Button>
              </Radio.Group>
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
}