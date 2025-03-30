import React, { useCallback, useEffect, useRef, useState } from "react";
import TaskCard from "../components/TaskCard";
import {
    Bell,
    CalendarDays,
    ChevronDown,
    Columns2,
    Ellipsis,
    MessagesSquare,
    Plus,
    SendHorizontal,
    Star,
    Table2,
    UsersRound,
    X,
} from "lucide-react";
import apiHelper from "../helpers/api-helper";
import DEVELOPMENT_CONFIG from "../helpers/config";
import { useIndexContext } from "../context/IndexContext";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import Description from "../components/Description";
import { toast, ToastContainer } from "react-toastify";
import ChildCard from "../components/ChildCard";
import io from "socket.io-client"
import ScrollToBottom, { useScrollToBottom, useSticky } from "react-scroll-to-bottom";
import { Badge } from "@mui/material";

const socket = io.connect(DEVELOPMENT_CONFIG.base_url)

export default function Dashbord() {
    const [newListCard, setNewListCard] = useState(false);
    const [newListTitle, setNewListTitle] = useState("");

    const { dashbordDataObj, handleOnDashbord, setBoardData, boardUsers, getBoardUsers } = useIndexContext();
    const [activeCard, setActiveCard] = useState(null);

    const [allNotification, setAllNotification] = useState([])
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    const [isBoardUsers, setIsBoardUsers] = useState(false)

    const [isChatbox, setIsChatbox] = useState(false)

    const [chatUserDetail, setChatUserDetail] = useState({})
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const [chatRoomId, setChatRoomId] = useState(null);

    const [notificationCount, setNotificationCount] = useState(0);

    const listRef = useRef(null);

    let dashbordCID = parseInt(localStorage.getItem("dashbordCID"), 10);
    let loggedInUser = parseInt(localStorage.getItem("loggedInUser"), 10);

    // const scrollToBottom = useScrollToBottom()
    // const [sticky] = useSticky();

    // OPEN AND CLOSE ADD LIST
    const handleNewListCardOpen = () => {
        setNewListCard(true);
        setTimeout(() => {
            if (listRef.current) {
                listRef.current.focus();
            }
        }, 100);
    };

    const handleNewListCardClose = () => {
        setNewListCard(false);
    };

    const success = (msg) => {
        toast.success(msg,
            {
                autoClose: 5000,
            });
    }
    const error = (msg) => {
        toast.success(msg,
            {
                autoClose: 5000,
            });
    }

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
            board_id: dashbordDataObj?.id
        })
        let result = await apiHelper.postRequest("create-dashbord-card", data)
        if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
            handleNewListCardClose()
            setNewListTitle("")
            handleOnDashbord(dashbordDataObj?.id) // UPDATE CONTENT
            success(result.message)
        } else {
            error(result.message)
        }
    }

    // DND HANDLER
    const handleDragStart = (event) => {
        setActiveCard(event.active.data.current);
    };

    // DREAG AND DROP HANDLE
    const handleDragEnd = useCallback(
        async (event) => {
            setActiveCard(null);
            const { active, over } = event;

            if (!over) return;

            const taskId = active.id;
            const newStatus = over.id;

            // UPDATE PARENT OF CHILD CARD
            const data = JSON.stringify({
                c_id: taskId,
                dashbord_c_id: newStatus,
            });
            let result = await apiHelper.postRequest("update-child-card", data);
            if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
                handleOnDashbord(dashbordDataObj?.id);
            }
        },
        [dashbordDataObj]
    );

    // GET NOTIFICATION
    async function getNotification() {
        let result = await apiHelper.getRequest("get-notification")
        if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
            setAllNotification(result?.body);
            const notifications = result?.body?.reduce((acc, current) => {
                return acc + (current?.is_viewed ? 0 : 1);
            }, 0);
            setNotificationCount(notifications);
        } else {
            setAllNotification([]);
            setNotificationCount(0);
        }
    }

    const handleToggleNotifications = () => {
        setIsNotificationOpen(!isNotificationOpen);
    }

    // RECEIVE NOTIFICATION SOCKET
    useEffect(() => {
        socket.on("receive_notification", (data) => {
            if (data.reciver_id == loggedInUser) {
                const notifications = data?.is_viewed ? 0 : 1;
                setAllNotification((prev) => [data, ...prev]);
                setNotificationCount((prev) => prev + notifications);
            }
        });

        return () => {
            socket.off("receive_notification");
        };
    }, []);

    const handleAcceptInvite = async (e, value) => {
        e.preventDefault();
        if (!value.board_id || !value.reciver_id) return;

        let data = JSON.stringify({
            board_id: value.board_id,
            collaborators_id: value.reciver_id,
        });
        let result = await apiHelper.postRequest("accept-invite", data);
        if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
            await socket.emit("send_notification", result?.body?.notification);
            getNotification();
            setBoardData((prev) => [...prev, result?.body?.board]);
            success(result.message);
        }
    };

    const handleRejectInvite = async (e, value) => {
        e.preventDefault();
        if (!value.board_id || !value.reciver_id) return;

        let data = JSON.stringify({
            board_id: value.board_id,
            collaborators_id: value.reciver_id,
        });
        let result = await apiHelper.postRequest("reject-invite", data);
        if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
            await socket.emit("send_notification", result?.body);
            getNotification();
            success(result.message);
        }
    };

    const handleViewed = async (e, value) => {
        e.preventDefault();
        if (value.is_viewed == true) return;
        let result = await apiHelper.postRequest(
            `update-notofication-status?notf_id=${value.id}`
        );
        if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
            getNotification();
        }
    };

    // CLOSE 3 POP-UPS
    const handleCloseAll = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            // setIsBoardUsers(false);
            // setIsNotificationOpen(false);
        }
    }

    useEffect(() => {
        getNotification()
        if (!!dashbordCID) {
            getBoardUsers(dashbordCID)
        }
    }, [dashbordCID])

    const handleToggleBoardUsers = async () => {
        setIsBoardUsers(!isBoardUsers)
    }

    // GET MESSAGES ( ON HANDLE JOIN CHAT )
    async function getMessages(chatId) {
        let result = await apiHelper.getRequest(`get-chat-room-messages?chat_room_id=${chatId}`) //FOR GROUP CHAT
        if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
            setMessages(result?.body);
        } else {
            setMessages([])
        }
    }

    const handleSingleChat = async (e, value) => {
        let configData = {
            is_group: false,
            group_name: "",
            board_id: "", // null
            group_users: [],
            user_2: value?.id,
        }
        setChatUserDetail(value) // receiver data
        await handleCreateChatRoom(e, configData)
    }

    const handleGroupChat = async (e) => {
        if (!boardUsers?.length > 0) return // object
        let configData = {
            is_group: true,
            group_name: dashbordDataObj?.title,
            board_id: dashbordDataObj?.id,
            group_users: boardUsers,
            user_1: "",
            user_2: "",
        }
        setChatUserDetail({ name: dashbordDataObj?.title }) // group title
        await handleCreateChatRoom(e, configData)
    }

    // GROUP CHAT AND SINGLE CHAT
    const handleCreateChatRoom = async (e, configData) => {
        e.preventDefault();
        // setIsBoardUsers(false)
        // setIsChatbox(true)
        let data = JSON.stringify({ configData });
        let result = await apiHelper.postRequest("create-chat-room", data);
        if (result?.code == DEVELOPMENT_CONFIG.statusCode) {
            await getMessages(result?.body?.id)
            setIsBoardUsers(false)
            setIsChatbox(true)
            setChatRoomId(result?.body?.id);
            socket.emit("join_chat", result?.body?.id);
        }
        else {
            setChatRoomId(null);
        }
    };

    // SEND MESSAGE
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!chatRoomId || !message) return;

        let data = JSON.stringify({
            chat_room_id: chatRoomId,
            message,
        });
        let result = await apiHelper.postRequest("send-chat-message", data);
        if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
            await socket.emit("send_message", result?.body);
            setMessage("");
            // if (sticky) {
            //     scrollToBottom();
            // }
        } else { }
    };

    // RECEIVE MESSAGE SOCKET
    useEffect(() => {
        socket.on("receive_message", (data) => {
            if (data.chat_room_id === chatRoomId) {
                setMessages((prev) => {
                    return [...prev, data];
                });
            }
        });

        return () => {
            socket.off("receive_message");
        };
    }, [chatRoomId]);

    return (
        <>
            <div
                className="flex-1 overflow-auto overflow-y-hidden bg-[#8636a5]"
                style={{
                    backgroundColor: dashbordDataObj?.bg_color?.startsWith("#")
                        ? dashbordDataObj?.bg_color
                        : "8636a5",
                    backgroundSize: "cover",
                }}
            >
                {/* HEADER */}
                <div className="fixed w-full flex items-center bg-[#50247e] p-3 border-t border-[#8d99b9] gap-2 z-1">
                    <div className="flex items-center gap-2 relative" tabIndex={0} onBlur={handleCloseAll}>
                        <h1 className="text-lg font-bold cursor-pointer hover:bg-[#918ca555] inline-block p-1 px-2 rounded">
                            {dashbordDataObj.title || "Your Board"}
                        </h1>
                        <button className="hover:bg-[#948ab7] rounded cursor-pointer p-2">
                            <Star size={16} strokeWidth={2.5} />
                        </button>
                        <button className="hover:bg-[#948ab7] rounded cursor-pointer p-2"
                            onClick={handleToggleBoardUsers}
                        >
                            <UsersRound size={16} strokeWidth={2.5} />
                        </button>
                        {/*  USERS BOARD */}
                        {isBoardUsers && (
                            <div className="absolute min-h-92 w-92 top-8 right-0 bg-white border rounded-lg shadow-md p-3">
                                <div className="flex items-center justify-between p-1 text-gray-700 text-lg border-b border-b-gray-300">
                                    <h3 className="">All Board Users</h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="flex items-center text-sm bg-gray-200 gap-1 hover:bg-gray-300 rounded cursor-pointer p-1"
                                            onClick={handleGroupChat}
                                        >
                                            <span>Group Chat</span>
                                            <span><MessagesSquare size={14} /></span>
                                        </button>
                                        <button
                                            className="hover:bg-gray-300 rounded cursor-pointer p-1.5"
                                            onClick={() => setIsBoardUsers(false)}
                                        >
                                            < X size={18} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                                {!!boardUsers && boardUsers.length > 0 && (
                                    <ul className="text-gray-600 text-sm mt-3 max-h-72 flex flex-col gap-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                                        {boardUsers?.map((value) => (
                                            <li
                                                key={value.id}
                                                className="p-2 rounded cursor-pointer hover:bg-gray-200"
                                                onClick={(e) => handleSingleChat(e, value)}
                                            >{value.name}{" "}{value?.id == loggedInUser ? "( You )" : ""}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* CHAT BOT */}
                        {!!isChatbox && (
                            <div className="absolute min-h-92 w-92 top-8 right-0 bg-green-50 border border-green-200 rounded-lg shadow-md p-1">
                                <div className="flex flex-col text-gray-600 gap-1 h-92">
                                    <div className="flex items-center justify-between p-1">
                                        <span className={`text-sm font-semibold`}>
                                            {chatUserDetail?.name}{" "}{chatUserDetail?.id == loggedInUser ? "( You )" : ""}
                                        </span>
                                        <button
                                            className="hover:bg-gray-300 rounded cursor-pointer p-1"
                                            onClick={() => {
                                                setIsChatbox(false)
                                                setIsBoardUsers(true)
                                                setMessage("")
                                            }}
                                        >
                                            < X size={18} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-1">
                                        {!!messages && messages.length > 0 && (
                                            <ScrollToBottom className="h-full">
                                                <ul className="flex flex-col gap-2 p-2">
                                                    {messages?.map((value) => (
                                                        < li key={value.id} className={`w-36 flex flex-col max-w-60 px-1 border border-gray-200 rounded-lg ${value.sender_id == loggedInUser ? "self-end bg-green-200" : "bg-gray-200"}`}>
                                                            <span className="text-xs font-medium text-gray-700 self-start border-b-1 border-gray-300 mb-1">{value?.sender_id == loggedInUser ? "" : value.sender_name}</span>
                                                            <span className="text-sm font-medium text-gray-700 text-right">{value.message}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </ScrollToBottom>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <input
                                            className="rounded-full border w-full border-green-400 bg-white text-sm font-medium text-gray-700 p-2 ring-1 ring-transparent focus:ring-green-500 focus:border-green-500 outline-none transition"
                                            type="text"
                                            value={message}
                                            placeholder="Enter Message"
                                            onChange={(event) => {
                                                setMessage(event.target.value);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    sendMessage(e);
                                                }
                                            }}
                                        />
                                        <button className="h-10 w-10 px-2.5 rounded-full border border-green-400 hover:border-2 hover:border-green-500 bg-green-300 cursor-pointer"
                                            onClick={sendMessage}
                                        >
                                            <SendHorizontal size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

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
                    <div className="flex items-center gap-2 relative" tabIndex={0} onBlur={handleCloseAll}>
                        <button className="flex hover:bg-[#948ab7] rounded p-1 w-6 cursor-pointer"
                            onClick={handleToggleNotifications}
                        >
                            <Bell size={15} strokeWidth={2.5} />
                            <Badge
                                badgeContent={notificationCount}
                                color="success"
                                sx={{
                                    "& .MuiBadge-badge": {
                                        backgroundColor: "green",
                                        color: "white",
                                        fontSize: "10px",
                                        fontWeight: "bold",
                                        height: "16px",
                                        minWidth: "14px",
                                    },
                                }}
                            />
                        </button>
                        {isNotificationOpen && (
                            <div className="absolute h-92 w-80 top-8 left-2 bg-white border rounded shadow-md p-3">
                                <div className="flex items-center justify-between p-1 text-gray-700 text-lg border-b border-b-gray-300">
                                    <h3>Notifications</h3>
                                    <button
                                        className="hover:bg-gray-300 rounded cursor-pointer p-1"
                                        onClick={() => setIsNotificationOpen(false)}
                                    >
                                        <X size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                                {allNotification && allNotification.length > 0 ? (
                                    <ul className="text-gray-600 text-sm mt-3 max-h-72 flex flex-col gap-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                                        {allNotification?.map((value) => (
                                            <li
                                                key={value.id}
                                                className={`flex flex-col border border-gray-200 p-2 rounded gap-2 cursor-pointer ${!!value.is_viewed ? "" : "bg-gray-200"
                                                    }`}
                                                onClick={(e) => handleViewed(e, value)}
                                            >
                                                <div>{value.message}</div>
                                                <>
                                                    {!!value.is_reject && (
                                                        <div className="text-xs text-red-500">Rejected</div>
                                                    )}
                                                    {!!value.is_accept && (
                                                        <div className="text-xs text-green-500">
                                                            Accepted
                                                        </div>
                                                    )}
                                                    {value.invitation && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                className="w-28 p-1 bg-red-600 rounded text-white cursor-pointer"
                                                                onClick={(e) => handleRejectInvite(e, value)}
                                                            >
                                                                Reject
                                                            </button>
                                                            <button
                                                                className="w-28 p-1 bg-green-600 rounded text-white cursor-pointer"
                                                                onClick={(e) => handleAcceptInvite(e, value)}
                                                            >
                                                                Accept
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="h-72 flex items-center justify-center">
                                        <p className="text-gray-700 text-lg ">No Notification</p>
                                    </div>
                                )}
                            </div>
                        )}
                        <button className="hover:bg-[#948ab7] rounded p-1 w-6 cursor-pointer">
                            <CalendarDays size={15} strokeWidth={2.5} />
                        </button>
                        <button className="hover:bg-[#948ab7] rounded p-1 w-6 cursor-pointer">
                            <Ellipsis size={15} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
                {/* CONTENT */}

                <div className="flex gap-4 mt-16 p-3 w-fit relative">
                    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        {!!dashbordDataObj &&
                            dashbordDataObj?.dashbord_cards?.map((value) => (
                                <TaskCard key={value.id} id={value.id} values={value} />
                            ))}

                        <DragOverlay>
                            {activeCard ? (
                                <div className="bg-[#E5E7EB] text-gray-600 rounded">
                                    <ChildCard
                                        key={activeCard.id}
                                        id={activeCard.id}
                                        cardValues={activeCard}
                                    />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>

                    {dashbordDataObj.id && (
                        <>
                            {newListCard ? (
                                <div className="bg-white h-fit p-2 rounded-xl min-w-72 flex flex-col gap-2">
                                    <textarea
                                        ref={listRef}
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
                                        <button
                                            className="text-sm bg-blue-600 hover:bg-blue-700 px-3 rounded cursor-pointer"
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
                                        <span className="text-sm font-semibold">
                                            Add another list
                                        </span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div >

            <Description />
            <ToastContainer rtl />
        </>
    );
}

export { socket };