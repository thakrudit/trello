import { Archive, FilePenLine, Menu } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import apiHelper from '../helpers/api-helper';
import DEVELOPMENT_CONFIG from '../helpers/config';
import { useDraggable } from '@dnd-kit/core';
import { useIndexContext } from '../context/IndexContext';

export default function ChildCard({ id, cardValues, displayDashbordCard }) {
    const { handleOpenDescriptionModal } = useIndexContext();

    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id })

    const style = transform
        ? {
            transform: `translate(${transform.x}px, ${transform.y}px)`,
            backgroundColor: "#E5E7EB",
            border: "1px solid blue"
        }
        : undefined;

    const [isChecked, setIsChecked] = useState(false);
    const [title, setTitle] = useState("");

    // GET STATUS CHECKED OR UNCHECKED AND SET TITLE
    async function getStatus() {
        setIsChecked(cardValues.is_checked)
        setTitle(cardValues.title)
    }
    useEffect(() => {
        getStatus(id)
    }, [cardValues])

    // CHECKED OR UNCHECKED CHILD CARD
    const handleComplete = (async (e, id) => {
        e.preventDefault();
        const newStatus = !isChecked;
        let data = JSON.stringify({
            id,
            is_checked: newStatus
        })
        let result = await apiHelper.postRequest("update-child-card-status", data)
        if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
            setIsChecked(newStatus);
            console.log("MESSAGE IF : ", result?.message)
        } else {
            console.log("MESSAGE ELSE : ", result?.message)
        }
    })

    // HANDLE CHILD CARD ARCHIVED
    const handleChildCardArchive = (async (e) => {
        e.preventDefault();
        const newStatus = true
        let data = JSON.stringify({
            id,
            newStatus
        })
        let result = await apiHelper.postRequest("child-card-archive", data)
        if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
            // UPDATE CONTENT AFTER ARCHIVED
            displayDashbordCard(result?.body?.dashbord_c_id)
            console.log("MESSAGE IF : ", result?.message)
        } else {
            console.log("MESSAGE ELSE : ", result?.message)
        }
    })

    return (
        <div
            key={id}
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="flex flex-col items-start py-2 gap-2 border border-gray-300 rounded hover:ring-1 hover:ring-blue-500 group"
            style={style}
        >
            <div className='flex w-full items-start justify-between p-2 '>
                <div className="flex items-center justify-between gap-1 w-full">
                    <input
                        type="checkbox"
                        checked={isChecked}
                        className="hidden group-hover:block w-5 h-4.5 appearance-none border-2 border-gray-500 cursor-pointer rounded-full checked:block checked:bg-green-600 checked:border-green-600 bg-center bg-no-repeat focus:outline-none"
                        onPointerDown={(e) => e.stopPropagation()}
                        onChange={(e) => handleComplete(e, id)}
                    />
                    <textarea
                        value={title}
                        className="w-full h-10 px-2 py-2 text-sm border-none resize-none outline-none overflow-hidden"
                        // onPointerDown={(e) => e.stopPropagation()}
                        onChange={(e) => {
                            setTitle(e.target.value)
                            e.target.style.height = "auto";
                            e.target.style.height = e.target.scrollHeight + "px";
                        }}
                    />
                </div>
                <div className='flex items-center gap-1.5'>
                    {!!isChecked &&
                        <button className="hidden group-hover:block cursor-pointer"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => handleChildCardArchive(e)}
                        >
                            <Archive size={15} />
                        </button>
                    }
                    <button className="cursor-pointer"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => console.log("Detail", id)}
                    >
                        <FilePenLine size={15} />
                    </button>
                </div>
            </div>
            <button className="mx-3 p-0.5 cursor-pointer"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => handleOpenDescriptionModal(id)}
            >
                <Menu size={15} />
            </button>
        </div>
    )
}
