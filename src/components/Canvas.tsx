import React from "react";

interface Props {
    canvasRef?: React.MutableRefObject<HTMLCanvasElement | undefined>;
    image: string
}

export const Canvas: React.FC<Props> = ({ canvasRef, image }) => {
    // const cursor = `url(${image})`
    return (
        <section >
            <canvas ref={canvasRef as any} />
            <div className="canvas" style={{ display: 'none', overflow: 'auto' }}>
                <img src={image} />
            </div>
        </section>
    );
};
