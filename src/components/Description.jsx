import React, { useEffect, useState, useRef } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { CircleStop, Clock, Menu, Pause, Play, Plus, X, UserRoundPlus, UserRound, UserRoundMinus } from "lucide-react";
import { useIndexContext } from "../context/IndexContext";
import DEVELOPMENT_CONFIG from "../helpers/config";
import apiHelper from "../helpers/api-helper";
import Member from "./Member";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 780,
  bgcolor: "background.paper",
  p: 2,
};

export default function Description() {
  const {
    openDescription,
    setOpenDescription,
    childCardDetails,
    handleComplete,
    handleUpdateChildCardTitle,
    getBoards,
    allJoinedUsers,
    setAllJoinedUsers,
    getAllUsersJoinedCard,
  } = useIndexContext();

  // CLOSE DESCRIPTION MODAL
  const handleClose = () => {
    getBoards(); //OR update dashbord_c_id=ID
    setOpenDescription(false);
  };

  const [childCardData, setChildCardData] = useState({
    id: "",
    title: "",
    description: "",
    is_checked: "",
    dashbord_c_id: "",
    is_archive: "",
  });
  const [history, setHistory] = useState([]);
  const [totalTime, setTotalTime] = useState(0);
  const [showHistory, setShowHistory] = useState(true);

  const [timers, setTimers] = useState({});

  useEffect(() => {
    setChildCardData(childCardDetails?.history);
    setHistory(childCardDetails?.history?.child_card_times)
    setTotalTime(childCardDetails?.totalTime)
  }, [childCardDetails]);

  const username = childCardDetails?.user?.name.split(' ')[0];
  const firstLetter = username?.charAt(0);

  const [descriptionBoard, setDescriptionBoard] = useState(false);
  const handleOpenDescriptionBoard = async () => {
    setDescriptionBoard(true);
  };
  const handleCloseDescriptionBoard = async () => {
    setDescriptionBoard(false);
  };

  const handleValidation = () => {
    let isValid = true;
    if (childCardData.description.trim() === "") {
      isValid = false;
    }
    return isValid;
  };
  // HANDLE UPDATE DESCRIPTION
  const handleUpdateDescription = async (e, id) => {
    e.preventDefault();
    if (!handleValidation()) {
      handleCloseDescriptionBoard();
      return;
    }
    let data = JSON.stringify({
      c_id: id,
      description: childCardData.description,
    });
    let result = await apiHelper.postRequest("update-child-card-description", data);
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
      handleCloseDescriptionBoard();
    } else { }
  };

  async function screenShot() {
    let data = JSON.stringify({
      c_id: childCardData?.id
    })
    let result = await apiHelper.postRequest("screen-shot", data)
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
    } else { }
  }

  const handleHideShowTimer = (cardId) => {
    setTimers((prevTimers) => ({
      ...prevTimers,
      [cardId]: {
        ...prevTimers[cardId],
        showTimer: !prevTimers[cardId]?.showTimer,
      },
    }));
  };
  const handleHideShowHistory = (cardId) => {
    setShowHistory(!showHistory)
    // setTimers((prevTimers) => ({
    //   ...prevTimers,
    //   [cardId]: {
    //     ...prevTimers[cardId],
    //     showHistory: !prevTimers[cardId]?.showHistory,
    //   },
    // }));
  };

  useEffect(() => {
    const intervals = {};
    Object.keys(timers).forEach((cardId) => {
      if (timers[cardId].isRunning) {
        intervals[cardId] = setInterval(() => {
          setTimers((prevTimers) => {
            const newTime = (prevTimers[cardId]?.time ?? 0) + 1;
            if (newTime % 20 === 0) {
              // screenShot()
            }
            return {
              ...prevTimers,
              [cardId]: {
                ...prevTimers[cardId],
                time: newTime
              },
            }
          });
        }, 1000);
      }
    });
    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [timers]);

  const handlePlay = (cardId) => {
    setTimers((prevTimers) => ({
      ...prevTimers,
      [cardId]: {
        isRunning: true,
        time: prevTimers[cardId]?.time ?? 0,
        showTimer: true,
        // showHistory: true
      },
    }));
  };

  const handlePlayPause = (cardId) => {
    setTimers((prevTimers) => ({
      ...prevTimers,
      [cardId]: {
        ...prevTimers[cardId],
        isRunning: !prevTimers[cardId]?.isRunning,
        time: prevTimers[cardId]?.time ?? 0,
      },
    }));
  };

  const formatTime = (seconds = 0) => {
    if (isNaN(seconds)) seconds = 0;

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handleStop = async (e, id) => {
    e.preventDefault();

    if (timers[id]?.time === 0) return

    let data = JSON.stringify({
      c_id: id,
      duration: timers[id]?.time
    })
    let result = await apiHelper.postRequest("update-time", data)
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
      setHistory(result?.body?.history);
      setTotalTime(result?.body?.totalTime);
      setTimers((prevTimers) => ({
        ...prevTimers,
        [id]: {
          ...prevTimers[id],
          isRunning: false,
          time: 0,
          showTimer: false
        },
      }));
    } else {
      setTimers((prevTimers) => ({
        ...prevTimers,
        [id]: {
          ...prevTimers[id],
          isRunning: false,
          time: 0,
          showTimer: false // check
        },
      }));
    }
  }

  // Day Wise
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).replace(',', '');
  };

  const groupedHistory = history?.reduce((acc, entry) => {
    const date = formatDate(entry.created_at)
    if (!acc[date]) acc[date] = { entries: [], total: 0 };
    acc[date].entries.push(entry);
    acc[date].total += entry.duration
    return acc;
  }, {})

  let extractFirst = (name) => {
    const fName = name?.charAt(0);
    return fName
  }

  const [isOpenJoinMember, setIsOpenJoinMember] = useState(false)
  const [joinedUser, setJoinedUser] = useState({})

  const openMemberBoard = () => {
    setIsOpenJoinMember(!isOpenJoinMember)
  }

  const popupRef = useRef(null);
  const buttonRef = useRef(null);
  const buttonRef2 = useRef(null);

  const [isOpenJoinMember2, setIsOpenJoinMember2] = useState(false);
  const openMemberBoard2 = () => setIsOpenJoinMember2(!isOpenJoinMember2);

  const handleCloseAll = (e) => {
    if (
      popupRef.current && !popupRef.current.contains(e.target)
    ) {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setIsOpenJoinMember(false);
      }
      if (buttonRef2.current && !buttonRef2.current.contains(e.target)) {
        setIsOpenJoinMember2(false);
      }
    }
  };

  // GET USER JOINED CARD
  async function getCardJoinedUser(c_id) {
    let result = await apiHelper.getRequest(`get-card-joined-user?c_id=${c_id}`)
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
      setJoinedUser(result?.body)
    } else {
      setJoinedUser({})
    }
  }

  useEffect(() => {
    getCardJoinedUser(childCardData?.id)
    getAllUsersJoinedCard(childCardData?.id)
  }, [childCardData])

  // JOIN AND LEAVE SINGLE USER
  const handleJoinLeaveUser = async (e, c_id, is_join) => {
    e.preventDefault();
    let data = JSON.stringify({
      c_id,
      is_join
    })
    let result = await apiHelper.postRequest("user-join-card", data)
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
      setJoinedUser(result?.body)
      setAllJoinedUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === result?.body.id ? { ...user, is_join: result?.body.is_join } : user
        )
      );
    } else {
      setJoinedUser({})
    }
  }

  return (
    <Modal
      open={openDescription}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={{ ...style }} className="rounded-xl">
        <div
          className="space-y-6 text-gray-700 max-h-[90vh] overflow-y-auto"
          onMouseDown={handleCloseAll}
        >
          {/* HEADER TITLE */}
          <div className="flex w-full gap-5 items-start justify-between">
            <div className="flex flex-row w-full gap-2 items-center justify-between">
              <input
                type="checkbox"
                checked={!!childCardData?.is_checked}
                className="w-5 h-4.5 mx-1 appearance-none border-2 border-gray-500 cursor-pointer rounded-full checked:block checked:bg-green-600 checked:border-green-600 bg-center bg-no-repeat focus:outline-none"
                onChange={(e) => handleComplete(e, childCardData?.id)}
              />
              <textarea
                value={childCardData?.title}
                className="w-full h-8 px-2 py-1 text-xl font-semibold resize-none outline-none overflow-hidden rounded focus:border-2 focus:border-blue-600"
                onChange={(e) => {
                  setChildCardData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }));
                  e.target.style.height = "32";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleUpdateChildCardTitle(
                      e,
                      childCardData.id,
                      childCardData.title
                    );
                  }
                }}
              />
            </div>
            <button className="p-1 cursor-pointer" onClick={handleClose}>
              <X size={20} />
            </button>
          </div>

          {/* CONTENT LEFT */}
          <div className="flex gap-4">
            <div className="flex flex-col py-2 space-y-4 w-xl">

              {/* Members */}
              {!!allJoinedUsers && allJoinedUsers?.length > 0 && (
                <div className="w-full">
                  <div className="mx-9 flex flex-col gap-1 w-full px-2">
                    <p className="text-sm">Members</p>
                    <div className="flex items-center gap-2 relative">
                      <ul className="flex">
                        {allJoinedUsers?.map((value) => (
                          <li key={value.id}>
                            {!!value.is_join && (
                              <div className="w-9 h-9 flex items-center justify-center bg-yellow-500 font-bold rounded-full cursor-pointer">
                                {extractFirst(value.user_name)}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul >
                      <button
                        ref={buttonRef}
                        className="w-9 h-9 flex items-center justify-center bg-gray-200 text-gray-700 text-xl rounded-full hover:bg-gray-300 transition cursor-pointer"
                        onClick={openMemberBoard}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {!!isOpenJoinMember &&
                      <div ref={popupRef}
                        className="absolute left-12 mt-16 text-gray-700 bg-white rounded-lg shadow-xl w-80 p-3 border border-gray-200"
                      >
                        <Member setIsOpenJoinMember={setIsOpenJoinMember} setJoinedUser={setJoinedUser} />
                      </div>
                    }
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="flex items-start gap-2 w-full">
                <button className="p-1">
                  <Menu size={20} />
                </button>
                <div className="flex flex-col gap-4 w-full px-2">
                  <p className="text-base font-medium">Description</p>
                  {!descriptionBoard ? (
                    <button
                      className="bg-gray-200 rounded py-4 hover:bg-gray-300 cursor-pointer"
                      onClick={handleOpenDescriptionBoard}
                    >
                      Add more detailed description
                    </button>
                  ) : (
                    <div>
                      <textarea
                        value={childCardData?.description}
                        placeholder="Enter some text here"
                        className="w-full px-2 py-1 text-base font-medium resize-none outline-none overflow-hidden rounded border border-gray-500 focus:border-2 focus:border-blue-600"
                        onChange={(e) => {
                          setChildCardData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }));
                          e.target.style.height = "auto";
                          e.target.style.height = e.target.scrollHeight + "px";
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          className="border border-blue-700 text-white px-3 rounded bg-blue-600"
                          onClick={(e) => {
                            handleUpdateDescription(e, childCardData?.id);
                          }}
                        >
                          Save
                        </button>
                        <button
                          className="border px-2 rounded"
                          onClick={handleCloseDescriptionBoard}
                        >
                          Cancle
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* TIMER  */}
              <div className="flex items-start gap-2 w-full">
                <button className="p-1">
                  <Clock size={20} />
                </button>
                <div className="flex flex-col gap-4 w-full px-2">
                  <div className="flex justify-between items-center px-2">
                    <p className="text-base font-medium">Work Log</p>
                    <button className="bg-gray-200 text-sm rounded px-4 py-2 hover:bg-gray-300 cursor-pointer"
                      onClick={() => handleHideShowTimer(childCardData?.id)}
                    >
                      {timers[childCardData?.id]?.showTimer ? "Hide" : "Show"} Details
                    </button>
                  </div>
                  {!!timers[childCardData?.id]?.showTimer &&
                    <div className="flex justify-between px-4 p-2 ">
                      <div className="text-lg text-gray-500 font-semibold space-x-4">
                        <span className="border-b-2 border-b-black ">{childCardData?.title}</span>
                        <span className="text-gray-600">
                          {formatTime(timers[childCardData?.id]?.time)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button className=""
                          onClick={() => handlePlayPause(childCardData?.id)}
                        >
                          {timers[childCardData?.id]?.isRunning ? (
                            <Pause size={28} />
                          ) : (
                            <Play size={28} />
                          )
                          }
                        </button>
                        <button onClick={(e) => handleStop(e, childCardData?.id)}>
                          <CircleStop size={28} />
                        </button>
                      </div>
                    </div>
                  }

                  <div className="flex flex-col gap-2">
                    <span className="text-sm">No estimate for this card</span>
                    <div className="flex w-full items-end justify-between gap-2">
                      <div className="flex flex-col gap-0.5 w-64">
                        <span className="text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center text-black bg-blue-500">
                          {firstLetter}
                        </span>
                        <progress className="h-2 bg-gray-300 rounded w-full" value={totalTime} max="43200"></progress>
                        <span className="text-xs text-gray-500">{formatTime(totalTime)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="bg-gray-200 text-sm rounded px-3 py-2 hover:bg-gray-300 cursor-pointer">
                          <Plus size={18} />{" "}
                        </button>
                        {!timers[childCardData?.id]?.showTimer &&
                          <button
                            className="bg-gray-200 text-sm rounded px-3 py-2 hover:bg-gray-300 cursor-pointer"
                            onClick={() => handlePlay(childCardData.id)}
                          >
                            <Play size={18} />{" "}
                          </button>
                        }
                        <button className="bg-gray-200 text-sm rounded px-4 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() => handleHideShowHistory(childCardData?.id)}
                        >
                          {showHistory ? "Hide" : "Show"} Details
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-500 p-2">
                    {showHistory && groupedHistory &&
                      <ul className="flex flex-col gap-2">
                        {Object.entries(groupedHistory).map(([date, data]) => (
                          <div key={date}>
                            <span className="text-sm text-gray-500">{date} {"-"} {formatTime(data.total)}</span>
                            {data?.entries.map((entry, index) => (
                              <div key={index} className="flex items-center gap-3 py-2">
                                <span className="text-base font-semibold rounded-full w-8 h-8 flex items-center justify-center text-black bg-blue-500">
                                  {extractFirst(entry.user_name)}
                                </span>
                                <span className="text-base text-gray-800 font-semibold">{entry.user_name}</span>
                                <li
                                  className="text-sm p-1">
                                  {formatTime(entry.duration)}
                                </li>
                              </div>
                            ))}
                          </div>
                        ))}
                      </ul>
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT RIGHT */}
            <div className="space-y-2">
              {!!joinedUser && joinedUser?.is_join ? (
                <button
                  className="flex w-40 gap-2 bg-gray-200 text-sm rounded px-4 py-2 hover:bg-gray-300 cursor-pointer"
                  onClick={(e) => handleJoinLeaveUser(e, childCardData?.id, false)}
                >
                  <UserRoundMinus size={18} />
                  <span>Leave</span>
                </button>
              ) : (
                <button
                  className="flex w-40 gap-2 bg-gray-200 text-sm rounded px-4 py-2 hover:bg-gray-300 cursor-pointer"
                  onClick={(e) => handleJoinLeaveUser(e, childCardData?.id, true)}
                >
                  <UserRoundPlus size={18} />
                  <span>Join</span>
                </button>
              )}
              <button
                ref={buttonRef2}
                className="flex w-40 gap-2 bg-gray-200 text-sm rounded px-4 py-2 hover:bg-gray-300 cursor-pointer relative"
                onClick={openMemberBoard2}
              >
                <UserRound size={18} />
                <span>Members</span>
              </button>
              {!!isOpenJoinMember2 &&
                <div
                  ref={popupRef}
                  className="absolute text-gray-700 bg-white rounded-lg shadow-xl w-80 p-3 border border-gray-200"
                >
                  <Member setIsOpenJoinMember={setIsOpenJoinMember2} setJoinedUser={setJoinedUser} />
                </div>
              }
            </div>
          </div>
        </div>
      </Box>
    </Modal >
  );
}
