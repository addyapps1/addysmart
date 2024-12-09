import { useEffect } from "react";

// Custom Hook to detect clicks outside elements and close them
function useClickOutside(elements) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      const elementsToCheck = Array.isArray(elements) ? elements : [elements];

      elementsToCheck.forEach(({ ref, close }) => {
        // Convert ref to an array if it's not one
        const refs = Array.isArray(ref)
          ? ref
          : ref && typeof ref === "object" && !Array.isArray(ref)
            ? Object.values(ref)
            : [ref];

        // Check if clicked outside all referenced elements
        const clickedOutside = refs.every(
          (r) => r.current && !r.current.contains(event.target)
        );
        if (clickedOutside) {
          close();
        }
      });
    };

    // Attach event listener to detect clicks
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [elements]); // Rerun effect when elements change
}

export default useClickOutside;



//// USAGE
// import React, { useState, useRef } from 'react';
// import useClickOutside from './useClickOutside';

// function MultipleModals() {
//   const [isOpen1, setIsOpen1] = useState(false);
//   const [isOpen2, setIsOpen2] = useState(false);
//   const [isOpen3, setIsOpen3] = useState(false);

//   const modalRef1a = useRef();
//   const modalRef1b = useRef();
//   const modalRef2 = useRef();
//   const modalRef3a = useRef();
//   const modalRef3b = useRef();

//   const closeModal1 = () => setIsOpen1(false);
//   const closeModal2 = () => setIsOpen2(false);
//   const closeModal3 = () => setIsOpen3(false);

//   useClickOutside([
//     { ref: { modalRef1a, modalRef1b }, close: closeModal1 },
//     { ref: modalRef2, close: closeModal2 },
//     { ref: [modalRef3a, modalRef3b], close: closeModal3 },
//   ]);

//   return (
//     <div>
//       <button onClick={() => setIsOpen1(true)}>Open Modal 1</button>
//       <button onClick={() => setIsOpen2(true)}>Open Modal 2</button>
//       <button onClick={() => setIsOpen3(true)}>Open Modal 3</button>

//       {isOpen1 && (
//         <div className="modal-overlay">
//           <div className="modal" ref={modalRef1a}>
//             <h2>Modal 1 Content Part A</h2>
//           </div>
//           <div className="modal" ref={modalRef1b}>
//             <h2>Modal 1 Content Part B</h2>
//             <button onClick={closeModal1}>Close Modal 1</button>
//           </div>
//         </div>
//       )}

//       {isOpen2 && (
//         <div className="modal-overlay">
//           <div className="modal" ref={modalRef2}>
//             <h2>Modal 2 Content</h2>
//             <button onClick={closeModal2}>Close Modal 2</button>
//           </div>
//         </div>
//       )}

//       {isOpen3 && (
//         <div className="modal-overlay">
//           <div className="modal" ref={modalRef3a}>
//             <h2>Modal 3 Content Part A</h2>
//           </div>
//           <div className="modal" ref={modalRef3b}>
//             <h2>Modal 3 Content Part B</h2>
//             <button onClick={closeModal3}>Close Modal 3</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default MultipleModals;
