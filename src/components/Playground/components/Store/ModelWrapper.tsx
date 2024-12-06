'use client'

import dynamic from 'next/dynamic'
import React from 'react';
import { Suspense } from 'react'

const Model3D = dynamic(() => import('./Model3D'), { ssr: false })

export default function ModelWrapper({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Model3D position={position} rotation={rotation} />
    </Suspense>
  )
}

