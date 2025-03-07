import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { CircleStop, Clock, Menu, Pause, Play, Plus, X } from "lucide-react";
import { useIndexContext } from "../context/IndexContext";

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
  const { openDescription, setOpenDescription, childCardDetails } =
    useIndexContext();

  // CLOSE DESCRIPTION MODAL
  const handleClose = () => {
    setOpenDescription(false);
  };

  const [childCardData, setChildCardData] = useState({});

  const [isChecked, setIsChecked] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setIsChecked(childCardDetails?.is_checked);
    setTitle(childCardDetails?.title);
    setDescription(childCardDetails.description);
  }, [childCardDetails]);

  const handleComplete = async (e, id) => {
    e.preventDefault();
    console.log("==================", id, isChecked);
    // const newStatus = !isChecked;
    // setIsChecked(newStatus)
  };

  return (
    <Modal
      open={openDescription}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style} className="rounded-xl">
        <div className="space-y-6 text-gray-700 ">
          {/* HEADER TITLE */}
          <div className="flex w-full gap-5 items-start justify-between">
            <div className="flex flex-row w-full gap-2 items-center justify-between">
              <input
                type="checkbox"
                // checked={childCardDetails?.is_checked}
                checked={isChecked}
                className="w-5 h-4.5 mx-1 appearance-none border-2 border-gray-500 cursor-pointer rounded-full checked:block checked:bg-green-600 checked:border-green-600 bg-center bg-no-repeat focus:outline-none"
                onChange={(e) => handleComplete(e, childCardDetails?.id)}
              />
              <textarea
                value={title}
                // value={childCardDetails?.title}
                className="w-full h-10 px-2 py-1 text-xl font-semibold resize-none outline-none overflow-hidden rounded focus:border-2 focus:border-blue-600"
                onChange={(e) => {
                  setTitle(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
              />
            </div>
            <button className="p-1 cursor-pointer" onClick={handleClose}>
              <X size={20} />
            </button>
          </div>

          {/* CONTENT */}
          <div className="flex gap-4">
            <div className="flex flex-col py-2 space-y-4 w-xl">
              <div className="flex items-start gap-2 w-full">
                <button className="p-1">
                  <Menu size={20} />
                </button>
                <div className="flex flex-col gap-4 w-full px-2">
                  <p className="text-base font-medium">Description</p>
                  {/* <button className='bg-gray-200 rounded py-4 hover:bg-gray-300 cursor-pointer'>Add more detailed description</button> */}
                  <textarea
                    value={description}
                    // value={childCardDetails?.description}
                    className="w-full h-10 px-2 py-1 text-xl font-semibold resize-none outline-none overflow-hidden rounded focus:border-2 focus:border-blue-600"
                    onChange={(e) => {
                      setDescription(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                  />
                </div>
              </div>

              {/* <div className='flex items-start gap-2 w-full'>
                                <button className='p-1'>
                                    <Menu size={20} />
                                </button>
                                <div className='flex flex-col gap-4 w-full px-2'>
                                    <div className='flex justify-between items-center px-2'>
                                        <p className='text-base font-medium'>Gant</p>
                                        <button
                                            className='bg-gray-200 text-sm rounded px-4 py-1 hover:bg-gray-300'
                                        >
                                            Hide
                                        </button>
                                    </div>
                                    <div className='hidden bg-gray-200 rounded py-4 hover:bg-gray-300'>Add more detailed description</div>
                                </div>
                            </div> */}

              {/* TIMER  */}
              <div className="flex items-start gap-2 w-full">
                <button className="p-1">
                  <Clock size={20} />
                </button>
                <div className="flex flex-col gap-4 w-full px-2">
                  <div className="flex justify-between items-center px-2">
                    <p className="text-base font-medium">Work Log</p>
                    <button className="bg-gray-200 text-sm rounded px-4 py-2 hover:bg-gray-300 cursor-pointer">
                      Hide Details
                    </button>
                  </div>

                  <div className="flex justify-between px-4 p-2 ">
                    <p className="text-lg text-gray-700 font-light">
                      List Name
                    </p>
                    <div className="gap-4">
                      <button>
                        {" "}
                        <Play size={18} />{" "}
                      </button>
                      <button>
                        {" "}
                        <Pause size={18} />{" "}
                      </button>
                      <button>
                        {" "}
                        <CircleStop size={18} />{" "}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm">No estimate for this card</span>
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col">
                        <p className="text-xs font-semibold rounded-full w-fit px-1.5 py-0.5 text-black bg-blue-500">
                          U
                        </p>
                        <div>-----------</div>
                        <span className="text-xs">3h 50m</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="bg-gray-200 text-sm rounded px-3 py-2 hover:bg-gray-300 cursor-pointer">
                          <Plus size={18} />{" "}
                        </button>
                        <button className="bg-gray-200 text-sm rounded px-4 py-2 hover:bg-gray-300 cursor-pointer">
                          Hide Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className=""></div>
          </div>
        </div>
      </Box>
    </Modal>
  );
}
