import DEVELOPMENT_CONFIG from "./config";
import axios from "axios";

export default {
    postRequest: (url, data) => {
        let token = localStorage.getItem("token")
        let config = {
            method: "post",
            url: DEVELOPMENT_CONFIG.base_url + "/api/v1/" + url,
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            data: data
        };
        const response = axios(config)
            .then(async (response) => {
                if (response.data.code === DEVELOPMENT_CONFIG.statusCode) {
                    return response.data
                }
                else {
                    return response.data
                }
            })
            .catch((error) => {
                return error.response.data
            });
        return response;
    },

    getRequest: function (url, data) {
        let token = localStorage.getItem("token")
        var config = {
            method: "get",
            url: DEVELOPMENT_CONFIG.base_url + "/api/v1/" + url,
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            data: data,
        };
        const response = axios(config)
            .then(async (response) => {
                if (response.data.code === DEVELOPMENT_CONFIG.statusCode) {
                    return response.data
                }
            })
            .catch((error) => {
                return error.response.data
            });
        return response;
    },
}
