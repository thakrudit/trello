import React, { createContext, useContext, useState } from "react";
import DEVELOPMENT_CONFIG from "../helpers/config";
import apiHelper from "../helpers/api-helper";

const IndexContext = createContext();

export default function ContextProvider({ children }) {
  const [dashbordDataObj, setDashbordDataObj] = useState({});

  const [boardData, setBoardData] = useState([]);

  const [openDescription, setOpenDescription] = useState(false);
  const [childCardDetails, setChildCardDetails] = useState({});

  // DISPLAY BOARD DATA ( TASK CARD WITH CHILD CARD )
  const handleOnDashbord = async (id) => {
    console.log("Enter in handle===========OnDashbord context");
    localStorage.setItem("dashbordCID", id);
    let result = await apiHelper.getRequest(`display-board?b_id=${id}`);
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
      setDashbordDataObj(result?.body);
    } else {
      setDashbordDataObj({});
    }
  };

  // GET BOARDS WHEN USER IS LOGED IN
  async function getBoards() {
    console.log("getBoards function run ======>>> context");
    let result = await apiHelper.getRequest("get-boards");
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
      setBoardData(result?.body);
      let dashbordCID = parseInt(localStorage.getItem("dashbordCID"), 10);
      if (result.body?.length > 0) {
        if (dashbordCID) {
          handleOnDashbord(dashbordCID);
        } else {
          handleOnDashbord(result?.body[0]?.id);
        }
      }
    } else {
      setBoardData([]);
    }
  }

  // OPEN DESCRIPTION MODAL AND GET CHILD CARD DATA
  const handleOpenDescriptionModal = async (id) => {
    let result = await apiHelper.getRequest(`get-child-card?c_id=${id}`);
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
      setOpenDescription(true);
      setChildCardDetails(result?.body);
    } else {
      setOpenDescription(true);
      setChildCardDetails({});
    }
  };

  // CHECKED OR UNCHECKED CHILD CARD
  const handleComplete = async (e, id) => {
    e.preventDefault();
    const newStatus = !childCardDetails?.is_checked;
    let data = JSON.stringify({
      id,
      is_checked: newStatus,
    });
    let result = await apiHelper.postRequest("update-child-card-status", data);
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
      setChildCardDetails((prev) => ({
        ...prev,
        is_checked: newStatus,
      }));
      console.log("MESSAGE IF : ", result?.message);
    } else {
      console.log("MESSAGE ELSE : ", result?.message);
    }
  };

  return (
    <IndexContext.Provider
      value={{
        dashbordDataObj,
        setDashbordDataObj,
        handleOnDashbord,
        openDescription,
        setOpenDescription,
        handleOpenDescriptionModal,
        childCardDetails,
        setChildCardDetails,
        boardData,
        setBoardData,
        getBoards,
        // isCheckedD,
        // setIsCheckedD,
        handleComplete,
      }}
    >
      {children}
    </IndexContext.Provider>
  );
}

export const useIndexContext = () => useContext(IndexContext);
