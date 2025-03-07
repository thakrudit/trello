import React, { useCallback, useState } from "react";
import TaskCard from "../components/TaskCard";
import {
    CalendarDays,
    ChevronDown,
    Columns2,
    Ellipsis,
    Plus,
    Star,
    Table2,
    UsersRound,
    X,
} from "lucide-react";
import apiHelper from "../helpers/api-helper";
import DEVELOPMENT_CONFIG from "../helpers/config";
import { useIndexContext } from "../context/IndexContext";
import { DndContext } from "@dnd-kit/core";
import Description from "../components/Description";

export default function Dashbord() {
    const [newListCard, setNewListCard] = useState(false);
    const [newListTitle, setNewListTitle] = useState("");

    const { dashbordDataObj, handleOnDashbord } = useIndexContext();

    // OPEN AND CLOSE ADD LIST
    const handleNewListCardOpen = () => {
        setNewListCard(true);
    };
    const handleNewListCardClose = () => {
        setNewListCard(false);
    };

    // DISPLAY BOARD DATA 2 ( TASK CARD WITH CHILD CARD )
    // const handleOnDashbord2 = (async (id) => {
    //     console.log("Enter in handle===========OnDashbord2")
    //     localStorage.setItem("dashbordCID", id)
    //     let result = await apiHelper.getRequest(`display-board?b_id=${id}`)
    //     if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
    //         setDashbordDataObj(result?.body)
    //     }
    //     else {
    //         setDashbordDataObj({})
    //     }
    // })

    const handleValidation = () => {
        let isValid = true
        if (newListTitle.trim() === "") {
            isValid = false;
        }
        return isValid
    }
    // CREATE DASHBORD CARD ( ADD LIST )
    async function handleCreateDashbordCard(e) {
        e.preventDefault();
        if (!handleValidation()) {
            return
        }
        let data = JSON.stringify({
            title: newListTitle,
            board_id: dashbordDataObj?.id // OR FROM LS
        })
        let result = await apiHelper.postRequest("create-dashbord-card", data)
        if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
            handleNewListCardClose()
            setNewListTitle("")
            handleOnDashbord(dashbordDataObj?.id) // UPDATE CONTENT
            console.log("MESSAGE IF : ", result.message)
        } else {
            console.log("MESSAGE ELSE : ", result.message)
        }
    }

    // DREAG AND DROP HANDLE
    const handleDragEnd = useCallback(async (event) => {
        console.log("=======================>>>>>>>>>>>");
        const { active, over } = event;

        if (!over) return;

        const taskId = active.id;
        const newStatus = over.id;

        console.log("taskId-child, newStatus-dachbord-card ", taskId, newStatus);

        // UPDATE PARENT OF CHILD CARD
        const data = JSON.stringify({
            id: taskId,
            dashbord_c_id: newStatus,
        });
        let result = await apiHelper.postRequest("update-child-card", data);
        if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
            // UPDATE CONTENT ( OR FROM LS )
            handleOnDashbord(dashbordDataObj?.id)

            // setDashbordDataObj((prevState) => {
            //     const updatedCards = prevState.dashbord_cards.map((card) => {
            //         console.log("card+++++++++++++", card);

            //         if (card.id === newStatus) {
            //             console.log("enter in 11111111111111111")
            //             return {
            //                 ...card,
            //                 //   childCards: [...card.childCards, { id: taskId }],
            //             };
            //         }
            //         //   if (card.childCards.some((child) => child.id === taskId)) {
            //         //     return {
            //         //       ...card,
            //         //       childCards: card.childCards.filter(
            //         //         (child) => child.id !== taskId
            //         //       ),
            //         //     };
            //         //   }
            //         return card;
            //     });

            //     return { ...prevState, dashbord_cards: updatedCards };
            // });

            console.log("MESSAGE IF : ", result?.message);
        } else {
            console.log("MESSAGE ELSE : ", result?.message);
        }
    }, [dashbordDataObj])

    return (
        <>
            <div className="flex-1 overflow-auto bg-[#8636a5]"
                style={{
                    backgroundColor: dashbordDataObj?.bg_color?.startsWith("#") ? dashbordDataObj?.bg_color : "8636a5",
                    backgroundSize: "cover",
                }}
            >
                {/* HEADER */}
                <div className="fixed w-full flex items-center bg-[#50247e] p-3 border-t border-[#8d99b9] gap-2">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold cursor-pointer hover:bg-[#918ca555] inline-block p-1 px-2 rounded">
                            {dashbordDataObj.title || "Your Board"}
                        </h1>
                        <button className="hover:bg-[#948ab7] rounded cursor-pointer p-2">
                            <Star size={16} strokeWidth={2.5} />
                        </button>
                        <button className="hover:bg-[#948ab7] rounded cursor-pointer p-2">
                            <UsersRound size={16} strokeWidth={2.5} />
                        </button>
                        <button className="flex items-center gap-1 cursor-pointer text-sm font-semibold bg-amber-50 text-gray-700 px-2.5 py-2 rounded">
                            <Columns2 size={15} strokeWidth={2.5} />
                            <span className="">Board</span>
                        </button>
                        <ul>
                            <li>
                                <button className="flex items-center gap-1 hover:bg-[#948ab7] rounded cursor-pointer text-sm font-semibold text-white px-2.5 py-2">
                                    <Table2 size={15} strokeWidth={2.5} />
                                    <span className="">Table</span>
                                </button>
                            </li>
                        </ul>
                        <button className="hover:bg-[#948ab7] rounded cursor-pointer p-2">
                            <ChevronDown size={15} strokeWidth={2.5} />
                        </button>
                    </div>
                    <div className=" flex items-center gap-2">
                        <button className="hover:bg-[#948ab7] rounded p-1 w-6 cursor-pointer">
                            <CalendarDays size={15} strokeWidth={2.5} />
                        </button>
                        <button className="hover:bg-[#948ab7] rounded p-1 w-6 cursor-pointer">
                            <Ellipsis size={15} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
                {/* CONTENT */}

                <div className="flex gap-4 mt-16 p-3 whitespace-nowrap scrollbar-hide w-fit ">
                    <DndContext onDragEnd={handleDragEnd}>
                        {!!dashbordDataObj && dashbordDataObj?.dashbord_cards?.map((value) => (
                            <TaskCard
                                key={value.id}
                                id={value.id}
                                values={value}
                            />
                        ))}
                    </DndContext>

                    {dashbordDataObj.id && (
                        <>
                            {
                                newListCard ? (
                                    <div className="bg-white h-fit p-2 rounded-xl min-w-72 flex flex-col gap-2" >
                                        <textarea
                                            value={newListTitle}
                                            placeholder="Enter list name..."
                                            className="w-full h-10 text-sm text-gray-700 font-semibold border-2 border-blue-500 rounded-sm resize-none outline-none px-2 py-2"
                                            onChange={(e) => setNewListTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleCreateDashbordCard(e);
                                                }
                                            }}
                                        />
                                        <div className="flex gap-1">
                                            <button className="text-sm bg-blue-600 hover:bg-blue-700 px-3 rounded cursor-pointer"
                                                onClick={handleCreateDashbordCard}
                                            >
                                                Add list
                                            </button>
                                            <button
                                                className="text-gray-500 p-2 rounded hover:bg-gray-300 cursor-pointer"
                                                onClick={handleNewListCardClose}
                                            >
                                                {" "}
                                                <X size={22} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-fit">
                                        <button
                                            className="flex items-center gap-2 p-2 px-3 bg-[#955db6] rounded-xl min-w-72 hover:bg-[#824da3] transition-colors duration-200 cursor-pointer"
                                            onClick={handleNewListCardOpen}
                                        >
                                            <Plus size={18} strokeWidth={3} />
                                            <span className="text-sm font-semibold">Add another list</span>
                                        </button>
                                    </div>
                                )}
                        </>
                    )}

                </div>
            </div >

            <Description />
        </>
    );
}
