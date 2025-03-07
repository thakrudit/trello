import React, { useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { X } from "lucide-react";
import apiHelper from "../helpers/api-helper";
import DEVELOPMENT_CONFIG from "../helpers/config";
import { useIndexContext } from "../context/IndexContext";

const style = {
  position: "absolute",
  top: "50%",
  left: "43%",
  transform: "translate(-50%, -50%)",
  width: 305,
  bgcolor: "background.paper",
  p: 2,
};

export default function LogIn({ openLogin, setOpenLogin }) {
  const { getBoards } = useIndexContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => {
    setOpenLogin(false);
    setEmail("");
    setPassword("");
    setError("");
  };

  // LOGIN USER
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Both fields are required");
      return;
    }
    setError("");
    let data = JSON.stringify({
      email,
      password,
    });
    let result = await apiHelper.postRequest("log-in", data);
    if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
      localStorage.setItem("token", result?.body?.token);
      handleClose();
      getBoards(); // UPDATE BOARD AND DASHBORD DATA
      console.log("MESAGE IF : ", result?.message);
    } else {
      console.log("MESAGE ELSE : ", result?.message);
      setError(result?.message);
    }
  };

  return (
    <div>
      <Modal
        open={openLogin}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-xl">
          <div className="flex justify-between">
            <p></p>
            <p className="text-base font-semibold text-gray-600 text-center">
              Log In
            </p>
            <button className="cursor-pointer" onClick={handleClose}>
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your password"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
            >
              Login
            </button>
            {/* <p className="text-center text-sm text-gray-600">
                            Don't have an account? <Link to="/signup" className="text-blue-600 font-semibold">Sign Up</Link>
                        </p> */}
          </form>
        </Box>
      </Modal>
    </div>
  );
}
