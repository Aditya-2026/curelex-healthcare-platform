import React from 'react';

const Watermark = () => {
    return (
        <div
            className="fixed inset-0 w-screen h-screen flex items-center justify-center pointer-events-none z-[1]"
        >
            <img
                src="/src/assets/watermark.png"
                alt=""
                className="w-[90%] md:w-[80%] lg:w-[70%] max-h-[90vh] opacity-[0.06] object-contain select-none"
                draggable="false"
                aria-hidden="true"
            />
        </div>
    );
};

export default Watermark;
