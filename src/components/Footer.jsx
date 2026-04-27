import React from 'react'

const Footer = () => {
  return (
    <>
    <div className='bg-slate-800 w-screen text-white flex flex-col items-center gap-1 py-1'>
        <div className="logo">
            <h1 className='text-2xl font-bold'><span><span className='text-green-600'>&lt;</span>Pass</span><span className='text-green-600'>OP/&gt;</span></h1>
        </div>
        <div className='flex text-xl'>
            Created with&nbsp;<span className='flex justify-center items-center'><img className='h-6 w-5.5' src="icons/heart.png" alt="" /></span>&nbsp;in India
        </div>
    </div>
    </>
  )
}

export default Footer
