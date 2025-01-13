import type { MetaFunction } from "@remix-run/node";
import { motion } from "motion/react"
import { useRef, useState } from "react";
import { Button, Input, Typography } from "antd";
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

  const draw = (context: { clearRect: (arg0: number, arg1: number, arg2: any, arg3: any) => void; canvas: { width: any; height: any; }; fillStyle: string; fillRect: (arg0: number, arg1: number, arg2: number, arg3: number) => void; }, count: number) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    context.fillStyle = 'grey'
    const delta = count % 800
    context.fillRect(10 + delta, 10, 100, 100)
  }

  return (
    <div className="gradient-bg">
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

      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-16">
          <div className="flex items-center m-1/3 gap-16">
            <div className="flex flex-col items-center gap-3">
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
            <div className="flex flex-col items-center gap-3">
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
        <div className="controlPanel border m-10 p-3 rounded-md">
          <Typography.Title level={3} className="text-white">Control Panel</Typography.Title>
          <h4>Stack 1</h4>
          <div className="flex gap-2">
            {/* <Button disabled={numSquaresOne >= 10} onClick={() => setNumSquaresOne((prevNumSquaresOne) => { return prevNumSquaresOne + 1 })}>+</Button> */}
            <Input
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
              defaultValue={numSquaresOne} />
            {/* <Button disabled={numSquaresOne <= 1} onClick={() => setNumSquaresOne((prevNumSquaresOne) => { return prevNumSquaresOne - 1 })}>-</Button> */}
          </div>
          <h4>Stack 2</h4>
          <div className="flex gap-2">
            {/* <Button disabled={numSquaresTwo >= 10} onClick={() => setNumSquaresTwo((prevNumSquaresOne) => { return prevNumSquaresOne + 1 })}>+</Button> */}
            <Input
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
              defaultValue={numSquaresTwo} />
            {/* <Button disabled={numSquaresTwo <= 1} onClick={() => setNumSquaresTwo((prevNumSquaresOne) => { return prevNumSquaresOne - 1 })}>-</Button> */}
          </div>
        </div>
      </div>

    </div>
  );
}