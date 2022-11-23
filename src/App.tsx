import React, { ReactNode, useRef, useState, useCallback, useEffect } from 'react';
import {
    Box,
    useColorModeValue,
    Container, Divider, Flex, Button, Stack, IconButton
} from '@chakra-ui/react';
import { SidebarContent } from './layouts/Sidebar';
import { brushSizes, BrushSizeButton } from './components/BrushSizeButton'
import { brushColors, BrushColorButton } from './components/BrushColorButton'
import ToolbarSection from './components/ToolbarSection'
import './App.css'
import {
    FaEraser,
    FaPaintBrush,
} from "react-icons/fa";
import { Canvas } from './components/Canvas';
import downloadFile from './helpers/downloadFile'

export default function App() {

    const [isEraser, setIsEraser] = useState(false);
    const [isRegularMode, setIsRegularMode] = useState(true);
    const [shapes, setIsShapes] = useState<any>("rectangle");
    const [currentWidth, setCurrentWidth] = useState(brushSizes.Small);
    const [currentColor, setCurrentColor] = useState(brushColors.Blue)
    const [imageData, setImageData] = useState<any>("");

    const selectedColor = useRef(brushColors.Blue);
    const selectedLineWidth = useRef(brushSizes.Small);
    const lastX = useRef(0);
    const lastY = useRef(0);;
    const isDrawing = useRef(false);
    const direction = useRef(true);
    const isRegularPaintMode = useRef(true);
    const isEraserMode = useRef(false);

    const canvas = useRef<HTMLCanvasElement>();
    const ctx = useRef(canvas?.current?.getContext("2d"));

    const drawOnCanvas = useCallback((event: any) => {
        if (!ctx || !ctx.current) {
            return;
        }
        ctx.current.beginPath();
        ctx.current.moveTo(lastX.current, lastY.current);
        ctx.current.lineTo(event.offsetX, event.offsetY);
        ctx.current.stroke();

        [lastX.current, lastY.current] = [event.offsetX, event.offsetY];
    }, []);

    // const drawShapeOnCanvas = useCallback((event: any) => {
    //     if (!ctx || !ctx.current) {
    //         return;
    //     }
    //     ctx.current.beginPath();
    //     ctx.current.moveTo(lastX.current, lastY.current);
    //     ctx.current.lineTo(event.offsetX, event.offsetY);
    //     ctx.current.stroke();

    //     let calcX = event.clientX - event.offsetX;
    //     let calcY = event.clientY - event.offsetY;
    //     [lastX.current, lastY.current] = [calcX, calcY];
    // }, []);




    const handleMouseDown = useCallback((e: any) => {
        isDrawing.current = true;
        [lastX.current, lastY.current] = [e.offsetX, e.offsetY];
    }, []);

    const dynamicLineWidth = useCallback(() => {
        if (!ctx || !ctx.current) {
            return;
        }
        if (ctx.current.lineWidth > 90 || ctx.current.lineWidth < 10) {
            direction.current = !direction.current;
        }
        direction.current ? ctx.current.lineWidth++ : ctx.current.lineWidth--;
        setCurrentWidth(ctx.current.lineWidth);
    }, []);


    const handleColor = (value: any) => {
        setCurrentColor(value);
        selectedColor.current = value;
    };

    const handleWidth = (value: number) => {
        setCurrentWidth(value)
        selectedLineWidth.current = value
    };


    const drawNormal = useCallback(
        (e: any) => {
            if (!isDrawing.current || !ctx.current) return;


            // ref isRegularPaintMode.current || isEraserMode.current
            if (isRegularMode || isEraser) {
                ctx.current.strokeStyle = selectedColor.current;

                setCurrentColor(selectedColor.current);


                ctx.current.lineWidth = selectedLineWidth.current

                isEraserMode.current
                    ? (ctx.current.globalCompositeOperation = "destination-out")
                    : (ctx.current.globalCompositeOperation = "source-over");
            }
            else {
                setCurrentColor("#000")
                ctx.current.strokeStyle = "#000";
                ctx.current.lineWidth = selectedLineWidth.current

            }
            drawOnCanvas(e);
        },
        [drawOnCanvas, dynamicLineWidth,],
    );



    const stopDrawing = useCallback(() => {
        isDrawing.current = false;

    }, []);


    useEffect(() => {
        ctx.current = canvas?.current?.getContext("2d");
        if (canvas && canvas.current && ctx && ctx.current) {
            canvas.current.addEventListener("mousedown", handleMouseDown);
            canvas.current.addEventListener("mousemove", drawNormal);
            canvas.current.addEventListener("mouseup", stopDrawing);
            canvas.current.addEventListener("mouseout", stopDrawing);

            ctx.current.strokeStyle = "#000";
            ctx.current.lineJoin = "round";
            ctx.current.lineCap = "round";
            ctx.current.lineWidth = 10;


        }
    }, [drawNormal, handleMouseDown, stopDrawing]);



    const onResize = () => {
        ctx.current = canvas?.current?.getContext("2d");
        if (canvas && canvas.current && ctx && ctx.current) {

            //custom height and witdh canvas
            canvas.current.width = window.innerWidth - 196;
            canvas.current.height = window.innerHeight;

            // canvas.current.width = canvas.current.offsetWidth
            // canvas.current.height = canvas.current.offsetHeight
            ctx.current.fillStyle = "#fff"
            ctx.current.fillRect(0, 0, canvas.current.width, canvas.current.height)
            ctx.current.fillStyle = '#fff'

        }
    }
    // Call onResize when canvas is initialized
    useEffect(() => onResize(), [canvas])

    // Add event listener for window.onResize
    // when the app gets initialized
    useEffect(() => {
        window.addEventListener('resize', onResize)
        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [])



    const handleRegularMode = useCallback(() => {
        setIsRegularMode(true);
        isEraserMode.current = false;
        setIsEraser(false);
        isRegularPaintMode.current = true;
    }, []);



    const handleClear = useCallback(() => {
        if (!ctx || !ctx.current || !canvas || !canvas.current) {
            return;
        }
        ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
        ctx.current.fillStyle = "#fff"
        ctx.current.fillRect(0, 0, canvas.current.width, canvas.current.height)
        ctx.current.fillStyle = '#fff'
    }, []);

    const handleEraserMode = (e: any) => {
        // autoWidth.current = false;
        setIsRegularMode(true);
        isEraserMode.current = true;
        setIsEraser(true);
    };


    const loadFile = () => {
        {
            const inputFile = document.querySelector('input[type=file]')
            let file = inputFile?.files[0]
            var reader = new FileReader();

            reader.onloadend = function () {
                if (reader) {
                    setImageData(reader?.result);
                }

            }

            if (file) {
                reader.readAsDataURL(file);
            }
        }
    }

    const loadCanvas = (imgData: any) => {
        if (!canvas.current) return

        let canvasRef = canvas.current
        const context = canvas.current.getContext('2d')!
        var image = new Image();
        image.onload = async () => {
            // context.clearRect(0, 0, canvasRef.width, canvasRef.height);
            let imgSize = {
                width: image.width,
                height: image.height
            };
            context.save();
            context.drawImage(image, 0, 0, imgSize.width, imgSize.height);
            context.restore();
        };
        image.src = imgData
    }

    useEffect(() => {
        if (imageData) {
            if (!canvas.current) return
            loadCanvas(imageData);

        }
    }, [imageData]);

    const saveCanvas = () => {
        if (!canvas.current) return

        const contents = canvas.current.toDataURL('image/png')
        downloadFile(contents, 'painting.png')
    }




    return (
        <Box minH="100vh" minW={'100%'} bg={useColorModeValue('gray.100', 'gray.900')}>
            <SidebarContent
                display={{ base: 'none', md: 'block' }}
            >
                <Container>
                    <ToolbarSection title="Upload Images">
                        <input type="file" id="fileBrowser" style={{ display: 'inline-block' }} onChange={loadFile} />
                    </ToolbarSection>
                    <Divider my={4} />
                    <ToolbarSection title="Brush color">
                        <Flex flexWrap={'wrap'}>
                            {Object.entries(brushColors).map(([colorName, color]) => (
                                <Box m={'4px'} key={colorName}>
                                    <BrushColorButton
                                        onClick={() => handleColor(color)}
                                        className={color === currentColor ? 'active' : ''}
                                        brushColor={colorName}
                                    />
                                </Box>
                            ))}
                        </Flex>
                    </ToolbarSection>
                    <ToolbarSection title="Brush Size">
                        <Flex flexWrap={'wrap'}>
                            {Object.entries(brushSizes).map(([sizeName, size]) => (
                                <BrushSizeButton
                                    key={sizeName}
                                    onClick={() => handleWidth(size)}
                                    className={size === currentWidth ? 'active' : ''}
                                    brushSize={sizeName}
                                />
                            ))}
                        </Flex>
                    </ToolbarSection>
                    <Divider my={4} />
                    <ToolbarSection title="Tools">
                        <Flex>
                            <Box me={'3'}>
                                <IconButton
                                    onClick={handleRegularMode}
                                    variant='outline'
                                    colorScheme='teal'
                                    aria-label='Send email'
                                    icon={<FaPaintBrush />}
                                />

                            </Box>
                            <Box me={'3'}>
                                <IconButton
                                    onClick={handleEraserMode}
                                    variant='outline'
                                    colorScheme='teal'
                                    aria-label='Send email'
                                    icon={<FaEraser />}
                                />
                            </Box>

                        </Flex>
                    </ToolbarSection>
                    <ToolbarSection title="Action">
                        <Stack spacing={4} direction='row' align='center'>
                            <Button colorScheme='blue' size='md' onClick={saveCanvas}>
                                Save
                            </Button>
                            <Button colorScheme='blue' variant='outline' size='md' onClick={handleClear}>
                                Clear
                            </Button>

                        </Stack>
                    </ToolbarSection>
                </Container>

            </SidebarContent>
            <Box ml={{ base: 0, md: '318px' }} p="4" h={'100vh'} overflow="auto">
                <Box display={'flex'} h={'100%'} w={'100%'} overflow="auto">
                    <Canvas canvasRef={canvas} image={imageData} />
                </Box>
            </Box>
        </Box>
    );
}