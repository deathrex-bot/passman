import React, { useState, useRef, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

const Manager = () => {

    const Eyeref = useRef()
    const Passref = useRef()
    const [form, setform] = useState({ site: '', username: '', password: '' })
    const [passwordArray, setpasswordArray] = useState([])

    // Production-grade: Use environment variables, fallback to localhost for development
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    const getPasswords = async () => {
        try {
            let req = await fetch(`${backendUrl}/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            let responseData = await req.json()
            
            if (req.ok && Array.isArray(responseData)) {
                setpasswordArray(responseData) //parse the password and set it to the state
            } else {
                console.error("Backend returned an error or non-array data:", responseData)
            }
        } catch (error) {
            console.error(`Failed to fetch passwords. Is the backend server running at ${backendUrl}?`, error)
            toast.error("Error: Could not connect to the database.")
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login'; // Redirect to login if no token is found
        } else {
            getPasswords()
        }
    }, []) //this will run only once when the component is mounted


    const showPassword = () => {
        if (Eyeref.current.src.includes('icons/eye.png')) {
            Eyeref.current.src = 'icons/eyecross.png'
            Passref.current.type = 'text' //If the eye icon is the open eye, change it to the closed eye and show the password
        } else {
            Eyeref.current.src = 'icons/eye.png'
            Passref.current.type = 'password' //If the eye icon is the closed eye, change it to the open eye and hide the password
        }
    }

    const savePassword = async() => {
        if (form.site.length > 3 && form.username.length > 3 && form.password.length > 3) {

            // Check for at least 8 chars, one capital letter, one number, and one special character
            const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;
            if (!passwordRegex.test(form.password)) {
                toast.error('Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character');
                return; // Stop the function here so the invalid password isn't saved
            }

            // Create the individual new password object (reusing id if we are editing)
            const newPassword = { ...form, id: form.id ? form.id : uuidv4() }; //Make a copy of what the user typed in the form. If we are editing an old password, keep its old ID. If it's a new password, generate a brand new ID for it.
            setpasswordArray([...passwordArray, newPassword]); //create a copy of the old password array and add the new password to it, then set it as the new state
            
            let res = await fetch(`${backendUrl}/`, { // Send the new password to the backend to be saved in the database
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newPassword) // Send the new password as a JSON string in the request body so that the backend can easily parse it and save it to the database
            })
            //localStorage.setItem('passwords', JSON.stringify(newPasswordArray)); //save the new array to local storage
            setform({ site: '', username: '', password: '' }) //reset the form
            toast.success('Password saved', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
        else {
            toast.error('Please fill all the fields')
        }
    }

    const deletePassword = async(id) => {
        let c = confirm("Are you sure you want to delete this password?");
        if (c) {
            console.log("Deleting password width id:", id)
            setpasswordArray(passwordArray.filter((item) => item.id !== id));
            let res = await fetch(`${backendUrl}/`, {
                method: 'DELETE', // Send a DELETE request to the backend with the ID of the password to be deleted so that it can be removed from the database as well
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ id }) // Send the ID of the password to be deleted as a JSON string in the request body so that the backend can easily parse it and delete it from the database
            })
            // localStorage.setItem('passwords', JSON.stringify(passwordArray.filter((item) => item.id !== id)));
            toast.success('Password deleted', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    }

    const editPassword = async (id) => {
        console.log("Editing password width id:", id)
        setform(passwordArray.find((item) => item.id === id)) // Find the password to be edited in the password array and set it as the new form state so that its values are shown in the form for editing
        setpasswordArray(passwordArray.filter((item) => item.id !== id)); // Remove the password to be edited from the password array so that it doesn't show in the list while we are editing it (we will add it back to the array when we save the edited password)
        
        // Delete the old entry from the database so it can be safely re-saved
        await fetch(`${backendUrl}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ id })
        })
    }


    const handleChange = (e) => {
        setform({ ...form, [e.target.name]: e.target.value })
    }

    const copyText = (text) => {
        toast.success('Copied to clipboard', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
        navigator.clipboard.writeText(text)
    }



    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            <div className="absolute inset-0 -z-10 h-full w-full bg-green-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-\[size\:14px_24px\]"><div className="absolute left-0 right-0 top-0 -z-10 m-auto h-77.5 w-77.5 rounded-full bg-green-400 opacity-20 blur-[100px]"></div></div>

            <div className="container w-full mx-auto h-[84.1vh] flex flex-col items-center py-10">
                <h1 className='text-4xl font-bold'><span><span className='text-green-600'>&lt;</span>Pass</span><span className='text-green-600'>OP/&gt;</span></h1>
                <h2 className='text-lg text-green-800 font-semibold mb-5'>Your Password Manager</h2>
                <div className="domain flex flex-col gap-5 w-fit">
                    <input value={form.site} onChange={handleChange} type="text" placeholder='Enter Website URL' name="site" id="" className='w-170 lg:w-250 rounded-2xl border-2 border-green-500 px-3 py-0.5 bg-white' />
                    <div className="userpass flex flex-col lg:flex-row lg justify-between">
                        <input value={form.username} type="text" onChange={handleChange} placeholder='Enter Username' name="username" id="" className='rounded-2xl border-2 border-green-500 px-3 py-0.5 w-full lg:w-190 bg-white' />
                        <div className="relative w-full lg:w-50 pt-4 lg:pt-0">
                            <input value={form.password} ref={Passref} type="password" onChange={handleChange} placeholder='Enter Password' name="password" id="" className='rounded-2xl border-2 border-green-500 px-3 py-0.5 w-full bg-white' />
                            <span className='absolute left-160 lg:left-42 top-5.5 lg:top-1.5 cursor-pointer' onClick={showPassword}>
                                <img ref={Eyeref} className='h-5' src="icons/eye.png" alt="eye icon" />
                            </span>
                        </div>
                    </div>
                    <button onClick={savePassword} className='flex gap-2 justify-center items-center border-2 border-green-800 rounded-3xl bg-green-400 w-fit px-4 py-1 mx-auto hover:bg-green-300 cursor-pointer'>
                        <lord-icon
                            src="https://cdn.lordicon.com/efxgwrkc.json"
                            trigger="hover">
                        </lord-icon>
                        Add Password
                    </button>
                </div>
                <div className='pt-4 w-170 lg:w-250'>
                    <h2 className='text-xl text-green-800 font-bold mb-5'>Your Passwords</h2>
                </div>
                <div className="passwords-container w-fit max-h-105 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-green-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-green-500">
                    {passwordArray.length === 0 && <div>No passwords to show</div>}
                    {passwordArray.length !== 0 && <table className="table-auto w-170 lg:w-250 mx-auto rounded-lg overflow-hidden">
                        <thead className='bg-green-800 text-center text-white'>
                            <tr>
                                <th className='py-2'>Site</th>
                                <th className='py-2'>Username</th>
                                <th className='py-2'>Password</th>
                                <th className='py-2'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='bg-green-100'>
                            {passwordArray.map((item, index) => {
                                return <tr key={item.id}>
                                    <td className='text-center w-35 py-2 px-2 border border-white'>
                                        <div className='flex items-center justify-center gap-1'>
                                            <a href={item.site} target='_blank' rel='noreferrer'>{item.site}</a>
                                            <div className='pt-1' onClick={() => { copyText(item.site) }}>
                                                <lord-icon
                                                    src="https://cdn.lordicon.com/xuoapdes.json"
                                                    trigger="hover"
                                                    style={{ width: '20px', height: '20px', display: 'inline-block', cursor: 'pointer' }}>
                                                </lord-icon>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='text-center w-35 py-2 px-2 border border-white'>
                                        <div className='flex items-center justify-center gap-1'>
                                            <span>{item.username}</span>
                                            <div className='pt-1' onClick={() => { copyText(item.username) }}>
                                                <lord-icon
                                                    src="https://cdn.lordicon.com/xuoapdes.json"
                                                    trigger="hover"
                                                    style={{ width: '20px', height: '20px', display: 'inline-block', cursor: 'pointer' }}>
                                                </lord-icon>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='text-center w-35 py-2 px-2 border border-white'>
                                        <div className='flex items-center justify-center gap-1'>
                                            <span>{"•".repeat(8)}</span>
                                            <div className='pt-1' onClick={() => { copyText(item.password) }}>
                                                <lord-icon
                                                    src="https://cdn.lordicon.com/xuoapdes.json"
                                                    trigger="hover"
                                                    style={{ width: '20px', height: '20px', display: 'inline-block', cursor: 'pointer' }}>
                                                </lord-icon>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='text-center w-35 py-2 px-2 border border-white'>
                                        <div className='flex items-center justify-center gap-2'>
                                            <span onClick={() => { editPassword(item.id) }}>
                                                <lord-icon
                                                    src="https://cdn.lordicon.com/qawxkplz.json"
                                                    trigger="hover"
                                                    style={{ width: '23px', height: '23px', cursor: 'pointer' }}>
                                                </lord-icon>
                                            </span>
                                            <span onClick={() => { deletePassword(item.id) }}>
                                                <lord-icon
                                                    src="https://cdn.lordicon.com/xyfswyxf.json"
                                                    trigger="hover"
                                                    style={{ width: '23px', height: '23px', cursor: 'pointer' }}>
                                                </lord-icon>
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            })}
                        </tbody>
                    </table>}
                </div>
            </div>
        </>
    )
}

export default Manager
