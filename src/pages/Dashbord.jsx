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
import io from "socket.io-client";
import ScrollToBottom, {
  useScrollToBottom,
  useSticky,
} from "react-scroll-to-bottom";

const socket = io.connect("http://localhost:4321");

export default function Dashbord() {
  const [newListCard, setNewListCard] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const {
    dashbordDataObj,
    handleOnDashbord,
    setBoardData,
    setDashbordDataObj,
  } = useIndexContext();
  const [activeCard, setActiveCard] = useState(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [allNotification, setAllNotification] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [isBoardUsers, setIsBoardUsers] = useState(false);
  const [boardUsers, setBoardUsers] = useState({});

  const [isChatbox, setIsChatbox] = useState(false);

  const [chatUserDetail, setChatUserDetail] = useState({});
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [chatRoomId, setChatRoomId] = useState(null);

  const listRef = useRef(null);

  let isLogin = localStorage.getItem("token");
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
    toast.success(msg, {
      autoClose: 5000,
    });
  };
  const error = (msg) => {
    toast.success(msg, {
      autoClose: 5000,
    });
  };

  const handleValidation = () => {
    let isValid = true;
    if (newListTitle.trim() === "") {
      isValid = false;
    }
    return isValid;
  };
  // CREATE DASHBORD CARD ( ADD LIST )
  async function handleCreateDashbordCard(e) {
    e.preventDefault();
    if (!handleValidation()) {
      return;
    }
    let data = JSON.stringify({
      title: newListTitle,
      board_id: dashbordDataObj?.id,
    });
    let result = await apiHelper.postRequest("create-dashbord-card", data);
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
      handleNewListCardClose();
      setNewListTitle("");
      handleOnDashbord(dashbordDataObj?.id); // UPDATE CONTENT
      success(result.message);
    } else {
      error(result.message);
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
        id: taskId,
        dashbord_c_id: newStatus,
      });
      let result = await apiHelper.postRequest("update-child-card", data);
      if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
        handleOnDashbord(dashbordDataObj?.id);
      }
    },
    [dashbordDataObj]
  );

  // LOGOUT
  const handleToggleMenu = () => {
    if (isLogin) {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  const handleLogOut = () => {
    setIsMenuOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    setBoardData([]);
    setDashbordDataObj({});
    setIsBoardUsers(false);
    setIsChatbox(false);
    setIsNotificationOpen(false);
  };

  // GET NOTIFICATION ( ONCLICK )
  async function getNotification() {
    let result = await apiHelper.getRequest("get-notification");
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
      setAllNotification(result?.body);
    } else {
      setAllNotification([]);
    }
  }

  const handleToggleNotifications = () => {
    if (isLogin) {
      getNotification();
      setIsNotificationOpen(!isNotificationOpen);
    }
  };

  // CLOSE 3 POP-UPS
  const handleCloseAll = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      // setIsBoardUsers(false);
      setIsNotificationOpen(false);
      setIsMenuOpen(false);
    }
  };

  // GET BOARD USERS ( ONCLICK )
  async function getBoardUsers(id) {
    let result = await apiHelper.getRequest(`get-board-users?board_id=${id}`);
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
      setBoardUsers(result?.body);
    } else {
      setBoardUsers({});
    }
  }

  useEffect(() => {
    if (isLogin) {
      getBoardUsers(dashbordCID);
    }
  }, [dashbordCID]);

  const handleToggleBoardUsers = async () => {
    if (isLogin) {
      // if (isLogin && !!dashbordCID) {
      // getBoardUsers(dashbordCID)
      setIsBoardUsers(!isBoardUsers);
    }
  };

  // GET MESSAGES ( ON HANDLE JOIN CHAT )
  async function getMessages(chatId) {
    let result = await apiHelper.getRequest(
      `get-chat-room-messages?chat_room_id=${chatId}`
    ); //FOR GROUP CHAT
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
      setMessages(result?.body);
    } else {
      setMessages([]);
    }
  }

  const handleSingleChat = async (e, value) => {
    let configData = {
      is_group: false,
      group_name: "",
      group_board_id: "", // null
      group_users: [],
      user_2: value?.id,
    };
    setChatUserDetail(value); // receiver data
    await handleCreateChatRoom(e, configData);
  };

  const handleGroupChat = async (e) => {
    let configData = {
      is_group: true,
      group_name: dashbordDataObj?.title,
      group_board_id: dashbordDataObj?.id,
      group_users: boardUsers,
      user_1: "",
      user_2: "",
    };
    setChatUserDetail({ name: dashbordDataObj?.title }); // group title
    await handleCreateChatRoom(e, configData);
  };

  // GROUP CHAT AND SINGLE CHAT
  const handleCreateChatRoom = async (e, configData) => {
    e.preventDefault();
    // setIsBoardUsers(false)
    // setIsChatbox(true)
    let data = JSON.stringify({ configData });
    let result = await apiHelper.postRequest("create-chat-room", data);
    if (result?.code == DEVELOPMENT_CONFIG.statusCode) {
      await getMessages(result?.body?.id);
      setIsBoardUsers(false);
      setIsChatbox(true);
      setChatRoomId(result?.body?.id);
      socket.emit("join_chat", result?.body?.id);
    } else {
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
    } else {
    }
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
          <div
            className="flex items-center gap-2 relative"
            tabIndex={0}
            onBlur={handleCloseAll}
          >
            <h1 className="text-lg font-bold cursor-pointer hover:bg-[#918ca555] inline-block p-1 px-2 rounded">
              {dashbordDataObj.title || "Your Board"}
            </h1>
            <button className="hover:bg-[#948ab7] rounded cursor-pointer p-2">
              <Star size={16} strokeWidth={2.5} />
            </button>
            <button
              className="hover:bg-[#948ab7] rounded cursor-pointer p-2"
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
                      <span>
                        <MessagesSquare size={14} />
                      </span>
                    </button>
                    <button
                      className="hover:bg-gray-300 rounded cursor-pointer p-1.5"
                      onClick={() => setIsBoardUsers(false)}
                    >
                      <X size={18} strokeWidth={2.5} />
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
                      >
                        {value.name}{" "}
                        {value?.id == loggedInUser ? "( You )" : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* CHAT BOT SINGLE USER */}
            {!!isChatbox && (
              <div className="absolute min-h-92 w-92 top-8 right-0 bg-green-50 border border-green-200 rounded-lg shadow-md p-1">
                <div className="flex flex-col text-gray-600 gap-1 h-92">
                  <div className="flex items-center justify-between p-1">
                    <span className={`text-sm font-semibold`}>
                      {chatUserDetail?.name}{" "}
                      {chatUserDetail?.id == loggedInUser ? "( You )" : ""}
                    </span>
                    <button
                      className="hover:bg-gray-300 rounded cursor-pointer p-1"
                      onClick={() => {
                        setIsChatbox(false);
                        setIsBoardUsers(true);
                      }}
                    >
                      <X size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-1">
                    {!!messages && messages.length > 0 && (
                      <ScrollToBottom className="h-full">
                        <ul className="flex flex-col gap-2 p-2">
                          {messages?.map((value) => (
                            <li
                              key={value.id}
                              className={`w-fit max-w-60 px-1 border border-gray-200 rounded-lg ${
                                value?.sender_id == loggedInUser
                                  ? "self-end bg-green-200"
                                  : "bg-gray-200"
                              }`}
                            >
                              <span className="text-sm font-medium text-gray-700">
                                {value.message}
                              </span>
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
                    <button
                      className="h-10 w-10 px-2.5 rounded-full border border-green-400 hover:border-2 hover:border-green-500 bg-green-300 cursor-pointer"
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
          <div
            className=" flex items-center gap-2 relative"
            tabIndex={0}
            onBlur={handleCloseAll}
          >
            <button
              className="hover:bg-[#948ab7] rounded p-1 w-6 cursor-pointer"
              onClick={handleToggleNotifications}
            >
              <Bell size={15} strokeWidth={2.5} />
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
                        className="border border-gray-200 p-2 rounded"
                      >
                        {value.message}
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
            <button
              className="hover:bg-[#948ab7] rounded p-1 w-6 cursor-pointer"
              onClick={handleToggleMenu}
            >
              <Ellipsis size={15} strokeWidth={2.5} />
            </button>
            {isMenuOpen && (
              <div className="absolute top-8 right-0 bg-white border rounded shadow-md p-2">
                <button
                  className="text-gray-500 bg-gray-200 text-base px-3 py-1 rounded hover:bg-gray-300 cursor-pointer"
                  onClick={handleLogOut}
                >
                  Logout
                </button>
              </div>
            )}
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
      </div>

      <Description />
      <ToastContainer rtl />
    </>
  );
}
