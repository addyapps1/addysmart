import React, { lazy, useContext } from 'react'
import { MineContext } from '../../MineContext/MineContext';



const ResizeableAndMoveableSupport = lazy(
  () => import("./supportUser/ResizeableAndMoveableSupport")
);

const Support = () => {
  const { closeSupportModal, isUserModalOpen } =
    useContext(MineContext);

    return (
        <>
            {isUserModalOpen && (
          <ResizeableAndMoveableSupport close={closeSupportModal} />
          )}

          </>
  )
}

export default Support