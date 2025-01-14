import type { MetaFunction } from "@remix-run/node";
import { motion } from "motion/react"
import { useEffect, useRef, useState } from "react";
import { Button, Divider, Drawer, Input, Radio, Space, Tooltip, Typography, ConfigProvider } from "antd";
import icons from './icons'
import Canvas from './Canvas/Canvas'
import React from "react";
import { useDrag } from '@use-gesture/react'
import { use } from "framer-motion/client";

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
  const [open, setOpen] = useState<boolean>(false)

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

  const handleDrag = (_e: any, info: { offset: { x: number; y: number; }; }, numSquares: 'numSquaresOne' | 'numSquaresTwo') => {
    console.log('numSquaresOne:', numSquaresOne);
    console.log('numSquaresTwo:', numSquaresTwo);
    // Set the opacity based on the drag distance
    const dragDistance = Math.abs(info.offset.x) + Math.abs(info.offset.y);  // Total drag distance

    // If the drag distance exceeds a threshold, fade out and decrease numSquaresOne
    if (numSquares === 'numSquaresOne') {
      if (dragDistance > 200 && numSquaresOne > 1) { // 200 is the threshold, adjust it as needed
        setNumSquaresOne((prev) => { return prev - 1 });
      }
    } else {
      if (dragDistance > 200 && numSquaresTwo > 1) { // 200 is the threshold, adjust it as needed
        setNumSquaresTwo((prev) => { return prev - 1 });
      }
    }

    // Set the opacity of the dragged square
    return {
      opacity: dragDistance > 200 ? 0 : 1,  // Fade out if dragged far enough
    };
  };

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div className="gradient-bg h-screen flex flex-col spotlight">
      <Drawer
        title={undefined}
        placement='left'
        closable={false}
        onClose={onClose}
        open={open}
        style={{ backgroundColor: '#00162a', color: "white" }}
      >
        <Typography.Title level={3} style={{ color: 'white' }}>Interaction Modes</Typography.Title>
        <div className="flex flex-col gap-8">
          <div>
            <span className="flex gap-2">{icons["Ban"]}<Typography.Title level={5} style={{ color: 'white' }}>No Interaction Mode</Typography.Title></span>
            <ul className="list-disc pl-5">
              <li>For viewing only</li>
            </ul>
          </div>
          <div>
            <span className="flex gap-2">{icons["Diff"]}<Typography.Title level={5} style={{ color: 'white' }}>Add / Remove Squares Mode</Typography.Title></span>
            <ul className="list-disc pl-5">
              <li>When you click on one of the "Square Stacks" it will add a square from the stack</li>
              <li>When you drag on of the squares away from  the stack, it will remove a square from the stack</li>
              <li>You can also change the input fields below their respective "Square Stacks" to quickly update the number of squares there</li>
              <li>No more than 10 squares can be in a stack</li>
              <li>No less than 1 square can be in a stack</li>
            </ul>
          </div>
          <div>
            <span className="flex gap-2">{icons["PencilRuler"]}<Typography.Title level={5} style={{ color: 'white' }}>Draw / Compare Square Stacks Mode</Typography.Title></span>
            <ul className="list-disc pl-5">
              <li>You can draw lines to compare the size of the stacks</li>
              <li>Draw a line from the top of one stack, to the top of the other stack</li>
              <li>Draw another line from the bottom of one stack, to the bottom of the other stack</li>
              <li>If you draw a line that isn't useful for your comparison, it will fade away</li>
              <li>Once you've drawn both comparison lines, you'll be able to play the comparison, by hitting the Play Button in the Control Panel</li>
            </ul>
          </div>
          <div>
            <span className="flex gap-2">{icons["Play"]}<Typography.Title level={5} style={{ color: 'white' }}>Play Comparison Animation</Typography.Title></span>
            <ul className="list-disc pl-5">
              <li>You will not be able to play the comparison until you have drawn both lines required in the Draw / Compare Mode</li>
              <li>The animation will turn the lines you drew into the comparison operattor that would be used between the two numbers</li>
              <li>This will show you how the size of the "Square Stacks" relates to which stack is greater, and what comparison operator should be used here</li>
              <li>After the Comparison Animation ends, the animated comparison operator will fade away, and you'll be free to go add and remove squares to try another comparison.</li>
            </ul>
          </div>
        </div>
      </Drawer>
      <Button
        type="text"
        icon={icons['Help']}
        onClick={() => setOpen(true)}
        style={{ backgroundColor: 'transparent' }}
        className="text-white m-3 absolute hover:drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)]"
      />
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
          zIndex: 900,
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
                <motion.div className={`container floating`} key={index} animate={{ scale: 1 }} drag
                  onDragEnd={(e, info) => { if (interaction === 'addRemove') handleDrag(e, info, 'numSquaresOne') }}
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
                </motion.div>))}

            </div>
            <div className='flex flex-col items-center justify-center h-5/6 boxColumnSmall boxColumn'
              style={{ gap: `${gapForLargerStack}px` }}
              onClick={() => { if (interaction === 'addRemove') { setNumSquaresTwo((prevNumSquaresTwo) => { return prevNumSquaresTwo + 1 }) } }}
            >
              {Array(numSquaresTwo).fill('').map((_, index) => (
                <motion.div className="container floating" key={index} animate={{ scale: 1 }} drag
                  onDragEnd={(e, info) => { if (interaction === 'addRemove') handleDrag(e, info, 'numSquaresTwo') }}
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
                </motion.div>))}
            </div>
          </div>
        </div>
      </div>
      <Divider style={{ borderColor: 'white' }} className="m-0" />
      <div className="flex flex-col mb-5">
        <div className="flex justify-between gap-5 items-center p-3 h-fit my-5 w-2/3 md:w-1/3 mx-auto">
          <div className="flex gap-2">
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