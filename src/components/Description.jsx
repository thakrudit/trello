import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { CircleStop, Clock, Menu, Pause, Play, Plus, X } from "lucide-react";
import { useIndexContext } from "../context/IndexContext";
import DEVELOPMENT_CONFIG from "../helpers/config";
import apiHelper from "../helpers/api-helper";

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
  } = useIndexContext();
  // console.log("childCardDetails =============", childCardDetails);

  // CLOSE DESCRIPTION MODAL
  const handleClose = () => {
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

  useEffect(() => {
    setChildCardData(childCardDetails);
  }, [childCardDetails]);

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
    let result = await apiHelper.postRequest(
      "update-child-card-description",
      data
    );
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
      handleCloseDescriptionBoard();
      console.log("MESSAGE IF : ", result.message);
    } else {
      console.log("MESSAGE ELSE : ", result.message);
    }
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

          {/* CONTENT */}
          <div className="flex gap-4">
            <div className="flex flex-col py-2 space-y-4 w-xl">
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
                            handleUpdateDescription(e, childCardData.id);
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
