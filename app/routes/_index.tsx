import type { MetaFunction } from "@remix-run/node";
import { motion } from "motion/react"
import { useEffect, useRef, useState } from "react";
import { Button, Divider, Input, Radio, Space, Tooltip, Typography } from "antd";
import icons from './icons'
import Canvas from './Canvas/Canvas'
import React from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Synthesis Widget App" },
    { name: "description", content: "Sav's comparison widget for the application process to Synthesis" },
  ];
};

export default function Index() {
  const [numSquaresOne, setNumSquaresOne] = useState(3)
  const [numSquaresTwo, setNumSquaresTwo] = useState(2)
  const [statusOne, setStatusOne] = useState<undefined | 'error'>(undefined);
  const [statusTwo, setStatusTwo] = useState<undefined | 'error'>(undefined);
  const [interaction, setInteraction] = useState<'none' | 'addRemove' | 'drawCompare'>('none')
  const [boxesAvailableHeight, setBoxesAvailableHeight] = useState(300);
  const [readyForComparison, setReadyForComparison] = useState(false)
  const [startComparison, setStartComparison] = useState(false)

  const boxesContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasHeightRef = useRef<HTMLDivElement | null>(null);
  let canvasAvailableHight = canvasHeightRef.current?.clientHeight

  const stackOneTopSquare = useRef<HTMLDivElement | null>(null);
  const stackOneBottomSquare = useRef<HTMLDivElement | null>(null);
  const stackTwoTopSquare = useRef<HTMLDivElement | null>(null);
  const stackTwoBottomSquare = useRef<HTMLDivElement | null>(null);

  const getCoordinates = () => {
    const coordinates = {
      stackOneTop: stackOneTopSquare.current?.getBoundingClientRect(),
      stackOneBottom: stackOneBottomSquare.current?.getBoundingClientRect(),
      stackTwoTop: stackTwoTopSquare.current?.getBoundingClientRect(),
      stackTwoBottom: stackTwoBottomSquare.current?.getBoundingClientRect(),
    };
    return coordinates;
  }

  useEffect(() => {
    console.log('getCoordinates', getCoordinates())
  }, [stackOneTopSquare, stackOneBottomSquare, stackTwoTopSquare, stackTwoBottomSquare])


  useEffect(() => {
    if (boxesContainerRef.current) {
      const containerHeight = boxesContainerRef.current.clientHeight;
      setBoxesAvailableHeight(containerHeight);
    }
  }, []);

  const calculateGap = (numSquares: number, availableHeight: number) => {
    const squareHeight = 40;
    const padding = 16;
    const totalHeight = numSquares * squareHeight + 2 * padding; // Total height of all squares plus padding

    if (totalHeight >= availableHeight) return 0;

    const gap = (availableHeight - totalHeight) / (numSquares - 1);
    return gap;
  };

  const largerStackSquares = Math.max(numSquaresOne, numSquaresTwo);
  const gapForLargerStack = calculateGap(largerStackSquares, boxesAvailableHeight);

  return (
    <div className="gradient-bg h-screen flex flex-col spotlight">
      <Canvas
        interaction={interaction}
        availableHeight={canvasAvailableHight}
        coordinates={getCoordinates()}
        changeReadyForComparison={(ready: boolean) => setReadyForComparison(ready)}
        startComparison={startComparison}
        numSquaresOne={numSquaresOne}
        numSquaresTwo={numSquaresTwo}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 9999,
          pointerEvents: interaction !== 'drawCompare' ? 'none' : 'auto',
          touchAction: interaction !== 'drawCompare' ? 'none' : 'auto'
        }}
      />

      <div className="flex items-center justify-center w-2/3 md:w-1/3 m-auto flex-1" ref={canvasHeightRef}>
        <div className="flex flex-col items-center gap-16 w-full h-full">
          <div className="flex items-center justify-between w-full h-full">
            <div className='flex flex-col items-center justify-center h-5/6 boxColumnSmall boxColumn transform-gpu'
              ref={boxesContainerRef}
              style={{ gap: `${gapForLargerStack}px` }}
              onClick={() => { if (interaction === 'addRemove') { setNumSquaresOne((prevNumSquaresOne) => { return prevNumSquaresOne + 1 }) } }}
            >
              {Array(numSquaresOne).fill('').map((_, index) => (
                <div className={`container floating`} key={index}
                  ref={index === 0 ? stackOneTopSquare : index === numSquaresOne - 1 ? stackOneBottomSquare : null}
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
                </div>))}

            </div>
            <div className='flex flex-col items-center justify-center h-5/6 boxColumnSmall boxColumn'
              style={{ gap: `${gapForLargerStack}px` }}
              onClick={() => { if (interaction === 'addRemove') { setNumSquaresTwo((prevNumSquaresTwo) => { return prevNumSquaresTwo + 1 }) } }}
            >
              {Array(numSquaresTwo).fill('').map((_, index) => (
                <div className="container floating" key={index}
                  ref={index === 0 ? stackTwoTopSquare : index === numSquaresTwo - 1 ? stackTwoBottomSquare : null}
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
                </div>))}
            </div>
          </div>
        </div>
      </div>
      <Divider style={{ borderColor: 'white' }} className="m-0" />
      {/* <Typography.Title level={3} style={{ color: "white" }} className="text-center">Control Panel</Typography.Title> */}
      <div className="flex flex-col mb-5">
        <div className="flex justify-between gap-5 items-center p-3 h-fit my-5 w-2/3 md:w-1/3 mx-auto">
          <div className="flex gap-2">
            {/* <Button disabled={numSquaresOne >= 10} onClick={() => setNumSquaresOne((prevNumSquaresOne) => { return prevNumSquaresOne + 1 })}>+</Button> */}
            {interaction === 'addRemove' ?
              (<Input
                className="h-fit mb-3 bg-cyan-100"
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
                defaultValue={numSquaresOne} />) : (<Typography.Title level={3} style={{ color: "white" }} className="">{numSquaresOne}</Typography.Title>)}
            {/* <Button disabled={numSquaresOne <= 1} onClick={() => setNumSquaresOne((prevNumSquaresOne) => { return prevNumSquaresOne - 1 })}>-</Button> */}
          </div>
          {readyForComparison ?
            (<Button
              style={{ background: 'transparent' }}
              icon={icons['Play']}
              className="content-center pt-1 text-white"

              onClick={() => {
                setStartComparison(true);
                setReadyForComparison(false)
              }}
              size="large" />)
            :
            (<Tooltip title="Draw lines from the top and bottom of Stack 1, to the top and bottom of Stack 2, before playing the comparison!">
              <Button
                style={{ background: 'transparent' }}
                disabled={true}
                icon={React.cloneElement(icons['Play'], { stroke: 'gray' })}
                className="content-center pt-1 text-white"
                size="large" />
            </Tooltip>)}

          {/* <Button disabled={numSquaresTwo >= 10} onClick={() => setNumSquaresTwo((prevNumSquaresOne) => { return prevNumSquaresOne + 1 })}>+</Button> */}
          {interaction === 'addRemove' ?
            (<Input
              className="h-fit mb-3 bg-cyan-100"
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
              defaultValue={numSquaresTwo} />) : (<Typography.Title level={3} style={{ color: "white" }} className="m-0">{numSquaresTwo}</Typography.Title>)}
          {/* <Button disabled={numSquaresTwo <= 1} onClick={() => setNumSquaresTwo((prevNumSquaresOne) => { return prevNumSquaresOne - 1 })}>-</Button> */}

        </div>
        <div className="flex justify-center gap-3">
          <Space>
            <Radio.Group value={interaction} onChange={(e) => setInteraction(e.target.value)}>
              <Radio.Button style={{ backgroundColor: 'transparent' }} value="none" className="content-center text-white"><Tooltip title='No Interaction'>{icons['Ban']}</Tooltip></Radio.Button>
              <Radio.Button style={{ backgroundColor: 'transparent' }} value="addRemove" className="content-center text-white"><Tooltip title='Add / Remove'>{icons['Diff']}</Tooltip></Radio.Button>
              <Radio.Button style={{ backgroundColor: 'transparent' }} value="drawCompare" className="content-center text-white"><Tooltip title='Draw / Compare'>{icons['PencilRuler']}</Tooltip></Radio.Button>
            </Radio.Group>
          </Space>
        </div>
      </div>
      <div>

      </div>
    </div>
  );
}