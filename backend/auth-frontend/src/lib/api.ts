import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
});

// ================= REQUEST =================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    console.log("========== REQUEST ==========");
    console.log("METHOD:", config.method?.toUpperCase());
    console.log("URL:", `${config.baseURL}${config.url}`);
    console.log("TOKEN:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("HEADERS:", config.headers);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ================= RESPONSE =================
API.interceptors.response.use(
  (response) => {
    console.log("========== RESPONSE ==========");
    console.log(
      response.config.method?.toUpperCase(),
      response.config.url,
      response.status
    );

    return response;
  },

  async (error) => {
    const originalRequest = error.config;

      console.log("========== ERROR ==========");
      console.log("STATUS:", error.response?.status);
      console.log("URL:", originalRequest?.url);
      console.log("RESPONSE DATA:", error.response?.data);
      console.log("RESPONSE MESSAGE:", error.response?.data?.message);

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      originalRequest._retry = true;

      try {
        console.log("TRY REFRESH TOKEN...");

        const res = await axios.post(
          "http://localhost:3000/api/v1/auth/refresh",
          {},
          {
            withCredentials: true,
          }
        );

        const newToken =
          res.data.data?.accessToken ||
          res.data.accessToken;

        console.log("NEW TOKEN:", newToken);

        localStorage.setItem("accessToken", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return API(originalRequest);
      } catch (err) {
        console.log("REFRESH FAILED");

        localStorage.removeItem("accessToken");

        window.location.href = "/login";

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;