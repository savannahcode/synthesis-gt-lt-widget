// import { useRef, useEffect } from 'react'

// // explanation of the use of useCanvas in React in this video: https://www.youtube.com/watch?v=tev71VzEJos&t=667s
// export const useCanvas = draw => {
//     const ref = useRef()

//     useEffect(() => {
//         const canvas = ref.current
//         const context = canvas.getContext('2d')
//         let count = 0
//         let animationId

//         const renderer = () => {
//             count++
//             draw(context, count)
//             animationId = window.requestAnimationFrame(renderer)
//         }
//         renderer()
//         return () => window.cancelAnimationFrame(animationId)
//     }, [draw])

//     return ref
// }
