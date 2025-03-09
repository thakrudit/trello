import { Archive, FilePenLine, Menu } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import apiHelper from "../helpers/api-helper";
import DEVELOPMENT_CONFIG from "../helpers/config";
import { useDraggable } from "@dnd-kit/core";
import { useIndexContext } from "../context/IndexContext";

export default function ChildCard({ id, cardValues, displayDashbordCard }) {
  // console.log("cardValues ============= ", cardValues);
  const { handleOpenDescriptionModal } = useIndexContext();

  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        backgroundColor: "#E5E7EB",
        border: "1px solid blue",
      }
    : undefined;

  let [childCard, setChildCard] = useState({});

  // SET CHILD CARD DATA
  useEffect(() => {
    setChildCard(cardValues);
  }, [cardValues]);

  // CHECKED OR UNCHECKED CHILD CARD
  const handleComplete = async (e, id) => {
    e.preventDefault();
    const newStatus = !childCard?.is_checked;
    let data = JSON.stringify({
      id,
      is_checked: newStatus,
    });
    let result = await apiHelper.postRequest("update-child-card-status", data);
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
      setChildCard((prev) => ({
        ...prev,
        is_checked: newStatus,
      }));
      console.log("MESSAGE IF : ", result?.message);
    } else {
      console.log("MESSAGE ELSE : ", result?.message);
    }
  };

  // HANDLE CHILD CARD ARCHIVED
  const handleChildCardArchive = async (e) => {
    e.preventDefault();
    const newStatus = true;
    let data = JSON.stringify({
      id,
      newStatus,
    });
    let result = await apiHelper.postRequest("child-card-archive", data);
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
      // UPDATE CONTENT AFTER ARCHIVED
      displayDashbordCard(result?.body?.dashbord_c_id);
      console.log("MESSAGE IF : ", result?.message);
    } else {
      console.log("MESSAGE ELSE : ", result?.message);
    }
  };

  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleButtonClick = (e) => {
    e.stopPropagation();
    textareaRef.current?.focus();
  };

  const handleValidation = () => {
    let isValid = true;
    if (childCard.title.trim() === "") {
      isValid = false;
    }
    return isValid;
  };
  // UPDATE CHILD CARD TITLE
  const handleUpdateChildCardTitle = async (e, id, title) => {
    e.preventDefault();
    if (!handleValidation()) {
      return;
    }
    let data = JSON.stringify({
      c_id: id,
      title,
    });
    let result = await apiHelper.postRequest("update-child-card-title", data);
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
      setChildCard((prev) => ({
        ...prev,
        title: title,
      }));
      console.log("MESSAGE IF : ", result.message);
    } else {
      console.log("MESSAGE ELSE : ", result.message);
    }
  };

  return (
    <div
      key={id}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex flex-col items-start py-2 gap-2 border border-gray-300 rounded hover:ring-1 hover:ring-blue-500 group transition-colors duration-300 ${
        isFocused ? "bg-gray-300" : ""
      }`}
      style={style}
    >
      <div className="flex w-full items-start justify-between p-2 ">
        <div className="flex items-center justify-between gap-1 w-full">
          <input
            type="checkbox"
            checked={!!childCard?.is_checked}
            className="hidden group-hover:block w-5 h-4.5 appearance-none border-2 border-gray-500 cursor-pointer rounded-full checked:block checked:bg-green-600 checked:border-green-600 bg-center bg-no-repeat focus:outline-none"
            onPointerDown={(e) => e.stopPropagation()}
            onChange={(e) => handleComplete(e, id)}
          />
          <textarea
            ref={textareaRef}
            value={childCard?.title}
            className="w-full h-8 px-2 py-2 text-sm border-none resize-none outline-none overflow-hidden"
            onPointerDown={(e) => e.stopPropagation()}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              setChildCard((prev) => ({
                ...prev,
                title: e.target.value,
              }));
              e.target.style.height = "32";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleUpdateChildCardTitle(e, childCard.id, childCard.title);
              }
            }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          {!!childCard?.is_checked && (
            <button
              className="hidden group-hover:block cursor-pointer"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => handleChildCardArchive(e)}
            >
              <Archive size={15} />
            </button>
          )}
          <button
            className="cursor-pointer"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleButtonClick}
          >
            <FilePenLine size={15} />
          </button>
        </div>
      </div>
      <button
        className="mx-3 p-0.5 cursor-pointer"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => handleOpenDescriptionModal(id)}
      >
        <Menu size={15} />
      </button>
    </div>
  );
}
