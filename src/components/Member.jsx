import React from "react";
import { X } from "lucide-react";
import { useIndexContext } from "../context/IndexContext";
import apiHelper from "../helpers/api-helper";
import DEVELOPMENT_CONFIG from "../helpers/config";
import { toast } from "react-toastify";

const Member = ({ setIsOpenJoinMember, setJoinedUser }) => {
    const { boardUsers, allJoinedUsers, setAllJoinedUsers } = useIndexContext();

    let dashbordCID = parseInt(localStorage.getItem("dashbordCID"), 10);

    const closeMemberBoard = () => {
        setIsOpenJoinMember(false)
    }

    let extractFirst = (name) => {
        const fName = name?.charAt(0);
        return fName
    }

    const joinedUsers = allJoinedUsers.filter(user => user.is_join);

    const boardUsersFiltered = boardUsers.filter(boardUser =>
        !joinedUsers.some(joinedUser => joinedUser.user_id === boardUser.id)
    );

    const error = (msg) => {
        toast.success(msg,
            {
                autoClose: 5000,
            });
    }

    // ADD OR REMOVE USER FROM CARD BY BOARD ADMIN ONLY
    const handleAddRemoveUser = async (e, user_id, user_name, is_join) => {
        e.preventDefault();
        let data = JSON.stringify({
            c_id: 5,
            user_id,
            user_name,
            is_join
        })
        let result = await apiHelper.postRequest(`add-remove-user?board_id=${dashbordCID}`, data)
        if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
            setAllJoinedUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === result?.body.id ? { ...user, is_join: result?.body.is_join } : user
                )
            );
            setJoinedUser((prev) =>
                prev.user_id === result?.body.user_id ? result?.body : prev
            )
        } else {
            error(result?.message)
        }
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <p></p>
                <h2 className="text-sm font-normal">Members</h2>
                <button
                    className="hover:bg-gray-300 rounded cursor-pointer p-1.5"
                    onClick={closeMemberBoard}
                >
                    <X size={18} />
                </button>
            </div>

            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search members"
                className="w-full p-2 text-gray-600 text-sm border border-blue-600 rounded-sm focus:outline-none focus:ring-none"
            />

            {/* Card members List */}
            {!!joinedUsers && joinedUsers?.length > 0 &&
                <div className="">
                    <h3 className="text-gray-600 text-xs font-semibold mb-2">Card members</h3>
                    <ul className="flex flex-col gap-2">
                        {joinedUsers?.map((value) => (
                            <li
                                key={value.id}
                                className="flex items-center justify-between p-1 px-2 bg-gray-200 rounded-md cursor-pointer"
                                onClick={(e) => handleAddRemoveUser(e, value?.user_id, value?.user_name, false)}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 flex items-center justify-center bg-yellow-500 font-bold rounded-full">
                                        {extractFirst(value.user_name)}
                                    </div>
                                    <span className="text-sm">{value.user_name}</span>
                                </div>
                                <X size={16} />
                            </li>
                        ))}
                    </ul>
                </div>
            }
            {/* Board members List */}
            {!!boardUsersFiltered && boardUsersFiltered?.length > 0 &&
                <div className="">
                    <h3 className="text-gray-600 text-xs font-semibold mb-2">Board members</h3>
                    <ul className="flex flex-col gap-2">
                        {boardUsersFiltered?.map((value) => (
                            <li
                                key={value.id}
                                className="flex items-center justify-between p-1 px-2 bg-gray-200 rounded-md cursor-pointer"
                                onClick={(e) => handleAddRemoveUser(e, value?.id, value?.name, true)}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 flex items-center justify-center bg-yellow-500 font-bold rounded-full">
                                        {extractFirst(value.name)}
                                    </div>
                                    <span className="text-sm">{value.name}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            }
        </div>
    );
};

export default Member;